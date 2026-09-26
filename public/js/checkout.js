const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyApOacPTnK-PLkiiC1o7qdwwrTv6upGoU0',
  authDomain: 'distribuidoralarutadeloriente.firebaseapp.com',
  projectId: 'distribuidoralarutadeloriente',
  storageBucket: 'distribuidoralarutadeloriente.firebasestorage.app',
  messagingSenderId: '18647063099',
  appId: '1:18647063099:web:d25d090a14a71603a51a1e'
};

const FIRESTORE_PRODUCTS_COLLECTION = 'products';
const LEGACY_PRODUCTS_STORAGE_KEY = 'products';

let firebaseAppReadyPromise = null;
let checkoutProductsPromise = null;

function setCheckoutButtonState(disabled, label = 'Enviar cotización por WhatsApp') {
  const submitButton = document.getElementById('checkout-submit');
  if (!submitButton) return;

  submitButton.disabled = disabled;
  submitButton.innerHTML = `<i class="fa-brands fa-whatsapp text-lg"></i> <span>${label}</span>`;
  submitButton.classList.toggle('opacity-50', disabled);
  submitButton.classList.toggle('cursor-not-allowed', disabled);
}

function getStoredCart() {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch (error) {
    return [];
  }
}

function clearLegacyProductsStorage() {
  try {
    localStorage.removeItem(LEGACY_PRODUCTS_STORAGE_KEY);
  } catch (error) {
    console.warn('No se pudo limpiar el cache legado de productos en checkout.', error);
  }
}

function loadFirebaseScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`No se pudo cargar ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    }, { once: true });
    script.addEventListener('error', () => reject(new Error(`No se pudo cargar ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

function initFirebaseApp() {
  if (firebaseAppReadyPromise) return firebaseAppReadyPromise;

  firebaseAppReadyPromise = Promise.all([
    loadFirebaseScript('https://www.gstatic.com/firebasejs/12.12.0/firebase-app-compat.js'),
    loadFirebaseScript('https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore-compat.js')
  ]).then(() => {
    if (!window.firebase?.apps?.length) {
      window.firebase.initializeApp(FIREBASE_CONFIG);
    }

    return window.firebase.firestore();
  });

  return firebaseAppReadyPromise;
}

async function fetchProductsFromFirestore() {
  const db = await initFirebaseApp();
  const snapshot = await db.collection(FIRESTORE_PRODUCTS_COLLECTION).get();
  return snapshot.docs.map(doc => {
    const data = doc.data() || {};
    return {
      ...data,
      id: Number(data.id),
      price: Number(data.price) || 0,
      discount: Number(data.discount) || 0
    };
  });
}

async function getCheckoutProducts() {
  if (checkoutProductsPromise) return checkoutProductsPromise;

  checkoutProductsPromise = (async () => {
    try {
      const remoteProducts = await fetchProductsFromFirestore();
      if (remoteProducts.length > 0) {
        return {
          products: remoteProducts,
          source: 'firestore',
          message: ''
        };
      }

      clearLegacyProductsStorage();

      return {
        products: [],
        source: 'missing',
        message: 'No fue posible cargar el catálogo para validar el pedido. Recarga la página antes de continuar con el pago.'
      };
    } catch (error) {
      console.warn('No se pudo cargar productos desde Firestore en checkout.', error);

      clearLegacyProductsStorage();

      return {
        products: [],
        source: 'missing',
        message: 'Firestore no respondió y no hay una copia local del catálogo disponible. Recarga la página para intentar nuevamente.'
      };
    }
  })();

  return checkoutProductsPromise;
}

function getDiscountedUnitPrice(product) {
  const price = Number(product?.price) || 0;
  const discount = Number(product?.discount) || 0;
  return discount > 0 ? Math.round(price * (1 - discount / 100)) : price;
}

function getCheckoutSummary(cart, productsById) {
  return cart.reduce((accumulator, item) => {
    const product = productsById.get(String(item.id));
    if (!product) return accumulator;

    const baseLineTotal = (Number(product.price) || 0) * item.qty;
    const finalLineTotal = getDiscountedUnitPrice(product) * item.qty;

    return {
      subtotal: accumulator.subtotal + baseLineTotal,
      total: accumulator.total + finalLineTotal,
      discount: accumulator.discount + (baseLineTotal - finalLineTotal)
    };
  }, { subtotal: 0, discount: 0, total: 0 });
}

function setCheckoutError(message = '') {
  const errorElement = document.getElementById('checkout-error');
  if (!errorElement) return;

  errorElement.textContent = message;
  errorElement.classList.toggle('hidden', !message);
}

function setCheckoutCatalogNotice(message = '', tone = 'warning') {
  const noticeElement = document.getElementById('checkout-catalog-notice');
  if (!noticeElement) return;

  noticeElement.textContent = message;
  noticeElement.className = 'hidden mb-4 rounded-2xl border px-4 py-3 text-sm';

  if (!message) {
    return;
  }

  if (tone === 'error') {
    noticeElement.classList.add('border-red-200', 'bg-red-50', 'text-red-700');
  } else {
    noticeElement.classList.add('border-amber-200', 'bg-amber-50', 'text-amber-900');
  }

  noticeElement.classList.remove('hidden');
}

async function renderCheckout() {
  const cart = getStoredCart();
  const catalogState = await getCheckoutProducts();
  const products = catalogState.products;
  const productsById = new Map(products.map(product => [String(product.id), product]));
  const emptyState = document.getElementById('checkout-empty');
  const content = document.getElementById('checkout-content');
  const itemsContainer = document.getElementById('checkout-items');
  const hasMissingProducts = cart.some(item => !productsById.has(String(item.id)));

  if (!itemsContainer || !emptyState || !content) return;

  if (cart.length === 0) {
    emptyState.classList.remove('hidden');
    content.classList.add('hidden');
    setCheckoutCatalogNotice('');
    setCheckoutButtonState(true);
    return;
  }

  emptyState.classList.add('hidden');
  content.classList.remove('hidden');

  if (catalogState.message) {
    setCheckoutCatalogNotice(catalogState.message, catalogState.source === 'missing' ? 'error' : 'warning');
  } else {
    setCheckoutCatalogNotice('');
  }

  itemsContainer.innerHTML = cart.map(item => {
    const product = productsById.get(String(item.id));
    if (!product) {
      return `<div class="rounded-3xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700">Uno de los productos del carrito ya no está disponible. Vuelve al catálogo y revisa el pedido.</div>`;
    }

    const unitPrice = getDiscountedUnitPrice(product);
    const lineTotal = unitPrice * item.qty;
    const originalLineTotal = (Number(product.price) || 0) * item.qty;
    const hasDiscount = Number(product.discount) > 0;

    return `
      <article class="flex gap-4 rounded-3xl bg-white px-4 py-4 shadow-sm">
        <img src="${product.img || ''}" alt="${product.name || 'Producto'}" class="h-20 w-20 rounded-2xl object-cover bg-stone-100" />
        <div class="min-w-0 flex-1">
          <h3 class="text-sm font-semibold text-slate-900">${product.name || 'Producto'}</h3>
          <p class="mt-1 text-xs text-slate-500">Cantidad: ${item.qty}</p>
          <div class="mt-2 text-sm">
            ${hasDiscount ? `<span class="mr-2 text-slate-400 line-through">$${originalLineTotal.toLocaleString('es-CL')}</span>` : ''}
            <span class="font-semibold text-amber-700">$${lineTotal.toLocaleString('es-CL')}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  const summary = getCheckoutSummary(cart, productsById);
  document.getElementById('checkout-subtotal').textContent = `$${summary.subtotal.toLocaleString('es-CL')}`;
  document.getElementById('checkout-discount').textContent = `-$${summary.discount.toLocaleString('es-CL')}`;
  document.getElementById('checkout-total').textContent = `$${summary.total.toLocaleString('es-CL')}`;

  setCheckoutButtonState(catalogState.source === 'missing' || hasMissingProducts);

  if (hasMissingProducts) {
    setCheckoutCatalogNotice('Hay productos del carrito que ya no pudieron validarse con el catálogo actual. Vuelve al catálogo y revisa el pedido antes de cotizar.', 'error');
  }
}

const WHATSAPP_QUOTE_PHONE = '56997862467';

async function sendWhatsAppQuote(event) {
  event.preventDefault();

  const submitButton = document.getElementById('checkout-submit');
  if (!submitButton) return;

  const cart = getStoredCart();
  if (cart.length === 0) {
    setCheckoutError('Tu carrito está vacío.');
    return;
  }

  const catalogState = await getCheckoutProducts();
  const productsById = new Map(catalogState.products.map(product => [String(product.id), product]));
  if (catalogState.source === 'missing' || cart.some(item => !productsById.has(String(item.id)))) {
    setCheckoutError('No se pudo validar el carrito con el catálogo actual. Recarga la página y revisa el pedido antes de cotizar.');
    setCheckoutButtonState(true);
    return;
  }

  setCheckoutError('');

  const name = (document.getElementById('checkout-name')?.value || '').trim();
  const phone = (document.getElementById('checkout-phone')?.value || '').trim();
  const email = (document.getElementById('checkout-email')?.value || '').trim();
  const notes = (document.getElementById('checkout-notes')?.value || '').trim();

  const summary = getCheckoutSummary(cart, productsById);
  const lines = cart.map(item => {
    const product = productsById.get(String(item.id));
    if (!product) return null;
    const discount = Number(product.discount) || 0;
    const finalPrice = discount > 0 ? Math.round(product.price * (1 - discount / 100)) : product.price;
    const lineTotal = finalPrice * item.qty;
    return `• ${product.name} x${item.qty}: $${lineTotal.toLocaleString('es-CL')}`;
  }).filter(Boolean);

  const message = [
    'Hola, quiero solicitar una cotización formal:',
    '',
    `*Cliente:* ${name}`,
    `*Teléfono:* ${phone}`,
    email ? `*Email:* ${email}` : '',
    notes ? `*Comentarios:* ${notes}` : '',
    '',
    '*Detalle de los productos:*',
    ...lines,
    '',
    `*Subtotal:* $${summary.subtotal.toLocaleString('es-CL')}`,
    `*Descuento:* -$${summary.discount.toLocaleString('es-CL')}`,
    `*Total estimado:* $${summary.total.toLocaleString('es-CL')}`
  ].filter(Boolean).join('\n');

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_QUOTE_PHONE}&text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

window.addEventListener('DOMContentLoaded', () => {
  renderCheckout().catch(error => {
    console.warn('No se pudo renderizar el checkout.', error);
    setCheckoutError('No fue posible cargar el resumen del pedido. Recarga la página para intentarlo nuevamente.');
  });
  document.getElementById('checkout-form')?.addEventListener('submit', sendWhatsAppQuote);
});