// ===================================================
// Distribuidora La Ruta del Oriente - Frontend App Engine
// Connected directly with Firebase Firestore (4 Corega Products)
// ===================================================

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyApOacPTnK-PLkiiC1o7qdwwrTv6upGoU0',
  authDomain: 'distribuidoralarutadeloriente.firebaseapp.com',
  projectId: 'distribuidoralarutadeloriente',
  storageBucket: 'distribuidoralarutadeloriente.firebasestorage.app',
  messagingSenderId: '18647063099',
  appId: '1:18647063099:web:d25d090a14a71603a51a1e'
};

const state = {
  contacts: [],
  filteredContacts: [],
  selectedContactIds: new Set(),
  products: [],
  selectedProductIds: new Set(),
  comunas: [],
  stats: {},
  uploadedEmailFiles: [],
  waImageFile: null,
  smtpConfig: {},
  currentCampaignPollInterval: null,
  firebaseConnected: false,
  waQueue: {
    active: false,
    list: [],
    currentIndex: 0
  }
};

// ================= API BASE & HELPER =================
// Servidor Node.js para envíos Titan SMTP (puerto 3000)
const LOCAL_API_BASE = 'http://localhost:3000';

function getApiUrl(endpoint) {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  // Si estamos navegando localmente en el puerto 3000
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return endpoint;
  }
  // Si estamos en distribuidoralarutadeloriente.cl, conectar al servidor local en puerto 3000
  return `${LOCAL_API_BASE}${endpoint}`;
}

async function apiFetch(endpoint, options = {}) {
  const url = getApiUrl(endpoint);
  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    if (!url.startsWith(LOCAL_API_BASE)) {
      try {
        res = await fetch(`${LOCAL_API_BASE}${endpoint}`, options);
      } catch (err2) {
        throw new Error(
          'No se pudo conectar al servidor de envíos masivos (http://localhost:3000). ' +
          'Asegúrate de tener ejecutándose "npm run envios" o INICIAR_SISTEMA.bat en tu computador.'
        );
      }
    } else {
      throw new Error(
        'No se pudo conectar al servidor de envíos masivos (http://localhost:3000). ' +
        'Asegúrate de tener ejecutándose "npm run envios" o INICIAR_SISTEMA.bat en tu computador.'
      );
    }
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (text.trim().startsWith('<')) {
      // Firebase Hosting devolvió HTML (404/index.html) porque no tiene backend Node.js
      if (!url.startsWith(LOCAL_API_BASE)) {
        return apiFetch(`${LOCAL_API_BASE}${endpoint}`, options);
      }
      throw new Error(
        'El servicio de envíos no respondió adecuadamente. Verifica que esté activo con "npm run envios".'
      );
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(text || 'Respuesta inválida del servidor');
    }
  }

  return await res.json();
}

// DOM Cache
const DOM = {
  // Tabs
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabPanes: document.querySelectorAll('.tab-pane'),

  // Header Metrics & Firebase
  metricTotal: document.getElementById('metric-total'),
  metricEmail: document.getElementById('metric-email'),
  metricWa: document.getElementById('metric-wa'),
  metricProducts: document.getElementById('metric-products'),
  fbStatusText: document.getElementById('fb-status-text'),
  btnSyncFirebaseHeader: document.getElementById('btn-sync-firebase-header'),
  btnSyncFirebasePicker: document.getElementById('btn-sync-firebase-picker'),
  btnSyncFirebaseNow: document.getElementById('btn-sync-firebase-now'),
  fbLastSyncTime: document.getElementById('fb-last-sync-time'),

  // Products Picker & Catalog
  productsPickerGrid: document.getElementById('products-picker-grid'),
  btnSelectAllProds: document.getElementById('btn-select-all-prods'),
  btnDeselectAllProds: document.getElementById('btn-deselect-all-prods'),
  catalogFullGrid: document.getElementById('catalog-full-grid'),

  // Product Modal
  productModal: document.getElementById('product-modal'),
  btnCloseProdModal: document.getElementById('btn-close-prod-modal'),
  btnCancelProd: document.getElementById('btn-cancel-prod'),
  btnSaveProd: document.getElementById('btn-save-prod'),

  // Email Campaign
  emailTargetCount: document.getElementById('email-target-count'),
  emailSubject: document.getElementById('email-subject'),
  emailTitle: document.getElementById('email-title'),
  emailBody: document.getElementById('email-body'),
  emailCtaText: document.getElementById('email-cta-text'),
  emailCtaUrl: document.getElementById('email-cta-url'),
  emailSenderName: document.getElementById('email-sender-name'),
  emailSenderPhone: document.getElementById('email-sender-phone'),
  emailDropzone: document.getElementById('email-dropzone'),
  emailFileInput: document.getElementById('email-file-input'),
  uploadedFilesList: document.getElementById('uploaded-files-list'),
  cbUseAsBanner: document.getElementById('cb-use-as-banner'),
  bannerSelectorContainer: document.getElementById('banner-selector-container'),
  previewContactSelect: document.getElementById('preview-contact-select'),
  previewSubjectText: document.getElementById('preview-subject-text'),
  emailPreviewFrame: document.getElementById('email-preview-frame'),
  btnPreviewEmailModal: document.getElementById('btn-preview-email-modal'),
  btnExpandPreview: document.getElementById('btn-expand-preview'),
  btnLaunchEmailCampaign: document.getElementById('btn-launch-email-campaign'),

  // Email Test & Full Preview
  testEmailRecipient: document.getElementById('test-email-recipient'),
  btnSendTestEmail: document.getElementById('btn-send-test-email'),
  testEmailStatusBox: document.getElementById('test-email-status-box'),
  emailPreviewFullModal: document.getElementById('email-preview-full-modal'),
  previewModalIframe: document.getElementById('preview-modal-iframe'),
  btnClosePreviewModal: document.getElementById('btn-close-preview-modal'),
  btnClosePreviewModalFooter: document.getElementById('btn-close-preview-modal-footer'),
  btnPreviewToSend: document.getElementById('btn-preview-to-send'),

  // Email Modal Progress
  emailSendModal: document.getElementById('email-send-modal'),
  btnCloseSendModal: document.getElementById('btn-close-send-modal'),
  progCurrent: document.getElementById('prog-current'),
  progTotal: document.getElementById('prog-total'),
  progSuccess: document.getElementById('prog-success'),
  progFailed: document.getElementById('prog-failed'),
  progBarFill: document.getElementById('prog-bar-fill'),
  progPercent: document.getElementById('prog-percent'),
  sendLiveLogs: document.getElementById('send-live-logs'),
  btnStopCampaign: document.getElementById('btn-stop-campaign'),
  btnDoneCampaign: document.getElementById('btn-done-campaign'),

  // Contacts View & Add Client Form
  contactSearch: document.getElementById('contact-search'),
  filterChannel: document.getElementById('filter-channel'),
  filterComuna: document.getElementById('filter-comuna'),
  btnSelectAll: document.getElementById('btn-select-all'),
  btnDeselectAll: document.getElementById('btn-deselect-all'),
  thSelectAll: document.getElementById('th-select-all'),
  contactsTbody: document.getElementById('contacts-tbody'),
  tableShowingCount: document.getElementById('table-showing-count'),
  tableTotalCount: document.getElementById('table-total-count'),
  tableSelectedCount: document.getElementById('table-selected-count'),
  btnReloadContacts: document.getElementById('btn-reload-contacts'),
  btnGoToEmailTab: document.getElementById('btn-go-to-email-tab'),
  selCountBadges: document.querySelectorAll('.sel-count-badge'),
  btnToggleAddClient: document.getElementById('btn-toggle-add-client'),
  addClientFormContainer: document.getElementById('add-client-form-container'),
  btnCancelAddClient: document.getElementById('btn-cancel-add-client'),
  btnCloseAddClientForm: document.getElementById('btn-close-add-client-form'),
  formNewClientEnvios: document.getElementById('form-new-client-envios'),

  // WhatsApp Campaign
  waTargetCount: document.getElementById('wa-target-count'),
  waMessageText: document.getElementById('wa-message-text'),
  waDropzone: document.getElementById('wa-dropzone'),
  waFileInput: document.getElementById('wa-file-input'),
  waImagePreviewContainer: document.getElementById('wa-image-preview-container'),
  waImagePreviewImg: document.getElementById('wa-image-preview-img'),
  btnRemoveWaImage: document.getElementById('btn-remove-wa-image'),
  waPreviewContactSelect: document.getElementById('wa-preview-contact-select'),
  waMockName: document.getElementById('wa-mock-name'),
  waMockPhone: document.getElementById('wa-mock-phone'),
  waMockImageContainer: document.getElementById('wa-mock-image-container'),
  waMockImg: document.getElementById('wa-mock-img'),
  waMockText: document.getElementById('wa-mock-text'),
  waMockTime: document.getElementById('wa-mock-time'),
  btnStartWaDispatcher: document.getElementById('btn-start-wa-dispatcher'),
  btnLoadProdsIntoWa: document.getElementById('btn-load-prods-into-wa'),

  // WhatsApp Queue Modal
  waQueueModal: document.getElementById('wa-queue-modal'),
  btnCloseWaModal: document.getElementById('btn-close-wa-modal'),
  btnCloseWaQueue: document.getElementById('btn-close-wa-queue'),
  waQueueCurrentIdx: document.getElementById('wa-queue-current-idx'),
  waQueueTotal: document.getElementById('wa-queue-total'),
  waQueueBar: document.getElementById('wa-queue-bar'),
  waQFarmacia: document.getElementById('wa-q-farmacia'),
  waQContacto: document.getElementById('wa-q-contacto'),
  waQPhone: document.getElementById('wa-q-phone'),
  waQMsgContent: document.getElementById('wa-q-msg-content'),
  btnWaOpenChat: document.getElementById('btn-wa-open-chat'),
  btnWaCopyMsg: document.getElementById('btn-wa-copy-msg'),
  btnWaNext: document.getElementById('btn-wa-next'),
  btnWaSkip: document.getElementById('btn-wa-skip'),

  // Settings
  smtpProvider: document.getElementById('smtp-provider'),
  smtpUser: document.getElementById('smtp-user'),
  smtpPass: document.getElementById('smtp-pass'),
  toggleSmtpPass: document.getElementById('toggle-smtp-pass'),
  smtpFromName: document.getElementById('smtp-from-name'),
  smtpFromEmail: document.getElementById('smtp-from-email'),
  customSmtpFields: document.getElementById('custom-smtp-fields'),
  smtpHost: document.getElementById('smtp-host'),
  smtpPort: document.getElementById('smtp-port'),
  smtpSecure: document.getElementById('smtp-secure'),
  smtpDelay: document.getElementById('smtp-delay'),
  btnSaveSmtp: document.getElementById('btn-save-smtp'),
  testEmailRecipient: document.getElementById('test-email-recipient'),
  btnTestEmail: document.getElementById('btn-test-email'),
  testResultBox: document.getElementById('test-result-box'),

  // History
  historyTbody: document.getElementById('history-tbody'),
  btnRefreshHistory: document.getElementById('btn-refresh-history'),

  // Toast
  toastContainer: document.getElementById('toast-container')
};

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'fa-circle-check text-success' : (type === 'error' ? 'fa-circle-exclamation text-danger' : 'fa-info-circle');
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  DOM.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function formatMoney(num) {
  return '$' + (Number(num) || 0).toLocaleString('es-CL');
}

// ================= REAL-TIME FIREBASE SETUP =================
function initFirebaseClient() {
  if (typeof firebase === 'undefined') return;

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    const db = firebase.firestore();

    db.collection('products').onSnapshot(snapshot => {
      console.log(`[Firebase Live] Snapshot recibido con ${snapshot.size} productos.`);
      state.firebaseConnected = true;
      if (DOM.fbStatusText) DOM.fbStatusText.textContent = 'En Vivo';
      if (DOM.fbLastSyncTime) DOM.fbLastSyncTime.textContent = new Date().toLocaleTimeString('es-CL');

      const fbProducts = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const price = Number(data.price) || 0;
        const discount = Number(data.discount) || 0;
        const offerPrice = (discount > 0 && discount < price) ? (price - discount) : price;

        fbProducts.push({
          id: `fb_${doc.id}`,
          firestoreId: doc.id,
          name: data.name || 'Producto',
          category: data.category || 'Cuidado Bucal',
          subcategory: data.subcategory || '',
          normalPrice: price,
          offerPrice: offerPrice,
          image: data.img || data.image || '/asset/logo-icon.png',
          url: 'https://distribuidoralarutadeloriente.cl/html/cuidado-bucal.html',
          stock: data.stock || '100',
          isFromFirebase: true,
          inStock: true,
          featured: true
        });
      });

      state.products = fbProducts;
      state.selectedProductIds = new Set(fbProducts.map(p => p.id)); // select all 4 products by default

      if (DOM.metricProducts) DOM.metricProducts.textContent = state.products.length;
      renderProductsPicker();
      renderFullCatalog();
      generateDefaultWhatsAppMessage();
      updateLiveEmailPreview();
    }, err => {
      console.warn('[Firebase Snapshot Error]', err.message);
    });
  } catch (err) {
    console.error('Firebase Client Error:', err);
  }
}

async function triggerFirebaseSync() {
  try {
    showToast('Sincronizando los 4 productos con Firebase...', 'info');
    const data = await apiFetch('/api/firebase/sync', { method: 'POST' });
    if (data.success) {
      showToast(`¡Sincronizados ${data.count} productos desde Firebase!`, 'success');
      await loadProducts();
      if (DOM.fbLastSyncTime) DOM.fbLastSyncTime.textContent = new Date().toLocaleTimeString('es-CL');
      updateLiveEmailPreview();
    }
  } catch (err) {
    showToast(`Error al sincronizar: ${err.message}`, 'error');
  }
}

// ================= INIT =================
async function init() {
  setupTabs();
  setupEventListeners();
  initFirebaseClient();
  await loadContacts();
  await loadProducts();
  await loadSmtpConfig();
  generateDefaultWhatsAppMessage();
  updateLiveEmailPreview();
  updateLiveWaPreview();
}

function setupTabs() {
  DOM.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      DOM.tabBtns.forEach(b => b.classList.remove('active'));
      DOM.tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetId).classList.add('active');

      if (targetId === 'tab-email') {
        updateLiveEmailPreview();
      } else if (targetId === 'tab-whatsapp') {
        updateLiveWaPreview();
      } else if (targetId === 'tab-history') {
        loadHistory();
      } else if (targetId === 'tab-products') {
        renderFullCatalog();
      }
    });
  });
}

// ================= PRODUCTS CATALOG & PICKER =================
async function loadProducts() {
  try {
    const data = await apiFetch('/api/products');
    if (data.success) {
      state.products = data.products;
      if (DOM.metricProducts) DOM.metricProducts.textContent = state.products.length;

      // Select all 4 by default
      state.selectedProductIds = new Set(state.products.map(p => p.id));

      renderProductsPicker();
      renderFullCatalog();
    }
  } catch (err) {
    console.error('Error loading products:', err);
  }
}

// Render cards matching user screenshot
function renderProductsPicker() {
  if (state.products.length === 0) {
    DOM.productsPickerGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: var(--muted);">
        Cargando los 4 productos de Firebase...
      </div>
    `;
    return;
  }

  DOM.productsPickerGrid.innerHTML = state.products.map(p => {
    const isSelected = state.selectedProductIds.has(p.id);
    const priceText = formatMoney(p.offerPrice || p.normalPrice);
    const stockVal = p.stock || '100';

    return `
      <div class="prod-picker-card ${isSelected ? 'selected' : ''}" data-id="${p.id}">
        <!-- Floating Checkbox Badge -->
        <div class="prod-card-select-float">
          <input type="checkbox" class="cb-prod-select" data-id="${p.id}" ${isSelected ? 'checked' : ''}>
          <span>${isSelected ? 'Incluido' : 'No incluir'}</span>
        </div>

        <!-- Upper White Image Box -->
        <div class="prod-card-img-wrap">
          <img src="${p.image || '/asset/logo-icon.png'}" alt="${escapeHtml(p.name)}" onerror="this.src='/asset/logo-icon.png'">
        </div>

        <!-- Lower Dark Card Area matching screenshot -->
        <div class="prod-card-info">
          <div class="prod-card-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</div>
          <div class="prod-card-price-tag">${priceText}</div>
          <div class="prod-card-stock">
            <span class="dot"></span>
            Stock: ${stockVal}
          </div>
          <div class="prod-card-actions">
            <a href="${p.url || 'https://distribuidoralarutadeloriente.cl'}" target="_blank" class="btn-detail-dark">
              Ver detalle
            </a>
            <span class="btn-add-gold">
              + Seleccionado
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderFullCatalog() {
  if (!DOM.catalogFullGrid) return;
  DOM.catalogFullGrid.innerHTML = state.products.map(p => {
    const priceText = formatMoney(p.offerPrice || p.normalPrice);
    const stockVal = p.stock || '100';

    return `
      <div class="prod-picker-card" style="cursor: default;">
        <div class="prod-card-img-wrap">
          <img src="${p.image || '/asset/logo-icon.png'}" alt="${escapeHtml(p.name)}" onerror="this.src='/asset/logo-icon.png'">
        </div>
        <div class="prod-card-info">
          <div class="prod-card-name">${escapeHtml(p.name)}</div>
          <div class="prod-card-price-tag">${priceText}</div>
          <div class="prod-card-stock"><span class="dot"></span> Stock: ${stockVal}</div>
          <div class="prod-card-actions">
            <a href="${p.url || 'https://distribuidoralarutadeloriente.cl'}" target="_blank" class="btn-detail-dark" style="grid-column: 1 / -1;">
              Ver en distribuidoralarutadeloriente.cl &raquo;
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ================= CONTACTS DATA =================
async function loadContacts() {
  let data = null;

  try {
    const result = await apiFetch('/api/contacts');
    if (result.success && Array.isArray(result.contacts)) {
      data = result;
    }
  } catch (err) {
    // API local no disponible
  }

  if (!data) {
    try {
      const res = await fetch('data/contacts.json');
      const result = await res.json();
      if (result.success && Array.isArray(result.contacts)) {
        data = result;
      }
    } catch (err) {
      console.warn('Fallback a data/contacts.json falló:', err.message);
    }
  }

  if (!data) {
    showToast('No se pudieron cargar los contactos del servidor ni del respaldo.', 'error');
    return;
  }

  // Sincronizar clientes personalizados desde Cloud Firestore
  try {
    if (window.firebase && typeof window.firebase.firestore === 'function') {
      const db = window.firebase.firestore();
      const snap = await db.collection('custom_clients').get();
      if (!snap.empty) {
        const cloudClients = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const existingIds = new Set(data.contacts.map(c => c.id));
        const newCustom = cloudClients.filter(c => !existingIds.has(c.id));
        data.contacts = [...newCustom, ...data.contacts];
      }
    }
  } catch (e) {}

  // Combinar clientes personalizados agregados manualmente
  try {
    const localCustom = JSON.parse(localStorage.getItem('mkt_custom_clients') || '[]');
    if (Array.isArray(localCustom) && localCustom.length > 0) {
      const existingIds = new Set(data.contacts.map(c => c.id));
      const newCustom = localCustom.filter(c => !existingIds.has(c.id));
      data.contacts = [...newCustom, ...data.contacts];
      if (data.stats) {
        data.stats.total = data.contacts.length;
        data.stats.conEmail = data.contacts.filter(c => c.tieneEmail).length;
        data.stats.conWhatsApp = data.contacts.filter(c => c.tieneWhatsApp).length;
      }
    }
  } catch (e) {
    console.warn('Error leyendo mkt_custom_clients:', e);
  }

  state.contacts = data.contacts;
  state.comunas = data.comunas;
  state.stats = data.stats || {
    total: data.contacts.length,
    conEmail: data.contacts.filter(c => c.tieneEmail).length,
    conWhatsApp: data.contacts.filter(c => c.tieneWhatsApp).length
  };

  DOM.metricTotal.textContent = state.stats.total;
  DOM.metricWa.textContent = state.stats.conWhatsApp;
  DOM.metricEmail.textContent = state.stats.conEmail;

  DOM.filterComuna.innerHTML = '<option value="all">Todas las Comunas</option>';
  state.comunas.forEach(com => {
    const opt = document.createElement('option');
    opt.value = com;
    opt.textContent = com;
    DOM.filterComuna.appendChild(opt);
  });

  populatePreviewDropdowns();
  state.selectedContactIds = new Set(state.contacts.map(c => c.id));

  applyContactsFilter();
  updateSelectionCounts();
}

function populatePreviewDropdowns() {
  const optionsHtml = state.contacts.slice(0, 40).map(c => 
    `<option value="${c.id}">${c.nombreFarmacia || c.contacto} (${c.comuna})</option>`
  ).join('');

  DOM.previewContactSelect.innerHTML = optionsHtml;
  DOM.waPreviewContactSelect.innerHTML = optionsHtml;
}

function applyContactsFilter() {
  const query = DOM.contactSearch.value.toLowerCase().trim();
  const channel = DOM.filterChannel.value;
  const comuna = DOM.filterComuna.value;

  state.filteredContacts = state.contacts.filter(c => {
    if (query) {
      const matchName = (c.nombreFarmacia || '').toLowerCase().includes(query);
      const matchContact = (c.contacto || '').toLowerCase().includes(query);
      const matchRut = (c.rut || '').toLowerCase().includes(query);
      const matchDir = (c.direccion || '').toLowerCase().includes(query);
      const matchEmail = (c.correo || '').toLowerCase().includes(query);
      const matchPhone = (c.telefonoOriginal || '').toLowerCase().includes(query);
      if (!matchName && !matchContact && !matchRut && !matchDir && !matchEmail && !matchPhone) return false;
    }

    if (channel === 'has_wa' && !c.tieneWhatsApp) return false;
    if (channel === 'has_email' && !c.tieneEmail) return false;
    if (channel === 'has_both' && (!c.tieneWhatsApp || !c.tieneEmail)) return false;

    if (comuna !== 'all' && c.comuna !== comuna) return false;

    return true;
  });

  renderContactsTable();
}

function renderContactsTable() {
  DOM.tableShowingCount.textContent = state.filteredContacts.length;
  DOM.tableTotalCount.textContent = state.contacts.length;

  if (state.filteredContacts.length === 0) {
    DOM.contactsTbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4 text-muted">
          No se encontraron contactos que coincidan con la búsqueda.
        </td>
      </tr>
    `;
    return;
  }

  DOM.contactsTbody.innerHTML = state.filteredContacts.map(c => {
    const isSelected = state.selectedContactIds.has(c.id);

    const waBadge = c.tieneWhatsApp 
      ? `<span class="badge badge-wa"><i class="fa-brands fa-whatsapp"></i> ${c.telefonoDisplay}</span>`
      : (c.telefonoOriginal ? `<span class="badge badge-landline"><i class="fa-solid fa-phone"></i> ${c.telefonoOriginal}</span>` : `<span class="badge badge-none">Sin fono</span>`);

    const emailBadge = c.tieneEmail
      ? `<span class="badge badge-email"><i class="fa-solid fa-envelope"></i> ${c.correo}</span>`
      : `<span class="badge badge-none">Sin correo</span>`;

    return `
      <tr class="${isSelected ? 'selected-row' : ''}">
        <td>
          <input type="checkbox" class="cb-contact" data-id="${c.id}" ${isSelected ? 'checked' : ''}>
        </td>
        <td class="farmacia-cell">
          <strong>${escapeHtml(c.nombreFarmacia || 'Sin Nombre')}</strong>
          <span>RUT: ${c.rut || 'N/A'}</span>
        </td>
        <td><strong>${escapeHtml(c.contacto || 'Sin contacto')}</strong></td>
        <td>${emailBadge}</td>
        <td>${waBadge}</td>
        <td>
          <div>${escapeHtml(c.comuna || 'Santiago')}</div>
          <small class="text-muted">${escapeHtml(c.direccion || '')}</small>
        </td>
      </tr>
    `;
  }).join('');

  const visibleSelected = state.filteredContacts.filter(c => state.selectedContactIds.has(c.id)).length;
  DOM.thSelectAll.checked = (visibleSelected > 0 && visibleSelected === state.filteredContacts.length);
}

function updateSelectionCounts() {
  const selectedList = state.contacts.filter(c => state.selectedContactIds.has(c.id));
  const waCount = selectedList.filter(c => c.tieneWhatsApp).length;
  const emailCount = selectedList.filter(c => c.tieneEmail).length;

  DOM.tableSelectedCount.textContent = state.selectedContactIds.size;
  DOM.selCountBadges.forEach(b => b.textContent = emailCount);
  DOM.emailTargetCount.textContent = emailCount;
  DOM.waTargetCount.textContent = waCount;
}

// ================= LIVE PREVIEWS & BUILDER =================
function getEmailPreviewPayload() {
  const contactId = DOM.previewContactSelect.value;
  const subject = DOM.emailSubject.value || 'Ofertas Adhesivos Corega - Distribuidora La Ruta del Oriente';
  const title = DOM.emailTitle.value || subject;
  const body = DOM.emailBody.value || '';
  const ctaText = DOM.emailCtaText.value || 'Visitar Catálogo Completo en la Web';
  const ctaUrl = DOM.emailCtaUrl.value || 'https://distribuidoralarutadeloriente.cl';
  const senderName = DOM.emailSenderName.value || 'Distribuidora La Ruta del Oriente';
  const senderPhone = DOM.emailSenderPhone.value || '+56 9 9875 0387 / +56 9 6280 1676';

  let bannerUrl = null;
  if (DOM.cbUseAsBanner && DOM.cbUseAsBanner.checked && state.uploadedEmailFiles.length > 0) {
    const firstImg = state.uploadedEmailFiles.find(f => f.isImage);
    if (firstImg) bannerUrl = firstImg.url;
  }

  return {
    contactId,
    subject,
    title,
    body,
    selectedProductIds: Array.from(state.selectedProductIds),
    ctaText,
    ctaUrl,
    bannerUrl,
    senderName,
    senderPhone
  };
}

function buildEmailHtmlPreview(data) {
  const selectedProds = state.products.filter(p => state.selectedProductIds.has(p.id));
  const contact = state.contacts.find(c => c.id === data.contactId) || {
    nombreFarmacia: 'Farmacia Ejemplo',
    contacto: 'Encargado/a de Adquisiciones',
    comuna: 'Santiago',
    direccion: 'Av. Libertador 1234'
  };

  const farmacia = contact.nombreFarmacia || 'su Farmacia';
  const contacto = contact.contacto || 'Estimado/a';
  const comuna = contact.comuna || 'Santiago';
  const direccion = contact.direccion || '';

  const processedSubject = (data.subject || '')
    .replace(/{farmacia}/gi, farmacia)
    .replace(/{contacto}/gi, contacto)
    .replace(/{comuna}/gi, comuna);

  const processedTitle = (data.title || '')
    .replace(/{farmacia}/gi, farmacia)
    .replace(/{contacto}/gi, contacto);

  const processedBody = (data.body || '')
    .replace(/{farmacia}/gi, farmacia)
    .replace(/{contacto}/gi, contacto)
    .replace(/{comuna}/gi, comuna)
    .replace(/{direccion}/gi, direccion);

  const bannerImgHtml = data.bannerUrl ? `
    <div style="text-align: center; background: #000; padding: 0; line-height: 0;">
      <img src="${data.bannerUrl}" alt="Banner Oferta" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />
    </div>
  ` : '';

  let prodsHtml = '';
  if (selectedProds.length > 0) {
    const prodCards = selectedProds.map(p => {
      const priceFmt = (p.offerPrice || p.normalPrice || 0).toLocaleString('es-CL');
      return `
        <td width="50%" style="padding: 10px; vertical-align: top;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #f4c542; border-radius: 12px; background-color: #0f1219; color: #ffffff; overflow: hidden;">
            <tr>
              <td style="background-color: #ffffff; padding: 14px; text-align: center;">
                <img src="${p.imageUrl || p.image || '/asset/corega1.png'}" alt="${escapeHtml(p.name)}" style="max-height: 110px; max-width: 90%; object-fit: contain;" />
              </td>
            </tr>
            <tr>
              <td style="padding: 14px;">
                <div style="color: #f4c542; font-weight: bold; font-size: 13px; min-height: 38px; line-height: 1.3;">${escapeHtml(p.name)}</div>
                <div style="color: #f4c542; font-size: 20px; font-weight: 800; margin: 8px 0 4px;">$${priceFmt}</div>
                <div style="color: #4ade80; font-size: 11px; margin-bottom: 12px;">🟢 Stock disponible (${p.stock || 100} un.)</div>
                <a href="${p.url || 'https://distribuidoralarutadeloriente.cl'}" target="_blank" style="display: block; text-align: center; background: linear-gradient(135deg, #f4c542 0%, #eab308 100%); color: #0b0c10; font-weight: 800; font-size: 11px; padding: 8px 12px; border-radius: 6px; text-decoration: none;">
                  Ver Producto &raquo;
                </a>
              </td>
            </tr>
          </table>
        </td>
      `;
    });

    let rowsHtml = '';
    for (let i = 0; i < prodCards.length; i += 2) {
      const col1 = prodCards[i];
      const col2 = prodCards[i + 1] || '<td width="50%"></td>';
      rowsHtml += `<tr>${col1}${col2}</tr>`;
    }

    prodsHtml = `
      <div style="margin: 24px 0 16px;">
        <h3 style="color: #0b0c10; font-size: 16px; margin: 0 0 12px; border-bottom: 2px solid #f4c542; padding-bottom: 6px;">
          🔥 Productos Destacados con Precio Mayorista:
        </h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${rowsHtml}
        </table>
      </div>
    `;
  }

  return `
    <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; padding: 20px; margin: 0;">
      <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
        
        <!-- Header Principal Negro y Dorado -->
        <div style="background-color: #0b0c10; padding: 22px 20px; text-align: center; border-bottom: 3px solid #f4c542;">
          <h1 style="color: #f4c542; font-size: 19px; margin: 0; font-weight: 800; letter-spacing: 0.5px;">
            DISTRIBUIDORA LA RUTA DEL ORIENTE
          </h1>
          <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0; font-weight: 600;">
            Venta Mayorista Directa para Farmacias &middot; distribuidoralarutadeloriente.cl
          </p>
        </div>

        ${bannerImgHtml}

        <!-- Contenido del Correo -->
        <div style="padding: 24px 22px; color: #334155;">
          ${processedTitle ? `<h2 style="color: #0b0c10; font-size: 17px; margin: 0 0 14px; font-weight: 800;">${processedTitle}</h2>` : ''}

          <div style="font-size: 13px; line-height: 1.6; white-space: pre-wrap; margin-bottom: 20px; color: #1e293b;">${processedBody}</div>

          ${prodsHtml}

          <!-- Botón CTA -->
          <div style="text-align: center; margin: 26px 0 18px;">
            <a href="${data.ctaUrl || 'https://distribuidoralarutadeloriente.cl'}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f4c542 0%, #eab308 100%); color: #0b0c10; font-weight: 800; font-size: 14px; padding: 13px 26px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 14px rgba(244, 197, 66, 0.4);">
              ${data.ctaText || 'Visitar Catálogo Completo en la Web'} &raquo;
            </a>
          </div>

          <!-- Contacto / Firma -->
          <div style="margin-top: 26px; padding-top: 18px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5;">
            <strong style="color: #0b0c10;">${data.senderName || 'Distribuidora La Ruta del Oriente'}</strong><br/>
            WhatsApp de Ventas: <strong style="color: #059669;">${data.senderPhone || '+56 9 9875 0387 / +56 9 6280 1676'}</strong><br/>
            Santiago de Chile &middot; <a href="https://distribuidoralarutadeloriente.cl" target="_blank" style="color: #f4c542; text-decoration: underline;">distribuidoralarutadeloriente.cl</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 14px 20px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          Recibes este correo comercial porque tu farmacia está registrada en nuestro directorio mayorista.
        </div>

      </div>
    </div>
  `;
}

async function updateLiveEmailPreview() {
  const payload = getEmailPreviewPayload();

  try {
    const data = await apiFetch('/api/email/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (data.success && data.html) {
      DOM.previewSubjectText.textContent = data.subject || payload.subject;
      DOM.emailPreviewFrame.innerHTML = data.html;
      return;
    }
  } catch (err) {
    // Si la API remota o local está desconectada, renderizar de forma autónoma
  }

  const fallbackHtml = buildEmailHtmlPreview(payload);
  DOM.previewSubjectText.textContent = payload.subject;
  DOM.emailPreviewFrame.innerHTML = fallbackHtml;
}

// 1. Ver Vista Previa Completa en Modal
function openEmailPreviewModal() {
  const payload = getEmailPreviewPayload();
  const modal = DOM.emailPreviewFullModal;
  const iframe = DOM.previewModalIframe;
  if (!modal || !iframe) return;

  const html = DOM.emailPreviewFrame?.innerHTML || buildEmailHtmlPreview(payload);
  iframe.srcdoc = html;
  modal.classList.add('active');
}

function closeEmailPreviewModal() {
  if (DOM.emailPreviewFullModal) {
    DOM.emailPreviewFullModal.classList.remove('active');
  }
}

// 2. Enviar Correo de Prueba a tu Bandeja
async function sendTestEmail() {
  const recipient = (DOM.testEmailRecipient?.value || '').trim();
  const statusBox = DOM.testEmailStatusBox;
  const btn = DOM.btnSendTestEmail;

  if (!recipient || !recipient.includes('@')) {
    showToast('Ingresa un correo válido para recibir la prueba.', 'error');
    DOM.testEmailRecipient?.focus();
    return;
  }

  const payload = getEmailPreviewPayload();

  if (statusBox) {
    statusBox.style.display = 'block';
    statusBox.style.background = 'rgba(59, 130, 246, 0.15)';
    statusBox.style.border = '1px solid rgba(59, 130, 246, 0.5)';
    statusBox.style.color = '#93c5fd';
    statusBox.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando correo de prueba con los productos a <strong>' + escapeHtml(recipient) + '</strong>...';
  }
  if (btn) btn.disabled = true;

  try {
    const data = await apiFetch('/api/email/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testRecipient: recipient,
        subject: payload.subject,
        title: payload.title,
        body: payload.body,
        selectedProductIds: payload.selectedProductIds,
        bannerUrl: payload.bannerUrl,
        ctaText: payload.ctaText,
        ctaUrl: payload.ctaUrl,
        senderName: payload.senderName,
        senderPhone: payload.senderPhone
      })
    });
    if (btn) btn.disabled = false;

    if (data.success) {
      if (statusBox) {
        statusBox.style.background = 'rgba(16, 185, 129, 0.15)';
        statusBox.style.border = '1px solid rgba(16, 185, 129, 0.5)';
        statusBox.style.color = '#6ee7b7';
        statusBox.innerHTML = '✅ <strong>¡Prueba enviada con éxito!</strong> Revisa la bandeja de entrada o spam de <strong>' + escapeHtml(recipient) + '</strong>.';
      }
      showToast('¡Correo de prueba enviado con éxito a ' + recipient + '!', 'success');
    } else {
      throw new Error(data.error || 'Error al enviar');
    }
  } catch (err) {
    if (btn) btn.disabled = false;
    if (statusBox) {
      statusBox.style.background = 'rgba(239, 68, 68, 0.15)';
      statusBox.style.border = '1px solid rgba(239, 68, 68, 0.5)';
      statusBox.style.color = '#fca5a5';
      statusBox.innerHTML = '⚠️ <strong>No se pudo enviar la prueba:</strong> ' + escapeHtml(err.message) + '. <br><small>Verifica que el servicio de envíos esté activo en tu computador con <code>npm run envios</code>.</small>';
    }
    showToast('Error al enviar correo de prueba: ' + err.message, 'error');
  }
}

// 3. Agregar Nuevo Cliente / Usuario al Directorio
function toggleAddClientForm(force) {
  const container = DOM.addClientFormContainer;
  if (!container) return;
  const shouldOpen = typeof force === 'boolean' ? force : (container.style.display === 'none' || !container.style.display);
  container.style.display = shouldOpen ? 'block' : 'none';
  if (shouldOpen) {
    document.getElementById('new-cli-farmacia')?.focus();
  }
}

async function handleAddNewClient(e) {
  e.preventDefault();
  const farmacia = (document.getElementById('new-cli-farmacia')?.value || '').trim();
  const contacto = (document.getElementById('new-cli-contacto')?.value || '').trim();
  const correo = (document.getElementById('new-cli-correo')?.value || '').trim();
  const telefono = (document.getElementById('new-cli-telefono')?.value || '').trim();
  const comuna = (document.getElementById('new-cli-comuna')?.value || '').trim() || 'Santiago';
  const direccion = (document.getElementById('new-cli-direccion')?.value || '').trim();

  if (!farmacia && !contacto) {
    showToast('Ingresa al menos el nombre de la farmacia o de la persona de contacto.', 'error');
    return;
  }

  const payload = { nombreFarmacia: farmacia, contacto, correo, telefono, comuna, direccion };

  try {
    const data = await apiFetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (data && data.success) {
      console.log('Cliente guardado en backend local');
    }
  } catch (err) {
    // Si la API local no está corriendo, se respalda en localStorage
  }

  const cleanWa = telefono ? telefono.replace(/\D/g, '') : '';
  const newContact = {
    id: 'custom_' + Date.now(),
    nombreFarmacia: farmacia || 'Farmacia',
    contacto: contacto || 'Encargado de Farmacia',
    correo: correo,
    telefonoOriginal: telefono,
    telefonoDisplay: telefono,
    whatsAppNumero: cleanWa.startsWith('56') ? cleanWa : (cleanWa ? '56' + cleanWa : ''),
    tieneWhatsApp: Boolean(telefono && telefono.length >= 8),
    tieneEmail: Boolean(correo && correo.includes('@')),
    comuna: comuna,
    direccion: direccion,
    rut: ''
  };

  // Guardar en Firestore para que se sincronice en la APK móvil y todos los dispositivos
  try {
    if (window.firebase && typeof window.firebase.firestore === 'function') {
      const db = window.firebase.firestore();
      await db.collection('custom_clients').doc(newContact.id).set(newContact);
      console.log('✓ Cliente guardado en Firestore custom_clients desde Envíos');
    }
  } catch (err) {
    console.warn('Error al guardar en Firestore:', err.message);
  }

  // Guardar en localStorage para persistencia
  try {
    const list = JSON.parse(localStorage.getItem('mkt_custom_clients') || '[]');
    list.unshift(newContact);
    localStorage.setItem('mkt_custom_clients', JSON.stringify(list));
  } catch (e) {}

  state.contacts.unshift(newContact);
  state.selectedContactIds.add(newContact.id);

  state.stats.total = (state.stats.total || 0) + 1;
  if (newContact.tieneEmail) state.stats.conEmail = (state.stats.conEmail || 0) + 1;
  if (newContact.tieneWhatsApp) state.stats.conWhatsApp = (state.stats.conWhatsApp || 0) + 1;

  DOM.metricTotal.textContent = state.stats.total;
  DOM.metricEmail.textContent = state.stats.conEmail;
  DOM.metricWa.textContent = state.stats.conWhatsApp;

  applyContactsFilter();
  updateSelectionCounts();
  populatePreviewDropdowns();

  DOM.formNewClientEnvios?.reset();
  toggleAddClientForm(false);
  showToast(`¡Cliente "${farmacia || contacto}" agregado con éxito al directorio!`, 'success');
}

function generateDefaultWhatsAppMessage() {
  const prods = state.products.filter(p => state.selectedProductIds.has(p.id));
  let prodLines = '';
  if (prods.length > 0) {
    prodLines = prods.map(p => `🔹 *${p.name}* -> Precio: *${formatMoney(p.offerPrice || p.normalPrice)}* (Stock: ${p.stock || 100})`).join('\n');
  } else {
    prodLines = '🔹 Línea Adhesivos Dentales Ultra Corega con stock inmediato.';
  }

  DOM.waMessageText.value = `Hola *{contacto}*, gusto en saludarte! 👋

Te escribimos desde *Distribuidora La Ruta del Oriente* para *{farmacia}*.
Tenemos disponibles ofertas de *Adhesivos Ultra Corega 70g* con stock para entrega inmediata:

${prodLines}

📦 Despacho directo a {comuna} y regiones.
🌐 Catálogo oficial: https://distribuidoralarutadeloriente.cl

¿Deseas que te reservemos unidades o te emitamos factura? 💊📦`;
}

function updateLiveWaPreview() {
  const contactId = DOM.waPreviewContactSelect.value;
  const contact = state.contacts.find(c => c.id === contactId) || state.contacts[0] || {
    nombreFarmacia: 'FARMACIA RENACER',
    contacto: 'CLAUDIA SEGOVIA',
    telefonoDisplay: '+56 9 7499 6820',
    comuna: 'SANTIAGO'
  };

  DOM.waMockName.textContent = `${contact.contacto || 'Cliente'} (${contact.nombreFarmacia || 'Farmacia'})`;
  DOM.waMockPhone.textContent = contact.telefonoDisplay || '+56 9 xxxx xxxx';

  let rawText = DOM.waMessageText.value || '';
  let replaced = rawText
    .replace(/{farmacia}/gi, contact.nombreFarmacia || 'su farmacia')
    .replace(/{contacto}/gi, contact.contacto || 'estimado/a')
    .replace(/{comuna}/gi, contact.comuna || '');

  let formattedHtml = escapeHtml(replaced)
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');

  DOM.waMockText.innerHTML = formattedHtml;

  const now = new Date();
  DOM.waMockTime.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  if (state.waImageFile) {
    DOM.waMockImageContainer.style.display = 'block';
    DOM.waMockImg.src = state.waImageFile.url;
  } else {
    DOM.waMockImageContainer.style.display = 'none';
  }
}

// ================= FILE UPLOADS =================
async function handleFileUpload(files, type = 'email') {
  if (!files || files.length === 0) return;

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  try {
    showToast('Subiendo archivo(s)...', 'info');
    const data = await apiFetch('/api/upload', { method: 'POST', body: formData });
    if (!data.success) throw new Error(data.error);

    if (type === 'email') {
      state.uploadedEmailFiles.push(...data.files);
      renderUploadedEmailFiles();
      showToast(`${data.files.length} archivo(s) agregado(s)`, 'success');
      updateLiveEmailPreview();
    } else if (type === 'wa') {
      const img = data.files.find(f => f.isImage);
      if (img) {
        state.waImageFile = img;
        DOM.waImagePreviewContainer.style.display = 'flex';
        DOM.waImagePreviewImg.src = img.url;
        showToast('Foto lista para WhatsApp', 'success');
        updateLiveWaPreview();
      }
    }
  } catch (err) {
    showToast(`Error al subir: ${err.message}`, 'error');
  }
}

function renderUploadedEmailFiles() {
  if (state.uploadedEmailFiles.length === 0) {
    DOM.uploadedFilesList.innerHTML = '';
    DOM.bannerSelectorContainer.style.display = 'none';
    return;
  }

  const hasImage = state.uploadedEmailFiles.some(f => f.isImage);
  DOM.bannerSelectorContainer.style.display = hasImage ? 'block' : 'none';

  DOM.uploadedFilesList.innerHTML = state.uploadedEmailFiles.map((f, idx) => `
    <div class="file-item-pill">
      <div class="file-info">
        <i class="fa-solid fa-paperclip text-gold"></i>
        <span>${escapeHtml(f.originalName)} (${Math.round(f.size / 1024)} KB)</span>
      </div>
      <button type="button" class="btn btn-sm btn-ghost text-danger btn-remove-file" data-idx="${idx}">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `).join('');
}

// ================= EMAIL CAMPAIGN SENDING =================
async function startEmailCampaign() {
  const subject = DOM.emailSubject.value.trim();
  const body = DOM.emailBody.value.trim();

  if (!subject) {
    showToast('Ingresa un Asunto para el correo', 'error');
    DOM.emailSubject.focus();
    return;
  }

  const selectedList = state.contacts.filter(c => state.selectedContactIds.has(c.id) && c.tieneEmail);
  if (selectedList.length === 0) {
    showToast('No hay farmacias seleccionadas con correo electrónico válido.', 'error');
    return;
  }

  if (!confirm(`¿Iniciar el envío masivo de las 4 ofertas de Corega a ${selectedList.length} farmacias de Santiago?`)) {
    return;
  }

  DOM.emailSendModal.classList.add('active');
  DOM.progCurrent.textContent = '0';
  DOM.progTotal.textContent = selectedList.length;
  DOM.progSuccess.textContent = '0';
  DOM.progFailed.textContent = '0';
  DOM.progBarFill.style.width = '0%';
  DOM.progPercent.textContent = '0%';
  DOM.sendLiveLogs.innerHTML = `<div class="log-item log-info">Iniciando despacho a ${selectedList.length} destinatarios con los 4 productos Corega de Firebase...</div>`;
  DOM.btnStopCampaign.style.display = 'inline-flex';
  DOM.btnDoneCampaign.style.display = 'none';

  let bannerUrl = null;
  if (DOM.cbUseAsBanner.checked && state.uploadedEmailFiles.length > 0) {
    const firstImg = state.uploadedEmailFiles.find(f => f.isImage);
    if (firstImg) bannerUrl = firstImg.url;
  }

  try {
    const data = await apiFetch('/api/email/send-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetContactIds: Array.from(state.selectedContactIds),
        subject,
        title: DOM.emailTitle.value || subject,
        body,
        selectedProductIds: Array.from(state.selectedProductIds),
        ctaText: DOM.emailCtaText.value || 'Visitar Catálogo en la Web',
        ctaUrl: DOM.emailCtaUrl.value || 'https://distribuidoralarutadeloriente.cl',
        bannerUrl,
        senderName: DOM.emailSenderName.value || 'Distribuidora La Ruta del Oriente',
        senderPhone: DOM.emailSenderPhone.value || '',
        attachmentFiles: state.uploadedEmailFiles
      })
    });

    if (!data.success) throw new Error(data.error);

    state.currentCampaignPollInterval = setInterval(pollCampaignStatus, 900);
  } catch (err) {
    showToast(`Error al enviar: ${err.message}`, 'error', 9000);
    DOM.sendLiveLogs.innerHTML += `<div class="log-item log-error">Error: ${escapeHtml(err.message)}</div>`;
  }
}

async function pollCampaignStatus() {
  try {
    const data = await apiFetch('/api/email/status');

    DOM.progCurrent.textContent = data.current;
    DOM.progTotal.textContent = data.total;
    DOM.progSuccess.textContent = data.success;
    DOM.progFailed.textContent = data.failed;

    const percent = data.total > 0 ? Math.round((data.current / data.total) * 100) : 0;
    DOM.progBarFill.style.width = `${percent}%`;
    DOM.progPercent.textContent = `${percent}%`;

    if (data.logs && data.logs.length > 0) {
      DOM.sendLiveLogs.innerHTML = data.logs.map(log => {
        if (log.status === 'success') {
          return `<div class="log-item log-success">✓ Enviado a: ${escapeHtml(log.name)} &lt;${escapeHtml(log.email)}&gt;</div>`;
        } else if (log.status === 'error') {
          return `<div class="log-item log-error">✗ Falló ${escapeHtml(log.name)}: ${escapeHtml(log.error || '')}</div>`;
        } else {
          return `<div class="log-item log-info">${escapeHtml(log.message || '')}</div>`;
        }
      }).join('');
    }

    if (!data.running) {
      clearInterval(state.currentCampaignPollInterval);
      state.currentCampaignPollInterval = null;
      DOM.btnStopCampaign.style.display = 'none';
      DOM.btnDoneCampaign.style.display = 'inline-flex';
      showToast(`¡Campaña finalizada! Enviados: ${data.success}, Errores: ${data.failed}`, 'success');
    }
  } catch (err) {
    console.error('Poll error:', err);
  }
}

async function stopCampaign() {
  if (confirm('¿Deseas detener el envío de correos en este momento?')) {
    await apiFetch('/api/email/stop', { method: 'POST' });
    showToast('Deteniendo campaña...', 'info');
  }
}

// ================= WHATSAPP GUIDED DISPATCHER =================
function startWhatsAppDispatcher() {
  const rawMsg = DOM.waMessageText.value.trim();
  if (!rawMsg) {
    showToast('Escribe el mensaje para WhatsApp', 'error');
    DOM.waMessageText.focus();
    return;
  }

  const selectedList = state.contacts.filter(c => state.selectedContactIds.has(c.id) && c.tieneWhatsApp);
  if (selectedList.length === 0) {
    showToast('No hay farmacias seleccionadas con WhatsApp móvil válido.', 'error');
    return;
  }

  state.waQueue.active = true;
  state.waQueue.list = selectedList;
  state.waQueue.currentIndex = 0;

  DOM.waQueueTotal.textContent = selectedList.length;
  DOM.waQueueModal.classList.add('active');

  renderCurrentWaQueueItem();
}

function renderCurrentWaQueueItem() {
  const item = state.waQueue.list[state.waQueue.currentIndex];
  if (!item) {
    showToast('¡Has completado toda la lista de envíos de WhatsApp!', 'success');
    DOM.waQueueModal.classList.remove('active');
    return;
  }

  const total = state.waQueue.list.length;
  const currentIdx = state.waQueue.currentIndex + 1;

  DOM.waQueueCurrentIdx.textContent = currentIdx;
  DOM.waQueueBar.style.width = `${Math.round((currentIdx / total) * 100)}%`;

  DOM.waQFarmacia.textContent = item.nombreFarmacia || 'Farmacia';
  DOM.waQContacto.textContent = `Contacto: ${item.contacto || 'Encargado'}`;
  DOM.waQPhone.textContent = item.telefonoDisplay || item.whatsAppNumero;

  const rawMsg = DOM.waMessageText.value;
  const personalizedMsg = rawMsg
    .replace(/{farmacia}/gi, item.nombreFarmacia || 'su farmacia')
    .replace(/{contacto}/gi, item.contacto || 'estimado/a')
    .replace(/{comuna}/gi, item.comuna || '');

  DOM.waQMsgContent.textContent = personalizedMsg;

  const encodedMsg = encodeURIComponent(personalizedMsg);
  const waUrl = `https://web.whatsapp.com/send?phone=${item.whatsAppNumero}&text=${encodedMsg}`;
  DOM.btnWaOpenChat.href = waUrl;
}

async function markWaCurrentAsSentAndNext() {
  const item = state.waQueue.list[state.waQueue.currentIndex];
  if (item) {
    fetch('/api/whatsapp/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contactId: item.id,
        farmacia: item.nombreFarmacia,
        contacto: item.contacto,
        phone: item.telefonoDisplay,
        message: DOM.waQMsgContent.textContent
      })
    });
  }

  state.waQueue.currentIndex++;
  renderCurrentWaQueueItem();
}

// ================= SMTP SETTINGS =================
async function loadSmtpConfig() {
  try {
    const cfg = await apiFetch('/api/config');
    state.smtpConfig = cfg;

    DOM.smtpProvider.value = cfg.provider || 'gmail';
    DOM.smtpUser.value = cfg.user || '';
    if (cfg.hasPass) DOM.smtpPass.placeholder = '•••••••••••••••• (Guardada)';
    DOM.smtpFromName.value = cfg.fromName || 'Distribuidora La Ruta del Oriente';
    DOM.smtpFromEmail.value = cfg.fromEmail || 'contacto@distribuidoralarutadeloriente.cl';
    DOM.smtpDelay.value = cfg.sendDelayMs || 1200;

    if (cfg.host) DOM.smtpHost.value = cfg.host;
    if (cfg.port) DOM.smtpPort.value = cfg.port;
    if (cfg.secure !== undefined) DOM.smtpSecure.value = String(cfg.secure);

    DOM.customSmtpFields.style.display = DOM.smtpProvider.value === 'custom' ? 'block' : 'none';
  } catch (err) {
    console.error('Config load error:', err);
  }
}

async function saveSmtpConfig() {
  const cfg = {
    provider: DOM.smtpProvider.value,
    user: DOM.smtpUser.value.trim(),
    pass: DOM.smtpPass.value.trim(),
    fromName: DOM.smtpFromName.value.trim() || 'Distribuidora La Ruta del Oriente',
    fromEmail: DOM.smtpFromEmail.value.trim() || 'contacto@distribuidoralarutadeloriente.cl',
    sendDelayMs: Number(DOM.smtpDelay.value) || 1200,
    host: DOM.smtpHost.value.trim(),
    port: Number(DOM.smtpPort.value) || 465,
    secure: DOM.smtpSecure.value === 'true'
  };

  try {
    const data = await apiFetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg)
    });
    if (!data.success) throw new Error(data.error);

    showToast('Configuración guardada correctamente', 'success');
  } catch (err) {
    showToast(`Error al guardar: ${err.message}`, 'error');
  }
}

async function testSmtpConnection() {
  const testRecipient = DOM.testEmailRecipient.value.trim();
  if (!testRecipient) {
    showToast('Ingresa tu correo para recibir la prueba', 'error');
    DOM.testEmailRecipient.focus();
    return;
  }

  DOM.btnTestEmail.disabled = true;
  DOM.btnTestEmail.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Probando...';
  DOM.testResultBox.style.display = 'none';

  try {
    const data = await apiFetch('/api/email/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testRecipient })
    });

    DOM.testResultBox.style.display = 'block';
    if (data.success) {
      DOM.testResultBox.className = 'test-result-box success';
      DOM.testResultBox.innerHTML = `<strong>✓ Conexión Exitosa:</strong> ${escapeHtml(data.message)}`;
      showToast('¡Correo de prueba enviado con éxito!', 'success');
    } else {
      DOM.testResultBox.className = 'test-result-box error';
      DOM.testResultBox.innerHTML = `<strong>✗ Error:</strong> ${escapeHtml(data.error)}`;
      showToast('Error al enviar correo de prueba', 'error');
    }
  } catch (err) {
    DOM.testResultBox.style.display = 'block';
    DOM.testResultBox.className = 'test-result-box error';
    DOM.testResultBox.innerHTML = `<strong>✗ Error:</strong> ${escapeHtml(err.message)}`;
  } finally {
    DOM.btnTestEmail.disabled = false;
    DOM.btnTestEmail.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Prueba';
  }
}

// ================= HISTORY =================
async function loadHistory() {
  try {
    const data = await apiFetch('/api/history');
    if (!data.success) throw new Error(data.error);

    if (data.history.length === 0) {
      DOM.historyTbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-muted">Aún no hay campañas enviadas.</td>
        </tr>
      `;
      return;
    }

    DOM.historyTbody.innerHTML = data.history.map(h => {
      const isEmail = h.type === 'email';
      const badge = isEmail
        ? `<span class="badge badge-email"><i class="fa-solid fa-envelope"></i> Correo Masivo</span>`
        : `<span class="badge badge-wa"><i class="fa-brands fa-whatsapp"></i> WhatsApp</span>`;

      const dateStr = new Date(h.date).toLocaleString('es-CL');

      if (isEmail) {
        return `
          <tr>
            <td>${dateStr}</td>
            <td>${badge}</td>
            <td><strong>${escapeHtml(h.subject || 'Ofertas')}</strong></td>
            <td><span class="badge badge-accent">${h.productsCount || 0} productos</span></td>
            <td>${h.total} farmacias</td>
            <td class="text-success font-bold">${h.success}</td>
            <td class="${h.failed > 0 ? 'text-danger font-bold' : 'text-muted'}">${h.failed}</td>
          </tr>
        `;
      } else {
        return `
          <tr>
            <td>${dateStr}</td>
            <td>${badge}</td>
            <td>${escapeHtml(h.farmacia || '')}</td>
            <td>-</td>
            <td>1 contacto (${h.phone})</td>
            <td class="text-success">1</td>
            <td class="text-muted">0</td>
          </tr>
        `;
      }
    }).join('');
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// ================= EVENT LISTENERS =================
function setupEventListeners() {
  if (DOM.btnSyncFirebaseHeader) DOM.btnSyncFirebaseHeader.addEventListener('click', triggerFirebaseSync);
  if (DOM.btnSyncFirebasePicker) DOM.btnSyncFirebasePicker.addEventListener('click', triggerFirebaseSync);
  if (DOM.btnSyncFirebaseNow) DOM.btnSyncFirebaseNow.addEventListener('click', triggerFirebaseSync);

  // Product picker selection clicks
  DOM.productsPickerGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.prod-picker-card');
    if (!card) return;

    const id = card.getAttribute('data-id');
    const cb = card.querySelector('.cb-prod-select');

    if (e.target !== cb && !e.target.closest('.btn-detail-dark')) {
      cb.checked = !cb.checked;
    }

    if (cb.checked) {
      state.selectedProductIds.add(id);
      card.classList.add('selected');
    } else {
      state.selectedProductIds.delete(id);
      card.classList.remove('selected');
    }

    const floatText = card.querySelector('.prod-card-select-float span');
    if (floatText) floatText.textContent = cb.checked ? 'Incluido' : 'No incluir';

    updateLiveEmailPreview();
  });

  DOM.btnSelectAllProds.addEventListener('click', () => {
    state.products.forEach(p => state.selectedProductIds.add(p.id));
    renderProductsPicker();
    updateLiveEmailPreview();
    showToast(`Los 4 productos Corega incluidos en la oferta`, 'info');
  });

  DOM.btnDeselectAllProds.addEventListener('click', () => {
    state.selectedProductIds.clear();
    renderProductsPicker();
    updateLiveEmailPreview();
    showToast('Productos deseleccionados', 'info');
  });

  DOM.btnLoadProdsIntoWa.addEventListener('click', () => {
    generateDefaultWhatsAppMessage();
    updateLiveWaPreview();
    showToast('Los 4 productos cargados al mensaje de WhatsApp', 'success');
  });

  // Contacts
  DOM.contactSearch.addEventListener('input', applyContactsFilter);
  DOM.filterChannel.addEventListener('change', applyContactsFilter);
  DOM.filterComuna.addEventListener('change', applyContactsFilter);

  DOM.btnSelectAll.addEventListener('click', () => {
    state.filteredContacts.forEach(c => state.selectedContactIds.add(c.id));
    renderContactsTable();
    updateSelectionCounts();
  });

  DOM.btnDeselectAll.addEventListener('click', () => {
    state.selectedContactIds.clear();
    renderContactsTable();
    updateSelectionCounts();
  });

  DOM.thSelectAll.addEventListener('change', (e) => {
    if (e.target.checked) {
      state.filteredContacts.forEach(c => state.selectedContactIds.add(c.id));
    } else {
      state.filteredContacts.forEach(c => state.selectedContactIds.delete(c.id));
    }
    renderContactsTable();
    updateSelectionCounts();
  });

  DOM.contactsTbody.addEventListener('change', (e) => {
    if (e.target.classList.contains('cb-contact')) {
      const id = e.target.getAttribute('data-id');
      if (e.target.checked) {
        state.selectedContactIds.add(id);
      } else {
        state.selectedContactIds.delete(id);
      }
      updateSelectionCounts();
    }
  });

  DOM.btnReloadContacts.addEventListener('click', async () => {
    showToast('Recargando archivo Excel...', 'info');
    await loadContacts();
    showToast('¡Contactos actualizados!', 'success');
  });

  DOM.btnGoToEmailTab.addEventListener('click', () => {
    document.querySelector('.tab-btn[data-tab="tab-email"]').click();
  });

  // Email live preview
  [
    DOM.emailSubject, DOM.emailTitle, DOM.emailBody,
    DOM.emailCtaText, DOM.emailCtaUrl, DOM.emailSenderName, DOM.emailSenderPhone,
    DOM.cbUseAsBanner, DOM.previewContactSelect
  ].forEach(el => {
    el.addEventListener('input', debounce(updateLiveEmailPreview, 250));
    el.addEventListener('change', updateLiveEmailPreview);
  });

  document.querySelectorAll('[data-insert]').forEach(btn => {
    btn.addEventListener('click', () => {
      insertTextAtCursor(DOM.emailBody, btn.getAttribute('data-insert'));
      updateLiveEmailPreview();
    });
  });

  document.querySelectorAll('[data-wa-insert]').forEach(btn => {
    btn.addEventListener('click', () => {
      insertTextAtCursor(DOM.waMessageText, btn.getAttribute('data-wa-insert'));
      updateLiveWaPreview();
    });
  });

  // Uploads
  DOM.emailDropzone.addEventListener('click', () => DOM.emailFileInput.click());
  DOM.emailFileInput.addEventListener('change', (e) => handleFileUpload(e.target.files, 'email'));

  DOM.uploadedFilesList.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-remove-file');
    if (btn) {
      state.uploadedEmailFiles.splice(Number(btn.getAttribute('data-idx')), 1);
      renderUploadedEmailFiles();
      updateLiveEmailPreview();
    }
  });

  DOM.btnLaunchEmailCampaign.addEventListener('click', startEmailCampaign);
  DOM.btnStopCampaign.addEventListener('click', stopCampaign);
  DOM.btnCloseSendModal.addEventListener('click', () => DOM.emailSendModal.classList.remove('active'));
  DOM.btnDoneCampaign.addEventListener('click', () => DOM.emailSendModal.classList.remove('active'));

  // Vista Previa Completa en Modal
  if (DOM.btnPreviewEmailModal) DOM.btnPreviewEmailModal.addEventListener('click', openEmailPreviewModal);
  if (DOM.btnExpandPreview) DOM.btnExpandPreview.addEventListener('click', openEmailPreviewModal);
  if (DOM.btnClosePreviewModal) DOM.btnClosePreviewModal.addEventListener('click', closeEmailPreviewModal);
  if (DOM.btnClosePreviewModalFooter) DOM.btnClosePreviewModalFooter.addEventListener('click', closeEmailPreviewModal);
  if (DOM.btnPreviewToSend) {
    DOM.btnPreviewToSend.addEventListener('click', () => {
      closeEmailPreviewModal();
      startEmailCampaign();
    });
  }

  // Enviar Correo de Prueba
  if (DOM.btnSendTestEmail) DOM.btnSendTestEmail.addEventListener('click', sendTestEmail);

  // Agregar Nuevo Cliente al Directorio
  if (DOM.btnToggleAddClient) DOM.btnToggleAddClient.addEventListener('click', () => toggleAddClientForm());
  if (DOM.btnCancelAddClient) DOM.btnCancelAddClient.addEventListener('click', () => toggleAddClientForm(false));
  if (DOM.btnCloseAddClientForm) DOM.btnCloseAddClientForm.addEventListener('click', () => toggleAddClientForm(false));
  if (DOM.formNewClientEnvios) DOM.formNewClientEnvios.addEventListener('submit', handleAddNewClient);

  // WhatsApp
  DOM.waMessageText.addEventListener('input', debounce(updateLiveWaPreview, 200));
  DOM.waPreviewContactSelect.addEventListener('change', updateLiveWaPreview);
  DOM.waDropzone.addEventListener('click', () => DOM.waFileInput.click());
  DOM.waFileInput.addEventListener('change', (e) => handleFileUpload(e.target.files, 'wa'));

  DOM.btnRemoveWaImage.addEventListener('click', () => {
    state.waImageFile = null;
    DOM.waImagePreviewContainer.style.display = 'none';
    DOM.waFileInput.value = '';
    updateLiveWaPreview();
  });

  DOM.btnStartWaDispatcher.addEventListener('click', startWhatsAppDispatcher);
  DOM.btnCloseWaModal.addEventListener('click', () => DOM.waQueueModal.classList.remove('active'));
  DOM.btnCloseWaQueue.addEventListener('click', () => DOM.waQueueModal.classList.remove('active'));
  DOM.btnWaNext.addEventListener('click', markWaCurrentAsSentAndNext);
  DOM.btnWaSkip.addEventListener('click', () => {
    state.waQueue.currentIndex++;
    renderCurrentWaQueueItem();
  });

  DOM.btnWaCopyMsg.addEventListener('click', () => {
    navigator.clipboard.writeText(DOM.waQMsgContent.textContent).then(() => {
      showToast('Mensaje copiado al portapapeles', 'info');
    });
  });

  // SMTP
  DOM.smtpProvider.addEventListener('change', () => {
    DOM.customSmtpFields.style.display = DOM.smtpProvider.value === 'custom' ? 'block' : 'none';
  });
  DOM.btnSaveSmtp.addEventListener('click', saveSmtpConfig);
  DOM.btnTestEmail.addEventListener('click', testSmtpConnection);

  DOM.toggleSmtpPass.addEventListener('click', () => {
    const isPass = DOM.smtpPass.type === 'password';
    DOM.smtpPass.type = isPass ? 'text' : 'password';
    DOM.toggleSmtpPass.innerHTML = isPass ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
  });

  DOM.btnRefreshHistory.addEventListener('click', loadHistory);
}

function insertTextAtCursor(textarea, text) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;
  textarea.value = val.substring(0, start) + text + val.substring(end);
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = start + text.length;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// ================= SEGURIDAD Y CONTROL DE ACCESO (FIREBASE AUTH) =================
const AUTHORIZED_ADMIN_EMAILS = ['distribuidorarutadeloriente@gmail.com', 'elsakitodewea@gmail.com'];

function isAuthorizedAdminUser(user) {
  const email = (user?.email || '').trim().toLowerCase();
  return Boolean(
    user && (
      email.endsWith('@distribuidoralarutadeloriente.cl') ||
      email === 'distribuidorarutadeloriente@gmail.com' ||
      email === 'elsakitodewea@gmail.com'
    )
  );
}

function toggleAuthPassVisibility() {
  const passInput = document.getElementById('auth-password');
  const eyeIcon = document.getElementById('auth-eye-icon');
  if (!passInput) return;
  if (passInput.type === 'password') {
    passInput.type = 'text';
    if (eyeIcon) eyeIcon.className = 'fa-solid fa-eye-slash';
  } else {
    passInput.type = 'password';
    if (eyeIcon) eyeIcon.className = 'fa-solid fa-eye';
  }
}

async function handleAdminLogin(event) {
  event.preventDefault();
  const email = document.getElementById('auth-email')?.value.trim() || '';
  const password = document.getElementById('auth-password')?.value || '';
  const submitBtn = document.getElementById('btn-submit-auth');
  const errorMsg = document.getElementById('auth-error-msg');
  const noticeMsg = document.getElementById('auth-notice-msg');

  if (errorMsg) errorMsg.style.display = 'none';
  if (noticeMsg) noticeMsg.style.display = 'none';

  if (!email || !password) {
    if (errorMsg) {
      errorMsg.textContent = 'Ingresa correo y contraseña.';
      errorMsg.style.display = 'block';
    }
    return;
  }

  if (!isAuthorizedAdminUser({ email })) {
    if (errorMsg) {
      errorMsg.textContent = 'Acceso denegado: solo cuentas autorizadas pueden ingresar al modo administrador.';
      errorMsg.style.display = 'block';
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando credenciales...';
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    const creds = await firebase.auth().signInWithEmailAndPassword(email, password);
    if (!isAuthorizedAdminUser(creds.user)) {
      await firebase.auth().signOut();
      throw new Error('La cuenta no corresponde a un administrador autorizado.');
    }
  } catch (err) {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Ingresar al Administrador';
    }
    if (errorMsg) {
      let msg = 'No fue posible iniciar sesión: ' + (err.message || err.code);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
        msg = 'Contraseña incorrecta para esa cuenta.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No existe una cuenta registrada en Firebase Auth con ese correo.';
      }
      errorMsg.textContent = msg;
      errorMsg.style.display = 'block';
    }
  }
}

async function sendAuthPasswordReset() {
  const email = document.getElementById('auth-email')?.value.trim() || '';
  const errorMsg = document.getElementById('auth-error-msg');
  const noticeMsg = document.getElementById('auth-notice-msg');

  if (errorMsg) errorMsg.style.display = 'none';
  if (noticeMsg) noticeMsg.style.display = 'none';

  if (!email) {
    alert('Ingresa tu correo para enviarte el enlace de restablecimiento.');
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    await firebase.auth().sendPasswordResetEmail(email);
    if (noticeMsg) {
      noticeMsg.textContent = 'Se envió un correo a ' + email + ' con el enlace para restablecer tu contraseña. Revisa tu bandeja de entrada o spam.';
      noticeMsg.style.display = 'block';
    }
  } catch (err) {
    if (errorMsg) {
      errorMsg.textContent = 'Error al enviar recuperación: ' + err.message;
      errorMsg.style.display = 'block';
    }
  }
}

async function handleAdminLogout() {
  if (confirm('¿Deseas cerrar la sesión de administrador?')) {
    try {
      if (firebase.auth) {
        await firebase.auth().signOut();
      }
    } catch (e) {}
    sessionStorage.removeItem('adminAuthenticated');
    window.location.reload();
  }
}

let appInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }

  firebase.auth().onAuthStateChanged(async user => {
    const barrier = document.getElementById('admin-auth-barrier');
    const appRoot = document.getElementById('admin-app-root');
    const emailDisplay = document.getElementById('admin-current-user-email');

    if (user && isAuthorizedAdminUser(user)) {
      sessionStorage.setItem('adminAuthenticated', 'true');
      if (barrier) barrier.style.display = 'none';
      if (appRoot) appRoot.style.display = 'block';
      if (emailDisplay) emailDisplay.textContent = user.email;
      if (DOM.testEmailRecipient && user.email) {
        DOM.testEmailRecipient.value = user.email;
      }

      if (!appInitialized) {
        appInitialized = true;
        await init();
      }
    } else {
      sessionStorage.removeItem('adminAuthenticated');
      if (appRoot) appRoot.style.display = 'none';
      if (barrier) barrier.style.display = 'flex';
      state.contacts = [];
      state.filteredContacts = [];
    }
  });

  initApkDownloadSystem();
});

// ================= APK DOWNLOAD MODAL & DRIVE SYSTEM =================
const DEFAULT_APK_DRIVE_URL = 'https://drive.google.com/file/d/133mJoUHWGUhyIpG4jm2th1lrYFxGWN00/view?usp=sharing';

function getApkDriveUrl() {
  return localStorage.getItem('laruta_apk_drive_url') || DEFAULT_APK_DRIVE_URL;
}

function resolveDriveDownloadUrl(rawUrl) {
  if (!rawUrl) return DEFAULT_APK_DRIVE_URL;
  const match = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return rawUrl;
}

function initApkDownloadSystem() {
  updateApkModalUi();
}

function updateApkModalUi() {
  const currentUrl = getApkDriveUrl();
  const downloadBtn = document.getElementById('btn-apk-drive-download');
  const qrImg = document.getElementById('apk-qr-image');
  const inputLink = document.getElementById('input-apk-drive-link');

  const downloadUrl = resolveDriveDownloadUrl(currentUrl);

  if (downloadBtn) {
    downloadBtn.href = downloadUrl;
  }
  if (inputLink) {
    inputLink.value = currentUrl;
  }
  if (qrImg) {
    const qrData = encodeURIComponent(downloadUrl);
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`;
  }
}

function openApkDownloadModal() {
  updateApkModalUi();
  const modal = document.getElementById('apk-download-modal');
  if (modal) {
    modal.classList.add('active');
  }
}

function closeApkDownloadModal() {
  const modal = document.getElementById('apk-download-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function saveCustomApkDriveUrl() {
  const input = document.getElementById('input-apk-drive-link');
  const feedback = document.getElementById('apk-save-feedback');
  if (!input) return;

  const val = input.value.trim();
  if (!val) {
    localStorage.removeItem('laruta_apk_drive_url');
    updateApkModalUi();
    if (feedback) {
      feedback.style.display = 'block';
      feedback.style.color = '#cbd5e1';
      feedback.textContent = 'Enlace restablecido por defecto.';
      setTimeout(() => { feedback.style.display = 'none'; }, 2500);
    }
    return;
  }

  localStorage.setItem('laruta_apk_drive_url', val);
  updateApkModalUi();

  if (feedback) {
    feedback.style.display = 'block';
    feedback.style.color = '#4ade80';
    feedback.textContent = '✓ ¡Enlace de Google Drive guardado con éxito!';
    setTimeout(() => { feedback.style.display = 'none'; }, 3000);
  }
  showToast('Enlace de APK en Google Drive actualizado', 'success');
}
