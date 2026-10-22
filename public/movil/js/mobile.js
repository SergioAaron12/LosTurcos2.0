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
function getApiEndpoint(ep) {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return ep;
  }
  return `${LOCAL_API_BASE}${ep}`;
}

async function mApi(endpoint, options = {}) {
  const url = getApiEndpoint(endpoint);
  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    if (!url.startsWith(LOCAL_API_BASE)) {
      res = await fetch(`${LOCAL_API_BASE}${endpoint}`, options);
    } else {
      throw new Error('Servidor de correos no responde. Ejecuta "npm run envios" en tu PC.');
    }
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (text.trim().startsWith('<')) {
      if (!url.startsWith(LOCAL_API_BASE)) {
        return mApi(`${LOCAL_API_BASE}${endpoint}`, options);
      }
      throw new Error('Error al conectar con el servicio de envíos.');
    }
    return JSON.parse(text);
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

  const totalEl = document.getElementById('m-stat-total');
  const waEl = document.getElementById('m-stat-wa');
  const prodsEl = document.getElementById('m-stat-prods');

  if (totalEl) totalEl.textContent = total;
  if (waEl) waEl.textContent = wa;
  if (prodsEl) prodsEl.textContent = prods;
}

function renderMobileContactsList() {
  const container = document.getElementById('m-contacts-list');
  const countEl = document.getElementById('m-showing-count');
  if (!container) return;

  const slice = mState.filteredContacts.slice(0, 100);
  if (countEl) countEl.textContent = `${slice.length} de ${mState.filteredContacts.length}`;

  if (!slice.length) {
    container.innerHTML = `<div style="text-align: center; padding: 30px 10px; color: #94a3b8; font-size: 13px;">No se encontraron clientes para esta búsqueda.</div>`;
    return;
  }

  container.innerHTML = slice.map(c => {
    const isSelected = mState.selectedContactIds.has(c.id);
    const waLink = c.whatsAppNumero 
      ? `https://wa.me/${c.whatsAppNumero}?text=${encodeURIComponent('Hola ' + (c.contacto || c.nombreFarmacia) + ', te saludamos de Distribuidora La Ruta del Oriente!')}`
      : (c.telefonoDisplay ? `tel:${c.telefonoDisplay}` : null);

    return `
      <div class="m-contact-card ${isSelected ? 'selected' : ''}" data-id="${c.id}">
        <div class="m-contact-top">
          <div class="m-contact-info" onclick="toggleContactSelection('${c.id}')">
            <h4>${c.nombreFarmacia || 'Farmacia'}</h4>
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

function toggleContactSelection(id) {
  if (mState.selectedContactIds.has(id)) {
    mState.selectedContactIds.delete(id);
  } else {
    mState.selectedContactIds.add(id);
  }
  renderMobileContactsList();
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
                    (c.correo || '').toLowerCase().includes(q);
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

function updateMobileHeaderStats() {
  const total = mState.contacts.length;
  const emails = mState.contacts.filter(c => c.tieneEmail).length;
  const wa = mState.contacts.filter(c => c.tieneWhatsApp).length;

  const totalEl = document.getElementById('m-stat-total');
  const emailEl = document.getElementById('m-stat-email');
  const waEl = document.getElementById('m-stat-wa');

  if (totalEl) totalEl.textContent = total;
  if (emailEl) emailEl.textContent = emails;
  if (waEl) waEl.textContent = wa;

  const targetEl = document.getElementById('m-email-target-badge');
  if (targetEl) targetEl.textContent = `${mState.selectedContactIds.size} seleccionados`;
}

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
  e.preventDefault();
  const farmacia = document.getElementById('m-new-farmacia')?.value.trim();
  const contacto = document.getElementById('m-new-contacto')?.value.trim();
  const correo = document.getElementById('m-new-correo')?.value.trim();
  const telefono = document.getElementById('m-new-telefono')?.value.trim();
  const comuna = document.getElementById('m-new-comuna')?.value.trim() || 'Santiago';

  if (!farmacia && !contacto) {
    alert('Ingresa el nombre de la farmacia o contacto.');
    return;
  }

  const payload = { nombreFarmacia: farmacia, contacto, correo, telefono, comuna };
  try {
    await mApi('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {}

  const cleanWa = telefono ? telefono.replace(/\D/g, '') : '';
  const newContact = {
    id: 'm_' + Date.now(),
    nombreFarmacia: farmacia || 'Farmacia',
    contacto: contacto || 'Encargado/a',
    correo,
    telefonoOriginal: telefono,
    telefonoDisplay: telefono,
    whatsAppNumero: cleanWa.startsWith('56') ? cleanWa : (cleanWa ? '56' + cleanWa : ''),
    tieneWhatsApp: Boolean(telefono && telefono.length >= 8),
    tieneEmail: Boolean(correo && correo.includes('@')),
    comuna
  };

  const stored = JSON.parse(localStorage.getItem('mkt_custom_clients') || '[]');
  stored.unshift(newContact);
  localStorage.setItem('mkt_custom_clients', JSON.stringify(stored));

  mState.contacts.unshift(newContact);
  mState.filteredContacts.unshift(newContact);
  mState.selectedContactIds.add(newContact.id);

  renderMobileContactsList();
  updateMobileHeaderStats();
  document.getElementById('m-form-new-client')?.reset();
  closeMobileAddClientSheet();
  alert(`¡Cliente "${farmacia || contacto}" agregado con éxito!`);
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



