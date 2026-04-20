const VERIFY_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBIN5wILjhmFhHFxBwuJuKPsZyUNziPDFQ',
  authDomain: 'losturcos2.firebaseapp.com',
  projectId: 'losturcos2',
  storageBucket: 'losturcos2.firebasestorage.app',
  messagingSenderId: '353259282248',
  appId: '1:353259282248:web:212a5dbe7ee28ed5cedd7d'
};

const MODE_ALIASES = new Map([
  ['verifyemail', 'verifyEmail'],
  ['verify', 'verifyEmail'],
  ['verificar', 'verifyEmail'],
  ['verificacion', 'verifyEmail'],
  ['resetpassword', 'resetPassword'],
  ['restablecer', 'resetPassword'],
  ['recoveremail', 'recoverEmail'],
  ['recuperaremail', 'recoverEmail']
]);

function getVerifyElements() {
  return {
    status: document.getElementById('verify-status'),
    title: document.getElementById('verify-title'),
    message: document.getElementById('verify-message'),
    details: document.getElementById('verify-details')
  };
}

function setVerifyView({ status, title, message, details = '', tone = 'neutral' }) {
  const elements = getVerifyElements();
  if (!elements.status || !elements.title || !elements.message || !elements.details) return;

  const toneClasses = {
    neutral: ['bg-stone-100', 'text-slate-700'],
    success: ['bg-emerald-100', 'text-emerald-800'],
    error: ['bg-red-100', 'text-red-800'],
    warning: ['bg-amber-100', 'text-amber-800']
  };

  elements.status.className = 'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium';
  elements.status.classList.add(...(toneClasses[tone] || toneClasses.neutral));
  elements.status.textContent = status;
  elements.title.textContent = title;
  elements.message.textContent = message;

  if (details) {
    elements.details.textContent = details;
    elements.details.classList.remove('hidden');
  } else {
    elements.details.textContent = '';
    elements.details.classList.add('hidden');
  }
}

function normalizeMode(rawMode, hasCode) {
  const mode = String(rawMode || '').trim();
  if (!mode && hasCode) {
    return 'verifyEmail';
  }

  const normalized = mode.toLowerCase();
  return MODE_ALIASES.get(normalized) || mode;
}

function getContinueUrl(searchParams) {
  const continueUrl = searchParams.get('continueUrl') || '';
  if (!continueUrl) return '../admin.html';

  try {
    const url = new URL(continueUrl, window.location.origin);
    return url.toString();
  } catch (error) {
    return '../admin.html';
  }
}

function updatePrimaryAction(searchParams) {
  const actions = document.getElementById('verify-actions');
  if (!actions) return;

  const primaryAction = actions.querySelector('a');
  if (!primaryAction) return;

  primaryAction.href = getContinueUrl(searchParams);
}

function ensureFirebaseApp() {
  if (!window.firebase) {
    throw new Error('Firebase no esta disponible en esta pagina.');
  }

  if (!window.firebase.apps.length) {
    window.firebase.initializeApp(VERIFY_FIREBASE_CONFIG);
  }

  return window.firebase.auth();
}

async function handleVerifyEmail(auth, code) {
  if (!code) {
    setVerifyView({
      status: 'Enlace incompleto',
      title: 'Falta el codigo de verificacion',
      message: 'Abre el enlace completo que llego al correo. Si solo entraste a /verificar, Firebase no puede confirmar la cuenta.',
      tone: 'warning'
    });
    return;
  }

  await auth.applyActionCode(code);
  setVerifyView({
    status: 'Correo verificado',
    title: 'La cuenta ya quedo validada',
    message: 'Ahora puedes volver al administrador e iniciar sesion con el correo autorizado.',
    details: 'Si la sesion estaba abierta antes de verificar, cierrala y vuelve a entrar para refrescar el estado del usuario.',
    tone: 'success'
  });
}

function showUnsupportedMode(mode) {
  setVerifyView({
    status: 'Modo no soportado',
    title: 'Este enlace no corresponde a verificacion de correo',
    message: 'La pagina personalizada de este sitio solo esta preparada para validar correos del administrador.',
    details: `Modo recibido: ${mode || 'sin valor'}`,
    tone: 'warning'
  });
}

function mapFirebaseError(error) {
  const code = String(error?.code || '');
  switch (code) {
    case 'auth/invalid-action-code':
      return 'El enlace ya se uso o ya no es valido. Solicita un nuevo correo de verificacion.';
    case 'auth/expired-action-code':
      return 'El enlace vencio. Solicita un nuevo correo de verificacion.';
    case 'auth/user-disabled':
      return 'La cuenta asociada a este correo se encuentra deshabilitada.';
    default:
      return error?.message || 'No fue posible procesar el enlace de Firebase.';
  }
}

async function initVerifyPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const actionCode = searchParams.get('oobCode') || '';
  const mode = normalizeMode(searchParams.get('mode'), Boolean(actionCode));
  updatePrimaryAction(searchParams);

  try {
    const auth = ensureFirebaseApp();

    if (mode === 'verifyEmail') {
      await handleVerifyEmail(auth, actionCode);
      return;
    }

    if (!mode) {
      setVerifyView({
        status: 'Sin parametros',
        title: 'Abre el enlace desde tu correo',
        message: 'Esta ruta funciona cuando ingresas desde el correo de Firebase Auth. Si vienes manualmente, falta el codigo de accion.',
        tone: 'warning'
      });
      return;
    }

    showUnsupportedMode(mode);
  } catch (error) {
    console.warn('No fue posible procesar la verificacion de Firebase.', error);
    setVerifyView({
      status: 'Error de verificacion',
      title: 'No se pudo validar el enlace',
      message: mapFirebaseError(error),
      details: 'Si el correo de Firebase sigue enviando la pagina generica con mode incorrecto, configura la URL de accion para apuntar a /verificar en Authentication > Templates.',
      tone: 'error'
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  void initVerifyPage();
});