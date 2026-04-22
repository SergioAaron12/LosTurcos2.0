const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBIN5wILjhmFhHFxBwuJuKPsZyUNziPDFQ',
  authDomain: 'losturcos2.firebaseapp.com',
  projectId: 'losturcos2',
  storageBucket: 'losturcos2.firebasestorage.app',
  messagingSenderId: '353259282248',
  appId: '1:353259282248:web:212a5dbe7ee28ed5cedd7d'
};

const AUTHORIZED_ADMIN_EMAIL = 'elsakitodewea@gmail.com';

const FIRESTORE_PRODUCTS_COLLECTION = 'products';
const FIRESTORE_ORDERS_COLLECTION = 'webpay_orders';
const LEGACY_PRODUCTS_STORAGE_KEY = 'products';
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
let adminProductSearchTerm = '';
let adminOrders = [];
let legacyProductsBootstrapCache = null;

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
    loadFirebaseScript('https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore-compat.js'),
    loadFirebaseScript('https://www.gstatic.com/firebasejs/12.12.0/firebase-auth-compat.js')
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

function getAdminAuthErrorElement() {
  return document.getElementById('admin-auth-error');
}

function getAdminAuthStatusElement() {
  return document.getElementById('admin-auth-status');
}

function getProductFormStatusElement() {
  return document.getElementById('product-form-status');
}

function clearProductFormStatus() {
  const statusElement = getProductFormStatusElement();
  if (!statusElement) return;
  statusElement.textContent = '';
  statusElement.className = 'hidden mt-3 rounded-lg border px-3 py-2 text-sm';
}

function setProductFormStatus(message, tone = 'info') {
  const statusElement = getProductFormStatusElement();
  if (!statusElement) return;

  const toneClassMap = {
    info: 'mt-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900',
    success: 'mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900',
    error: 'mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900'
  };

  statusElement.className = toneClassMap[tone] || toneClassMap.info;
  statusElement.textContent = message;
}

function setProductFormBusy(isBusy) {
  const saveButton = document.getElementById('save-product-btn');
  if (!saveButton) return;

  saveButton.disabled = isBusy;
  saveButton.classList.toggle('opacity-60', isBusy);
  saveButton.classList.toggle('cursor-not-allowed', isBusy);
  saveButton.textContent = isBusy ? 'Guardando...' : 'Guardar';
}

function getAdminAuthNoticeElement() {
  return document.getElementById('admin-auth-notice');
}

function setAdminAuthError(message = '') {
  const errorElement = getAdminAuthErrorElement();
  if (!errorElement) return;
  errorElement.textContent = message;
  errorElement.classList.toggle('hidden', !message);
}

function clearAdminAuthNotice() {
  const noticeElement = getAdminAuthNoticeElement();
  if (!noticeElement) return;
  noticeElement.textContent = '';
  noticeElement.className = 'hidden mt-4 rounded-xl border px-4 py-4 text-left shadow-sm';
}

function setAdminAuthNotice(message, tone = 'info') {
  const noticeElement = getAdminAuthNoticeElement();
  if (!noticeElement) return;

  const toneClassMap = {
    info: 'mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-4 text-left text-sky-900 shadow-sm',
    success: 'mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-left text-emerald-900 shadow-sm',
    warning: 'mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-left text-amber-900 shadow-sm',
    error: 'mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-left text-red-900 shadow-sm'
  };

  noticeElement.className = toneClassMap[tone] || toneClassMap.info;
  noticeElement.textContent = message;
}

function setAdminAuthStatus(message, isError = false) {
  const statusElement = getAdminAuthStatusElement();
  if (!statusElement) return;
  statusElement.textContent = message;
  statusElement.classList.toggle('text-gray-500', !isError);
  statusElement.classList.toggle('text-amber-600', isError);
}

function isAuthorizedAdminUser(user) {
  return Boolean(
    user &&
    user.emailVerified &&
    normalizeTextValue(user.email) === normalizeTextValue(AUTHORIZED_ADMIN_EMAIL)
  );
}

function isAdminEmail(userOrEmail) {
  const email = typeof userOrEmail === 'string' ? userOrEmail : userOrEmail?.email;
  return normalizeTextValue(email) === normalizeTextValue(AUTHORIZED_ADMIN_EMAIL);
}

function buildAdminVerificationActionSettings() {
  return {
    url: `${window.location.origin}/admin.html`,
    handleCodeInApp: false
  };
}

async function sendVerificationEmailToUser(user) {
  const auth = window.firebase.auth();
  auth.languageCode = 'es';
  await user.sendEmailVerification(buildAdminVerificationActionSettings());
}

async function signInForVerificationEmail(email, password) {
  await initFirebaseApp();
  const auth = window.firebase.auth();
  const credentials = await auth.signInWithEmailAndPassword(email, password);

  if (!isAdminEmail(credentials.user)) {
    await auth.signOut();
    throw new Error(`Solo ${AUTHORIZED_ADMIN_EMAIL} puede administrar el catálogo.`);
  }

  return credentials.user;
}

function mapAdminAuthError(error) {
  switch (String(error?.code || '')) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
      return 'La contraseña no es correcta para esa cuenta de Firebase Auth.';
    case 'auth/user-not-found':
      return 'Esa cuenta no existe todavía en Firebase Auth.';
    case 'auth/too-many-requests':
      return 'Firebase bloqueó temporalmente el acceso por demasiados intentos. Espera un momento e inténtalo de nuevo.';
    case 'auth/network-request-failed':
      return 'No se pudo contactar a Firebase. Revisa tu conexión e inténtalo nuevamente.';
    default:
      return error?.message || 'No fue posible completar la autenticación con Firebase.';
  }
}

async function signInAdminWithEmailPassword(email, password) {
  const auth = window.firebase.auth();
  const user = await signInForVerificationEmail(email, password);

  if (!user.emailVerified) {
    try {
      await sendVerificationEmailToUser(user);
    } finally {
      await auth.signOut();
    }

    const verificationError = new Error('La cuenta existe, pero el correo todavía no está verificado. Te reenviamos un correo de verificación. Revisa entrada, spam y promociones.');
    verificationError.code = 'admin/email-not-verified';
    throw verificationError;
  }

  if (!isAuthorizedAdminUser(user)) {
    await auth.signOut();
    throw new Error('La cuenta no corresponde a un administrador autorizado o el correo no está verificado.');
  }

  return user;
}

async function resendAdminVerificationEmail() {
  const email = document.getElementById('admin-email')?.value.trim() || '';
  const password = document.getElementById('admin-password')?.value || '';

  if (!email || !password) {
    clearAdminAuthNotice();
    setAdminAuthError('Ingresa correo y contraseña para reenviar la verificación.');
    return;
  }

  if (!isAdminEmail(email)) {
    clearAdminAuthNotice();
    setAdminAuthError(`Solo ${AUTHORIZED_ADMIN_EMAIL} puede administrar el catálogo.`);
    return;
  }

  setAdminAuthError('');
  clearAdminAuthNotice();
  setAdminAuthStatus('Solicitando correo de verificación a Firebase...', false);

  try {
    const user = await signInForVerificationEmail(email, password);
    if (user.emailVerified) {
      await window.firebase.auth().signOut();
      setAdminAuthNotice('Ese correo ya está verificado. Si no puedes entrar, el problema ya no es la verificación: revisa la contraseña o si estás usando exactamente elsakitodewea@gmail.com.', 'success');
      setAdminAuthStatus('Ese correo ya está verificado. Ya puedes iniciar sesión en el admin.', false);
      return;
    }

    await sendVerificationEmailToUser(user);
    await window.firebase.auth().signOut();
    setAdminAuthNotice('Correo de verificación reenviado. Revisa entrada, spam y promociones. Cuando lo abras, vuelve al admin e inicia sesión de nuevo.', 'warning');
    setAdminAuthStatus('Correo de verificación enviado. Revisa entrada, spam y promociones.', false);
  } catch (error) {
    console.warn('No fue posible reenviar la verificación del admin.', error);
    clearAdminAuthNotice();
    setAdminAuthError(mapAdminAuthError(error));
    setAdminAuthStatus('No fue posible reenviar el correo de verificación.', true);
  }
}

async function getCurrentAuthorizedAdminUser() {
  await initFirebaseApp();
  const auth = window.firebase.auth();
  const user = auth.currentUser;
  return isAuthorizedAdminUser(user) ? user : null;
}

async function waitForCurrentUser(timeoutMs = 4000) {
  await initFirebaseApp();
  const auth = window.firebase.auth();

  if (auth.currentUser) {
    return auth.currentUser;
  }

  return new Promise(resolve => {
    let settled = false;
    const finalize = user => {
      if (settled) return;
      settled = true;
      unsubscribe();
      resolve(user || auth.currentUser || null);
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      finalize(user);
    });

    window.setTimeout(() => finalize(auth.currentUser || null), timeoutMs);
  });
}

async function ensureAuthorizedAdminSession() {
  const user = await waitForCurrentUser();
  if (!user) {
    const authError = new Error('Debes iniciar sesión nuevamente antes de guardar cambios.');
    authError.code = 'admin/auth-required';
    throw authError;
  }

  await user.reload();
  const refreshedUser = window.firebase.auth().currentUser || user;

  if (!refreshedUser.emailVerified) {
    const verificationError = new Error('Tu cuenta admin todavía no tiene el correo verificado.');
    verificationError.code = 'admin/email-not-verified';
    throw verificationError;
  }

  if (!isAuthorizedAdminUser(refreshedUser)) {
    const adminError = new Error(`Solo ${AUTHORIZED_ADMIN_EMAIL} puede guardar cambios en el catálogo.`);
    adminError.code = 'admin/not-authorized';
    throw adminError;
  }

  await refreshedUser.getIdToken(true);
  return refreshedUser;
}

function mapProductPersistenceError(error) {
  switch (String(error?.code || '')) {
    case 'admin/auth-required':
      return 'La sesión del administrador no está activa. Inicia sesión otra vez y vuelve a guardar.';
    case 'admin/email-not-verified':
      return 'La cuenta existe, pero el correo todavía no está verificado. Verifica el correo y luego guarda de nuevo.';
    case 'admin/not-authorized':
      return `Solo ${AUTHORIZED_ADMIN_EMAIL} puede guardar cambios en el catálogo.`;
    case 'permission-denied':
      return 'Firestore rechazó la escritura. La sesión admin expiró o no cumple las reglas actuales.';
    case 'unavailable':
      return 'Firestore no respondió. Revisa tu conexión e inténtalo nuevamente.';
    default:
      return error?.message || 'No fue posible guardar el producto en Firestore.';
  }
}

function syncProductsCache() {
  legacyProductsBootstrapCache = products.map(product => normalizeProduct(product));
}

function readImageFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => resolve(event.target?.result || '');
    reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
    reader.readAsDataURL(file);
  });
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

function chunkArray(items, chunkSize) {
  const chunks = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

function clearLegacyProductsStorage() {
  try {
    localStorage.removeItem(LEGACY_PRODUCTS_STORAGE_KEY);
  } catch (error) {
    console.warn('No se pudo limpiar el cache legado de productos.', error);
  }
}

function getLegacyStoredProducts() {
  if (legacyProductsBootstrapCache !== null) {
    return legacyProductsBootstrapCache.map(normalizeProduct);
  }

  try {
    const saved = localStorage.getItem(LEGACY_PRODUCTS_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    legacyProductsBootstrapCache = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('No se pudo leer el cache legado de productos.', error);
    legacyProductsBootstrapCache = [];
  }

  clearLegacyProductsStorage();
  return legacyProductsBootstrapCache.map(normalizeProduct);
}

async function fetchProductsFromFirestore() {
  const db = await initFirebaseApp();
  const snapshot = await db.collection(FIRESTORE_PRODUCTS_COLLECTION).get();
  return snapshot.docs
    .map(doc => normalizeProduct(doc.data()))
    .sort((left, right) => left.id - right.id);
}

async function fetchOrdersFromFirestore() {
  const db = await initFirebaseApp();
  const snapshot = await db.collection(FIRESTORE_ORDERS_COLLECTION)
    .orderBy('createdAtMs', 'desc')
    .limit(50)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

async function syncProductsToFirestore(productList) {
  const db = await initFirebaseApp();
  const snapshot = await db.collection(FIRESTORE_PRODUCTS_COLLECTION).get();
  const incomingProducts = productList.map(product => normalizeProduct(product));
  const incomingIds = new Set(incomingProducts.map(product => String(product.id)));
  const operations = [];

  snapshot.forEach(doc => {
    if (!incomingIds.has(doc.id)) {
      operations.push({ type: 'delete', ref: doc.ref });
    }
  });

  incomingProducts.forEach(product => {
    operations.push({
      type: 'set',
      ref: db.collection(FIRESTORE_PRODUCTS_COLLECTION).doc(String(product.id)),
      data: product
    });
  });

  const MAX_BATCH_OPERATIONS = 450;
  for (const batchOperations of chunkArray(operations, MAX_BATCH_OPERATIONS)) {
    const batch = db.batch();
    batchOperations.forEach(operation => {
      if (operation.type === 'delete') {
        batch.delete(operation.ref);
        return;
      }

      batch.set(operation.ref, operation.data);
    });
    await batch.commit();
  }
}

async function persistProductToFirestore(product) {
  await ensureAuthorizedAdminSession();
  const db = await initFirebaseApp();
  const normalized = normalizeProduct(product);
  await db.collection(FIRESTORE_PRODUCTS_COLLECTION).doc(String(normalized.id)).set(normalized);
}

async function deleteProductFromFirestore(productId) {
  await ensureAuthorizedAdminSession();
  const db = await initFirebaseApp();
  await db.collection(FIRESTORE_PRODUCTS_COLLECTION).doc(String(productId)).delete();
}

async function hydrateProductsFromFirestore() {
  try {
    const remoteProducts = await fetchProductsFromFirestore();

    if (remoteProducts.length > 0) {
      products = remoteProducts;
      return;
    }

    products = [];
  } catch (error) {
    console.warn('No se pudo cargar productos desde Firestore.', error);
    products = [];
  }
}

function getInitialProducts() {
  legacyProductsBootstrapCache = [];
  clearLegacyProductsStorage();
  return [];
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
  if (!Array.isArray(products) || products.length === 0) {
    products = getInitialProducts();
  }
}
// admin.js - Lógica de administración independiente

let products = getInitialProducts();

function saveProducts(remoteOperation) {
  syncProductsCache();
  const operation = remoteOperation || syncProductsToFirestore(products);
  operation.catch(error => {
    console.warn('No se pudo guardar productos en Firestore.', error);
  });
}

function productMatchesAdminSearch(product, query) {
  if (!query) return true;

  const searchableValues = [
    product.name,
    product.category,
    ...getProductCategoryNames(product),
    ...getAllProductCatalogLabels(product),
    String(product.price || ''),
    String(product.stock || ''),
    product.details || ''
  ];

  return searchableValues.some(value => normalizeTextValue(value).includes(query));
}

async function checkAdminPassword() {
  const email = document.getElementById('admin-email')?.value.trim() || '';
  const password = document.getElementById('admin-password')?.value || '';

  if (!email || !password) {
    setAdminAuthError('Ingresa correo y contraseña de Firebase Auth.');
    return;
  }

  if (normalizeTextValue(email) !== normalizeTextValue(AUTHORIZED_ADMIN_EMAIL)) {
    setAdminAuthError(`Solo ${AUTHORIZED_ADMIN_EMAIL} puede administrar el catálogo.`);
    return;
  }

  setAdminAuthError('');
  clearAdminAuthNotice();
  setAdminAuthStatus('Iniciando sesión en Firebase...', false);

  try {
    await signInAdminWithEmailPassword(email, password);
    sessionStorage.setItem('adminAuthenticated', 'true');
    setAdminAuthStatus(`Sesión iniciada como ${AUTHORIZED_ADMIN_EMAIL}.`, false);
    showAdminPanel();
    renderAdminProducts();
    await loadAdminOrders();
  } catch (error) {
    console.warn('No fue posible autenticar el admin en Firebase.', error);
    sessionStorage.removeItem('adminAuthenticated');
    if (error.code === 'admin/email-not-verified') {
      setAdminAuthNotice('La cuenta existe pero todavía no está verificada. Ya se reenvió un correo automáticamente. Revisa entrada, spam y promociones, abre el enlace y luego vuelve a iniciar sesión.', 'warning');
    } else {
      clearAdminAuthNotice();
    }
    setAdminAuthError(mapAdminAuthError(error));
    setAdminAuthStatus('Sin sesión válida de administrador en Firebase.', true);
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

  const filteredProducts = products.filter(product => productMatchesAdminSearch(product, adminProductSearchTerm));
  if (filteredProducts.length === 0) {
    grid.innerHTML = '<p class="text-gray-400 text-center">No se encontraron productos para esta búsqueda.</p>';
    return;
  }

  filteredProducts.forEach(p => {
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

function getAdminOrdersStatusElement() {
  return document.getElementById('admin-orders-status');
}

function setAdminOrdersStatus(message, isError = false) {
  const statusElement = getAdminOrdersStatusElement();
  if (!statusElement) return;
  statusElement.textContent = message;
  statusElement.classList.toggle('text-red-600', isError);
  statusElement.classList.toggle('text-gray-500', !isError);
}

function getOrderStatusLabel(status) {
  const normalizedStatus = normalizeTextValue(status).replace(/-/g, '_');
  switch (normalizedStatus) {
    case 'authorized': return 'Pagada';
    case 'created': return 'Creada';
    case 'failed': return 'Fallida';
    case 'aborted': return 'Abortada';
    case 'timeout': return 'Expirada';
    case 'paid_manual_review': return 'Revisión manual';
    case 'paid_validation_error': return 'Error de validación';
    case 'error': return 'Error';
    default: return status || 'Sin estado';
  }
}

function getOrderStatusClasses(status) {
  const normalizedStatus = normalizeTextValue(status).replace(/-/g, '_');
  switch (normalizedStatus) {
    case 'authorized': return 'bg-emerald-100 text-emerald-800';
    case 'created': return 'bg-slate-100 text-slate-700';
    case 'failed':
    case 'error': return 'bg-red-100 text-red-800';
    case 'aborted':
    case 'timeout': return 'bg-amber-100 text-amber-800';
    case 'paid_manual_review':
    case 'paid_validation_error': return 'bg-sky-100 text-sky-800';
    default: return 'bg-slate-100 text-slate-700';
  }
}

function formatOrderDate(timestampMs, fallbackIsoDate = '') {
  const timestamp = Number(timestampMs) || Date.parse(fallbackIsoDate) || 0;
  if (!timestamp) return 'Sin fecha';
  return new Date(timestamp).toLocaleString('es-CL');
}

function renderAdminOrders() {
  const grid = document.getElementById('admin-orders-grid');
  if (!grid) return;

  if (adminOrders.length === 0) {
    grid.innerHTML = '<p class="text-gray-400 text-center py-4">No hay órdenes registradas todavía.</p>';
    setAdminOrdersStatus('Sin órdenes registradas.', false);
    return;
  }

  grid.innerHTML = adminOrders.map(order => {
    const customer = order.customer || {};
    const items = Array.isArray(order.items) ? order.items : [];
    const transbank = order.transbank || {};
    const lastResponse = transbank.lastResponse || {};
    const itemSummary = items.slice(0, 3).map(item => `${item.name} x${item.qty}`).join(' | ');
    const extraItems = items.length > 3 ? ` (+${items.length - 3} más)` : '';
    return `
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="text-sm font-semibold text-slate-900">${order.buyOrder || order.id}</span>
              <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getOrderStatusClasses(order.status)}">${getOrderStatusLabel(order.status)}</span>
            </div>
            <div class="text-sm text-gray-700">Cliente: <span class="font-medium">${customer.name || 'Sin nombre'}</span> · ${customer.email || 'Sin correo'} · ${customer.phone || 'Sin teléfono'}</div>
            <div class="text-sm text-gray-600 mt-1">Total: <span class="font-semibold text-slate-900">$${(Number(order.amount) || 0).toLocaleString('es-CL')}</span> · Fecha: ${formatOrderDate(order.createdAtMs, lastResponse.transactionDate)}</div>
            <div class="text-sm text-gray-600 mt-1">Productos: ${itemSummary || 'Sin detalle'}${extraItems}</div>
            <div class="text-xs text-gray-500 mt-2">Autorización: ${lastResponse.authorizationCode || 'Sin autorización'} · Tarjeta: ${lastResponse.cardNumber ? `**** ${lastResponse.cardNumber}` : 'Sin dato'} · Tipo: ${lastResponse.paymentTypeCode || 'Sin dato'}</div>
            ${order.manualReviewReason ? `<div class="text-xs text-sky-700 mt-2">Revisión: ${order.manualReviewReason}</div>` : ''}
            ${order.errorMessage ? `<div class="text-xs text-red-700 mt-2">Error: ${order.errorMessage}</div>` : ''}
          </div>
        </div>
      </article>
    `;
  }).join('');

  setAdminOrdersStatus(`Mostrando ${adminOrders.length} órdenes.`, false);
}

async function loadAdminOrders() {
  setAdminOrdersStatus('Cargando órdenes...', false);
  try {
    adminOrders = await fetchOrdersFromFirestore();
    renderAdminOrders();
  } catch (error) {
    console.warn('No fue posible cargar las órdenes del admin.', error);
    adminOrders = [];
    const grid = document.getElementById('admin-orders-grid');
    if (grid) {
      grid.innerHTML = '<p class="text-red-500 text-center py-4">No fue posible cargar las órdenes.</p>';
    }
    setAdminOrdersStatus(error.message || 'No fue posible cargar las órdenes.', true);
  }
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

async function deleteProduct(id) {
  if (confirm('¿Seguro que deseas eliminar este producto?')) {
    clearProductFormStatus();
    setProductFormBusy(true);
    setProductFormStatus('Eliminando producto...', 'info');

    try {
      await deleteProductFromFirestore(id);
      const idx = products.findIndex(p => p.id === id);
      if (idx > -1) {
        products.splice(idx, 1);
        syncProductsCache();
        renderAdminProducts();
        resetForm();
      }
      setProductFormStatus('Producto eliminado correctamente.', 'success');
    } catch (error) {
      console.warn('No fue posible eliminar el producto.', error);
      setProductFormStatus(mapProductPersistenceError(error), 'error');
    } finally {
      setProductFormBusy(false);
    }
  }
}

document.getElementById('product-form').onsubmit = async function(e) {
  e.preventDefault();
  clearProductFormStatus();

  const id = document.getElementById('product-id').value;
  const name = document.getElementById('product-name').value.trim();
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

  if (!name) {
    setProductFormStatus('Ingresa un nombre para el producto.', 'error');
    return;
  }

  if (!Number.isFinite(price) || price < 0) {
    setProductFormStatus('Ingresa un precio valido mayor o igual a 0.', 'error');
    return;
  }

  if (!category) {
    setProductFormStatus('Selecciona una categoría principal.', 'error');
    return;
  }

  if (!Number.isInteger(stock) || stock < 0) {
    setProductFormStatus('Ingresa un stock valido mayor o igual a 0.', 'error');
    return;
  }

  setProductFormBusy(true);
  setProductFormStatus('Guardando producto...', 'info');

  try {
    if (imgFile) {
      img = await readImageFileAsDataUrl(imgFile);
    }

    const updatedAt = Date.now();
    let savedProduct = null;
    if (id) {
      const idx = products.findIndex(p => p.id == id);
      if (idx > -1) {
        savedProduct = stampProductUpdate({ ...products[idx], name, price, stock, category, additionalCategories, categoryCatalogAssignments, catalogAssignments, subcategory: catalogAssignments[0] || '', discount, img, details, showcase: 'index', showInOffers, showInNew }, updatedAt);
        await persistProductToFirestore(savedProduct);
        products[idx] = savedProduct;
        savedProduct = products[idx];
      }
    } else {
      const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
      savedProduct = stampProductUpdate({ id: newId, name, price, stock, category, additionalCategories, categoryCatalogAssignments, catalogAssignments, subcategory: catalogAssignments[0] || '', discount, img, details, showcase: 'index', showInOffers, showInNew }, updatedAt);
      await persistProductToFirestore(savedProduct);
      products.push(savedProduct);
    }

    syncProductsCache();
    showAdminPanel();
    renderAdminProducts();
    resetForm();

    setProductFormStatus(id ? 'Producto actualizado correctamente.' : 'Producto guardado correctamente.', 'success');
  } catch (error) {
    console.warn('No fue posible guardar el producto.', error);
    setProductFormStatus(mapProductPersistenceError(error), 'error');
  } finally {
    setProductFormBusy(false);
  }
};

document.addEventListener('DOMContentLoaded', async function() {
  await hydrateProductsFromFirestore();

  const categorySelect = document.getElementById('product-category');
  const additionalCategoriesContainer = document.getElementById('product-additional-categories');
  const adminProductSearchInput = document.getElementById('admin-product-search');
  const refreshOrdersButton = document.getElementById('refresh-orders-btn');
  const resendVerificationButton = document.getElementById('resend-verification-btn');

  categorySelect?.addEventListener('change', () => {
    const currentAssignments = getSelectedAdminCategoryCatalogAssignments();
    renderAdminAdditionalCategories(getSelectedAdminAdditionalCategories());
    renderAdminCatalogAssignments(currentAssignments);
  });

  additionalCategoriesContainer?.addEventListener('change', () => {
    const currentAssignments = getSelectedAdminCategoryCatalogAssignments();
    renderAdminCatalogAssignments(currentAssignments);
  });

  adminProductSearchInput?.addEventListener('input', event => {
    adminProductSearchTerm = normalizeTextValue(event.target.value);
    renderAdminProducts();
  });

  refreshOrdersButton?.addEventListener('click', async () => {
    await loadAdminOrders();
  });

  resendVerificationButton?.addEventListener('click', async () => {
    await resendAdminVerificationEmail();
  });

  renderAdminAdditionalCategories([]);
  renderAdminCatalogAssignments({});

  const currentAdminUser = await getCurrentAuthorizedAdminUser();
  if (currentAdminUser) {
    sessionStorage.setItem('adminAuthenticated', 'true');
    setAdminAuthStatus(`Sesión iniciada como ${currentAdminUser.email}.`, false);
  } else {
    sessionStorage.removeItem('adminAuthenticated');
    setAdminAuthStatus('Debes iniciar sesión con la cuenta administradora para guardar cambios en Firestore.', false);
  }

  document.getElementById('logout-btn').addEventListener('click', async function(e) {
    e.preventDefault();
    try {
      await initFirebaseApp();
      await window.firebase.auth().signOut();
    } catch (error) {
      console.warn('No fue posible cerrar la sesión de Firebase.', error);
    }
    sessionStorage.removeItem('adminAuthenticated');
    setAdminAuthError('');
    clearAdminAuthNotice();
    setAdminAuthStatus('Sesión cerrada. Debes iniciar sesión nuevamente para administrar.', false);
    showAdminLogin();
  });

  if (sessionStorage.getItem('adminAuthenticated') === 'true') {
    showAdminPanel();
    renderAdminProducts();
    await loadAdminOrders();
    return;
  }

  showAdminLogin();
});
