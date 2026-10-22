// ========================================================
// Módulo de Envíos Masivos: Distribuidora La Ruta del Oriente
// Integrado directamente en admin.html
// ========================================================

const API_BASE = 'http://localhost:3000';

const MKT_STATE = {
  products: [],
  selectedProductIds: new Set(),
  contacts: [],
  filteredContacts: [],
  selectedContactIds: new Set(),
  currentPollInterval: null
};

// 1. Alternar pestañas en el Administrador
function switchAdminSection(section) {
  const vMarketing = document.getElementById('admin-view-marketing');
  const vProducts = document.getElementById('admin-view-products');
  const vOrders = document.getElementById('admin-view-orders');

  const btnMarketing = document.getElementById('tab-btn-marketing');
  const btnProducts = document.getElementById('tab-btn-products');
  const btnOrders = document.getElementById('tab-btn-orders');

  if (vMarketing) vMarketing.classList.add('hidden');
  if (vProducts) vProducts.classList.add('hidden');
  if (vOrders) vOrders.classList.add('hidden');

  const inactiveClass = "px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition flex items-center gap-1.5";
  if (btnMarketing) btnMarketing.className = inactiveClass;
  if (btnProducts) btnProducts.className = inactiveClass;
  if (btnOrders) btnOrders.className = inactiveClass;

  if (section === 'marketing') {
    if (vMarketing) vMarketing.classList.remove('hidden');
    if (btnMarketing) btnMarketing.className = "px-4 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 rounded-xl font-extrabold text-sm shadow-md ring-2 ring-amber-400 transition flex items-center gap-2";
    initMarketingModule();
  } else if (section === 'products') {
    if (vProducts) vProducts.classList.remove('hidden');
    if (btnProducts) btnProducts.className = "px-4 py-2 bg-slate-900 text-white rounded-xl font-extrabold text-sm shadow-md transition flex items-center gap-1.5";
  } else if (section === 'orders') {
    if (vOrders) vOrders.classList.remove('hidden');
    if (btnOrders) btnOrders.className = "px-4 py-2 bg-slate-900 text-white rounded-xl font-extrabold text-sm shadow-md transition flex items-center gap-1.5";
  }
}



// 2. Inicializar Módulo de Marketing
async function initMarketingModule() {
  loadSmtpConfigInAdmin();
  await loadCoregaProducts();
  await loadAdminClients();
  updateLiveEmailPreviewAdmin();
}

// 3. Cargar los 4 Productos Corega desde Firebase / API
async function loadCoregaProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    const data = await res.json();
    if (data.success && data.products && data.products.length > 0) {
      MKT_STATE.products = data.products;
    } else {
      throw new Error('No se recibieron productos del servidor local');
    }
  } catch (err) {
    console.warn('API local no respondió, usando datos de respaldo de Firebase:', err.message);
    // 4 productos oficiales Corega extraídos directamente de Firestore
    MKT_STATE.products = [
      {
        id: 'fb_1',
        name: 'Adhesivo Dental Corega Ultra Crema Sin Sabor 70g',
        normalPrice: 7990,
        stock: '100',
        url: 'https://distribuidoralarutadeloriente.cl/html/cuidado-bucal.html',
        image: 'https://distribuidoralarutadeloriente.cl/asset/logo-icon.png'
      },
      {
        id: 'fb_2',
        name: 'Ultra Crema Adhesiva Sabor Menta 70G',
        normalPrice: 8150,
        stock: '100',
        url: 'https://distribuidoralarutadeloriente.cl/html/cuidado-bucal.html',
        image: 'https://distribuidoralarutadeloriente.cl/asset/logo-icon.png'
      },
      {
        id: 'fb_3',
        name: 'Crema Adhesiva Ultra Corega Maximo Sellado 70g',
        normalPrice: 8999,
        stock: '100',
        url: 'https://distribuidoralarutadeloriente.cl/html/cuidado-bucal.html',
        image: 'https://distribuidoralarutadeloriente.cl/asset/logo-icon.png'
      },
      {
        id: 'fb_4',
        name: 'Corega Ultra 70g Sin Sabor Máximo Sellado Sabor Menta',
        normalPrice: 8999,
        stock: '100',
        url: 'https://distribuidoralarutadeloriente.cl/html/cuidado-bucal.html',
        image: 'https://distribuidoralarutadeloriente.cl/asset/logo-icon.png'
      }
    ];
  }

  // Marcar los 4 por defecto
  MKT_STATE.selectedProductIds = new Set(MKT_STATE.products.map(p => p.id));
  renderCoregaCards();
}

function renderCoregaCards() {
  const container = document.getElementById('mkt-products-grid');
  if (!container) return;

  container.innerHTML = MKT_STATE.products.map(p => {
    const isSelected = MKT_STATE.selectedProductIds.has(p.id);
    const priceFormatted = '$' + (Number(p.offerPrice || p.normalPrice) || 0).toLocaleString('es-CL');

    return `
      <div class="card-corega cursor-pointer flex flex-col justify-between ${isSelected ? 'selected ring-2 ring-amber-400' : 'opacity-70'}" onclick="toggleCoregaSelection('${p.id}')">
        <!-- Caja Blanca Superior con Foto -->
        <div class="bg-white p-4 h-40 flex items-center justify-center relative">
          <img src="${p.image || '/asset/logo-icon.png'}" alt="${p.name}" class="max-h-32 max-w-full object-contain" onerror="this.src='/asset/logo-icon.png'">
          <div class="absolute top-2 left-2 bg-slate-900/90 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-400/50 flex items-center gap-1">
            <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleCoregaSelection('${p.id}')" />
            <span>${isSelected ? 'Incluido' : 'Excluir'}</span>
          </div>
        </div>

        <!-- Contenedor Oscuro Inferior -->
        <div class="p-3.5 flex flex-col flex-1 justify-between bg-[#0f1219]">
          <div>
            <div class="text-xs font-bold text-amber-400 leading-snug line-clamp-2 h-8 mb-1.5" title="${p.name}">
              ${p.name}
            </div>
            <div class="text-xl font-extrabold text-amber-400 mb-1">
              ${priceFormatted}
            </div>
            <div class="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 mb-3">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              Stock: ${p.stock || 100} un.
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-1.5 text-center text-[11px] font-bold">
            <a href="${p.url || 'https://distribuidoralarutadeloriente.cl'}" target="_blank" onclick="event.stopPropagation()" class="py-1.5 rounded-lg border border-amber-400 text-amber-400 hover:bg-amber-400/10 transition">
              Ver detalle
            </a>
            <div class="py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold">
              ${isSelected ? '✓ Activo' : '+ Agregar'}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleCoregaSelection(id) {
  if (MKT_STATE.selectedProductIds.has(id)) {
    MKT_STATE.selectedProductIds.delete(id);
  } else {
    MKT_STATE.selectedProductIds.add(id);
  }
  renderCoregaCards();
  updateLiveEmailPreviewAdmin();
}

function selectAllCorega(shouldSelect) {
  if (shouldSelect) {
    MKT_STATE.products.forEach(p => MKT_STATE.selectedProductIds.add(p.id));
  } else {
    MKT_STATE.selectedProductIds.clear();
  }
  renderCoregaCards();
  updateLiveEmailPreviewAdmin();
}

// 4. Cargar Clientes y Farmacias
async function loadAdminClients() {
  let contactsLoaded = false;

  // 1. Intentar servidor local si está corriendo
  try {
    const res = await fetch(`${API_BASE}/api/contacts`);
    const data = await res.json();
    if (data.success && Array.isArray(data.contacts) && data.contacts.length > 0) {
      MKT_STATE.contacts = data.contacts;
      document.getElementById('mkt-stat-total').textContent = data.stats.total;
      document.getElementById('mkt-stat-email').textContent = data.stats.conEmail;
      document.getElementById('mkt-stat-wa').textContent = data.stats.conWhatsApp;
      document.getElementById('mkt-count-badge').textContent = data.stats.total;
      contactsLoaded = true;
    }
  } catch (err) {
    // Servidor local no disponible, pasamos al archivo estático
  }

  // 2. Si no respondió la API local, cargar la base empaquetada
  if (!contactsLoaded) {
    try {
      const res = await fetch('data/contacts.json');
      const data = await res.json();
      if (data.success && Array.isArray(data.contacts)) {
        MKT_STATE.contacts = [...data.contacts];
        contactsLoaded = true;
      }
    } catch (err) {
      console.warn('No se pudo cargar data/contacts.json:', err.message);
    }
  }

  // 3. Sincronizar clientes personalizados desde Cloud Firestore (compartido con APK móvil)
  try {
    if (typeof initFirebaseApp === 'function') {
      const db = await initFirebaseApp();
      const snap = await db.collection('custom_clients').get();
      if (!snap.empty) {
        const cloudClients = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const ids = new Set(MKT_STATE.contacts.map(c => c.id));
        const newCloudItems = cloudClients.filter(c => !ids.has(c.id));
        if (newCloudItems.length) {
          MKT_STATE.contacts = [...newCloudItems, ...MKT_STATE.contacts];
        }
      }

      // Si hay clientes en localStorage local que no están en Firestore, subirlos
      const localCustom = JSON.parse(localStorage.getItem('mkt_custom_clients') || '[]');
      if (localCustom.length) {
        for (const lc of localCustom) {
          try {
            await db.collection('custom_clients').doc(lc.id || `custom_${Date.now()}`).set(lc, { merge: true });
          } catch (e) {}
        }
      }
    }
  } catch (err) {
    console.warn('Error al sincronizar custom_clients desde Firestore:', err.message);
  }

  // 4. Combinar con localStorage como respaldo
  try {
    const customClients = JSON.parse(localStorage.getItem('mkt_custom_clients') || '[]');
    if (customClients.length) {
      const ids = new Set(MKT_STATE.contacts.map(c => c.id));
      const freshLocal = customClients.filter(c => !ids.has(c.id));
      MKT_STATE.contacts = [...freshLocal, ...MKT_STATE.contacts];
    }
  } catch (e) {}

  const total = MKT_STATE.contacts.length;
  const conEmail = MKT_STATE.contacts.filter(c => c.tieneEmail).length;
  const conWa = MKT_STATE.contacts.filter(c => c.tieneWhatsApp).length;

  const totalEl = document.getElementById('mkt-stat-total');
  const emailEl = document.getElementById('mkt-stat-email');
  const waEl = document.getElementById('mkt-stat-wa');
  const badgeEl = document.getElementById('mkt-count-badge');

  if (totalEl) totalEl.textContent = total;
  if (emailEl) emailEl.textContent = conEmail;
  if (waEl) waEl.textContent = conWa;
  if (badgeEl) badgeEl.textContent = total;

  MKT_STATE.selectedContactIds = new Set(MKT_STATE.contacts.filter(c => c.tieneEmail).map(c => c.id));
  MKT_STATE.filteredContacts = [...MKT_STATE.contacts];
  renderClientsTable();
  updateSelectedCount();
}

function renderClientsTable() {
  const tbody = document.getElementById('mkt-clients-tbody');
  if (!tbody) return;

  if (MKT_STATE.filteredContacts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-400">No se encontraron clientes para esta búsqueda.</td></tr>';
    return;
  }

  tbody.innerHTML = MKT_STATE.filteredContacts.slice(0, 150).map(c => {
    const isChecked = MKT_STATE.selectedContactIds.has(c.id);
    const emailBadge = c.correo 
      ? `<span class="text-blue-700 font-semibold">${c.correo}</span>` 
      : `<span class="text-gray-400 italic">Sin correo</span>`;
    const waBadge = c.tieneWhatsApp 
      ? `<a href="https://web.whatsapp.com/send?phone=${c.whatsAppNumero}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-semibold hover:underline" title="Abrir chat en WhatsApp"><i class="fa-brands fa-whatsapp text-emerald-600 text-sm"></i> ${c.telefonoDisplay || c.whatsAppNumero}</a>` 
      : `<span class="text-gray-400">${c.telefonoOriginal || 'Sin teléfono'}</span>`;

    return `
      <tr class="hover:bg-amber-50/40 transition">
        <td class="p-2.5 text-center">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleClientCheckbox('${c.id}', this.checked)" />
        </td>
        <td class="p-2.5 font-bold text-slate-900">${c.nombreFarmacia || 'Farmacia'}</td>
        <td class="p-2.5 text-slate-600">${c.contacto || '-'}</td>
        <td class="p-2.5">${emailBadge}</td>
        <td class="p-2.5">${waBadge}</td>
        <td class="p-2.5 text-slate-500">${c.comuna || 'Santiago'}</td>
      </tr>
    `;
  }).join('');
}

function toggleClientCheckbox(id, checked) {
  if (checked) {
    MKT_STATE.selectedContactIds.add(id);
  } else {
    MKT_STATE.selectedContactIds.delete(id);
  }
  updateSelectedCount();
}

function toggleSelectAllCheckbox(checked) {
  selectAllClients(checked);
}

function selectAllClients(shouldSelect) {
  if (shouldSelect) {
    MKT_STATE.filteredContacts.forEach(c => {
      if (c.tieneEmail) MKT_STATE.selectedContactIds.add(c.id);
    });
  } else {
    MKT_STATE.filteredContacts.forEach(c => MKT_STATE.selectedContactIds.delete(c.id));
  }
  renderClientsTable();
  updateSelectedCount();
}

function updateSelectedCount() {
  const el = document.getElementById('mkt-sel-count');
  if (el) el.textContent = MKT_STATE.selectedContactIds.size;
}

function filterAdminClients() {
  const q = (document.getElementById('mkt-search-clients')?.value || '').toLowerCase().trim();
  if (!q) {
    MKT_STATE.filteredContacts = [...MKT_STATE.contacts];
  } else {
    MKT_STATE.filteredContacts = MKT_STATE.contacts.filter(c => {
      return (c.nombreFarmacia || '').toLowerCase().includes(q) ||
             (c.contacto || '').toLowerCase().includes(q) ||
             (c.comuna || '').toLowerCase().includes(q) ||
             (c.correo || '').toLowerCase().includes(q) ||
             (c.telefonoOriginal || '').toLowerCase().includes(q);
    });
  }
  renderClientsTable();
}

// 5. Agregar Nuevos Clientes
function toggleAddClientForm() {
  const formBox = document.getElementById('add-client-form-container');
  if (formBox) {
    formBox.classList.toggle('hidden');
    if (!formBox.classList.contains('hidden')) {
      document.getElementById('new-cli-farmacia')?.focus();
    }
  }
}

async function saveNewClient(event) {
  event.preventDefault();
  const farmacia = document.getElementById('new-cli-farmacia')?.value.trim();
  const contacto = document.getElementById('new-cli-contacto')?.value.trim();
  const correo = document.getElementById('new-cli-correo')?.value.trim();
  const telefono = document.getElementById('new-cli-telefono')?.value.trim();
  const comuna = document.getElementById('new-cli-comuna')?.value.trim() || 'Santiago';
  const direccion = document.getElementById('new-cli-direccion')?.value.trim();

  if (!farmacia && !contacto) {
    alert('Ingresa al menos el nombre de la farmacia o de la persona de contacto.');
    return;
  }

  const payload = { nombreFarmacia: farmacia, contacto, correo, telefono, comuna, direccion };

  try {
  const cleanDigits = telefono ? telefono.replace(/\D/g, '') : '';
  const cleanWa = cleanDigits.startsWith('56') ? cleanDigits : (cleanDigits ? '56' + cleanDigits : '');

  const newClient = {
    id: 'cli_custom_' + Date.now(),
    nombreFarmacia: farmacia || 'Cliente Especial',
    contacto: contacto || 'Encargado/a',
    correo: correo || '',
    telefonoOriginal: telefono || '',
    telefonoDisplay: telefono || '',
    whatsAppNumero: cleanWa,
    tieneWhatsApp: Boolean(cleanDigits && cleanDigits.length >= 8),
    tieneEmail: Boolean(correo && correo.includes('@') && correo.includes('.')),
    comuna: comuna || 'Santiago',
    direccion: direccion || '',
    isCustom: true,
    createdAt: new Date().toISOString()
  };

  // 1. Sincronizar en Cloud Firestore (disponible al instante para la APK móvil y web)
  try {
    if (typeof initFirebaseApp === 'function') {
      const db = await initFirebaseApp();
      await db.collection('custom_clients').doc(newClient.id).set(newClient);
      console.log('✓ Cliente sincronizado en Firestore custom_clients');
    }
  } catch (err) {
    console.warn('Advertencia al sincronizar en Firestore:', err.message);
  }

  // 2. Enviar a backend local si está activo
  try {
    await fetch(`${API_BASE}/api/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClient)
    });
  } catch (err) {}

  // 3. Respaldo en localStorage
  try {
    const list = JSON.parse(localStorage.getItem('mkt_custom_clients') || '[]');
    list.unshift(newClient);
    localStorage.setItem('mkt_custom_clients', JSON.stringify(list));
  } catch (e) {}

  MKT_STATE.contacts.unshift(newClient);
  MKT_STATE.filteredContacts.unshift(newClient);
  MKT_STATE.selectedContactIds.add(newClient.id);

  alert(`¡Cliente "${farmacia || contacto}" agregado con éxito y sincronizado con la App Móvil!`);
  document.getElementById('form-new-client')?.reset();
  toggleAddClientForm();
  renderClientsTable();
  updateSelectedCount();
}

// 6. Vista Previa en Vivo del Correo
async function updateLiveEmailPreviewAdmin() {
  const iframe = document.getElementById('mkt-email-preview-iframe');
  if (!iframe) return;

  const subject = document.getElementById('mkt-email-subject')?.value || 'Ofertas Adhesivos Corega';
  const body = document.getElementById('mkt-email-body')?.value || '';
  const selectedProductIds = Array.from(MKT_STATE.selectedProductIds);

  try {
    const res = await fetch(`${API_BASE}/api/email/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject,
        body,
        selectedProductIds,
        title: subject
      })
    });
    const data = await res.json();
    if (data.success && data.html) {
      iframe.srcdoc = data.html;
      return;
    }
  } catch (err) {
    // Si la API no está en línea, renderizar HTML local idéntico
    const prods = MKT_STATE.products.filter(p => selectedProductIds.includes(p.id));
    const prodCards = prods.map(p => `
      <td width="50%" style="padding: 8px;">
        <div style="border: 1px solid #f59e0b; border-radius: 10px; background: #0f1219; color: #fff; overflow: hidden;">
          <div style="background: #fff; padding: 12px; text-align: center;">
            <img src="${p.image}" style="max-height: 100px; max-width: 90%;" />
          </div>
          <div style="padding: 12px;">
            <div style="color: #f59e0b; font-weight: bold; font-size: 13px; height: 36px; overflow: hidden;">${p.name}</div>
            <div style="color: #f59e0b; font-size: 18px; font-weight: 800; margin: 4px 0;">$${(p.normalPrice || 0).toLocaleString('es-CL')}</div>
            <div style="color: #4ade80; font-size: 11px;">🟢 Stock: ${p.stock || 100} un.</div>
          </div>
        </div>
      </td>
    `).join('');

    iframe.srcdoc = `
      <div style="font-family: Arial, sans-serif; background: #0b0c10; color: #fff; padding: 16px; text-align: center;">
        <h2 style="color: #f59e0b; margin: 0;">DISTRIBUIDORA LA RUTA DEL ORIENTE</h2>
        <p style="font-size: 12px; color: #cbd5e1; margin: 4px 0 0;">Catálogo Mayorista para Farmacias</p>
      </div>
      <div style="padding: 16px; font-family: Arial, sans-serif; background: #fff; color: #333;">
        <p><strong>Estimado/a Contacto,</strong></p>
        <p style="white-space: pre-wrap; font-size: 13px;">${body}</p>
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>${prodCards}</tr>
        </table>
      </div>
    `;
  }
}

// 7. Enviar Correo de Prueba (¡Lo que pidió el usuario!)
async function sendTestEmailNow() {
  const recipientInput = document.getElementById('mkt-test-recipient');
  const recipient = recipientInput?.value.trim();
  const statusBox = document.getElementById('mkt-test-status');
  const btn = document.getElementById('btn-send-test-email');
  const passInput = document.getElementById('smtp-pass-input');

  if (!recipient) {
    alert('Ingresa tu correo para recibir la prueba.');
    recipientInput?.focus();
    return;
  }

  // Si escribió la contraseña en el campo de configuración, guardarla automáticamente primero
  if (passInput && passInput.value.trim().length >= 8) {
    await saveSmtpConfigFromAdmin();
  }

  const subject = document.getElementById('mkt-email-subject')?.value || 'Ofertas Adhesivos Corega';
  const body = document.getElementById('mkt-email-body')?.value || '';
  const selectedProductIds = Array.from(MKT_STATE.selectedProductIds);

  if (statusBox) {
    statusBox.className = "mt-2.5 text-xs font-semibold p-2.5 rounded-xl bg-blue-100 text-blue-900 border border-blue-300 block";
    statusBox.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Enviando correo de prueba con los 4 productos Corega a ' + recipient + '...';
  }
  if (btn) btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/email/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testRecipient: recipient,
        subject,
        body,
        selectedProductIds
      })
    });
    const data = await res.json();
    if (btn) btn.disabled = false;

    if (data.success) {
      if (statusBox) {
        statusBox.className = "mt-2.5 text-xs font-semibold p-2.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 block";
        statusBox.innerHTML = '✅ <strong>¡Prueba enviada con éxito!</strong> Revisa tu correo (' + recipient + ') para ver el diseño exacto con las 4 fotos y precios.';
      }
      alert('¡Correo de prueba enviado con éxito a ' + recipient + '! Revisa tu bandeja de entrada o spam.');
    } else {
      throw new Error(data.error || 'Error al enviar');
    }
  } catch (err) {
    if (btn) btn.disabled = false;
    let msg = err.message;
    if (statusBox) {
      statusBox.className = "mt-2.5 text-xs font-semibold p-2.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 block";
      statusBox.innerHTML = '⚠️ <strong>Nota:</strong> ' + msg;
    }
  }
}

// 8. Envío Masivo a Clientes
async function launchMassEmailModal() {
  const selectedCount = MKT_STATE.selectedContactIds.size;
  if (selectedCount === 0) {
    alert('No has seleccionado ningún cliente con correo para el envío.');
    return;
  }

  const subject = document.getElementById('mkt-email-subject')?.value.trim();
  const body = document.getElementById('mkt-email-body')?.value.trim();
  const selectedProductIds = Array.from(MKT_STATE.selectedProductIds);

  const confirmSend = confirm(`¿Estás seguro de iniciar el envío masivo de ofertas a ${selectedCount} farmacias clientes?`);
  if (!confirmSend) return;

  const modal = document.getElementById('mkt-send-modal');
  modal?.classList.remove('hidden');

  document.getElementById('mkt-prog-current').textContent = '0';
  document.getElementById('mkt-prog-total').textContent = selectedCount;
  document.getElementById('mkt-prog-percent').textContent = '0%';
  document.getElementById('mkt-prog-bar').style.width = '0%';
  document.getElementById('mkt-prog-success').textContent = '0';
  document.getElementById('mkt-prog-failed').textContent = '0';
  document.getElementById('mkt-live-logs').innerHTML = '> Iniciando campaña masiva...\n';
  document.getElementById('btn-close-mkt-send')?.classList.add('hidden');
  document.getElementById('btn-stop-mkt-send')?.classList.remove('hidden');

  try {
    const res = await fetch(`${API_BASE}/api/email/send-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject,
        body,
        selectedProductIds,
        contactIds: Array.from(MKT_STATE.selectedContactIds),
        targetContactIds: Array.from(MKT_STATE.selectedContactIds)
      })
    });
    let data;
    try {
      data = await res.json();
    } catch(e) {
      const txt = await res.text();
      throw new Error(txt || 'Error desconocido del servidor');
    }
    if (!data.success) throw new Error(data.error);

    // Comenzar polling de estado
    MKT_STATE.currentPollInterval = setInterval(pollCampaignStatus, 1000);
  } catch (err) {
    alert('Error al iniciar envío: ' + err.message);
    modal?.classList.add('hidden');
  }
}

async function pollCampaignStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/email/status`);
    const s = await res.json();

    document.getElementById('mkt-prog-current').textContent = s.current;
    document.getElementById('mkt-prog-total').textContent = s.total;
    document.getElementById('mkt-prog-percent').textContent = s.percent + '%';
    document.getElementById('mkt-prog-bar').style.width = s.percent + '%';
    document.getElementById('mkt-prog-success').textContent = s.success;
    document.getElementById('mkt-prog-failed').textContent = s.failed;

    if (s.logs && s.logs.length > 0) {
      document.getElementById('mkt-live-logs').innerHTML = s.logs.slice(-20).map(l => {
        const color = l.status === 'ok' ? '#4ade80' : (l.status === 'error' ? '#f87171' : '#cbd5e1');
        return `<div style="color: ${color};">[${l.time}] ${l.farmacia}: ${l.message}</div>`;
      }).join('');
    }

    if (!s.running) {
      clearInterval(MKT_STATE.currentPollInterval);
      document.getElementById('btn-stop-mkt-send')?.classList.add('hidden');
      document.getElementById('btn-close-mkt-send')?.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Error polling:', err);
  }
}

async function stopMassEmailSend() {
  await fetch(`${API_BASE}/api/email/stop`, { method: 'POST' });
}

function closeMassEmailModal() {
  document.getElementById('mkt-send-modal')?.classList.add('hidden');
  if (MKT_STATE.currentPollInterval) clearInterval(MKT_STATE.currentPollInterval);
}

// Inicialización automática al cargar
window.addEventListener('DOMContentLoaded', () => {
  // Escuchar inputs para actualizar vista previa
  ['mkt-email-subject', 'mkt-email-body'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      clearTimeout(window._previewDebounce);
      window._previewDebounce = setTimeout(updateLiveEmailPreviewAdmin, 300);
    });
  });

  // Si el panel de admin ya está visible, inicializar
  if (!document.getElementById('admin-panel')?.classList.contains('hidden')) {
    initMarketingModule();
  }
});

// Detectar cuando el administrador inicia sesión con éxito
const adminPanelObserver = new MutationObserver((mutations) => {
  mutations.forEach((m) => {
    if (m.attributeName === 'class') {
      const panel = document.getElementById('admin-panel');
      if (panel && !panel.classList.contains('hidden')) {
        initMarketingModule();
      }
    }
  });
});

window.addEventListener('DOMContentLoaded', () => {
  const panel = document.getElementById('admin-panel');
  if (panel) {
    adminPanelObserver.observe(panel, { attributes: true, attributeFilter: ['class'] });
    // Si ya estuviera autenticado en la sesión actual
    if (!panel.classList.contains('hidden')) {
      initMarketingModule();
    }
  }
});

// ================= GMAIL / SMTP CONFIG =================
async function loadSmtpConfigInAdmin() {
  const badge = document.getElementById('smtp-status-badge');
  const userInput = document.getElementById('smtp-user-input');
  const passInput = document.getElementById('smtp-pass-input');

  try {
    const res = await fetch(`${API_BASE}/api/config`);
    const cfg = await res.json();

    if (cfg.user && userInput) userInput.value = cfg.user;

    if (cfg.hasPass) {
      if (badge) {
        badge.className = "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300";
        badge.innerHTML = (document.getElementById("smtp-provider-select")?.value === "gmail") ? "🟢 Gmail Conectado" : "🟢 Correo Empresarial Conectado";
      }
      if (passInput) passInput.placeholder = "•••••••••••••••• (Guardada)";
    } else {
      if (badge) {
        badge.className = "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300";
        badge.innerHTML = "⚠️ Ingresa tu clave";
      }
    }
  } catch (err) {
    const localUser = localStorage.getItem('mkt_smtp_user');
    if (localUser && userInput && !userInput.value) {
      userInput.value = localUser;
    }
    if (badge) {
      badge.className = "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700";
      badge.innerHTML = "Servidor local";
    }
  }
}

async function saveSmtpConfigFromAdmin() {
  const userInput = document.getElementById('smtp-user-input');
  const passInput = document.getElementById('smtp-pass-input');
  const badge = document.getElementById('smtp-status-badge');
  const statusBox = document.getElementById('mkt-test-status');

  const user = userInput?.value.trim() || '';
  const pass = passInput?.value.trim() || '';

  if (!user) {
    alert('Ingresa tu correo emisor.');
    userInput?.focus();
    return false;
  }

  if (!pass && !passInput?.placeholder.includes('Guardada')) {
    alert('Ingresa la contraseña de la cuenta o contraseña de aplicación.');
    passInput?.focus();
    return false;
  }

  localStorage.setItem('mkt_smtp_user', user);

  try {
    const res = await fetch(`${API_BASE}/api/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: document.getElementById('smtp-provider-select')?.value || 'titan',
        host: (document.getElementById('smtp-provider-select')?.value === 'gmail') ? 'smtp.gmail.com' : 'smtpout.secureserver.net',
        port: 465,
        secure: true,
        user,
        pass,
        fromName: 'Distribuidora La Ruta del Oriente',
        fromEmail: user
      })
    });
    const data = await res.json();
    if (data.success) {
      if (badge) {
        badge.className = "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300";
        badge.innerHTML = (document.getElementById('smtp-provider-select')?.value === 'gmail') ? "🟢 Gmail Conectado" : "🟢 Correo Empresarial Conectado";
      }
      if (passInput) passInput.placeholder = "•••••••••••••••• (Guardada)";
      if (passInput) passInput.value = "";
      alert('¡Configuración de correo emisor guardada con éxito!');
      return true;
    }
  } catch (err) {
    alert('Error al guardar configuración: ' + err.message + '.\n\nPara guardar y enviar correos, el servidor local debe estar abierto ejecutando INICIAR_SISTEMA.bat ubicado en C:\\app_datosacorreo.');
    return false;
  }
  return true;
}

function toggleSmtpPassVisible() {
  const input = document.getElementById('smtp-pass-input');
  const icon = document.getElementById('smtp-pass-eye');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.className = 'fa fa-eye-slash';
  } else {
    input.type = 'password';
    if (icon) icon.className = 'fa fa-eye';
  }
}

function openPreviewModal() {
  const modal = document.getElementById('mkt-preview-modal');
  const iframeMain = document.getElementById('mkt-email-preview-iframe');
  const iframeModal = document.getElementById('mkt-modal-iframe');
  if (modal && iframeMain && iframeModal) {
    iframeModal.srcdoc = iframeMain.srcdoc;
    modal.classList.remove('hidden');
  }
}

function closePreviewModal() {
  document.getElementById('mkt-preview-modal')?.classList.add('hidden');
}

function onSmtpProviderChange() {
  const provider = document.getElementById('smtp-provider-select')?.value || 'titan';
  const lblUser = document.getElementById('lbl-smtp-user');
  const lblPass = document.getElementById('lbl-smtp-pass');
  const userInput = document.getElementById('smtp-user-input');
  const passInput = document.getElementById('smtp-pass-input');
  const helpText = document.getElementById('smtp-help-text');

  if (provider === 'titan') {
    if (lblUser) lblUser.textContent = 'Tu Correo Empresarial Titan:';
    if (lblPass) lblPass.textContent = 'Contraseña habitual de Titan:';
    if (userInput && userInput.value.includes('gmail.com')) {
      userInput.value = 'contacto@distribuidoralarutadeloriente.cl';
    }
    if (passInput) passInput.placeholder = 'Tu contraseña normal de Titan';
    if (helpText) {
      helpText.className = 'text-emerald-700 font-semibold flex items-center gap-1.5';
      helpText.innerHTML = '<i class="fa fa-shield-halved text-emerald-600"></i> Servidor: <code>smtpout.secureserver.net</code> (Puerto 465 SSL automático)';
      if (badge) badge.innerHTML = '🟢 Correo Empresarial Conectado';
    }
  } else {
    if (lblUser) lblUser.textContent = 'Tu Correo de Gmail:';
    if (lblPass) lblPass.textContent = 'Contraseña de Aplicación (16 letras):';
    if (passInput) passInput.placeholder = 'ej: abcd efgh ijkl mnop';
    if (helpText) {
      helpText.className = 'text-blue-600 font-semibold flex items-center gap-1.5';
      helpText.innerHTML = '<a href="https://myaccount.google.com/apppasswords" target="_blank" class="hover:underline flex items-center gap-1"><i class="fa fa-external-link-alt text-[9px]"></i> Obtener clave de 16 letras de Gmail</a>';
    }
  }
}
