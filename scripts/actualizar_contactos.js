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

const comunas = [...new Set(contacts.map(c => c.comuna).filter(Boolean))].sort();
const stats = {
  total: contacts.length,
  conEmail: contacts.filter(c => c.tieneEmail).length,
  conWhatsApp: contacts.filter(c => c.tieneWhatsApp).length,
  conAmbos: contacts.filter(c => c.tieneEmail && c.tieneWhatsApp).length
};

const outputDir = path.resolve(__dirname, '..', 'public', 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'contacts.json');
fs.writeFileSync(outputPath, JSON.stringify({ success: true, stats, comunas, contacts }, null, 2), 'utf8');

console.log('✅ Contactos actualizados con éxito en public/data/contacts.json:');
console.log(`   - Total registros: ${stats.total}`);
console.log(`   - Con correo: ${stats.conEmail}`);
console.log(`   - Con WhatsApp (+56 9): ${stats.conWhatsApp}`);
console.log(`   - Comunas cubiertas: ${comunas.length}`);
