const fs = require('fs');
const path = require('path');

// Buscar el archivo Excel en C:\app_datosacorreo o en la raíz del proyecto
const PATHS_TO_CHECK = [
  path.join('C:', 'app_datosacorreo', 'Contactos_Santiago farmacia .xlsx'),
  path.resolve(__dirname, '..', 'Contactos_Santiago farmacia .xlsx')
];

let excelPath = PATHS_TO_CHECK.find(p => fs.existsSync(p));

if (!excelPath) {
  console.error('❌ No se encontró el archivo Excel en ninguna de las rutas esperadas:');
  PATHS_TO_CHECK.forEach(p => console.error('   -', p));
  process.exit(1);
}

// Cargar librería xlsx
let xlsx;
try {
  xlsx = require('xlsx');
} catch (e) {
  try {
    xlsx = require('C:/app_datosacorreo/node_modules/xlsx');
  } catch (err2) {
    console.error('❌ No se encontró la librería xlsx. Ejecuta "npm install xlsx"');
    process.exit(1);
  }
}

function normalizePhone(rawPhone) {
  if (!rawPhone) return { original: '', display: '', cleanNumber: '', type: 'none', isWhatsApp: false };
  const str = String(rawPhone).trim();
  const digits = str.replace(/\D/g, '');

  if (!digits) return { original: str, display: str, cleanNumber: '', type: 'none', isWhatsApp: false };

  if (digits.startsWith('569') && digits.length === 11) {
    const national = digits.substring(2);
    return {
      original: str,
      display: `+56 ${national.slice(0, 1)} ${national.slice(1, 5)} ${national.slice(5)}`,
      cleanNumber: digits,
      type: 'mobile',
      isWhatsApp: true
    };
  }

  if (digits.startsWith('9') && digits.length === 9) {
    return {
      original: str,
      display: `+56 ${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5)}`,
      cleanNumber: `56${digits}`,
      type: 'mobile',
      isWhatsApp: true
    };
  }

  if (digits.startsWith('562') || (digits.startsWith('2') && digits.length === 9)) {
    return {
      original: str,
      display: `+56 ${digits.substring(2)} (Fijo)`,
      cleanNumber: digits,
      type: 'landline',
      isWhatsApp: false
    };
  }

  return {
    original: str,
    display: str,
    cleanNumber: digits,
    type: 'other',
    isWhatsApp: digits.length >= 8
  };
}

console.log(`📖 Leyendo archivo Excel: ${excelPath}`);
const wb = xlsx.readFile(excelPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const contacts = [];
for (let i = 3; i < rawRows.length; i++) {
  const r = rawRows[i];
  if (!r || r.length === 0) continue;

  const id = `cli_${i}`;
  const rut = r[1] ? String(r[1]).trim() : '';
  const sucursal = r[2] ? String(r[2]).trim() : '';
  const nombreFarmacia = r[3] ? String(r[3]).trim() : '';
  const direccion = r[4] ? String(r[4]).trim() : '';
  const comuna = r[5] ? String(r[5]).trim() : '';
  const claseComercio = r[6] ? String(r[6]).trim() : '';
  const rawTelefono = r[7] ? String(r[7]).trim() : '';
  const rawCorreo = r[8] ? String(r[8]).trim() : '';
  const contacto = r[9] ? String(r[9]).trim() : '';
  const suspendido = r[10] ? String(r[10]).trim() : '';

  if (!nombreFarmacia && !contacto && !rawCorreo && !rawTelefono) continue;

  const phoneInfo = normalizePhone(rawTelefono);
  const hasValidEmail = Boolean(rawCorreo && rawCorreo.includes('@') && rawCorreo.includes('.'));

  contacts.push({
    id,
    rowIndex: i,
    rut,
    sucursal,
    nombreFarmacia,
    direccion,
    comuna,
    claseComercio,
    telefonoOriginal: rawTelefono,
    telefonoDisplay: phoneInfo.display,
    whatsAppNumero: phoneInfo.cleanNumber,
    telefonoTipo: phoneInfo.type,
    tieneWhatsApp: phoneInfo.isWhatsApp,
    correo: rawCorreo,
    tieneEmail: hasValidEmail,
    contacto,
    suspendido
  });
}

// Incorporar contactos personalizados / talleres (ej: Mechlook SpA)
const customCandidates = [
  path.join('C:', 'app_datosacorreo', 'data', 'custom_contacts.json'),
  path.resolve(__dirname, '..', 'public', 'data', 'custom_contacts.json'),
  path.resolve(__dirname, '..', 'data', 'custom_contacts.json')
];

let customList = [];
for (const p of customCandidates) {
  if (fs.existsSync(p)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (Array.isArray(parsed) && parsed.length) {
        customList = parsed;
        console.log(`📁 Contactos personalizados cargados desde: ${p} (${parsed.length} registros)`);
        break;
      }
    } catch (e) {
      console.warn(`Error al leer ${p}:`, e.message);
    }
  }
}

const customFormatted = [];
if (customList.length) {
  const seenIds = new Set();
  for (const c of customList) {
    const id = c.id || `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    if (seenIds.has(id)) continue;
    seenIds.add(id);

    const rawTelefono = c.telefono || c.telefonoOriginal || '';
    const phoneInfo = normalizePhone(rawTelefono);
    const rawCorreo = c.correo || '';
    const hasValidEmail = Boolean(rawCorreo && rawCorreo.includes('@') && rawCorreo.includes('.'));

    customFormatted.push({
      id,
      rowIndex: 0,
      rut: c.rut || '',
      sucursal: c.sucursal || '',
      nombreFarmacia: c.nombreFarmacia || c.nombre || 'Taller MechLook',
      direccion: c.direccion || '',
      comuna: c.comuna || 'Santiago',
      claseComercio: c.claseComercio || 'Taller Mecánico / Especial',
      telefonoOriginal: rawTelefono,
      telefonoDisplay: phoneInfo.display,
      whatsAppNumero: phoneInfo.cleanNumber,
      telefonoTipo: phoneInfo.type,
      tieneWhatsApp: phoneInfo.isWhatsApp,
      correo: rawCorreo,
      tieneEmail: hasValidEmail,
      contacto: c.contacto || '',
      suspendido: '',
      isCustom: true,
      createdAt: c.createdAt || new Date().toISOString()
    });
  }

  // Prepend custom contacts to the beginning so they appear at the top
  contacts.unshift(...customFormatted);
  console.log(`✅ ${customFormatted.length} talleres/contactos personalizados agregados al inicio del listado.`);
}

const comunas = [...new Set(contacts.map(c => c.comuna).filter(Boolean))].sort();
const stats = {
  total: contacts.length,
  conEmail: contacts.filter(c => c.tieneEmail).length,
  conWhatsApp: contacts.filter(c => c.tieneWhatsApp).length,
  conAmbos: contacts.filter(c => c.tieneEmail && c.tieneWhatsApp).length
};

const payload = JSON.stringify({ success: true, stats, comunas, contacts }, null, 2);

// Escribir en todos los destinos necesarios
const targetDirs = [
  path.resolve(__dirname, '..', 'public', 'data'),
  path.resolve(__dirname, '..', 'public', 'movil', 'data'),
  path.join('C:', 'laruta', 'www', 'data'),
  path.join('C:', 'laruta', 'data')
];

targetDirs.forEach(dir => {
  try {
    if (fs.existsSync(path.dirname(dir))) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'contacts.json'), payload, 'utf8');
      if (customList.length) {
        fs.writeFileSync(path.join(dir, 'custom_contacts.json'), JSON.stringify(customList, null, 2), 'utf8');
      }
      console.log(`💾 Actualizado contacts.json en: ${dir}`);
    }
  } catch (err) {
    console.warn(`No se pudo escribir en ${dir}:`, err.message);
  }
});

console.log('✅ Contactos actualizados con éxito:');
console.log(`   - Total registros: ${stats.total} (incluye ${customFormatted.length} talleres/personalizados)`);
console.log(`   - Con correo: ${stats.conEmail}`);
console.log(`   - Con WhatsApp (+56 9): ${stats.conWhatsApp}`);
console.log(`   - Comunas cubiertas: ${comunas.length}`);
