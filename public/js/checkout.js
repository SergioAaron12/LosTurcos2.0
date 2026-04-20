function getStoredCart() {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch (error) {
    return [];
  }
}

function getStoredProducts() {
  try {
    return JSON.parse(localStorage.getItem('products') || '[]');
  } catch (error) {
    return [];
  }
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

function renderCheckout() {
  const cart = getStoredCart();
  const products = getStoredProducts();
  const productsById = new Map(products.map(product => [String(product.id), product]));
  const emptyState = document.getElementById('checkout-empty');
  const content = document.getElementById('checkout-content');
  const itemsContainer = document.getElementById('checkout-items');
  const submitButton = document.getElementById('checkout-submit');

  if (!itemsContainer || !emptyState || !content || !submitButton) return;

  if (cart.length === 0) {
    emptyState.classList.remove('hidden');
    content.classList.add('hidden');
    submitButton.disabled = true;
    submitButton.classList.add('opacity-50', 'cursor-not-allowed');
    return;
  }

  emptyState.classList.add('hidden');
  content.classList.remove('hidden');
  submitButton.disabled = false;
  submitButton.classList.remove('opacity-50', 'cursor-not-allowed');

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
}

function createAndSubmitTransbankForm(url, token) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;

  const tokenInput = document.createElement('input');
  tokenInput.type = 'hidden';
  tokenInput.name = 'token_ws';
  tokenInput.value = token;

  form.appendChild(tokenInput);
  document.body.appendChild(form);
  form.submit();
}

async function startTransbankCheckout(event) {
  event.preventDefault();

  const submitButton = document.getElementById('checkout-submit');
  if (!submitButton) return;

  const cart = getStoredCart();
  if (cart.length === 0) {
    setCheckoutError('Tu carrito está vacío.');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Preparando pago...';
  setCheckoutError('');

  try {
    const payload = {
      customer: {
        name: document.getElementById('checkout-name')?.value || '',
        email: document.getElementById('checkout-email')?.value || '',
        phone: document.getElementById('checkout-phone')?.value || '',
        notes: document.getElementById('checkout-notes')?.value || ''
      },
      items: cart.map(item => ({ id: item.id, qty: item.qty }))
    };

    const response = await fetch('/api/transbank/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'No fue posible iniciar el pago con Transbank.');
    }

    sessionStorage.setItem('pendingTransbankOrder', JSON.stringify({
      orderId: data.orderId,
      accessCode: data.accessCode
    }));

    createAndSubmitTransbankForm(data.url, data.token);
  } catch (error) {
    setCheckoutError(error.message || 'No fue posible iniciar el pago con Transbank.');
    submitButton.disabled = false;
    submitButton.textContent = 'Ir a pagar con Transbank';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  renderCheckout();
  document.getElementById('checkout-form')?.addEventListener('submit', startTransbankCheckout);
});