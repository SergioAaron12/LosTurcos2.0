// ===================================================
// Distribuidora La Ruta del Oriente - Mobile Engine
// ===================================================

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyApOacPTnK-PLkiiC1o7qdwwrTv6upGoU0',
  authDomain: 'distribuidoralarutadeloriente.firebaseapp.com',
  projectId: 'distribuidoralarutadeloriente',
  storageBucket: 'distribuidoralarutadeloriente.firebasestorage.app',
  messagingSenderId: '18647063099',
  appId: '1:18647063099:web:d25d090a14a71603a51a1e'
};

const LOCAL_API_BASE = 'http://localhost:3000';

// Detectar entorno APK nativo o PWA para ajuste de barra de estado
try {
  if (
    (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) ||
    window.location.protocol === 'capacitor:' ||
    (window.location.protocol === 'https:' && window.location.hostname === 'localhost') ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  ) {
    document.documentElement.classList.add('is-native-app');
    document.body?.classList.add('is-native-app');
  }
} catch (e) {}

const mState = {
  contacts: [],
  filteredContacts: [],
  selectedContactIds: new Set(),
  products: [],
  selectedProductIds: new Set(),
  activeTab: 'm-tab-whatsapp',
  activeFilter: 'all',
  waIndex: 0,
  waList: []
};

// ================= API CALLER =================
const DEFAULT_SERVER_URL = 'http://192.168.100.19:3000';

function getServerBaseUrl() {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return '';
  }
  return localStorage.getItem('m_server_url') || DEFAULT_SERVER_URL;
}

function getApiEndpoint(ep) {
  const base = getServerBaseUrl();
  return `${base}${ep}`;
}

async function mApi(endpoint, options = {}) {
  const url = getApiEndpoint(endpoint);
  let res;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeout || 12000);
    res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
  } catch (err) {
    throw new Error(`No se pudo conectar con el servidor de envíos (${getServerBaseUrl()}). Asegúrate de ejecutar "npm run envios" en tu PC.`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error('Respuesta no válida del servidor.');
    }
  }
  return await res.json();
}

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', async () => {
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }

  firebase.auth().onAuthStateChanged(async (user) => {
    const authBarrier = document.getElementById('m-auth-barrier');
    const appRoot = document.getElementById('m-app-root');

    if (user && isAuthorizedAdmin(user)) {
      if (authBarrier) authBarrier.style.display = 'none';
      if (appRoot) appRoot.style.display = 'block';
      await initMobileApp();
    } else {
      if (appRoot) appRoot.style.display = 'none';
      if (authBarrier) authBarrier.style.display = 'flex';
    }
  });

  setupNavigationTabs();
  setupEventListeners();
});

function isAuthorizedAdmin(user) {
  const email = (user?.email || '').trim().toLowerCase();
  return Boolean(
    email.endsWith('@distribuidoralarutadeloriente.cl') ||
    email === 'distribuidorarutadeloriente@gmail.com' ||
    email === 'elsakitodewea@gmail.com'
  );
}

async function initMobileApp() {
  await Promise.all([loadMobileProducts(), loadMobileContacts()]);
  updateMobileHeaderStats();
}

// ================= TABS =================
function setupNavigationTabs() {
  document.querySelectorAll('.m-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      document.querySelectorAll('.m-nav-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.m-tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const pane = document.getElementById(targetId);
      if (pane) pane.classList.add('active');
      mState.activeTab = targetId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// ================= PRODUCTS =================
const COREGA_PRODUCT_IMAGES = {
  corega_max_bloqueo: 'img/products/corega_maximo_sellado_70g.jpg',
  corega_max_fijacion: 'img/products/corega_maximo_menta_70g.jpg',
  corega_sin_sabor: 'img/products/corega_sin_sabor_70g.jpg',
  corega_sabor_menta: 'img/products/corega_menta_70g.jpg'
};

function getProductImage(p) {
  if (!p) return 'img/products/corega_maximo_sellado_70g.jpg';
  if (p.image && !p.image.includes('corega1') && !p.image.includes('corega2') && !p.image.includes('corega3') && !p.image.includes('corega4')) {
    return p.image;
  }
  if (p.imageUrl && !p.imageUrl.includes('corega1')) {
    return p.imageUrl;
  }
  return COREGA_PRODUCT_IMAGES[p.id] || 'img/products/corega_maximo_sellado_70g.jpg';
}

async function loadMobileProducts() {
  const fallbackProducts = [
    { id: 'corega_max_bloqueo', name: 'Corega Max Bloqueo 70g', normalPrice: 8990, offerPrice: 7290, stock: 120, image: 'img/products/corega_maximo_sellado_70g.jpg' },
    { id: 'corega_max_fijacion', name: 'Corega Max Fijación + Confort 70g', normalPrice: 8990, offerPrice: 7290, stock: 120, image: 'img/products/corega_maximo_menta_70g.jpg' },
    { id: 'corega_sin_sabor', name: 'Corega Ultra Crema Sin Sabor 70g', normalPrice: 8490, offerPrice: 6890, stock: 150, image: 'img/products/corega_sin_sabor_70g.jpg' },
    { id: 'corega_sabor_menta', name: 'Corega Ultra Crema Sabor Menta 70g', normalPrice: 8490, offerPrice: 6890, stock: 150, image: 'img/products/corega_menta_70g.jpg' }
  ];

  try {
    const data = await mApi('/api/products');
    if (data.success && Array.isArray(data.products) && data.products.length > 0) {
      mState.products = data.products;
    } else {
      mState.products = fallbackProducts;
    }
  } catch (e) {
    mState.products = fallbackProducts;
  }

  mState.selectedProductIds = new Set(mState.products.map(p => p.id));
  renderMobileProductsPicker();
  renderMobileCatalog();
}

function renderMobileProductsPicker() {
  const container = document.getElementById('m-prods-picker-scroll');
  if (!container) return;

  container.innerHTML = mState.products.map(p => {
    const isSelected = mState.selectedProductIds.has(p.id);
    const priceFmt = (p.offerPrice || p.normalPrice || 0).toLocaleString('es-CL');
    const imgSrc = getProductImage(p);
    return `
      <div class="m-prod-chip ${isSelected ? 'selected' : ''}" onclick="toggleMobileProd('${p.id}')">
        <div class="m-prod-chip-img">
          <img src="${imgSrc}" alt="${p.name}" onerror="this.onerror=null; this.src='https://distribuidoralarutadeloriente.cl/' + '${imgSrc}';">
        </div>
        <div class="m-prod-chip-name">${p.name}</div>
        <div class="m-prod-chip-price">$${priceFmt}</div>
        <div class="m-prod-chip-toggle">
          <i class="fa-solid ${isSelected ? 'fa-check' : 'fa-plus'}"></i>
          <span>${isSelected ? 'Incluido' : 'Agregar'}</span>
        </div>
      </div>
    `;
  }).join('');
}

function toggleMobileProd(id) {
  if (mState.selectedProductIds.has(id)) {
    mState.selectedProductIds.delete(id);
  } else {
    mState.selectedProductIds.add(id);
  }
  renderMobileProductsPicker();
}

function renderMobileCatalog() {
  const container = document.getElementById('m-catalog-list');
  if (!container) return;

  container.innerHTML = mState.products.map(p => {
    const priceFmt = (p.offerPrice || p.normalPrice || 0).toLocaleString('es-CL');
    const imgSrc = getProductImage(p);
    return `
      <div class="m-card" style="display: flex; gap: 14px; align-items: center; border: 1px solid rgba(244,197,66,0.25); background: #13151b; border-radius: 14px; padding: 12px; margin-bottom: 10px;">
        <div style="width: 76px; height: 76px; background: #ffffff; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <img src="${imgSrc}" alt="${p.name}" style="max-width: 95%; max-height: 95%; object-fit: contain;" onerror="this.onerror=null; this.src='https://distribuidoralarutadeloriente.cl/' + '${imgSrc}';">
        </div>
        <div style="flex: 1; min-width: 0;">
          <h4 style="font-size: 13px; font-weight: 800; color: #fff; margin-bottom: 3px; line-height: 1.3;">${p.name}</h4>
          <div style="font-size: 16px; font-weight: 800; color: #f4c542; margin: 3px 0;">$${priceFmt}</div>
          <div style="font-size: 11px; color: #4ade80; font-weight: 600;">🟢 Stock: ${p.stock || 100} un.</div>
        </div>
      </div>
    `;
  }).join('');
}

// ================= CONTACTS =================
async function loadMobileContacts() {
  let list = [];
  try {
    const data = await mApi('/api/contacts');
    if (data.success && Array.isArray(data.contacts)) {
      list = data.contacts;
    }
  } catch (e) {}

  if (!list.length) {
    try {
      const res = await fetch('data/contacts.json');
      const data = await res.json();
      if (data.success && Array.isArray(data.contacts)) {
        list = data.contacts;
      }
    } catch (e) {}
  }

  // Cargar clientes personalizados de Cloud Firestore (sincronizados con el Administrador web)
  try {
    if (window.firebase && typeof window.firebase.firestore === 'function') {
      const db = window.firebase.firestore();
      const snap = await db.collection('custom_clients').get();
      if (!snap.empty) {
        const cloudClients = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const ids = new Set(list.map(c => c.id));
        const freshCloud = cloudClients.filter(c => !ids.has(c.id));
        if (freshCloud.length) {
          list = [...freshCloud, ...list];
        }
      }
    }
  } catch (e) {
    console.warn('Firestore custom_clients sync error:', e.message);
  }

  // Combinar clientes personalizados locales
  try {
    const custom = JSON.parse(localStorage.getItem('mkt_custom_clients') || '[]');
    if (custom.length) {
      const ids = new Set(list.map(c => c.id));
      const fresh = custom.filter(c => !ids.has(c.id));
      list = [...fresh, ...list];
    }
  } catch (e) {}

  mState.contacts = list;
  mState.selectedContactIds = new Set(list.map(c => c.id));
  mState.filteredContacts = [...list];

  renderMobileContactsList();
  populateMobileComunas();
  updateMobileHeaderStats();
}

function updateMobileHeaderStats() {
  const total = mState.contacts.length || 773;
  const wa = mState.contacts.filter(c => c.tieneWhatsApp).length || 684;
  const prods = mState.products.length || 4;
  const selectedCount = mState.selectedContactIds.size;

  const totalEl = document.getElementById('m-stat-total');
  const waEl = document.getElementById('m-stat-wa');
  const prodsEl = document.getElementById('m-stat-prods');
  const selectedCountEl = document.getElementById('m-selected-count');
  const emailTargetEl = document.getElementById('m-email-target-badge');

  if (totalEl) totalEl.textContent = total;
  if (waEl) waEl.textContent = wa;
  if (prodsEl) prodsEl.textContent = prods;
  if (selectedCountEl) selectedCountEl.textContent = selectedCount;
  if (emailTargetEl) emailTargetEl.textContent = `${selectedCount} seleccionados`;
}

function renderMobileContactsList() {
  const container = document.getElementById('m-contacts-list');
  const countEl = document.getElementById('m-showing-count');
  if (!container) return;

  const slice = mState.filteredContacts.slice(0, 100);
  if (countEl) countEl.textContent = `${slice.length} de ${mState.filteredContacts.length}`;
  const selEl = document.getElementById('m-selected-count');
  if (selEl) selEl.textContent = mState.selectedContactIds.size;

  if (!slice.length) {
    container.innerHTML = `<div style="text-align: center; padding: 30px 10px; color: #94a3b8; font-size: 13px;">No se encontraron clientes para esta búsqueda.</div>`;
    return;
  }

  container.innerHTML = slice.map(c => {
    const isSelected = mState.selectedContactIds.has(c.id);
    const isTaller = c.isCustom || 
                     (c.nombreFarmacia && (c.nombreFarmacia.toLowerCase().includes('mechlook') || c.nombreFarmacia.toLowerCase().includes('taller'))) ||
                     (c.claseComercio && c.claseComercio.toLowerCase().includes('taller'));
    const waLink = c.whatsAppNumero 
      ? `https://wa.me/${c.whatsAppNumero}?text=${encodeURIComponent('Hola ' + (c.contacto || c.nombreFarmacia) + ', te saludamos de Distribuidora La Ruta del Oriente!')}`
      : (c.telefonoDisplay ? `tel:${c.telefonoDisplay}` : null);

    return `
      <div class="m-contact-card ${isSelected ? 'selected' : ''} ${isTaller ? 'is-taller' : ''}" data-id="${c.id}" ${isTaller ? 'style="border: 1px solid rgba(244,197,66,0.4); background: linear-gradient(145deg, #181c26 0%, #1a1e2a 100%);"' : ''}>
        <div class="m-contact-top">
          <div class="m-contact-info" onclick="toggleContactSelection('${c.id}')">
            <h4 style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              ${c.nombreFarmacia || 'Farmacia'}
              ${isTaller ? `<span class="m-badge" style="background: rgba(244,197,66,0.18); color: #f4c542; border: 1px solid rgba(244,197,66,0.5); font-size: 9px; padding: 2px 6px;"><i class="fa-solid fa-wrench"></i> Taller</span>` : ''}
            </h4>
            <p><i class="fa-regular fa-user"></i> ${c.contacto || 'Sin contacto'} &bull; ${c.comuna || 'Santiago'}</p>
          </div>
          <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleContactSelection('${c.id}')" style="width: 20px; height: 20px; accent-color: #f4c542;">
        </div>

        <div class="m-contact-badges">
          ${c.tieneEmail ? `<span class="m-badge m-badge-email"><i class="fa-regular fa-envelope"></i> ${c.correo}</span>` : ''}
          ${c.tieneWhatsApp ? `<span class="m-badge m-badge-wa"><i class="fa-brands fa-whatsapp"></i> ${c.telefonoDisplay || c.whatsAppNumero}</span>` : ''}
        </div>

        <div class="m-contact-actions">
          ${waLink ? `<a href="${waLink}" target="_blank" class="m-action-icon-btn m-action-wa" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>` : ''}
          ${c.tieneEmail ? `<a href="mailto:${c.correo}" class="m-action-icon-btn m-action-email" title="Correo"><i class="fa-regular fa-envelope"></i></a>` : ''}
          ${c.telefonoDisplay ? `<a href="tel:${c.telefonoDisplay}" class="m-action-icon-btn m-action-call" title="Llamar"><i class="fa-solid fa-phone"></i></a>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function selectAllMobileContacts(select = true) {
  if (select) {
    if (mState.filteredContacts && mState.filteredContacts.length > 0) {
      mState.filteredContacts.forEach(c => mState.selectedContactIds.add(c.id));
    } else {
      mState.contacts.forEach(c => mState.selectedContactIds.add(c.id));
    }
  } else {
    if (mState.filteredContacts && mState.filteredContacts.length < mState.contacts.length) {
      mState.filteredContacts.forEach(c => mState.selectedContactIds.delete(c.id));
    } else {
      mState.selectedContactIds.clear();
    }
  }
  renderMobileContactsList();
  updateMobileHeaderStats();
}

function toggleContactSelection(id) {
  if (mState.selectedContactIds.has(id)) {
    mState.selectedContactIds.delete(id);
  } else {
    mState.selectedContactIds.add(id);
  }
  
  const card = document.querySelector(`.m-contact-card[data-id="${id}"]`);
  if (card) {
    const isSelected = mState.selectedContactIds.has(id);
    card.classList.toggle('selected', isSelected);
    const cb = card.querySelector('input[type="checkbox"]');
    if (cb) cb.checked = isSelected;
  }
  updateMobileHeaderStats();
}

function filterMobileContacts() {
  const q = (document.getElementById('m-search-input')?.value || '').toLowerCase().trim();
  const comuna = document.getElementById('m-comuna-select')?.value || 'all';

  mState.filteredContacts = mState.contacts.filter(c => {
    if (mState.activeFilter === 'email' && !c.tieneEmail) return false;
    if (mState.activeFilter === 'wa' && !c.tieneWhatsApp) return false;
    if (comuna !== 'all' && c.comuna !== comuna) return false;

    if (q) {
      const match = (c.nombreFarmacia || '').toLowerCase().includes(q) ||
                    (c.contacto || '').toLowerCase().includes(q) ||
                    (c.comuna || '').toLowerCase().includes(q) ||
                    (c.claseComercio || '').toLowerCase().includes(q) ||
                    (c.correo || '').toLowerCase().includes(q) ||
                    (c.telefonoDisplay || '').includes(q) ||
                    (c.whatsAppNumero || '').includes(q);
      if (!match) return false;
    }
    return true;
  });

  renderMobileContactsList();
}

function setContactFilter(type, btn) {
  mState.activeFilter = type;
  document.querySelectorAll('.m-filter-chip').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  filterMobileContacts();
}

function populateMobileComunas() {
  const select = document.getElementById('m-comuna-select');
  if (!select) return;
  const comunas = Array.from(new Set(mState.contacts.map(c => c.comuna).filter(Boolean))).sort();
  select.innerHTML = '<option value="all">Todas las Comunas</option>' + comunas.map(com => `<option value="${com}">${com}</option>`).join('');
}

// (updateMobileHeaderStats unificado al inicio de la sección)

// ================= TEST EMAIL =================
async function sendMobileTestEmail() {
  const emailInput = document.getElementById('m-test-email-input');
  const recipient = (emailInput?.value || '').trim();
  const statusBox = document.getElementById('m-test-status-box');
  const btn = document.getElementById('m-btn-test-send');

  if (!recipient || !recipient.includes('@')) {
    alert('Ingresa tu correo para recibir la prueba.');
    emailInput?.focus();
    return;
  }

  if (statusBox) {
    statusBox.style.display = 'block';
    statusBox.className = 'm-card';
    statusBox.style.borderColor = '#38bdf8';
    statusBox.innerHTML = `<span style="color: #38bdf8;"><i class="fa-solid fa-spinner fa-spin"></i> Enviando prueba con las fotos a ${recipient}...</span>`;
  }
  if (btn) btn.disabled = true;

  try {
    const data = await mApi('/api/email/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testRecipient: recipient,
        subject: document.getElementById('m-email-subject')?.value || 'Ofertas Corega Mayorista',
        body: document.getElementById('m-email-body')?.value || '',
        selectedProductIds: Array.from(mState.selectedProductIds)
      })
    });

    if (btn) btn.disabled = false;
    if (data.success) {
      if (statusBox) {
        statusBox.style.borderColor = '#10b981';
        statusBox.innerHTML = `✅ <strong style="color: #6ee7b7;">¡Prueba enviada!</strong> Revisa tu bandeja de entrada o spam (${recipient}).`;
      }
      alert('¡Prueba enviada con éxito a ' + recipient + '!');
    } else {
      throw new Error(data.error);
    }
  } catch (err) {
    if (btn) btn.disabled = false;
    if (statusBox) {
      statusBox.style.borderColor = '#ef4444';
      statusBox.innerHTML = `⚠️ <strong style="color: #fca5a5;">Aviso:</strong> ${err.message}`;
    }
  }
}

// ================= FULL PREVIEW BOTTOM SHEET =================
function openMobilePreviewSheet() {
  const sheet = document.getElementById('m-preview-sheet');
  const iframe = document.getElementById('m-preview-iframe');
  if (!sheet || !iframe) return;

  const subject = document.getElementById('m-email-subject')?.value || 'Ofertas Adhesivos Corega';
  const body = document.getElementById('m-email-body')?.value || '';
  const prods = mState.products.filter(p => mState.selectedProductIds.has(p.id));

  const prodCardsHtml = prods.map(p => {
    const priceFmt = (p.offerPrice || p.normalPrice || 0).toLocaleString('es-CL');
    return `
      <div style="border: 1px solid #f4c542; border-radius: 10px; background: #0f1219; color: #fff; padding: 12px; margin-bottom: 10px; text-align: center;">
        <div style="background: #fff; padding: 10px; border-radius: 6px; margin-bottom: 8px;">
          <img src="${p.image || p.imageUrl || '/asset/corega1.png'}" style="max-height: 80px; max-width: 90%; object-fit: contain;">
        </div>
        <div style="color: #f4c542; font-weight: bold; font-size: 13px;">${p.name}</div>
        <div style="font-size: 18px; font-weight: 800; color: #f4c542; margin: 4px 0;">$${priceFmt}</div>
        <div style="font-size: 11px; color: #4ade80;">🟢 Stock disponible (${p.stock || 100} un.)</div>
      </div>
    `;
  }).join('');

  iframe.srcdoc = `
    <div style="font-family: Arial, sans-serif; background: #0b0c10; padding: 16px; text-align: center; border-bottom: 3px solid #f4c542;">
      <h2 style="color: #f4c542; margin: 0; font-size: 16px;">DISTRIBUIDORA LA RUTA DEL ORIENTE</h2>
      <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0;">Catálogo Mayorista para Farmacias</p>
    </div>
    <div style="padding: 16px; background: #fff; font-family: Arial, sans-serif; color: #333;">
      <p style="white-space: pre-wrap; font-size: 13px; line-height: 1.5;">${body}</p>
      ${prodCardsHtml}
      <div style="text-align: center; margin: 20px 0;">
        <a href="https://distribuidoralarutadeloriente.cl" target="_blank" style="display: inline-block; background: #f4c542; color: #000; padding: 12px 20px; font-weight: bold; border-radius: 8px; text-decoration: none;">Visitar Tienda Web</a>
      </div>
    </div>
  `;

  sheet.classList.add('active');
}

function closeMobilePreviewSheet() {
  document.getElementById('m-preview-sheet')?.classList.remove('active');
}

// ================= ADD CLIENT =================
function openMobileAddClientSheet() {
  document.getElementById('m-add-client-sheet')?.classList.add('active');
}

function closeMobileAddClientSheet() {
  document.getElementById('m-add-client-sheet')?.classList.remove('active');
}

async function saveMobileNewClient(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  const farmacia = document.getElementById('m-new-farmacia')?.value.trim();
  const contacto = document.getElementById('m-new-contacto')?.value.trim();
  const correo = document.getElementById('m-new-correo')?.value.trim();
  const telefono = document.getElementById('m-new-telefono')?.value.trim();
  const comuna = document.getElementById('m-new-comuna')?.value.trim() || 'Santiago';
  const tipo = document.getElementById('m-new-tipo')?.value || 'farmacia';

  if (!farmacia && !contacto) {
    alert('Por favor ingresa al menos el Nombre del Cliente / Farmacia o Persona de Contacto.');
    return;
  }

  const saveBtn = document.getElementById('m-btn-save-client');
  const originalBtnHtml = saveBtn ? saveBtn.innerHTML : 'Guardar Cliente';
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
  }

  const cleanDigits = telefono ? telefono.replace(/\D/g, '') : '';
  const cleanWa = cleanDigits.startsWith('56') ? cleanDigits : (cleanDigits ? '56' + cleanDigits : '');
  const isTaller = tipo === 'taller' || 
                   farmacia.toLowerCase().includes('taller') || 
                   farmacia.toLowerCase().includes('mechlook');

  const newContact = {
    id: 'cli_custom_' + Date.now(),
    nombreFarmacia: farmacia || 'Cliente Especial',
    contacto: contacto || 'Encargado/a',
    correo: correo || '',
    telefonoOriginal: telefono || '',
    telefonoDisplay: telefono || (cleanWa ? '+' + cleanWa : ''),
    whatsAppNumero: cleanWa,
    tieneWhatsApp: Boolean(cleanDigits && cleanDigits.length >= 8),
    tieneEmail: Boolean(correo && correo.includes('@') && correo.includes('.')),
    comuna: comuna || 'Santiago',
    claseComercio: isTaller ? 'Taller' : 'Farmacia',
    isCustom: true,
    createdAt: new Date().toISOString()
  };

  // 1. Sincronizar en Cloud Firestore (disponible para el Administrador web y la app móvil)
  try {
    if (window.firebase && typeof window.firebase.firestore === 'function') {
      const db = window.firebase.firestore();
      await db.collection('custom_clients').doc(newContact.id).set(newContact, { merge: true });
      console.log('✓ Nuevo cliente sincronizado en Firestore custom_clients');
    }
  } catch (err) {
    console.warn('Advertencia Firestore:', err.message);
  }

  // 2. Respaldo local inmediato en localStorage
  try {
    const stored = JSON.parse(localStorage.getItem('mkt_custom_clients') || '[]');
    stored.unshift(newContact);
    localStorage.setItem('mkt_custom_clients', JSON.stringify(stored));
  } catch (err) {}

  // 3. Notificar API backend opcionalmente sin bloquear la interfaz
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    fetch(getApiEndpoint('/api/contacts'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newContact),
      signal: controller.signal
    }).catch(() => {}).finally(() => clearTimeout(timer));
  } catch (err) {}

  // 4. Agregar a la lista activa en memoria y seleccionar
  mState.contacts.unshift(newContact);
  mState.filteredContacts.unshift(newContact);
  mState.selectedContactIds.add(newContact.id);

  renderMobileContactsList();
  populateMobileComunas();
  updateMobileHeaderStats();

  if (saveBtn) {
    saveBtn.disabled = false;
    saveBtn.innerHTML = originalBtnHtml;
  }
  document.getElementById('m-form-new-client')?.reset();
  closeMobileAddClientSheet();
  alert(`✓ ¡Cliente "${farmacia || contacto}" agregado con éxito y disponible en la lista!`);
}

// ================= WHATSAPP DISPATCHER =================
function startMobileWaDispatcher() {
  const waList = mState.contacts.filter(c => mState.selectedContactIds.has(c.id) && c.tieneWhatsApp);
  if (!waList.length) {
    alert('No hay clientes seleccionados con WhatsApp.');
    return;
  }
  mState.waList = waList;
  mState.waIndex = 0;
  openMobileWaQueueSheet();
  renderMobileWaQueueItem();
}

function openMobileWaQueueSheet() {
  document.getElementById('m-wa-queue-sheet')?.classList.add('active');
}

function closeMobileWaQueueSheet() {
  document.getElementById('m-wa-queue-sheet')?.classList.remove('active');
}

function renderMobileWaQueueItem() {
  if (mState.waIndex >= mState.waList.length) {
    alert('¡Has completado el despacho de WhatsApp!');
    closeMobileWaQueueSheet();
    return;
  }

  const client = mState.waList[mState.waIndex];
  const template = document.getElementById('m-wa-template')?.value || 'Hola {contacto}, te escribimos de Distribuidora La Ruta del Oriente con ofertas mayoristas para {farmacia}.';
  const finalMsg = template
    .replace(/{farmacia}/gi, client.nombreFarmacia || 'su Farmacia')
    .replace(/{contacto}/gi, client.contacto || 'Estimado/a');

  document.getElementById('m-wa-q-count').textContent = `${mState.waIndex + 1} de ${mState.waList.length}`;
  document.getElementById('m-wa-q-farmacia').textContent = client.nombreFarmacia || 'Farmacia';
  document.getElementById('m-wa-q-contacto').textContent = client.contacto || 'Contacto';
  document.getElementById('m-wa-q-phone').textContent = client.telefonoDisplay || client.whatsAppNumero;
  document.getElementById('m-wa-q-msg').textContent = finalMsg;

  const btnSend = document.getElementById('m-btn-open-wa-chat');
  if (btnSend) {
    btnSend.href = `https://wa.me/${client.whatsAppNumero}?text=${encodeURIComponent(finalMsg)}`;
  }
}

function nextMobileWaQueueItem() {
  mState.waIndex++;
  renderMobileWaQueueItem();
}

// ================= EVENT LISTENERS =================
function setupEventListeners() {
  document.querySelectorAll('[data-m-insert]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.getAttribute('data-m-insert');
      const textarea = document.getElementById('m-email-body');
      if (textarea) {
        textarea.value += ' ' + tag;
        textarea.focus();
      }
    });
  });

  // Inicializar enlace de APK en Ajustes si existe personalizado
  const customDriveUrl = localStorage.getItem('laruta_apk_drive_url');
  if (customDriveUrl) {
    const btn = document.getElementById('m-settings-apk-btn');
    if (btn) btn.href = customDriveUrl;
  }
}

function promptMobileApkDriveUrl() {
  const current = localStorage.getItem('laruta_apk_drive_url') || 'https://drive.google.com/file/d/133mJoUHWGUhyIpG4jm2th1lrYFxGWN00/view?usp=sharing';
  const input = prompt('Enlace de Google Drive para la APK:', current);
  if (input !== null) {
    const trimmed = input.trim();
    if (trimmed) {
      localStorage.setItem('laruta_apk_drive_url', trimmed);
      const btn = document.getElementById('m-settings-apk-btn');
      if (btn) btn.href = trimmed;
      alert('¡Enlace de Google Drive actualizado con éxito!');
    }
  }
}

// ================= MASS EMAIL CAMPAIGN =================
let mobileCampaignInterval = null;

async function startMobileMassEmailCampaign() {
  const selectedWithEmail = mState.contacts.filter(c => mState.selectedContactIds.has(c.id) && c.tieneEmail);
  if (!selectedWithEmail.length) {
    alert('No hay farmacias seleccionadas con correo electrónico en la lista.');
    return;
  }

  const serverUrl = getServerBaseUrl();
  const btnMass = document.getElementById('m-btn-mass-email');
  if (btnMass) btnMass.disabled = true;

  // 1. Probar conectividad con el servidor Node.js
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const probe = await fetch(`${serverUrl}/api/config`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!probe.ok) throw new Error('Servidor offline');
  } catch (err) {
    if (btnMass) btnMass.disabled = false;
    alert(
      `⚠️ No se pudo conectar con el Servidor de Envíos Titan SMTP (${serverUrl}).\n\n` +
      `Para enviar correos masivos a las ${selectedWithEmail.length} farmacias:\n` +
      `1. En tu computador abre la terminal y escribe: npm run envios\n` +
      `2. Tu celular y el computador deben estar en la misma red Wi-Fi.\n\n` +
      `Tip: En la pestaña "Ajustes" puedes cambiar la IP del PC si cambió.`
    );
    return;
  }

  if (btnMass) btnMass.disabled = false;

  const subject = document.getElementById('m-email-subject')?.value || 'Ofertas Corega Mayorista';
  const body = document.getElementById('m-email-body')?.value || '';
  const prods = Array.from(mState.selectedProductIds);

  const confirmSend = confirm(
    `¿Iniciar despacho masivo a ${selectedWithEmail.length} farmacias seleccionadas?\n\n` +
    `Asunto: ${subject}\nProductos incluidos: ${prods.length}`
  );
  if (!confirmSend) return;

  openMobileMassEmailSheet();

  const progCurrent = document.getElementById('m-prog-current');
  const progTotal = document.getElementById('m-prog-total');
  const progPercent = document.getElementById('m-prog-percent');
  const progBar = document.getElementById('m-prog-bar');
  const progSuccess = document.getElementById('m-prog-success');
  const progFailed = document.getElementById('m-prog-failed');
  const progLogs = document.getElementById('m-prog-logs');
  const stopBtn = document.getElementById('m-btn-stop-campaign');
  const doneBtn = document.getElementById('m-btn-done-campaign');

  if (progCurrent) progCurrent.textContent = '0';
  if (progTotal) progTotal.textContent = selectedWithEmail.length;
  if (progPercent) progPercent.textContent = '0%';
  if (progBar) progBar.style.width = '0%';
  if (progSuccess) progSuccess.textContent = '0';
  if (progFailed) progFailed.textContent = '0';
  if (stopBtn) stopBtn.style.display = 'inline-flex';
  if (doneBtn) doneBtn.style.display = 'none';
  if (progLogs) progLogs.innerHTML = `<div style="color: #38bdf8;"><i class="fa-solid fa-spinner fa-spin"></i> Contactando servidor Titan y comenzando envíos...</div>`;

  try {
    const res = await mApi('/api/email/send-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetContactIds: selectedWithEmail.map(c => c.id),
        subject,
        title: subject,
        body,
        selectedProductIds: prods,
        ctaText: 'Visitar Catálogo en la Web',
        ctaUrl: 'https://distribuidoralarutadeloriente.cl',
        senderName: 'Distribuidora La Ruta del Oriente'
      })
    });

    if (!res.success) throw new Error(res.error || 'Error al iniciar campaña');

    if (mobileCampaignInterval) clearInterval(mobileCampaignInterval);
    mobileCampaignInterval = setInterval(pollMobileCampaignStatus, 1200);
  } catch (err) {
    if (progLogs) progLogs.innerHTML = `<div style="color: #f87171;">✗ Error al iniciar: ${err.message}</div>`;
  }
}

async function pollMobileCampaignStatus() {
  try {
    const data = await mApi('/api/email/status');
    const campaign = data.campaign || data;

    const progCurrent = document.getElementById('m-prog-current');
    const progTotal = document.getElementById('m-prog-total');
    const progPercent = document.getElementById('m-prog-percent');
    const progBar = document.getElementById('m-prog-bar');
    const progSuccess = document.getElementById('m-prog-success');
    const progFailed = document.getElementById('m-prog-failed');
    const progLogs = document.getElementById('m-prog-logs');
    const stopBtn = document.getElementById('m-btn-stop-campaign');
    const doneBtn = document.getElementById('m-btn-done-campaign');

    const total = campaign.total || 0;
    const current = campaign.current || 0;
    const success = campaign.success || 0;
    const failed = campaign.failed || 0;
    const percent = total > 0 ? Math.round((current / total) * 100) : 0;

    if (progCurrent) progCurrent.textContent = current;
    if (progTotal) progTotal.textContent = total;
    if (progPercent) progPercent.textContent = `${percent}%`;
    if (progBar) progBar.style.width = `${percent}%`;
    if (progSuccess) progSuccess.textContent = success;
    if (progFailed) progFailed.textContent = failed;

    if (campaign.logs && campaign.logs.length && progLogs) {
      progLogs.innerHTML = campaign.logs.slice(-10).map(log => {
        if (log.status === 'success') {
          return `<div style="color: #4ade80;">✓ ${log.name || log.email || 'Enviado'}</div>`;
        } else if (log.status === 'error') {
          return `<div style="color: #f87171;">✗ ${log.name || log.email || ''} - ${log.error || 'Error'}</div>`;
        } else {
          return `<div style="color: #94a3b8;">${log.message || ''}</div>`;
        }
      }).join('');
    }

    if (!campaign.running) {
      clearInterval(mobileCampaignInterval);
      mobileCampaignInterval = null;
      if (stopBtn) stopBtn.style.display = 'none';
      if (doneBtn) doneBtn.style.display = 'inline-flex';
      if (progLogs) progLogs.innerHTML += `<div style="color: #f4c542; font-weight: bold; margin-top: 8px;">🎉 ¡Campaña finalizada! Exitosos: ${success}, Fallidos: ${failed}</div>`;
    }
  } catch (err) {
    console.warn('Error al consultar estado de campaña:', err);
  }
}

async function stopMobileMassEmailCampaign() {
  try {
    await mApi('/api/email/stop', { method: 'POST' });
    alert('Se solicitó detener la campaña.');
  } catch (e) {
    alert('No se pudo contactar al servidor para detener.');
  }
}

function openMobileMassEmailSheet() {
  document.getElementById('m-mass-email-sheet')?.classList.add('active');
}

function closeMobileMassEmailSheet() {
  if (mobileCampaignInterval) {
    clearInterval(mobileCampaignInterval);
    mobileCampaignInterval = null;
  }
  document.getElementById('m-mass-email-sheet')?.classList.remove('active');
}

async function testAndSaveMobileServerUrl() {
  const input = document.getElementById('m-input-server-url');
  let val = (input?.value || '').trim();
  if (!val) val = DEFAULT_SERVER_URL;
  if (!val.startsWith('http://') && !val.startsWith('https://')) {
    val = 'http://' + val;
  }
  val = val.replace(/\/+$/, '');

  const msgBox = document.getElementById('m-server-test-msg');
  if (msgBox) {
    msgBox.style.display = 'block';
    msgBox.style.background = 'rgba(56, 189, 248, 0.15)';
    msgBox.style.color = '#38bdf8';
    msgBox.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Probando conexión con ' + val + '...';
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${val}/api/config`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    localStorage.setItem('m_server_url', val);
    if (input) input.value = val;
    if (msgBox) {
      msgBox.style.background = 'rgba(16, 185, 129, 0.15)';
      msgBox.style.color = '#4ade80';
      msgBox.innerHTML = '✓ ¡Conectado con éxito al servidor Titan Mail de tu PC!';
    }
    const badge = document.getElementById('m-server-status-badge');
    if (badge) {
      badge.textContent = 'En Línea';
      badge.style.background = 'rgba(16, 185, 129, 0.2)';
      badge.style.color = '#4ade80';
    }
  } catch (err) {
    if (msgBox) {
      msgBox.style.background = 'rgba(239, 68, 68, 0.15)';
      msgBox.style.color = '#f87171';
      msgBox.innerHTML = `✗ No responde ${val}. Revisa que "npm run envios" esté corriendo en tu PC y estén en la misma Wi-Fi.`;
    }
    const badge = document.getElementById('m-server-status-badge');
    if (badge) {
      badge.textContent = 'Desconectado';
      badge.style.background = 'rgba(239, 68, 68, 0.2)';
      badge.style.color = '#f87171';
    }
  }
}

// Inicializar campo de servidor al cargar
document.addEventListener('DOMContentLoaded', () => {
  const currentUrl = localStorage.getItem('m_server_url') || DEFAULT_SERVER_URL;
  const input = document.getElementById('m-input-server-url');
  if (input) input.value = currentUrl;
});



