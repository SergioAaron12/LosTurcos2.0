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
  btnLaunchEmailCampaign: document.getElementById('btn-launch-email-campaign'),

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

  // Contacts View
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
    const res = await fetch('/api/firebase/sync', { method: 'POST' });
    const data = await res.json();
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
    const res = await fetch('/api/products');
    const data = await res.json();
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
  try {
    const res = await fetch('/api/contacts');
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    state.contacts = data.contacts;
    state.comunas = data.comunas;
    state.stats = data.stats;

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
  } catch (err) {
    showToast(`Error al cargar contactos: ${err.message}`, 'error');
  }
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

// ================= LIVE PREVIEWS =================
async function updateLiveEmailPreview() {
  const contactId = DOM.previewContactSelect.value;
  const subject = DOM.emailSubject.value || 'Ofertas Adhesivos Corega - Distribuidora La Ruta del Oriente';
  const title = DOM.emailTitle.value || subject;
  const body = DOM.emailBody.value || '';
  const ctaText = DOM.emailCtaText.value || 'Visitar Catálogo Completo en la Web';
  const ctaUrl = DOM.emailCtaUrl.value || 'https://distribuidoralarutadeloriente.cl';
  const senderName = DOM.emailSenderName.value || 'Distribuidora La Ruta del Oriente';
  const senderPhone = DOM.emailSenderPhone.value || '+56 9 9786 2467';

  let bannerUrl = null;
  if (DOM.cbUseAsBanner.checked && state.uploadedEmailFiles.length > 0) {
    const firstImg = state.uploadedEmailFiles.find(f => f.isImage);
    if (firstImg) bannerUrl = firstImg.url;
  }

  try {
    const res = await fetch('/api/email/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      })
    });
    const data = await res.json();
    if (data.success) {
      DOM.previewSubjectText.textContent = data.subject;
      DOM.emailPreviewFrame.innerHTML = data.html;
    }
  } catch (err) {
    console.error('Preview error:', err);
  }
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
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
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
    const res = await fetch('/api/email/send-batch', {
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

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    state.currentCampaignPollInterval = setInterval(pollCampaignStatus, 900);
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
    DOM.sendLiveLogs.innerHTML += `<div class="log-item log-error">Error: ${escapeHtml(err.message)}</div>`;
  }
}

async function pollCampaignStatus() {
  try {
    const res = await fetch('/api/email/status');
    const data = await res.json();

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
    await fetch('/api/email/stop', { method: 'POST' });
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
    const res = await fetch('/api/config');
    const cfg = await res.json();
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
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg)
    });
    const data = await res.json();
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
    const res = await fetch('/api/email/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testRecipient })
    });
    const data = await res.json();

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
    const res = await fetch('/api/history');
    const data = await res.json();
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

document.addEventListener('DOMContentLoaded', init);
