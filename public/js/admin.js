const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBIN5wILjhmFhHFxBwuJuKPsZyUNziPDFQ',
  authDomain: 'losturcos2.firebaseapp.com',
  projectId: 'losturcos2',
  storageBucket: 'losturcos2.firebasestorage.app',
  messagingSenderId: '353259282248',
  appId: '1:353259282248:web:212a5dbe7ee28ed5cedd7d'
};

const FIRESTORE_PRODUCTS_COLLECTION = 'products';
const CATEGORY_CATALOG_CONFIGS = [
  {
    key: 'regalos',
    page: 'regalos.html',
    category: 'Regalos',
    displayName: 'Regalos',
    groups: [
      { title: 'Regalos', items: ['Mujer', 'Hombre', 'Niños'] }
    ]
  },
  {
    key: 'adulto-mayor',
    page: 'adulto-mayor.html',
    category: 'Cuidado Adulto',
    displayName: 'Adulto mayor',
    groups: [
      { title: 'Pañales adulto mayor', items: ['Emumed', 'Cotidian', 'Win', 'Comodity', 'Plenitud'] },
      { title: 'Complementos', items: ['Sabanillas', 'Toalla humeda', 'Aposito', 'Otros productos adulto mayor'] }
    ]
  },
  {
    key: 'mundo-bebe',
    page: 'mundo-bebe.html',
    category: 'Mundo Bebé',
    displayName: 'Mundo Bebé',
    groups: [
      { title: 'Toallas Húmedas bebé', items: ['Babysec', 'Simond´s', 'Huggies'] },
      { title: 'Pañales', items: ['EmuBaby', 'Pampers', 'Babysec', 'Huggies'] },
      { title: 'Shampoos y Acondicionadores', items: ['Shampoos', 'Acondicionadores'] },
      { title: 'Cuidado piel bebé', items: ['Cremas', 'Emulsionados', 'Jabones', 'Pomadas', 'Colonias', 'Talco bebé', 'Vaselina'] },
      { title: 'Accesorios para bebé', items: ['Mamaderas', 'Chupetes', 'Mordedores', 'Platos', 'Protectores mamarios', 'Aspiradores Nasales', 'Ropa', 'Tutos'] }
    ]
  },
  {
    key: 'proteccion-solar',
    page: 'proteccion-solar.html',
    category: 'Protección Solar',
    displayName: 'Protección Solar',
    groups: []
  },
  {
    key: 'aseo',
    page: 'aseo.html',
    category: 'Aseo',
    displayName: 'Aseo',
    groups: [
      { title: 'Accesorios de Limpieza', items: ['Bolsas de Basura', 'Escobas y Traperos', 'Guantes, Esponjas y Paños', 'Limpiadores de Calzado', 'Scrub Daddy', 'Otros'] },
      { title: 'Aerosoles y Desinfectantes', items: ['Cloros', 'Desodorantes Ambientales', 'Insecticidas', 'Toallas Desinfectantes', 'Otros'] }
    ]
  },
  {
    key: 'limpieza-de-ropa',
    page: 'limpieza-de-ropa.html',
    category: 'Limpieza de ropa',
    displayName: 'Limpieza de ropa',
    groups: [
      { title: 'Limpieza de ropa', items: ['Detergentes', 'Tratamiento de Ropa', 'Suavizantes de Ropa', 'Jabones para Ropa', 'Aromatizantes de Tela y Ropa'] }
    ]
  },
  {
    key: 'auto',
    page: 'auto.html',
    category: 'Auto',
    displayName: 'Auto',
    groups: [
      { title: 'Auto', items: ['Aromatizantes', 'Limpieza y Cuidado'] }
    ]
  },
  {
    key: 'bano-y-cocina',
    page: 'bano-y-cocina.html',
    category: 'Baño y Cocina',
    displayName: 'Baño y Cocina',
    groups: [
      { title: 'Baño y Cocina', items: ['Accesorios de Baño', 'Lavadora y Lavavajilla', 'Limpia Vidrios', 'Limpiador Baño', 'Limpiador Cocina'] }
    ]
  },
  {
    key: 'iluminacion-y-pilas',
    page: 'iluminacion-y-pilas.html',
    category: 'Iluminación y Pilas',
    displayName: 'Iluminación y Pilas',
    groups: [
      { title: 'Iluminación y Pilas', items: ['Fósforos y Encendedores', 'Iluminación', 'Pilas y Baterías'] }
    ]
  },
  {
    key: 'pisos-y-muebles',
    page: 'pisos-y-muebles.html',
    category: 'Pisos y Muebles',
    displayName: 'Pisos y Muebles',
    groups: [
      { title: 'Pisos y Muebles', items: ['Ceras y Virutillas', 'Limpia Pisos', 'Lustras Muebles', 'Piso Flotantes'] }
    ]
  },
  {
    key: 'cuidado-bucal',
    page: 'cuidado-bucal.html',
    category: 'Cuidado Bucal',
    displayName: 'Cuidado Bucal',
    groups: [
      { title: 'Cuidado Bucal', items: ['Cepillos Dentales', 'Hilos y Enjuagues', 'Pastas Dentales'] }
    ]
  },
  {
    key: 'cuidado-capilar',
    page: 'cuidado-capilar.html',
    category: 'Cuidado Capilar',
    displayName: 'Cuidado Capilar',
    groups: [
      { title: 'Cuidado Capilar', items: ['Accesorios', 'Coloración Cabello', 'Cuidado del Cabello', 'Shampoo y Acondicionador'] }
    ]
  },
  {
    key: 'cuidado-mujer',
    page: 'cuidado-mujer.html',
    category: 'Cuidado Mujer',
    displayName: 'Cuidado Mujer',
    groups: [
      { title: 'Cuidado Mujer', items: ['Cosmética', 'Cremas', 'Depilación', 'Desodorantes', 'Higiene Íntima'] }
    ]
  },
  {
    key: 'cuidado-personal',
    page: 'cuidado-personal.html',
    category: 'Cuidado Personal',
    displayName: 'Higiene y Cuidado Personal',
    groups: [
      { title: 'Higiene y Cuidado Personal', items: ['Accesorios de Higiene', 'Cuidado Manos y Pies', 'Implementos de Salud', 'Jabones', 'Protección'] }
    ]
  },
  {
    key: 'repelentes',
    page: 'repelentes.html',
    category: 'Repelentes',
    displayName: 'Repelentes',
    groups: []
  },
  {
    key: 'the-pink-stuff',
    page: 'the-pink-stuff.html',
    category: 'The Pink Stuff',
    displayName: 'The Pink Stuff',
    groups: []
  },
  {
    key: 'papeleria-industrial',
    page: 'papeleria-industrial.html',
    category: 'Papeleria Industrial',
    displayName: 'Papeleria Industrial',
    groups: []
  },
  {
    key: 'preservativos',
    page: 'preservativos.html',
    category: 'Preservativos',
    displayName: 'Preservativos',
    groups: []
  }
];
const CATEGORY_CONFIG_BY_CATEGORY = new Map(CATEGORY_CATALOG_CONFIGS.map(config => [normalizeTextValue(config.category), config]));
let firebaseAppReadyPromise = null;

function normalizeTextValue(value) {
  return String(value || '').trim().toLowerCase();
}

function getCatalogConfigByCategory(category) {
  return CATEGORY_CONFIG_BY_CATEGORY.get(normalizeTextValue(category)) || null;
}

function getCanonicalCategoryValue(category) {
  return getCatalogConfigByCategory(category)?.category || String(category || '').trim();
}

function getManagedCategoryOptions() {
  return CATEGORY_CATALOG_CONFIGS.map(config => ({
    value: config.category,
    label: config.displayName
  }));
}

function getCatalogLabelsForConfig(config) {
  if (!config) return [];
  return [...new Set(config.groups.flatMap(group => group.items || []))];
}

function buildCatalogToken(groupTitle, itemLabel) {
  return `${groupTitle}::${itemLabel}`;
}

function getCatalogEntriesForConfig(config) {
  if (!config) return [];

  const labelCounts = new Map();
  config.groups.forEach(group => {
    (group.items || []).forEach(item => {
      const key = normalizeTextValue(item);
      labelCounts.set(key, (labelCounts.get(key) || 0) + 1);
    });
  });

  return config.groups.flatMap(group => (group.items || []).map(item => {
    const repeatedLabel = (labelCounts.get(normalizeTextValue(item)) || 0) > 1;
    return {
      token: buildCatalogToken(group.title, item),
      label: item,
      groupTitle: group.title,
      displayLabel: repeatedLabel ? `${group.title} / ${item}` : item
    };
  }));
}

function getCanonicalCatalogToken(config, value) {
  const normalizedValue = normalizeTextValue(value);
  const entry = getCatalogEntriesForConfig(config).find(option => (
    normalizeTextValue(option.token) === normalizedValue ||
    normalizeTextValue(option.displayLabel) === normalizedValue ||
    normalizeTextValue(option.label) === normalizedValue
  ));
  return entry?.token || '';
}

function getCatalogEntryByToken(config, token) {
  return getCatalogEntriesForConfig(config).find(entry => entry.token === token) || null;
}

function normalizeAdditionalCategories(product) {
  const primaryCategory = getCanonicalCategoryValue(product.category);
  const normalizedPrimary = normalizeTextValue(primaryCategory);
  const categories = [];

  const pushCategory = value => {
    const canonicalValue = getCanonicalCategoryValue(value);
    if (!canonicalValue || normalizeTextValue(canonicalValue) === normalizedPrimary) {
      return;
    }

    if (!categories.some(category => normalizeTextValue(category) === normalizeTextValue(canonicalValue))) {
      categories.push(canonicalValue);
    }
  };

  if (Array.isArray(product.additionalCategories)) {
    product.additionalCategories.forEach(pushCategory);
  }

  return categories;
}

function getProductCategories(product) {
  const categories = [];
  const pushCategory = value => {
    const canonicalValue = getCanonicalCategoryValue(value);
    if (!canonicalValue) return;
    if (!categories.some(category => normalizeTextValue(category) === normalizeTextValue(canonicalValue))) {
      categories.push(canonicalValue);
    }
  };

  pushCategory(product.category);
  normalizeAdditionalCategories(product).forEach(pushCategory);
  return categories;
}

function getStoredAssignmentsForCategory(categoryCatalogAssignments, category) {
  if (!categoryCatalogAssignments || typeof categoryCatalogAssignments !== 'object') {
    return [];
  }

  const match = Object.entries(categoryCatalogAssignments).find(([key]) => normalizeTextValue(key) === normalizeTextValue(category));
  return Array.isArray(match?.[1]) ? match[1] : [];
}

function normalizeCategoryCatalogAssignments(product, categories = getProductCategories(product)) {
  const assignmentsByCategory = {};

  categories.forEach(category => {
    const config = getCatalogConfigByCategory(category);
    if (!config || getCatalogEntriesForConfig(config).length === 0) {
      return;
    }

    const assignments = [];
    const pushAssignment = value => {
      const canonicalValue = getCanonicalCatalogToken(config, value);
      if (canonicalValue && !assignments.includes(canonicalValue)) {
        assignments.push(canonicalValue);
      }
    };

    const storedAssignments = getStoredAssignmentsForCategory(product.categoryCatalogAssignments, category);
    storedAssignments.forEach(pushAssignment);

    if (normalizeTextValue(category) === normalizeTextValue(product.category)) {
      if (Array.isArray(product.catalogAssignments)) {
        product.catalogAssignments.forEach(pushAssignment);
      }

      if (product.subcategory) {
        pushAssignment(product.subcategory);
      }
    }

    if (assignments.length > 0) {
      assignmentsByCategory[config.category] = assignments;
    }
  });

  return assignmentsByCategory;
}

function getDisplayCategoryName(category) {
  return getCatalogConfigByCategory(category)?.displayName || category || 'Sin categoria';
}

function getProductCategoryNames(product) {
  return getProductCategories(product).map(category => getDisplayCategoryName(category));
}

function getProductCatalogTokens(product, category = product.category) {
  return getStoredAssignmentsForCategory(product.categoryCatalogAssignments, category).filter(Boolean);
}

function getProductCatalogLabels(product, category = product.category) {
  const config = getCatalogConfigByCategory(category);
  return getProductCatalogTokens(product, category)
    .map(token => getCatalogEntryByToken(config, token)?.displayLabel || '')
    .filter(Boolean);
}

function getAllProductCatalogLabels(product) {
  return getProductCategories(product).flatMap(category => (
    getProductCatalogLabels(product, category).map(label => `${getDisplayCategoryName(category)} / ${label}`)
  ));
}

function getProductCategoryLabel(product) {
  const displayCategories = getProductCategoryNames(product);
  const catalogLabels = getProductCatalogLabels(product, product.category);
  const displayName = getDisplayCategoryName(product.category);

  let label = catalogLabels.length > 0 ? `${displayName} / ${catalogLabels.join(', ')}` : displayName;
  if (displayCategories.length > 1) {
    label += ` + ${displayCategories.slice(1).join(', ')}`;
  }

  return label;
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
  const legacyShowcase = product.showcase || 'index';
  const category = getCanonicalCategoryValue(product.category || '');
  const additionalCategories = normalizeAdditionalCategories({ ...product, category });
  const categoryCatalogAssignments = normalizeCategoryCatalogAssignments({ ...product, category, additionalCategories });
  const catalogAssignments = getStoredAssignmentsForCategory(categoryCatalogAssignments, category);
  return {
    id: Number(product.id),
    name: product.name || '',
    price: Number(product.price) || 0,
    stock: Number(product.stock) || 0,
    category,
    additionalCategories,
    categoryCatalogAssignments,
    catalogAssignments,
    subcategory: catalogAssignments[0] || '',
    discount: Number(product.discount) || 0,
    img: product.img || '',
    details: product.details || '',
    showcase: legacyShowcase,
    updatedAt: Number(product.updatedAt) || 0,
    showInOffers: Boolean(product.showInOffers || legacyShowcase === 'ofertas'),
    showInNew: Boolean(product.showInNew || legacyShowcase === 'nuevos')
  };
}

function getProductsVersion(productList) {
  return productList.reduce((latest, product) => Math.max(latest, Number(product.updatedAt) || 0), 0);
}

function stampProductUpdate(product, timestamp = Date.now()) {
  return {
    ...product,
    updatedAt: timestamp
  };
}

function getProductDisplayFlags(product) {
  const legacyShowcase = product.showcase || 'index';
  return {
    showInOffers: Boolean(product.showInOffers || legacyShowcase === 'ofertas'),
    showInNew: Boolean(product.showInNew || legacyShowcase === 'nuevos')
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

async function hydrateProductsFromFirestore() {
  const localProducts = getInitialProducts().map(normalizeProduct);

  try {
    const remoteProducts = await fetchProductsFromFirestore();
    const localVersion = getProductsVersion(localProducts);
    const remoteVersion = getProductsVersion(remoteProducts);

    if (localProducts.length > 0 && localVersion > remoteVersion) {
      products = localProducts;
      localStorage.setItem('products', JSON.stringify(products));
      await persistProductsToFirestore(products);
      return;
    }

    if (remoteProducts.length > 0) {
      products = remoteProducts;
      localStorage.setItem('products', JSON.stringify(products));
      return;
    }

    products = localProducts;
    localStorage.setItem('products', JSON.stringify(products));
    if (products.length > 0) {
      await persistProductsToFirestore(products);
    }
  } catch (error) {
    console.warn('No se pudo sincronizar productos con Firestore. Se usará almacenamiento local.', error);
    products = localProducts;
    localStorage.setItem('products', JSON.stringify(products));
  }
}

function getInitialProducts() {
  const saved = localStorage.getItem('products');
  if (saved) {
    return JSON.parse(saved).map(normalizeProduct);
  }

  return [
    {id:5, name:"Alfombras Kilim pack 5 ud", price:285000, img:"https://picsum.photos/id/29/800/900", discount:18, category:"Textiles", stock:10},
    {id:6, name:"Toallas Hammam pack 20 ud", price:145000, img:"https://picsum.photos/id/160/800/900", discount:0, category:"Textiles", stock:10},
    {id:7, name:"Bata de Baño Turca", price:39000, img:"https://picsum.photos/id/1011/800/900", discount:5, category:"Textiles", stock:10},
    {id:8, name:"Jabón Alepo Natural caja 50 ud", price:95000, img:"https://picsum.photos/id/201/800/900", discount:0, category:"Aseo", stock:10},
    {id:9, name:"Jabón Líquido Perfumado caja 12 ud", price:35000, img:"https://picsum.photos/id/405/800/900", discount:0, category:"Aseo", stock:10},
    {id:10, name:"Pasta Dental Premium pack 24 ud", price:45000, img:"https://picsum.photos/id/455/800/900", discount:5, category:"Aseo", stock:10},
    {id:11, name:"Champú Natural Turco pack 10 ud", price:48000, img:"https://picsum.photos/id/420/800/900", discount:8, category:"Cuidado Capilar", stock:10},
    {id:12, name:"Acondicionador Herbal pack 10 ud", price:52000, img:"https://picsum.photos/id/1025/800/900", discount:0, category:"Cuidado Capilar", stock:10},
    {id:13, name:"Crema Corporal Humectante caja 24 ud", price:52000, img:"https://picsum.photos/id/435/800/900", discount:0, category:"Cuidado Adulto", stock:10},
    {id:14, name:"Desodorante Spray pack 12 ud", price:38000, img:"https://picsum.photos/id/445/800/900", discount:0, category:"Cuidado Adulto", stock:10},
    {id:15, name:"Loción Corporal Aromática caja 10 ud", price:62000, img:"https://picsum.photos/id/465/800/900", discount:0, category:"Cuidado Adulto", stock:10}
  ].map(normalizeProduct);
}

function showAdminPanel() {
  document.getElementById('admin-auth').classList.add('hidden');
  document.getElementById('admin-panel').classList.remove('hidden');
}

function showAdminLogin() {
  document.getElementById('admin-panel').classList.add('hidden');
  document.getElementById('admin-auth').classList.remove('hidden');
}

// Sincronizar products con localStorage
function syncProductsFromStorage() {
  const saved = localStorage.getItem('products');
  products = saved ? JSON.parse(saved).map(normalizeProduct) : getInitialProducts();
}
// admin.js - Lógica de administración independiente

let products = getInitialProducts();

function saveProducts() {
  localStorage.setItem('products', JSON.stringify(products));
  persistProductsToFirestore(products).catch(error => {
    console.warn('No se pudo guardar productos en Firestore.', error);
  });
}

function checkAdminPassword() {
  const pass = document.getElementById('admin-password').value;
  if (pass === 'Brujit@31$') {
    sessionStorage.setItem('adminAuthenticated', 'true');
    document.getElementById('admin-auth-error').classList.add('hidden');
    showAdminPanel();
    renderAdminProducts();
  } else {
    document.getElementById('admin-auth-error').classList.remove('hidden');
  }
}

function renderAdminProducts() {
  syncProductsFromStorage();
  const grid = document.getElementById('admin-products-grid');
  grid.innerHTML = '';
  if (products.length === 0) {
    grid.innerHTML = '<p class="text-gray-400 text-center">No hay productos.</p>';
    return;
  }
  products.forEach(p => {
    const flags = getProductDisplayFlags(p);
    const stock = Number(p.stock) || 0;
    const stockStatus = stock <= 0
      ? '<span class="font-semibold text-red-600">Agotado</span>'
      : `<span class="font-semibold text-emerald-600">Disponible</span> (${stock})`;
    const visibility = [
      'Catalogo general',
      flags.showInOffers ? 'Ofertas' : null,
      flags.showInNew ? 'Nuevos' : null
    ].filter(Boolean).join(' | ');
    const card = document.createElement('div');
    card.className = 'border p-3 rounded mb-2 flex items-center gap-3 bg-white shadow';
    card.innerHTML = `
      <img src="${p.img}" class="w-16 h-16 object-cover rounded"/>
      <div class="flex-1">
        <div class="font-bold">${p.name}</div>
        <div>Stock: ${stockStatus}</div>
        <div>Precio: $${p.price.toLocaleString('es-CL')}</div>
        <div>Categorías: ${getProductCategoryNames(p).join(' | ')}</div>
        <div>Catálogos: ${getAllProductCatalogLabels(p).join(' | ') || 'Sin catálogos específicos'}</div>
        <div>Descuento: ${p.discount || 0}%</div>
        <div>Se muestra en: ${visibility}</div>
      </div>
      <button onclick="editProduct(${p.id})" class="px-2 py-1 bg-blue-500 text-white rounded">Editar</button>
      <button onclick="deleteProduct(${p.id})" class="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button>
    `;
    grid.appendChild(card);
  });
}

function renderAdminAdditionalCategories(selectedValues = []) {
  const wrapper = document.getElementById('product-additional-categories-wrapper');
  const container = document.getElementById('product-additional-categories');
  const categorySelect = document.getElementById('product-category');
  if (!wrapper || !container || !categorySelect) return;

  const primaryCategory = getCanonicalCategoryValue(categorySelect.value);
  if (!primaryCategory) {
    wrapper.classList.add('hidden');
    container.innerHTML = '';
    return;
  }

  const selectedSet = new Set(selectedValues.map(value => normalizeTextValue(value)));
  container.innerHTML = getManagedCategoryOptions()
    .filter(option => normalizeTextValue(option.value) !== normalizeTextValue(primaryCategory))
    .map((option, index) => {
      const inputId = `product-additional-category-${index}`;
      const checked = selectedSet.has(normalizeTextValue(option.value)) ? 'checked' : '';
      return `<label class="catalog-assignment-option" for="${inputId}"><input id="${inputId}" type="checkbox" name="product-additional-category" value="${option.value}" ${checked} /><span>${option.label}</span></label>`;
    }).join('');

  wrapper.classList.remove('hidden');
}

function getSelectedAdminAdditionalCategories() {
  return Array.from(document.querySelectorAll('input[name="product-additional-category"]:checked')).map(input => input.value);
}

function getSelectedAdminCategories() {
  const primaryCategory = getCanonicalCategoryValue(document.getElementById('product-category')?.value);
  return primaryCategory ? [primaryCategory].concat(getSelectedAdminAdditionalCategories()) : [];
}

function renderAdminCatalogAssignments(selectedAssignments = {}) {
  const wrapper = document.getElementById('product-catalog-assignments-wrapper');
  const container = document.getElementById('product-catalog-assignments');
  if (!wrapper || !container) return;

  const selectedCategories = getSelectedAdminCategories();
  const sections = selectedCategories.map(category => {
    const config = getCatalogConfigByCategory(category);
    if (!config || config.groups.length === 0) {
      return '';
    }

    const selectedSet = new Set(getStoredAssignmentsForCategory(selectedAssignments, category).map(value => normalizeTextValue(value)));
    return `
      <div class="catalog-assignment-group">
        <div class="catalog-assignment-category-heading">${getDisplayCategoryName(category)}</div>
        ${config.groups.map((group, groupIndex) => `
          <div class="${groupIndex > 0 ? 'mt-3' : ''}">
            <div class="catalog-assignment-group__title">${group.title}</div>
            <div class="catalog-assignment-group__options">
              ${group.items.map((item, itemIndex) => {
                const inputId = `product-catalog-${normalizeTextValue(category).replace(/[^a-z0-9]+/g, '-')}-${groupIndex}-${itemIndex}`;
                const token = buildCatalogToken(group.title, item);
                const checked = selectedSet.has(normalizeTextValue(token)) ? 'checked' : '';
                return `<label class="catalog-assignment-option" for="${inputId}"><input id="${inputId}" type="checkbox" name="product-catalog-assignment" data-category="${category}" value="${token}" ${checked} /><span>${item}</span></label>`;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }).filter(Boolean);

  if (sections.length === 0) {
    wrapper.classList.add('hidden');
    container.innerHTML = '';
    return;
  }

  container.innerHTML = sections.join('');
  wrapper.classList.remove('hidden');
}

function getSelectedAdminCategoryCatalogAssignments() {
  return Array.from(document.querySelectorAll('input[name="product-catalog-assignment"]:checked')).reduce((accumulator, input) => {
    const category = getCanonicalCategoryValue(input.dataset.category || '');
    if (!category) return accumulator;
    if (!accumulator[category]) {
      accumulator[category] = [];
    }
    accumulator[category].push(input.value);
    return accumulator;
  }, {});
}

function resetForm() {
  document.getElementById('product-id').value = '';
  document.getElementById('product-name').value = '';
  document.getElementById('product-price').value = '';
  document.getElementById('product-stock').value = '';
  document.getElementById('product-category').value = '';
  renderAdminAdditionalCategories([]);
  document.getElementById('product-discount').value = '';
  document.getElementById('product-img').value = '';
  document.getElementById('product-details').value = '';
  document.getElementById('product-img-file').value = '';
  renderAdminCatalogAssignments({});
  const showInOffers = document.getElementById('product-show-in-offers');
  const showInNew = document.getElementById('product-show-in-new');
  if (showInOffers) showInOffers.checked = false;
  if (showInNew) showInNew.checked = false;
}

function editProduct(id) {
  const prod = products.find(p => p.id === id);
  const flags = getProductDisplayFlags(prod);
  document.getElementById('product-id').value = prod.id;
  document.getElementById('product-name').value = prod.name;
  document.getElementById('product-price').value = prod.price;
  document.getElementById('product-stock').value = prod.stock || 0;
  document.getElementById('product-category').value = prod.category || '';
  renderAdminAdditionalCategories(prod.additionalCategories || []);
  document.getElementById('product-discount').value = prod.discount || 0;
  document.getElementById('product-img').value = prod.img;
  document.getElementById('product-details').value = prod.details || '';
  document.getElementById('product-img-file').value = '';
  renderAdminCatalogAssignments(prod.categoryCatalogAssignments || {});
  const showInOffers = document.getElementById('product-show-in-offers');
  const showInNew = document.getElementById('product-show-in-new');
  if (showInOffers) showInOffers.checked = flags.showInOffers;
  if (showInNew) showInNew.checked = flags.showInNew;
}

function deleteProduct(id) {
  if (confirm('¿Seguro que deseas eliminar este producto?')) {
    const idx = products.findIndex(p => p.id === id);
    if (idx > -1) {
      products.splice(idx, 1);
      saveProducts();
      renderAdminProducts();
      resetForm();
    }
  }
}

document.getElementById('product-form').onsubmit = function(e) {
  e.preventDefault();
  const id = document.getElementById('product-id').value;
  const name = document.getElementById('product-name').value;
  const price = parseInt(document.getElementById('product-price').value);
  const stockValue = document.getElementById('product-stock').value.trim();
  const stock = Number.parseInt(stockValue, 10);
  const category = getCanonicalCategoryValue(document.getElementById('product-category').value);
  const additionalCategories = getSelectedAdminAdditionalCategories();
  const categoryCatalogAssignments = getSelectedAdminCategoryCatalogAssignments();
  const catalogAssignments = getStoredAssignmentsForCategory(categoryCatalogAssignments, category);
  const discount = parseInt(document.getElementById('product-discount').value) || 0;
  const details = document.getElementById('product-details').value;
  let img = document.getElementById('product-img').value;
  const imgFile = document.getElementById('product-img-file').files[0];
  const showInOffers = document.getElementById('product-show-in-offers')?.checked || false;
  const showInNew = document.getElementById('product-show-in-new')?.checked || false;

  if (!Number.isInteger(stock) || stock < 0) {
    alert('Ingresa un stock valido mayor o igual a 0.');
    return;
  }

  if (imgFile) {
    const reader = new FileReader();
    reader.onload = function(ev) {
      img = ev.target.result;
      saveProductData();
    };
    reader.readAsDataURL(imgFile);
  } else {
    saveProductData();
  }
  function saveProductData() {
    const updatedAt = Date.now();
    if (id) {
      // Editar
      const idx = products.findIndex(p => p.id == id);
      if (idx > -1) {
        products[idx] = stampProductUpdate({ ...products[idx], name, price, stock, category, additionalCategories, categoryCatalogAssignments, catalogAssignments, subcategory: catalogAssignments[0] || '', discount, img, details, showcase: 'index', showInOffers, showInNew }, updatedAt);
      }
    } else {
      // Nuevo
      const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
      products.push(stampProductUpdate({ id: newId, name, price, stock, category, additionalCategories, categoryCatalogAssignments, catalogAssignments, subcategory: catalogAssignments[0] || '', discount, img, details, showcase: 'index', showInOffers, showInNew }, updatedAt));
    }
    saveProducts();
    showAdminPanel();
    renderAdminProducts();
    resetForm();
  }
};

document.addEventListener('DOMContentLoaded', async function() {
  await hydrateProductsFromFirestore();

  const categorySelect = document.getElementById('product-category');
  const additionalCategoriesContainer = document.getElementById('product-additional-categories');

  categorySelect?.addEventListener('change', () => {
    const currentAssignments = getSelectedAdminCategoryCatalogAssignments();
    renderAdminAdditionalCategories(getSelectedAdminAdditionalCategories());
    renderAdminCatalogAssignments(currentAssignments);
  });

  additionalCategoriesContainer?.addEventListener('change', () => {
    const currentAssignments = getSelectedAdminCategoryCatalogAssignments();
    renderAdminCatalogAssignments(currentAssignments);
  });

  renderAdminAdditionalCategories([]);
  renderAdminCatalogAssignments({});

  document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    sessionStorage.removeItem('adminAuthenticated');
    showAdminLogin();
  });

  if (sessionStorage.getItem('adminAuthenticated') === 'true') {
    showAdminPanel();
    renderAdminProducts();
    return;
  }

  showAdminLogin();
});
