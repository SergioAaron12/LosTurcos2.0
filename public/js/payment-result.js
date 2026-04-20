function getPendingOrderFromSession() {
  try {
    return JSON.parse(sessionStorage.getItem('pendingTransbankOrder') || 'null');
  } catch (error) {
    return null;
  }
}

function formatCurrency(value) {
  return `$${(Number(value) || 0).toLocaleString('es-CL')}`;
}

function setPaymentHero(status, title, description, badgeClassName, badgeText) {
  const badge = document.getElementById('payment-badge');
  const hero = document.getElementById('payment-hero');
  document.getElementById('payment-title').textContent = title;
  document.getElementById('payment-description').textContent = description;

  if (badge) {
    badge.className = `inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${badgeClassName}`;
    badge.textContent = badgeText;
  }

  if (hero) {
    hero.dataset.status = status;
  }
}

function renderOrderMeta(order) {
  const meta = document.getElementById('payment-order-meta');
  if (!meta) return;

  meta.innerHTML = `
    <div>
      <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Orden</div>
      <div class="mt-1 font-semibold text-slate-900">${order.buyOrder || order.orderId}</div>
    </div>
    <div>
      <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Cliente</div>
      <div class="mt-1 font-semibold text-slate-900">${order.customer?.name || '-'}</div>
      <div class="text-xs text-slate-500">${order.customer?.email || ''}</div>
    </div>
  `;
  meta.classList.remove('hidden');
}

function renderOrderItems(order) {
  const itemsContainer = document.getElementById('payment-items');
  if (!itemsContainer) return;

  itemsContainer.innerHTML = (order.items || []).map(item => `
    <article class="flex gap-4 rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <img src="${item.img || ''}" alt="${item.name || 'Producto'}" class="h-20 w-20 rounded-2xl object-cover bg-stone-100" />
      <div class="min-w-0 flex-1">
        <h3 class="text-sm font-semibold text-slate-900">${item.name || 'Producto'}</h3>
        <p class="mt-1 text-xs text-slate-500">Cantidad: ${item.qty}</p>
        <div class="mt-2 text-sm text-slate-600">Valor unitario: ${formatCurrency(item.unitPrice)}</div>
      </div>
      <div class="text-right text-sm font-semibold text-amber-700">${formatCurrency(item.lineTotal)}</div>
    </article>
  `).join('');
}

function renderSummary(order) {
  document.getElementById('payment-subtotal').textContent = formatCurrency(order.subtotal);
  document.getElementById('payment-discount').textContent = `-${formatCurrency(order.discount).replace('$', '$')}`;
  document.getElementById('payment-total').textContent = formatCurrency(order.amount);
}

function renderTransbankData(order) {
  const container = document.getElementById('payment-transbank-data');
  if (!container) return;

  const details = [];
  if (order.transbank?.authorizationCode) {
    details.push(`<div><span class="text-slate-400">Autorización</span><div class="font-semibold text-slate-900">${order.transbank.authorizationCode}</div></div>`);
  }
  if (order.transbank?.cardNumber) {
    details.push(`<div><span class="text-slate-400">Tarjeta</span><div class="font-semibold text-slate-900">**** ${order.transbank.cardNumber}</div></div>`);
  }
  if (order.transbank?.paymentTypeCode) {
    details.push(`<div><span class="text-slate-400">Tipo de pago</span><div class="font-semibold text-slate-900">${order.transbank.paymentTypeCode}</div></div>`);
  }
  if (order.transbank?.installmentsNumber) {
    details.push(`<div><span class="text-slate-400">Cuotas</span><div class="font-semibold text-slate-900">${order.transbank.installmentsNumber}</div></div>`);
  }
  if (order.transbank?.transactionDate) {
    details.push(`<div><span class="text-slate-400">Fecha</span><div class="font-semibold text-slate-900">${new Date(order.transbank.transactionDate).toLocaleString('es-CL')}</div></div>`);
  }

  if (details.length === 0) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }

  container.classList.remove('hidden');
  container.innerHTML = `<h3 class="mb-4 text-base font-semibold text-slate-900">Datos de Transbank</h3><div class="grid gap-4 md:grid-cols-2">${details.join('')}</div>`;
}

function applyStatusPresentation(order, fallbackStatus) {
  const message = document.getElementById('payment-message');
  const rawStatus = order?.status || fallbackStatus || 'UNKNOWN';
  const status = String(rawStatus).trim().toUpperCase().replace(/-/g, '_');

  if (status === 'AUTHORIZED') {
    setPaymentHero(
      'authorized',
      'Pago aprobado',
      'La transacción fue autorizada y el stock del pedido quedó descontado del catálogo.',
      'bg-emerald-100 text-emerald-800',
      'Pago confirmado'
    );
    if (message) {
      message.className = 'rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800';
      message.textContent = 'Tu pago fue aprobado por Transbank. Este comprobante corresponde a la página de resultado del comercio.';
    }
    localStorage.removeItem('cart');
    sessionStorage.removeItem('pendingTransbankOrder');
    return;
  }

  if (status === 'ABORTED' || status === 'TIMEOUT') {
    setPaymentHero(
      'aborted',
      'Pago no completado',
      'La transacción no alcanzó a confirmarse en Webpay Plus. Puedes volver al checkout y reintentar el pago.',
      'bg-amber-100 text-amber-800',
      'Pago interrumpido'
    );
    if (message) {
      message.className = 'rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800';
      message.textContent = 'No se realizó el cobro. El carrito se mantiene para que puedas intentar otra vez.';
    }
    return;
  }

  if (status === 'PAID_MANUAL_REVIEW' || status === 'PAID_VALIDATION_ERROR' || status === 'MANUAL_REVIEW') {
    setPaymentHero(
      'manual-review',
      'Pago recibido con revisión manual',
      'Transbank autorizó el cargo, pero la orden quedó marcada para revisión interna antes de cerrar el proceso.',
      'bg-sky-100 text-sky-800',
      'Revisión necesaria'
    );
    if (message) {
      message.className = 'rounded-3xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800';
      message.textContent = 'Debes revisar esta orden en administración antes de despachar. El cliente ya podría haber sido cobrado.';
    }
    sessionStorage.removeItem('pendingTransbankOrder');
    return;
  }

  setPaymentHero(
    'failed',
    'Pago rechazado o con error',
    'La transacción no se pudo confirmar correctamente. Puedes volver al checkout o contactar al comercio.',
    'bg-red-100 text-red-800',
    'Pago no aprobado'
  );
  if (message) {
    message.className = 'rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800';
    message.textContent = 'No se confirmó un pago exitoso para esta orden.';
  }
}

async function loadOrderResult() {
  const params = new URLSearchParams(window.location.search);
  const pendingOrder = getPendingOrderFromSession();
  const orderId = params.get('orderId') || pendingOrder?.orderId || '';
  const accessCode = params.get('access') || pendingOrder?.accessCode || '';
  const fallbackStatus = params.get('status') || '';

  if (!orderId || !accessCode) {
    applyStatusPresentation(null, fallbackStatus || 'ERROR');
    return;
  }

  const response = await fetch(`/api/transbank/order?orderId=${encodeURIComponent(orderId)}&accessCode=${encodeURIComponent(accessCode)}`);
  const data = await response.json();
  if (!response.ok) {
    applyStatusPresentation(null, fallbackStatus || 'ERROR');
    return;
  }

  const order = data.order;
  renderOrderMeta(order);
  renderOrderItems(order);
  renderSummary(order);
  renderTransbankData(order);
  applyStatusPresentation(order, fallbackStatus);
}

window.addEventListener('DOMContentLoaded', () => {
  void loadOrderResult();
});