const crypto = require('crypto');

const admin = require('firebase-admin');
const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const {
  IntegrationApiKeys,
  IntegrationCommerceCodes,
  WebpayPlus
} = require('transbank-sdk');

admin.initializeApp();

const db = admin.firestore();
const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'webpay_orders';
const FUNCTION_REGION = 'us-central1';

class ManualReviewError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ManualReviewError';
    this.status = status;
  }
}

function getEnvMode() {
  return String(process.env.TBK_ENV || 'integration').trim().toLowerCase();
}

function buildTransactionClient() {
  const envMode = getEnvMode();
  if (envMode === 'production') {
    const commerceCode = String(process.env.TBK_COMMERCE_CODE || '').trim();
    const apiKey = String(process.env.TBK_API_KEY || '').trim();

    if (!commerceCode || !apiKey) {
      throw new Error('Faltan TBK_COMMERCE_CODE o TBK_API_KEY para el ambiente productivo.');
    }

    return WebpayPlus.Transaction.buildForProduction(commerceCode, apiKey);
  }

  return WebpayPlus.Transaction.buildForIntegration(
    String(process.env.TBK_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS),
    String(process.env.TBK_API_KEY || IntegrationApiKeys.WEBPAY)
  );
}

function parseRawBodyParams(req) {
  const rawBody = req.rawBody ? req.rawBody.toString('utf8') : '';
  if (!rawBody) return new URLSearchParams();
  return new URLSearchParams(rawBody);
}

function getRequestParam(req, key) {
  const queryValue = req.query?.[key];
  if (typeof queryValue === 'string' && queryValue) {
    return queryValue;
  }

  const bodyValue = req.body?.[key];
  if (typeof bodyValue === 'string' && bodyValue) {
    return bodyValue;
  }

  const rawParams = parseRawBodyParams(req);
  return rawParams.get(key) || '';
}

function json(res, statusCode, payload) {
  res.set('Cache-Control', 'no-store');
  res.status(statusCode).json(payload);
}

function getBaseUrl(req) {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0].trim();
  const forwardedHost = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  return `${forwardedProto || 'https'}://${forwardedHost}`;
}

function sanitizeText(value, maxLength = 200) {
  return String(value || '').trim().slice(0, maxLength);
}

function normalizeCustomer(rawCustomer) {
  const name = sanitizeText(rawCustomer?.name, 120);
  const email = sanitizeText(rawCustomer?.email, 160).toLowerCase();
  const phone = sanitizeText(rawCustomer?.phone, 40);
  const notes = sanitizeText(rawCustomer?.notes, 500);

  if (!name) {
    throw new Error('Debes ingresar el nombre del cliente.');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Debes ingresar un correo valido.');
  }

  if (!phone) {
    throw new Error('Debes ingresar un telefono de contacto.');
  }

  return { name, email, phone, notes };
}

function normalizeCartItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('El carrito esta vacio.');
  }

  const normalizedItems = rawItems.map(item => ({
    id: String(item?.id || '').trim(),
    qty: Number.parseInt(item?.qty, 10)
  })).filter(item => item.id && Number.isInteger(item.qty) && item.qty > 0);

  if (normalizedItems.length === 0) {
    throw new Error('No se encontraron productos validos para pagar.');
  }

  if (normalizedItems.length > 25) {
    throw new Error('El carrito supera el maximo de productos permitido por esta integracion.');
  }

  const mergedItems = new Map();
  normalizedItems.forEach(item => {
    const existing = mergedItems.get(item.id);
    mergedItems.set(item.id, (existing || 0) + item.qty);
  });

  return Array.from(mergedItems.entries()).map(([id, qty]) => ({ id, qty }));
}

function getDiscountedUnitPrice(productData) {
  const basePrice = Number(productData.price) || 0;
  const discount = Number(productData.discount) || 0;
  if (discount <= 0) return basePrice;
  return Math.round(basePrice * (1 - discount / 100));
}

async function resolveOrderItems(rawItems) {
  const items = normalizeCartItems(rawItems);
  const refs = items.map(item => db.collection(PRODUCTS_COLLECTION).doc(item.id));
  const snapshots = await db.getAll(...refs);
  const docsById = new Map(snapshots.map(snapshot => [snapshot.id, snapshot]));

  const resolvedItems = items.map(item => {
    const snapshot = docsById.get(item.id);
    if (!snapshot?.exists) {
      throw new Error('Uno de los productos del carrito ya no existe.');
    }

    const productData = snapshot.data() || {};
    const stock = Number(productData.stock) || 0;
    if (stock < item.qty) {
      throw new Error(`No hay stock suficiente para ${productData.name || 'uno de los productos'}.`);
    }

    const unitPrice = getDiscountedUnitPrice(productData);
    const baseUnitPrice = Number(productData.price) || 0;
    const discountPercent = Number(productData.discount) || 0;

    return {
      productId: item.id,
      name: sanitizeText(productData.name, 160) || 'Producto',
      qty: item.qty,
      baseUnitPrice,
      unitPrice,
      discountPercent,
      img: sanitizeText(productData.img, 400),
      lineTotal: unitPrice * item.qty
    };
  });

  const subtotal = resolvedItems.reduce((sum, item) => sum + item.baseUnitPrice * item.qty, 0);
  const total = resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  if (total <= 0) {
    throw new Error('El monto total del pedido no es valido para pagar.');
  }

  return {
    items: resolvedItems,
    subtotal,
    discount: subtotal - total,
    total
  };
}

function generateOrderId() {
  return `LT2${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(5).toString('hex').toUpperCase()}`.slice(0, 26);
}

function generateSessionId() {
  return `SES${crypto.randomBytes(8).toString('hex').toUpperCase()}`.slice(0, 61);
}

function generateAccessCode() {
  return crypto.randomBytes(16).toString('hex');
}

function summarizeTransactionResponse(response) {
  return {
    authorizationCode: sanitizeText(response?.authorization_code, 40),
    amount: Number(response?.amount) || 0,
    buyOrder: sanitizeText(response?.buy_order, 40),
    sessionId: sanitizeText(response?.session_id, 80),
    status: sanitizeText(response?.status, 40),
    responseCode: Number(response?.response_code),
    transactionDate: sanitizeText(response?.transaction_date, 80),
    paymentTypeCode: sanitizeText(response?.payment_type_code, 40),
    installmentsNumber: Number(response?.installments_number) || 0,
    installmentsAmount: Number(response?.installments_amount) || 0,
    cardNumber: sanitizeText(response?.card_detail?.card_number, 8),
    vci: sanitizeText(response?.vci, 40)
  };
}

function redirectToResult(res, baseUrl, params) {
  const url = new URL('/pago/resultado.html', baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  res.redirect(303, url.toString());
}

async function markOrderStatus(orderId, partialData) {
  if (!orderId) return;
  await db.collection(ORDERS_COLLECTION).doc(orderId).set({
    ...partialData,
    updatedAtMs: Date.now()
  }, { merge: true });
}

async function findOrderByToken(token) {
  const snapshot = await db.collection(ORDERS_COLLECTION)
    .where('transbank.token', '==', token)
    .limit(1)
    .get();

  return snapshot.empty ? null : snapshot.docs[0];
}

async function finalizeAuthorizedOrder(orderRef, orderData, commitResponse) {
  const transactionSummary = summarizeTransactionResponse(commitResponse);

  if (transactionSummary.responseCode !== 0 || transactionSummary.status !== 'AUTHORIZED') {
    await orderRef.set({
      status: 'FAILED',
      transbank: {
        ...(orderData.transbank || {}),
        lastResponse: transactionSummary
      },
      updatedAtMs: Date.now()
    }, { merge: true });
    return 'FAILED';
  }

  if (transactionSummary.buyOrder !== orderData.buyOrder || transactionSummary.amount !== Number(orderData.amount) || transactionSummary.sessionId !== orderData.sessionId) {
    await orderRef.set({
      status: 'PAID_VALIDATION_ERROR',
      transbank: {
        ...(orderData.transbank || {}),
        lastResponse: transactionSummary
      },
      updatedAtMs: Date.now()
    }, { merge: true });
    throw new ManualReviewError('La respuesta de Transbank no coincide con la orden original.', 'manual-review');
  }

  await db.runTransaction(async transaction => {
    const freshOrderSnapshot = await transaction.get(orderRef);
    if (!freshOrderSnapshot.exists) {
      throw new Error('La orden ya no existe.');
    }

    const freshOrder = freshOrderSnapshot.data() || {};
    if (freshOrder.status === 'AUTHORIZED') {
      return;
    }

    const productRefs = (freshOrder.items || []).map(item => db.collection(PRODUCTS_COLLECTION).doc(String(item.productId)));
    const productSnapshots = await Promise.all(productRefs.map(ref => transaction.get(ref)));

    productSnapshots.forEach((productSnapshot, index) => {
      const orderItem = freshOrder.items[index];
      if (!productSnapshot.exists) {
        throw new ManualReviewError(`No se encontro el producto ${orderItem?.name || orderItem?.productId}.`, 'manual-review');
      }

      const productData = productSnapshot.data() || {};
      const currentStock = Number(productData.stock) || 0;
      if (currentStock < Number(orderItem.qty) || 0) {
        throw new ManualReviewError(`Stock insuficiente para ${orderItem?.name || orderItem?.productId} despues del pago.`, 'manual-review');
      }

      transaction.set(productSnapshot.ref, {
        stock: currentStock - Number(orderItem.qty),
        updatedAt: Date.now()
      }, { merge: true });
    });

    transaction.set(orderRef, {
      status: 'AUTHORIZED',
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAtMs: Date.now(),
      transbank: {
        ...(freshOrder.transbank || {}),
        lastResponse: transactionSummary
      }
    }, { merge: true });
  });

  return 'AUTHORIZED';
}

function sanitizeOrderForClient(orderSnapshot) {
  const data = orderSnapshot.data() || {};
  return {
    orderId: orderSnapshot.id,
    buyOrder: data.buyOrder || orderSnapshot.id,
    status: data.status || 'CREATED',
    amount: Number(data.amount) || 0,
    subtotal: Number(data.subtotal) || 0,
    discount: Number(data.discount) || 0,
    currency: data.currency || 'CLP',
    customer: {
      name: data.customer?.name || '',
      email: data.customer?.email || '',
      phone: data.customer?.phone || '',
      notes: data.customer?.notes || ''
    },
    items: Array.isArray(data.items) ? data.items : [],
    transbank: {
      environment: data.transbank?.environment || getEnvMode(),
      authorizationCode: data.transbank?.lastResponse?.authorizationCode || '',
      cardNumber: data.transbank?.lastResponse?.cardNumber || '',
      paymentTypeCode: data.transbank?.lastResponse?.paymentTypeCode || '',
      installmentsNumber: Number(data.transbank?.lastResponse?.installmentsNumber) || 0,
      transactionDate: data.transbank?.lastResponse?.transactionDate || ''
    },
    createdAtMs: Number(data.createdAtMs) || 0,
    updatedAtMs: Number(data.updatedAtMs) || 0
  };
}

exports.createTransbankTransaction = onRequest({ region: FUNCTION_REGION, cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Metodo no permitido.' });
    return;
  }

  try {
    const customer = normalizeCustomer(req.body?.customer || {});
    const resolvedOrder = await resolveOrderItems(req.body?.items || []);
    const buyOrder = generateOrderId();
    const sessionId = generateSessionId();
    const accessCode = generateAccessCode();
    const baseUrl = getBaseUrl(req);
    const returnUrl = `${baseUrl}/api/transbank/return`;
    const transactionClient = buildTransactionClient();
    const transaction = await transactionClient.create(buyOrder, sessionId, resolvedOrder.total, returnUrl);

    await db.collection(ORDERS_COLLECTION).doc(buyOrder).set({
      buyOrder,
      sessionId,
      accessCode,
      status: 'CREATED',
      currency: 'CLP',
      customer,
      items: resolvedOrder.items,
      subtotal: resolvedOrder.subtotal,
      discount: resolvedOrder.discount,
      amount: resolvedOrder.total,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAtMs: Date.now(),
      updatedAtMs: Date.now(),
      transbank: {
        environment: getEnvMode(),
        token: String(transaction.token || ''),
        url: String(transaction.url || '')
      }
    });

    json(res, 200, {
      orderId: buyOrder,
      accessCode,
      token: String(transaction.token || ''),
      url: String(transaction.url || ''),
      amount: resolvedOrder.total
    });
  } catch (error) {
    logger.error('No fue posible crear la transaccion Webpay Plus.', error);
    json(res, 400, { error: error.message || 'No fue posible iniciar el pago con Transbank.' });
  }
});

exports.getTransbankOrder = onRequest({ region: FUNCTION_REGION, cors: true }, async (req, res) => {
  if (req.method !== 'GET') {
    json(res, 405, { error: 'Metodo no permitido.' });
    return;
  }

  const orderId = sanitizeText(req.query?.orderId, 40);
  const accessCode = sanitizeText(req.query?.accessCode, 80);
  if (!orderId || !accessCode) {
    json(res, 400, { error: 'Faltan orderId o accessCode.' });
    return;
  }

  const orderSnapshot = await db.collection(ORDERS_COLLECTION).doc(orderId).get();
  if (!orderSnapshot.exists) {
    json(res, 404, { error: 'No se encontro la orden.' });
    return;
  }

  const orderData = orderSnapshot.data() || {};
  if (String(orderData.accessCode || '') !== accessCode) {
    json(res, 403, { error: 'No tienes permiso para ver esta orden.' });
    return;
  }

  json(res, 200, { order: sanitizeOrderForClient(orderSnapshot) });
});

exports.transbankReturn = onRequest({ region: FUNCTION_REGION, cors: true }, async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const tokenWs = sanitizeText(getRequestParam(req, 'token_ws'), 128);
  const tbkToken = sanitizeText(getRequestParam(req, 'TBK_TOKEN'), 128);
  const tbkOrder = sanitizeText(getRequestParam(req, 'TBK_ORDEN_COMPRA'), 40);
  const tbkSession = sanitizeText(getRequestParam(req, 'TBK_ID_SESION'), 80);

  try {
    if (tokenWs) {
      const transactionClient = buildTransactionClient();
      const commitResponse = await transactionClient.commit(tokenWs);
      const orderId = sanitizeText(commitResponse?.buy_order, 40);
      const orderRef = db.collection(ORDERS_COLLECTION).doc(orderId);
      const orderSnapshot = await orderRef.get();

      if (!orderSnapshot.exists) {
        redirectToResult(res, baseUrl, { status: 'error' });
        return;
      }

      const orderData = orderSnapshot.data() || {};
      if (orderData.status === 'AUTHORIZED') {
        redirectToResult(res, baseUrl, {
          status: 'authorized',
          orderId,
          access: orderData.accessCode
        });
        return;
      }

      try {
        const finalStatus = await finalizeAuthorizedOrder(orderRef, orderData, commitResponse);
        redirectToResult(res, baseUrl, {
          status: finalStatus === 'AUTHORIZED' ? 'authorized' : 'failed',
          orderId,
          access: orderData.accessCode
        });
      } catch (error) {
        if (error instanceof ManualReviewError) {
          await markOrderStatus(orderId, {
            status: error.status === 'manual-review' ? 'PAID_MANUAL_REVIEW' : error.status,
            transbank: {
              ...(orderData.transbank || {}),
              lastResponse: summarizeTransactionResponse(commitResponse)
            },
            manualReviewReason: error.message
          });

          redirectToResult(res, baseUrl, {
            status: 'manual-review',
            orderId,
            access: orderData.accessCode
          });
          return;
        }

        throw error;
      }

      return;
    }

    if (tbkToken) {
      const orderSnapshot = tbkOrder
        ? await db.collection(ORDERS_COLLECTION).doc(tbkOrder).get()
        : await findOrderByToken(tbkToken);

      if (orderSnapshot?.exists) {
        const orderData = orderSnapshot.data() || {};
        await markOrderStatus(orderSnapshot.id, {
          status: 'ABORTED',
          abortedAt: admin.firestore.FieldValue.serverTimestamp(),
          transbank: {
            ...(orderData.transbank || {}),
            abortedToken: tbkToken,
            abortedSessionId: tbkSession,
            abortedBuyOrder: tbkOrder
          }
        });

        redirectToResult(res, baseUrl, {
          status: 'aborted',
          orderId: orderSnapshot.id,
          access: orderData.accessCode
        });
        return;
      }

      redirectToResult(res, baseUrl, { status: 'aborted' });
      return;
    }

    if (tbkOrder || tbkSession) {
      const orderSnapshot = tbkOrder
        ? await db.collection(ORDERS_COLLECTION).doc(tbkOrder).get()
        : null;

      if (orderSnapshot?.exists) {
        const orderData = orderSnapshot.data() || {};
        await markOrderStatus(orderSnapshot.id, {
          status: 'TIMEOUT',
          timeoutAt: admin.firestore.FieldValue.serverTimestamp(),
          transbank: {
            ...(orderData.transbank || {}),
            timeoutSessionId: tbkSession,
            timeoutBuyOrder: tbkOrder
          }
        });

        redirectToResult(res, baseUrl, {
          status: 'timeout',
          orderId: orderSnapshot.id,
          access: orderData.accessCode
        });
        return;
      }
    }

    redirectToResult(res, baseUrl, { status: 'error' });
  } catch (error) {
    logger.error('No fue posible procesar el retorno de Transbank.', error);
    if (tbkOrder) {
      await markOrderStatus(tbkOrder, {
        status: 'ERROR',
        errorMessage: error.message || 'Error inesperado al confirmar el pago.'
      });
    }

    redirectToResult(res, baseUrl, {
      status: 'error',
      orderId: tbkOrder || '',
      access: ''
    });
  }
});