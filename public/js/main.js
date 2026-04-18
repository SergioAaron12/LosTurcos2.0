const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBIN5wILjhmFhHFxBwuJuKPsZyUNziPDFQ',
  authDomain: 'losturcos2.firebaseapp.com',
  projectId: 'losturcos2',
  storageBucket: 'losturcos2.firebasestorage.app',
  messagingSenderId: '353259282248',
  appId: '1:353259282248:web:212a5dbe7ee28ed5cedd7d'
};

const FIRESTORE_PRODUCTS_COLLECTION = 'products';
let firebaseAppReadyPromise = null;
let remoteProductsHydrationPromise = null;

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
    if (!window.firebase) {
      throw new Error('Firebase no quedó disponible en ventana global.');
    }

    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(FIREBASE_CONFIG);
    }

    return window.firebase.firestore();
  });

  return firebaseAppReadyPromise;
}

function normalizeProduct(product) {
  return {
    id: Number(product.id),
    name: product.name || '',
    price: Number(product.price) || 0,
    stock: Number(product.stock) || 0,
    category: product.category || '',
    discount: Number(product.discount) || 0,
    img: product.img || '',
    details: product.details || '',
    showcase: product.showcase || 'index'
  };
}

async function fetchProductsFromFirestore() {
  const db = await initFirebaseApp();
  const snapshot = await db.collection(FIRESTORE_PRODUCTS_COLLECTION).get();
  return snapshot.docs
    .map(doc => normalizeProduct(doc.data()))
    .sort((left, right) => left.id - right.id);
}

async function persistProductsToFirestore(productList) {
  const db = await initFirebaseApp();
  const batch = db.batch();
  const snapshot = await db.collection(FIRESTORE_PRODUCTS_COLLECTION).get();
  const incomingIds = new Set(productList.map(product => String(product.id)));

  snapshot.forEach(doc => {
    if (!incomingIds.has(doc.id)) {
      batch.delete(doc.ref);
    }
  });

  productList.forEach(product => {
    const normalized = normalizeProduct(product);
    batch.set(db.collection(FIRESTORE_PRODUCTS_COLLECTION).doc(String(normalized.id)), normalized);
  });

  await batch.commit();
}

function getDefaultProducts() {
  return [
    {id:5, name:'Alfombras Kilim pack 5 ud', price:285000, img:'https://picsum.photos/id/29/800/900', discount:18, category:'Textiles', stock:10},
    {id:6, name:'Toallas Hammam pack 20 ud', price:145000, img:'https://picsum.photos/id/160/800/900', discount:0, category:'Textiles', stock:10},
    {id:7, name:'Bata de Baño Turca', price:39000, img:'https://picsum.photos/id/1011/800/900', discount:5, category:'Textiles', stock:10},
    {id:8, name:'Jabón Alepo Natural caja 50 ud', price:95000, img:'https://picsum.photos/id/201/800/900', discount:0, category:'Aseo', stock:10},
    {id:9, name:'Jabón Líquido Perfumado caja 12 ud', price:35000, img:'https://picsum.photos/id/405/800/900', discount:0, category:'Aseo', stock:10},
    {id:10, name:'Pasta Dental Premium pack 24 ud', price:45000, img:'https://picsum.photos/id/455/800/900', discount:5, category:'Aseo', stock:10},
    {id:11, name:'Champú Natural Turco pack 10 ud', price:48000, img:'https://picsum.photos/id/420/800/900', discount:8, category:'Cuidado Capilar', stock:10},
    {id:12, name:'Acondicionador Herbal pack 10 ud', price:52000, img:'https://picsum.photos/id/1025/800/900', discount:0, category:'Cuidado Capilar', stock:10},
    {id:13, name:'Crema Corporal Humectante caja 24 ud', price:52000, img:'https://picsum.photos/id/435/800/900', discount:0, category:'Cuidado Adulto', stock:10},
    {id:14, name:'Desodorante Spray pack 12 ud', price:38000, img:'https://picsum.photos/id/445/800/900', discount:0, category:'Cuidado Adulto', stock:10},
    {id:15, name:'Loción Corporal Aromática caja 10 ud', price:62000, img:'https://picsum.photos/id/465/800/900', discount:0, category:'Cuidado Adulto', stock:10}
  ];
}

async function hydrateProductsFromFirestore() {
  if (remoteProductsHydrationPromise) return remoteProductsHydrationPromise;

  remoteProductsHydrationPromise = (async () => {
    const localProducts = getInitialProducts();

    try {
      const remoteProducts = await fetchProductsFromFirestore();
      if (remoteProducts.length > 0) {
        products = remoteProducts;
        localStorage.setItem('products', JSON.stringify(products));
        return;
      }

      products = localProducts.length > 0 ? localProducts : getDefaultProducts();
      localStorage.setItem('products', JSON.stringify(products));
      if (products.length > 0) {
        await persistProductsToFirestore(products);
      }
    } catch (error) {
      console.warn('No se pudo sincronizar productos con Firestore. Se usará almacenamiento local.', error);
      products = localProducts.length > 0 ? localProducts : getDefaultProducts();
      localStorage.setItem('products', JSON.stringify(products));
    }
  })();

  return remoteProductsHydrationPromise;
}

// Sincronizar products con localStorage
function syncProductsFromStorage() {
  const saved = localStorage.getItem('products');
  products = saved ? JSON.parse(saved) : [];
}
// Funciones principales JS para la tienda
// Incluye: buscador, renderizado de productos, carrito, filtros, etc.

// ...código JS extraído de inicio3.html...
// Buscador de productos
let searchSuggestionIndex = -1;

function getSearchMatches(query, limit = null) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  const matches = products.filter(p =>
    p.name.toLowerCase().includes(normalizedQuery) ||
    (p.category || '').toLowerCase().includes(normalizedQuery) ||
    (p.details || '').toLowerCase().includes(normalizedQuery)
  );

  return limit ? matches.slice(0, limit) : matches;
}

function getTodosPagePath() {
  return window.location.pathname.includes('/html/') ? './todos.html' : 'html/todos.html';
}

function redirectToTodosSearch(query) {
  window.location.href = `${getTodosPagePath()}?search=${encodeURIComponent(query)}`;
}

function hideSearchResultsSection() {
  const section = document.getElementById('search-results-section');
  const grid = document.getElementById('search-results-grid');
  const summary = document.getElementById('search-results-summary');
  if (section) section.classList.add('hidden');
  if (grid) grid.innerHTML = '';
  if (summary) summary.textContent = '';
}

function renderSearchResultsSection(results, query) {
  const section = document.getElementById('search-results-section');
  const grid = document.getElementById('search-results-grid');
  const summary = document.getElementById('search-results-summary');
  if (!section || !grid || !summary) return;

  section.classList.remove('hidden');
  summary.textContent = `${results.length} resultado${results.length === 1 ? '' : 's'} para "${query}"`;

  if (results.length === 0) {
    grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10">No se encontraron productos para tu búsqueda.</p>';
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  renderProducts('search-results-grid', results);
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderAllProductsSection() {
  syncProductsFromStorage();
  const sortSelect = document.getElementById('ordenar');
  const criterion = sortSelect ? sortSelect.value : 'default';
  const allProducts = applySortCriteria([...products], criterion);
  renderProducts('products-grid', allProducts);
}

function buscarProductos() {
  syncProductsFromStorage();
  const query = document.getElementById('buscador').value.trim().toLowerCase();
  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  hideSearchSuggestions();
  if (!query) {
    if (pageName === 'index.html') {
      initHomePage();
    } else if (pageName === 'todos.html') {
      hideSearchResultsSection();
      renderAllProductsSection();
    } else {
      renderProducts('products-grid');
    }
    return;
  }

  const resultados = getSearchMatches(query);

  if (pageName !== 'todos.html') {
    redirectToTodosSearch(query);
    return;
  }

  renderSearchResultsSection(resultados, query);
  renderAllProductsSection();

  if (resultados.length === 0) {
    clearHighlightedSearchResults();
    return;
  }

  focusProductSearchResult(resultados[0]);
}

function showSearchNotFound() {
  const productsSection = document.getElementById('productos');
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10">No se encontraron productos para tu búsqueda.</p>';
  const counter = document.getElementById('productos-encontrados');
  if (counter) {
    counter.textContent = '0 productos';
  }
  productsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderSearchSuggestions() {
  syncProductsFromStorage();
  const input = document.getElementById('buscador');
  const container = document.getElementById('buscador-sugerencias');
  if (!input || !container) return;

  const matches = getSearchMatches(input.value, 6);
  searchSuggestionIndex = -1;

  if (matches.length === 0 || !input.value.trim()) {
    hideSearchSuggestions();
    return;
  }

  container.innerHTML = matches.map((product, index) => {
    const discountedPrice = getDiscountedUnitPrice(product);
    const priceMarkup = Number(product.discount) > 0
      ? `<span class="text-xs text-gray-400 line-through mr-2">$${product.price.toLocaleString('es-CL')}</span><span class="font-semibold text-turquoise-jewel">$${discountedPrice.toLocaleString('es-CL')}</span>`
      : `<span class="font-semibold text-turquoise-jewel">$${product.price.toLocaleString('es-CL')}</span>`;

    return `<button type="button" class="search-suggestion-item w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0" data-index="${index}" data-product-id="${product.id}"><img src="${product.img}" alt="${product.name}" class="w-12 h-12 rounded-lg object-cover bg-gray-50" /><span class="flex-1 min-w-0"><span class="block text-sm font-semibold text-dark-royal truncate">${product.name}</span><span class="block text-xs text-gray-500 truncate">${product.category || 'Sin categoría'}</span></span><span class="text-sm whitespace-nowrap">${priceMarkup}</span></button>`;
  }).join('');

  container.classList.remove('hidden');

  container.querySelectorAll('.search-suggestion-item').forEach(button => {
    button.addEventListener('click', () => {
      const productId = Number(button.dataset.productId);
      const product = products.find(item => item.id === productId);
      if (!product) return;
      document.getElementById('buscador').value = product.name;
      hideSearchSuggestions();
      executeProductSearch(product);
    });
  });
}

function updateSearchSuggestionSelection(items) {
  items.forEach((item, index) => {
    item.classList.toggle('bg-gray-50', index === searchSuggestionIndex);
  });
}

function handleSearchInputKeydown(event) {
  const container = document.getElementById('buscador-sugerencias');
  if (!container || container.classList.contains('hidden')) return;

  const items = Array.from(container.querySelectorAll('.search-suggestion-item'));
  if (items.length === 0) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    searchSuggestionIndex = (searchSuggestionIndex + 1) % items.length;
    updateSearchSuggestionSelection(items);
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    searchSuggestionIndex = (searchSuggestionIndex - 1 + items.length) % items.length;
    updateSearchSuggestionSelection(items);
    return;
  }

  if (event.key === 'Enter' && searchSuggestionIndex >= 0) {
    event.preventDefault();
    items[searchSuggestionIndex].click();
    return;
  }

  if (event.key === 'Escape') {
    hideSearchSuggestions();
  }
}

function hideSearchSuggestions() {
  const container = document.getElementById('buscador-sugerencias');
  if (!container) return;
  container.innerHTML = '';
  container.classList.add('hidden');
  searchSuggestionIndex = -1;
}

function executeProductSearch(product) {
  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  if (pageName !== 'todos.html') {
    redirectToTodosSearch(product.name);
    return;
  }

  document.getElementById('buscador').value = product.name;
  buscarProductos();
}

function applySearchFromUrl() {
  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  if (pageName !== 'todos.html') return;

  const params = new URLSearchParams(window.location.search);
  const search = params.get('search');
  if (!search) return;

  const input = document.getElementById('buscador');
  if (!input) return;

  input.value = search;
  buscarProductos();
}

function clearHighlightedSearchResults() {
  document.querySelectorAll('[data-search-highlight="true"]').forEach(card => {
    card.dataset.searchHighlight = 'false';
    card.classList.remove('ring-4', 'ring-turquoise-jewel', 'ring-offset-4', 'ring-offset-white');
  });
}

function focusProductSearchResult(product) {
  const targetSelector = `[data-product-id="${product.id}"]`;
  const searchResultsSection = document.getElementById('search-results-grid');
  const productsSection = document.getElementById('products-grid');
  const searchResultCard = searchResultsSection?.querySelector(targetSelector);
  const productCard = productsSection?.querySelector(targetSelector);

  if (!searchResultCard && !productCard) {
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  clearHighlightedSearchResults();
  [searchResultCard, productCard].filter(Boolean).forEach(card => {
    card.dataset.searchHighlight = 'true';
    card.classList.add('ring-4', 'ring-turquoise-jewel', 'ring-offset-4', 'ring-offset-white');
  });

  const preferredCard = searchResultCard || productCard;
  preferredCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function initSearchSuggestions() {
  const input = document.getElementById('buscador');
  if (!input || input.dataset.suggestionsBound === 'true') return;

  input.dataset.suggestionsBound = 'true';
  input.addEventListener('input', renderSearchSuggestions);
  input.addEventListener('focus', renderSearchSuggestions);
  input.addEventListener('keydown', handleSearchInputKeydown);
  input.addEventListener('blur', () => {
    setTimeout(hideSearchSuggestions, 150);
  });

  document.addEventListener('click', event => {
    if (event.target.closest('form')?.querySelector('#buscador')) return;
    hideSearchSuggestions();
  });
}
function getInitialProducts() {
  const saved = localStorage.getItem('products');
  if (saved) return JSON.parse(saved);
  return getDefaultProducts();
}

let products = getInitialProducts();

function saveProducts() {
  localStorage.setItem('products', JSON.stringify(products));
  persistProductsToFirestore(products).catch(error => {
    console.warn('No se pudo guardar productos en Firestore.', error);
  });
}

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
  document.getElementById('cart-count').textContent = cart.reduce((acc, item) => acc + item.qty, 0);
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function renderCart() {
  let html = '';
  if (cart.length === 0) {
    html = '<p class="text-center py-6">El carrito está vacío.</p>';
  } else {
    html = '<ul>' + cart.map(item => {
      const prod = products.find(p => p.id === item.id);
      return `<li class=\"flex items-center gap-2 py-2 border-b\"><img src=\"${prod.img}\" class=\"w-12 h-12 object-cover rounded\"/><span class=\"flex-1\">${prod.name}</span><span>x${item.qty}</span><span class=\"font-bold\">$${(prod.price * item.qty).toLocaleString('es-CL')}</span><button onclick=\"removeFromCart(${item.id})\" class=\"ml-2 text-red-500 hover:text-red-700\"><i class=\"fa fa-trash\"></i></button></li>`;
    }).join('') + '</ul>';
    html += `<div class=\"text-right font-bold mt-4\">Total: $${cart.reduce((acc, item) => acc + products.find(p => p.id === item.id).price * item.qty, 0).toLocaleString('es-CL')}</div>`;
  }
  if (document.getElementById('cart-modal-body')) {
    document.getElementById('cart-modal-body').innerHTML = html;
  }
}

function toggleCart() {
  const modal = ensureCartModal();
  renderCart();
  modal.classList.toggle('hidden');
}



function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

document.addEventListener('DOMContentLoaded', updateCartCount);

// MODO ADMINISTRADOR (estructura básica)
let adminMode = false;
let adminAuthenticated = false;

function toggleAdmin() {
  adminMode = !adminMode;
  document.getElementById('admin-modal').classList.toggle('hidden');
  if (adminMode) {
    adminAuthenticated = false;
    document.getElementById('admin-auth').classList.remove('hidden');
    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('admin-password').value = '';
    document.getElementById('admin-auth-error').classList.add('hidden');
    hideProductForm();
  }
}

function checkAdminPassword() {
  const pass = document.getElementById('admin-password').value;
  if (pass === 'Brujit@31$') {
    adminAuthenticated = true;
    document.getElementById('admin-auth').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
    renderAdminProducts();
  } else {
    document.getElementById('admin-auth-error').classList.remove('hidden');
  }
}

function renderAdminProducts() {
  const grid = document.getElementById('admin-products-grid');
  if (!grid) return;
  grid.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'border p-3 rounded mb-2 flex items-center gap-3';
    card.innerHTML = `
      <img src="${p.img}" class="w-16 h-16 object-cover rounded"/>
      <div class="flex-1">
        <div class="font-bold">${p.name}</div>
        <div>Stock: <span id="stock-${p.id}">${p.stock || 0}</span></div>
        <div>Precio: $${p.price.toLocaleString('es-CL')}</div>
        <div>Categoría: ${p.category || ''}</div>
        <div>Descuento: ${p.discount || 0}%</div>
      </div>
      <button onclick="editProduct(${p.id})" class="px-2 py-1 bg-blue-500 text-white rounded">Editar</button>
      <button onclick="deleteProduct(${p.id})" class="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button>
    `;
    grid.appendChild(card);
  });
}

function showProductForm(editId = null) {
  document.getElementById('product-form').classList.remove('hidden');
  if (editId) {
    const prod = products.find(p => p.id === editId);
    document.getElementById('product-id').value = prod.id;
    document.getElementById('product-name').value = prod.name;
    document.getElementById('product-price').value = prod.price;
    document.getElementById('product-stock').value = prod.stock || 0;
    document.getElementById('product-category').value = prod.category || '';
    document.getElementById('product-discount').value = prod.discount || 0;
    document.getElementById('product-img').value = prod.img;
  } else {
    document.getElementById('product-id').value = '';
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-stock').value = '';
    document.getElementById('product-category').value = '';
    document.getElementById('product-discount').value = '';
    document.getElementById('product-img').value = '';
  }
}

function hideProductForm() {
  document.getElementById('product-form').classList.add('hidden');
}

// Guardar producto (alta o edición)
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('product-form');
  if (form) {
    form.onsubmit = function(e) {
      e.preventDefault();
      const id = document.getElementById('product-id').value;
      const name = document.getElementById('product-name').value;
      const price = parseInt(document.getElementById('product-price').value);
      const stock = parseInt(document.getElementById('product-stock').value);
      const category = document.getElementById('product-category').value;
      const discount = parseInt(document.getElementById('product-discount').value) || 0;
      const img = document.getElementById('product-img').value;
      if (id) {
        // Editar
        const idx = products.findIndex(p => p.id == id);
        if (idx > -1) {
          products[idx] = { ...products[idx], name, price, stock, category, discount, img };
        }
      } else {
        // Nuevo
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({ id: newId, name, price, stock, category, discount, img });
      }
      saveProducts();
      hideProductForm();
      renderAdminProducts();
      renderProducts('products-grid');
    };
  }
});

function editProduct(id) {
  showProductForm(id);
}

function deleteProduct(id) {
  if (confirm('¿Seguro que deseas eliminar este producto?')) {
    const idx = products.findIndex(p => p.id === id);
    if (idx > -1) {
      products.splice(idx, 1);
      saveProducts();
      renderAdminProducts();
      renderProducts('products-grid');
    }
  }
}
let selectedCategory = 'Todos';

function filterByCategory(category) {
  selectedCategory = category;
  renderProducts('products-grid');
}


function ensureSuccessToast() {
  let toast = document.getElementById('success-toast');
  if (toast) return toast;

  toast = document.createElement('div');
  toast.id = 'success-toast';
  toast.style.display = 'none';
  toast.className = 'fixed top-8 left-1/2 -translate-x-1/2 z-[9999] bg-green-500 text-black px-6 py-3 rounded-lg shadow-lg text-lg font-semibold transition-all duration-300';
  toast.textContent = 'Agregado con éxito';
  document.body.appendChild(toast);
  return toast;
}

function ensureProductDetailModal() {
  let modal = document.getElementById('product-detail-modal');
  if (modal && document.getElementById('product-detail-content')) {
    return modal;
  }

  modal = document.createElement('div');
  modal.id = 'product-detail-modal';
  modal.className = 'hidden fixed inset-0 bg-gris/60 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white w-full max-w-3xl mx-5 rounded-2xl overflow-hidden shadow-2xl border border-gold-lux/20 relative max-h-[90vh] flex flex-col">
      <button type="button" onclick="closeProductModal()" aria-label="Cerrar" class="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-dark-royal text-black border border-white shadow-md flex items-center justify-center text-xl font-bold leading-none hover:bg-gray-300 transition">×</button>
      <div id="product-detail-content" class="p-5 pt-11 overflow-hidden"></div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

function ensureCartModal() {
  let modal = document.getElementById('cart-modal');
  if (modal && document.getElementById('cart-items')) {
    return modal;
  }

  modal = document.createElement('div');
  modal.id = 'cart-modal';
  modal.className = 'fixed inset-0 bg-black/40 flex items-center justify-center z-50 hidden';
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md relative overflow-hidden">
      <button onclick="toggleCart()" class="absolute top-2 right-2 text-gray-500 hover:text-red-500"><i class="fa fa-times"></i></button>
      <div class="p-6 border-b">
        <h2 class="text-xl font-bold">Carrito de Compras</h2>
      </div>
      <div id="cart-items" class="p-6 max-h-[55vh] overflow-y-auto"></div>
      <div class="p-6 bg-gray-50 border-t space-y-3">
        <div class="flex items-center justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span id="cart-subtotal">$0</span>
        </div>
        <div class="flex items-center justify-between text-sm text-green-700">
          <span>Descuento</span>
          <span id="cart-discount">-$0</span>
        </div>
        <div class="flex items-center justify-between text-lg font-bold">
          <span>Total</span>
          <span id="cart-total">$0</span>
        </div>
        <button onclick="checkout()" class="w-full px-4 py-3 bg-gold-lux text-dark-royal rounded hover:bg-yellow-400 transition font-semibold">Solicitar cotización</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

function getProductPriceMarkup(product) {
  const hasDiscount = Number(product.discount) > 0;
  if (!hasDiscount) {
    return `<span class="font-bold text-turquoise-jewel">$${product.price.toLocaleString('es-CL')}</span>`;
  }

  const finalPrice = getDiscountedUnitPrice(product);
  return `<span class="line-through text-gray-400 mr-2">$${product.price.toLocaleString('es-CL')}</span><span class="font-bold text-turquoise-jewel">$${finalPrice.toLocaleString('es-CL')}</span>`;
}

function getDiscountedUnitPrice(product) {
  const discount = Number(product.discount) || 0;
  return discount > 0 ? Math.round(product.price * (1 - discount / 100)) : product.price;
}

function getCartSummary() {
  return cart.reduce((acc, item) => {
    const product = products.find(p => p.id === item.id);
    if (!product) return acc;

    const baseLineTotal = product.price * item.qty;
    const finalLineTotal = getDiscountedUnitPrice(product) * item.qty;

    acc.subtotal += baseLineTotal;
    acc.total += finalLineTotal;
    acc.discount += baseLineTotal - finalLineTotal;

    return acc;
  }, { subtotal: 0, discount: 0, total: 0 });
}

function getProductsByShowcase(showcase) {
  syncProductsFromStorage();
  return products.filter(product => (product.showcase || 'index') === showcase);
}

function getOfferProducts() {
  syncProductsFromStorage();
  const seen = new Set();
  return products.filter(product => {
    const isOffer = (product.showcase || 'index') === 'ofertas' || Number(product.discount) > 0;
    if (!isOffer || seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

function renderHomeSection(containerId, showcase, emptyMessage) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const sectionProducts = getProductsByShowcase(showcase);
  if (sectionProducts.length === 0) {
    container.innerHTML = `<p class="col-span-full text-center text-gray-500 py-10">${emptyMessage}</p>`;
    return;
  }

  renderProducts(containerId, sectionProducts);
}

function initHomePage() {
  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  if (pageName !== 'index.html') return;

  renderProducts('ofertas-grid', getOfferProducts());
  renderHomeSection('nuevos-grid', 'nuevos', 'No hay productos nuevos por ahora.');

  renderHomeCatalog();

  const sortSelect = document.getElementById('ordenar');
  if (!sortSelect || sortSelect.dataset.homeBound === 'true') return;

  sortSelect.dataset.homeBound = 'true';
  sortSelect.addEventListener('change', renderHomeCatalog);
}

function renderHomeCatalog() {
  syncProductsFromStorage();
  const sortSelect = document.getElementById('ordenar');
  const criterion = sortSelect ? sortSelect.value : 'relevancia';
  const featuredProducts = applySortCriteria([...products], criterion).slice(0, 8);
  renderProducts('products-grid', featuredProducts);
}

function renderProducts(containerId, listOrOnlyDiscount = false) {
  syncProductsFromStorage();
  const grid = document.getElementById(containerId);
  if (!grid) return;
  const showQuickAdd = true;

  const onlyDiscount = typeof listOrOnlyDiscount === 'boolean' ? listOrOnlyDiscount : false;
  const externalList = Array.isArray(listOrOnlyDiscount) ? listOrOnlyDiscount : null;
  grid.innerHTML = '';
  let filtered = externalList || (onlyDiscount ? products.filter(p => p.discount > 0) : products);
  if (!externalList && selectedCategory !== 'Todos') {
    const catNorm = selectedCategory.trim().toLowerCase();
    filtered = filtered.filter(p => (p.category || '').trim().toLowerCase() === catNorm);
  }

  const counter = document.getElementById('productos-encontrados');
  if (counter) {
    counter.textContent = `${filtered.length} producto${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="text-center text-gray-500 py-10">No hay productos disponibles.</p>';
    return;
  }

  filtered.forEach(p => {
    const imageClass = containerId === 'ofertas-grid'
      ? 'w-full h-41 object-contain bg-white p-3'
      : 'w-full h-60 object-cover';
    const badge = p.discount ? 
      `<span class="absolute top-3 right-3 bg-pomegranate text-white text-xs font-bold px-3 py-1 rounded-full shadow lux-frame">-${p.discount}%</span>` : '';
    const quickAddButton = showQuickAdd
      ? `<button class="w-full py-3 btn-lux rounded-lg font-medium transition text-sm add-product-btn" data-id="${p.id}">+ Agregar</button>`
      : '';
    const actionsMarkup = showQuickAdd
      ? `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><button class="w-full py-3 bg-gold-lux/10 hover:bg-gold-lux/25 text-gold-lux border border-gold-lux/30 rounded-lg font-medium transition text-sm show-detail-btn" data-id="${p.id}">Ver detalle</button>${quickAddButton}</div>`
      : `<button class="w-full py-3 bg-gold-lux/10 hover:bg-gold-lux/25 text-gold-lux border border-gold-lux/30 rounded-lg font-medium transition text-sm show-detail-btn" data-id="${p.id}">Ver detalle</button>`;
    const card = document.createElement('div');
    card.className = 'product-card relative cursor-pointer';
    card.dataset.productId = p.id;
    card.innerHTML = `
      <img src="${p.img}" class="${imageClass}" alt="${p.name}">
      ${badge}
      <div class="p-5">
        <h3 class="text-lg ornate-serif font-semibold mb-2 text-gold-lux">${p.name}</h3>
        <div class="text-xl mb-3">${getProductPriceMarkup(p)}</div>
        ${actionsMarkup}
      </div>
    `;
    card.addEventListener('click', function(e) {
      if (e.target.closest('button')) return;
      showProductDetailModal(p.id);
    });
    grid.appendChild(card);
  });

  // Asignar eventos a los botones de detalle
  grid.querySelectorAll('.show-detail-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = parseInt(this.getAttribute('data-id'));
      showProductDetailModal(id);
    });
  });

  grid.querySelectorAll('.add-product-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = parseInt(this.getAttribute('data-id'));
      const added = addToCart(id, 1);
      if (added) {
        showSuccessToast('Agregado con éxito');
      }
    });
  });
}

// Modal de detalle de producto UNIFICADO para todos los productos
function showProductDetailModal(id) {
  syncProductsFromStorage();
  const product = products.find(p => p.id === id);
  if (!product) return;
  const modal = ensureProductDetailModal();
  const content = document.getElementById('product-detail-content');
  const stock = product.stock !== undefined ? product.stock : 10;
  const detailText = product.details && product.details.trim() ? product.details : 'Sin descripción disponible.';
  const hasLongDescription = detailText.length > 220;
  const descriptionHint = hasLongDescription ? '<div class="text-xs text-gray-400 mb-1">Desliza para leer más</div>' : '';
  const descriptionClass = hasLongDescription
    ? 'text-gray-800 text-sm h-32 overflow-y-auto pr-2 text-left w-full rounded-lg border border-gray-100 bg-gray-50 p-3'
    : 'text-gray-800 text-sm text-left w-full min-h-[6rem] rounded-lg border border-gray-100 bg-gray-50 p-3';
  content.innerHTML = `
    <div class="flex flex-col md:flex-row gap-6 items-start h-full max-h-[calc(90vh-3.5rem)] overflow-hidden">
      <div class="flex flex-col items-center text-center w-full md:w-[220px] md:flex-shrink-0">
        <div class="w-full max-w-[220px] aspect-square rounded-2xl shadow border border-gray-100 bg-white p-3 flex items-center justify-center">
          <img src="${product.img}" alt="${product.name}" class="w-full h-full object-contain rounded-xl">
        </div>
      </div>
      <div class="flex flex-col min-w-0 flex-1 h-full overflow-hidden">
        <div class="text-xl text-gold-lux font-semibold mb-2 leading-tight text-center md:text-left pr-8">${product.name}</div>
        <div class="text-base text-gray-700 mb-2 text-center md:text-left">Precio habitual: ${getProductPriceMarkup(product)}</div>
        <div class="text-sm text-gray-500 mb-4 text-center md:text-left">Stock disponible: <span class="font-semibold text-dark-royal">${stock}</span></div>
        <div class="mb-4 flex flex-col items-center md:items-start gap-2">
          <label class="text-sm text-gray-700">Cantidad</label>
          <div class="flex items-center border rounded-lg px-3 py-3 bg-gray-50" style="width: 140px;">
            <button type="button" id="btn-restar" class="text-xl px-3 text-gray-500 hover:text-dark-royal" tabindex="-1">−</button>
            <input id="modal-cantidad" type="number" min="1" max="${stock}" value="${stock > 0 ? 1 : 0}" class="w-11 px-1 py-0.5 border-0 bg-transparent text-center text-lg font-semibold outline-none" readonly />
            <button type="button" id="btn-sumar" class="text-xl px-3 text-gray-500 hover:text-dark-royal" tabindex="-1">+</button>
          </div>
          <div id="stock-msg" class="text-xs text-red-600 mt-1" style="display:none"></div>
        </div>
        <div class="text-sm text-gray-600 mb-2 text-center md:text-left">Descripción:</div>
        ${descriptionHint}
        <div class="${descriptionClass}">${detailText}</div>
        <div class="flex flex-col sm:flex-row gap-3 w-full mt-4 pt-4 border-t border-gray-100">
          <button ${stock <= 0 ? 'disabled' : ''} onclick="addModalToCart(${product.id})" class="flex-1 py-3 btn-lux rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Agregar al carrito</button>
          <button ${stock <= 0 ? 'disabled' : ''} onclick="addModalToCart(${product.id}, true)" class="flex-1 py-3 btn-lux rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Comprar ahora</button>
        </div>
      </div>
    </div>
  `;
  // Lógica de cantidad con botones
  setTimeout(() => {
    const input = document.getElementById('modal-cantidad');
    const btnSumar = document.getElementById('btn-sumar');
    const btnRestar = document.getElementById('btn-restar');
    const stockMsg = document.getElementById('stock-msg');
    if (!input || !btnSumar || !btnRestar || !stockMsg) return;
    btnSumar.onclick = () => {
      let val = parseInt(input.value);
      if (val < stock) {
        input.value = val + 1;
        stockMsg.style.display = 'none';
      } else {
        stockMsg.textContent = 'No hay más stock disponible.';
        stockMsg.style.display = 'block';
      }
    };
    btnRestar.onclick = () => {
      let val = parseInt(input.value);
      if (val > 1) {
        input.value = val - 1;
        stockMsg.style.display = 'none';
      }
    };
  }, 50);
  modal.classList.remove('hidden');
}

function closeProductModal() {
  const modal = document.getElementById('product-detail-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function showSuccessToast(msg) {
  const toast = ensureSuccessToast();
  toast.textContent = msg;
  toast.style.display = 'block';
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.opacity = '0';
  }, 1200);
  setTimeout(() => {
    toast.style.display = 'none';
  }, 1600);
}

function addModalToCart(productId, openCart = false) {
  const cantidad = parseInt(document.getElementById('modal-cantidad')?.value, 10) || 1;
  const added = addToCart(productId, cantidad);
  if (!added) return;

  closeProductModal();
  showSuccessToast('Agregado con éxito');
  if (openCart) {
    toggleCart();
  }
}

function addToCart(id, qty = 1) {
  syncProductsFromStorage();
  const prod = products.find(p => p.id === id);
  if (!prod || prod.stock === 0) {
    alert('Producto sin stock');
    return false;
  }
  if (qty < 1 || qty > prod.stock) {
    alert('Cantidad inválida');
    return false;
  }

  const idx = cart.findIndex(item => item.id === id);
  if (idx > -1) {
    cart[idx].qty += qty;
  } else {
    cart.push({id, qty});
  }

  // Disminuir stock
  prod.stock -= qty;
  saveProducts();
  saveCart();
  renderCart();
  if (document.getElementById('products-grid')) {
    renderProducts('products-grid');
  }
  return true;
}

function renderCart() {
  const cartItemsContainer = document.getElementById('cart-items') || document.getElementById('cart-modal-body');
  const cartTotalElement = document.getElementById('cart-total');
  const cartDiscountElement = document.getElementById('cart-discount');
  const cartSubtotalElement = document.getElementById('cart-subtotal');
  if (!cartItemsContainer) return;

  let html = '';
  if (cart.length === 0) {
    html = '<p class="text-center py-6">El carrito está vacío.</p>';
  } else {
    html = '<ul>' + cart.map(item => {
      const prod = products.find(p => p.id === item.id);
      if (!prod) return '';
      const baseLineTotal = prod.price * item.qty;
      const finalLineTotal = getDiscountedUnitPrice(prod) * item.qty;
      const hasDiscount = Number(prod.discount) > 0;
      return `<li class="flex items-center gap-3 py-3 border-b border-gray-100"><img src="${prod.img}" class="w-14 h-14 object-cover rounded" alt="${prod.name}"/><div class="flex-1 min-w-0"><div class="font-medium text-dark-royal leading-tight">${prod.name}</div><div class="text-sm text-gray-500">Cantidad: ${item.qty}${hasDiscount ? ` · Descuento: ${prod.discount}%` : ''}</div><div class="text-sm mt-1">${hasDiscount ? `<span class="line-through text-gray-400 mr-2">$${baseLineTotal.toLocaleString('es-CL')}</span>` : ''}<span class="font-bold text-turquoise-jewel">$${finalLineTotal.toLocaleString('es-CL')}</span></div></div><button onclick="removeFromCart(${item.id})" class="ml-1 text-red-500 hover:text-red-700" aria-label="Eliminar ${prod.name}"><i class="fa fa-trash"></i></button></li>`;
    }).join('') + '</ul>';
  }

  cartItemsContainer.innerHTML = html;
  if (cart.length === 0) {
    if (cartSubtotalElement) cartSubtotalElement.textContent = '$0';
    if (cartDiscountElement) cartDiscountElement.textContent = '-$0';
    if (cartTotalElement) cartTotalElement.textContent = '$0';
    return;
  }

  const summary = getCartSummary();
  if (cartSubtotalElement) {
    cartSubtotalElement.textContent = `$${summary.subtotal.toLocaleString('es-CL')}`;
  }
  if (cartDiscountElement) {
    cartDiscountElement.textContent = `-$${summary.discount.toLocaleString('es-CL')}`;
  }
  if (cartTotalElement) {
    cartTotalElement.textContent = `$${summary.total.toLocaleString('es-CL')}`;
  }
}

function checkout() {
  syncProductsFromStorage();
  if (cart.length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }

  const summary = getCartSummary();
  const lines = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return null;
    const lineTotal = getDiscountedUnitPrice(product) * item.qty;
    return `• ${product.name} x${item.qty}: $${lineTotal.toLocaleString('es-CL')}`;
  }).filter(Boolean);

  const message = [
    'Hola, quiero solicitar una cotización de estos productos:',
    '',
    ...lines,
    '',
    `Subtotal: $${summary.subtotal.toLocaleString('es-CL')}`,
    `Descuento: -$${summary.discount.toLocaleString('es-CL')}`,
    `Total: $${summary.total.toLocaleString('es-CL')}`
  ].join('\n');

  openWhatsAppChat(message);
}

const WHATSAPP_NUMBER = '56997862467';

function openWhatsAppChat(message) {
  window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`, '_blank');
}

function initFooterWhatsAppButtons() {
  document.querySelectorAll('footer .btn-lux').forEach(button => {
    if (button.dataset.whatsappBound === 'true') return;

    button.dataset.whatsappBound = 'true';
    button.addEventListener('click', () => {
      openWhatsAppChat('Hola, quiero solicitar acceso mayorista.');
    });
  });
}

document.addEventListener('DOMContentLoaded', async function() {
  await hydrateProductsFromFirestore();
  ensureSuccessToast();
  ensureCartModal();
  ensureProductDetailModal();
  initSearchSuggestions();
  initFooterWhatsAppButtons();
  initHomePage();
  setTimeout(() => {
    initCategoryPage();
    applySearchFromUrl();
  }, 0);
});

function applySortCriteria(list, criterion) {
  const sorted = [...list];
  if (criterion === 'precio-menor' || criterion === 'precio-asc') {
    sorted.sort((a, b) => a.price - b.price);
  } else if (criterion === 'precio-mayor' || criterion === 'precio-desc') {
    sorted.sort((a, b) => b.price - a.price);
  } else if (criterion === 'nombre' || criterion === 'nombre-asc') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (criterion === 'nombre-desc') {
    sorted.sort((a, b) => b.name.localeCompare(a.name));
  }
  return sorted;
}

function initCategoryPage() {
  const pageName = window.location.pathname.split('/').pop();
  const categoryMap = {
    'adulto-mayor.html': 'Cuidado Adulto',
    'aseo.html': 'Aseo',
    'auto.html': 'Auto',
    'bano-y-cocina.html': 'Baño y Cocina',
    'cuidado-bucal.html': 'Cuidado Bucal',
    'cuidado-capilar.html': 'Cuidado Capilar',
    'cuidado-mujer.html': 'Cuidado Mujer',
    'cuidado-personal.html': 'Cuidado Personal',
    'iluminacion-y-pilas.html': 'Iluminación y Pilas',
    'limpieza-de-ropa.html': 'Limpieza de ropa',
    'mundo-bebe.html': 'Mundo Bebé',
    'papeleria-industrial.html': 'Papeleria Industrial',
    'pisos-y-muebles.html': 'Pisos y Muebles',
    'preservativos.html': 'Preservativos',
    'proteccion-solar.html': 'Protección Solar',
    'regalos.html': 'Regalos',
    'repelentes.html': 'Repelentes',
    'the-pink-stuff.html': 'The Pink Stuff'
  };

  if (pageName === 'todos.html') {
    renderProducts('products-grid');
  } else if (categoryMap[pageName]) {
    filterByCategory(categoryMap[pageName]);
  } else {
    return;
  }

  const sortSelect = document.getElementById('ordenar');
  if (!sortSelect || sortSelect.dataset.globalBound === 'true') return;

  sortSelect.dataset.globalBound = 'true';
  sortSelect.addEventListener('change', function() {
    syncProductsFromStorage();
    let list = [...products];
    if (categoryMap[pageName]) {
      const categoryName = categoryMap[pageName].trim().toLowerCase();
      list = list.filter(p => (p.category || '').trim().toLowerCase() === categoryName);
    }
    renderProducts('products-grid', applySortCriteria(list, sortSelect.value));
  });
}