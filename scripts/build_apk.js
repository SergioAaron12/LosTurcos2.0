const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LARUTA_DIR = 'C:\\laruta';
const WWW_DIR = path.join(LARUTA_DIR, 'www');
const WORKSPACE_DIR = path.resolve(__dirname, '..');
const SDK_PATH = 'C:\\Users\\sergi\\AppData\\Local\\Android\\Sdk';

console.log('🚀 Iniciando compilación de la APK en C:\\laruta...');

// 1. Crear directorio www si no existe
if (!fs.existsSync(WWW_DIR)) {
  fs.mkdirSync(WWW_DIR, { recursive: true });
}

// 2. Función para copiar recursivamente
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('📦 Sincronizando archivos web a C:\\laruta\\www...');
copyDirRecursive(path.join(WORKSPACE_DIR, 'public', 'movil'), WWW_DIR);

// Asegurar carpeta asset e img en www
copyDirRecursive(path.join(WORKSPACE_DIR, 'public', 'asset'), path.join(WWW_DIR, 'asset'));
copyDirRecursive(path.join(WORKSPACE_DIR, 'public', 'img'), path.join(WWW_DIR, 'img'));

// También asegurar que C:\laruta raíz tenga copias
copyDirRecursive(path.join(WORKSPACE_DIR, 'public', 'movil'), LARUTA_DIR);

// 3. Crear capacitor.config.json
const capConfig = {
  appId: 'cl.distribuidoralarutadeloriente.app',
  appName: 'La Ruta del Oriente',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};
fs.writeFileSync(path.join(LARUTA_DIR, 'capacitor.config.json'), JSON.stringify(capConfig, null, 2), 'utf8');

// 4. Agregar plataforma Android si no existe
const androidDir = path.join(LARUTA_DIR, 'android');
if (!fs.existsSync(androidDir)) {
  console.log('📱 Agregando plataforma Android a Capacitor...');
  execSync('npx cap add android', { cwd: LARUTA_DIR, stdio: 'inherit' });
} else {
  console.log('📱 Plataforma Android ya existe. Sincronizando assets...');
  execSync('npx cap sync android', { cwd: LARUTA_DIR, stdio: 'inherit' });
}

// 4.1 Generar iconos nativos con el logo oficial
try {
  console.log('🎨 Generando iconos nativos de Android con el logo oficial...');
  execSync('powershell -ExecutionPolicy Bypass -File scripts\\generate_android_icons.ps1', {
    cwd: WORKSPACE_DIR,
    stdio: 'inherit'
  });
} catch (e) {
  console.warn('Advertencia al generar iconos:', e.message);
}

// 5. Configurar local.properties para Android SDK
const localPropsPath = path.join(androidDir, 'local.properties');
const sdkEscaped = SDK_PATH.replace(/\\/g, '\\\\');
fs.writeFileSync(localPropsPath, `sdk.dir=${sdkEscaped}\n`, 'utf8');
console.log('🔧 Configurado local.properties con SDK en:', SDK_PATH);

// 6. Configurar permisos de Internet y WhatsApp en AndroidManifest.xml si es necesario
const manifestPath = path.join(androidDir, 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
  let manifestContent = fs.readFileSync(manifestPath, 'utf8');
  // Asegurar que queries para WhatsApp y navegador estén presentes
  if (!manifestContent.includes('package android:name="com.whatsapp"')) {
    const queries = `
    <queries>
        <package android:name="com.whatsapp" />
        <package android:name="com.whatsapp.w4b" />
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="https" />
        </intent>
    </queries>
    </manifest>`;
    manifestContent = manifestContent.replace('</manifest>', queries);
    fs.writeFileSync(manifestPath, manifestContent, 'utf8');
    console.log('✓ Permisos y consultas de WhatsApp añadidos a AndroidManifest.xml');
  }
}

// 6.1 Asegurar estilos de Android y barra de estado
try {
  execSync('node scripts\\fix_styles.js', { cwd: WORKSPACE_DIR, stdio: 'inherit' });
} catch (e) {
  console.warn('Advertencia al configurar styles.xml:', e.message);
}

// 7. Compilar APK con Gradle
console.log('🔨 Compilando APK con Gradle Wrapper (assembleDebug)...');
const gradlewCmd = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
execSync(`${gradlewCmd} assembleDebug`, {
  cwd: androidDir,
  env: {
    ...process.env,
    ANDROID_HOME: SDK_PATH,
    ANDROID_SDK_ROOT: SDK_PATH
  },
  stdio: 'inherit'
});

// 8. Buscar el APK generado
const apkGeneratedPath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
if (fs.existsSync(apkGeneratedPath)) {
  const destApkInLaruta = path.join(LARUTA_DIR, 'LaRutaDelOriente.apk');
  fs.copyFileSync(apkGeneratedPath, destApkInLaruta);

  const stats = fs.statSync(destApkInLaruta);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

  console.log('\n======================================================');
  console.log('🎉 ¡APK GENERADA CON ÉXITO!');
  console.log(`📁 Ubicación en C:\\laruta: ${destApkInLaruta} (${sizeMb} MB)`);
  console.log('☁️ Sube este archivo a tu Google Drive para distribuirlo.');
  console.log('======================================================\n');
} else {
  console.error('⚠️ No se encontró el APK generado en:', apkGeneratedPath);
}
