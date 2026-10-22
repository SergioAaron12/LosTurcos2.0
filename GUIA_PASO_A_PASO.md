# 📋 Guía Maestra de Uso - Administrador y Envíos Masivos
**Distribuidora La Ruta del Oriente** &middot; `distribuidoralarutadeloriente.cl`

---

## 🌅 ¿Cómo retomar mañana al encender tu computador? (Paso 1)

Para que el sistema de envíos de correos masivos pueda despachar los mensajes a través de tu cuenta empresarial Titan (`contacto@distribuidoralarutadeloriente.cl`), debes iniciar el servidor local:

1. Abre **Visual Studio Code**.
2. Abre la terminal (`Ctrl + ~` o Menú: *Terminal > Nueva terminal*).
3. Escribe el siguiente comando y presiona **Enter**:
   ```bash
   npm run envios
   ```
4. Verás en pantalla:
   ```text
   🚀 Distribuidora La Ruta del Oriente - 4 Productos Corega
   🔥 Sincronizado con Firebase: distribuidoralarutadeloriente
   👉 Abre tu navegador en: http://localhost:3000
   ```
   *(Deja esa terminal abierta mientras realices envíos).*

---

## 💻 Enlaces de Acceso al Panel de Administración

| Versión | Enlace Web de Producción | Enlace Local (en tu PC) |
| :--- | :--- | :--- |
| **PC / Escritorio** | [https://distribuidoralarutadeloriente.cl/envios.html](https://distribuidoralarutadeloriente.cl/envios.html) | [http://localhost:3000/envios.html](http://localhost:3000/envios.html) |
| **Móvil / Celular** | [https://distribuidoralarutadeloriente.cl/movil/](https://distribuidoralarutadeloriente.cl/movil/) | Carpeta local `C:\laruta\index.html` |

* **Correo de acceso:** `distribuidorarutadeloriente@gmail.com`
* **Contraseña:** Tu clave habitual de Firebase Auth.

---

## ✉️ Guía para Enviar Correos Masivos a las 773 Farmacias

### Paso 1: Enviar correo de prueba a tu propia bandeja
1. Entra a **[envios.html](https://distribuidoralarutadeloriente.cl/envios.html)** (Pestaña *Campaña Correo con Productos*).
2. Marca los productos Corega que deseas ofrecer (vienen los 4 activos por defecto).
3. En la sección **"Enviar Correo de Prueba a tu Bandeja"**, confirma que esté tu correo (`distribuidorarutadeloriente@gmail.com`).
4. Haz clic en **`Enviar Prueba Ahora`**.
5. Abre tu Gmail o correo en tu celular y revisa que las fotos, los precios y el diseño se vean perfectos.

### Paso 2: Ver Vista Previa en Pantalla Completa
1. Haz clic en el botón superior **`Ver Vista Previa`**.
2. Podrás ver la ventana modal completa con el encabezado dorado, el mensaje personalizado y los botones de compra.

### Paso 3: Agregar nuevos clientes (si tienes nuevas farmacias)
1. Ve a la pestaña **`Clientes (773)`**.
2. Haz clic en el botón verde **`+ Agregar Nuevo Cliente`**.
3. Rellena el nombre de la farmacia, contacto, correo y teléfono.
4. Presiona **`Guardar Cliente en el Directorio`** y quedará añadido inmediatamente en la parte superior.

### Paso 4: Lanzar el Envío Masivo
1. Vuelve a la pestaña **`Campaña Correo con Productos`**.
2. Haz clic en el botón dorado principal **`Iniciar Envío Masivo a Clientes`**.
3. Se abrirá la ventana de progreso en tiempo real con la barra de porcentaje, contador de éxitos y registro de cada farmacia despachada.

---

## 📱 Guía para Enviar Mensajes de WhatsApp desde tu Número de Empresa

Para comunicarte con las **684 farmacias con WhatsApp móvil** (+56 9...) de forma 100% segura y sin riesgo de que WhatsApp te suspenda el número:

### Opción A: Desde tu Computador (con WhatsApp Web)
1. En tu navegador, abre [web.whatsapp.com](https://web.whatsapp.com) y vincula tu número de empresa escaneando el código QR con tu celular.
2. En el panel **[envios.html](https://distribuidoralarutadeloriente.cl/envios.html)**, ve a la pestaña **`Campaña WhatsApp`**.
3. Revisa la plantilla del mensaje con las ofertas de Corega.
4. Presiona **`Iniciar Despachador Guiado`**.
5. Verás al primer cliente. Haz clic en **`Abrir Chat en WhatsApp Web`**:
   * Se abrirá la conversación directamente con esa farmacia y el mensaje ya redactado.
   * Presionas **Enviar** en WhatsApp.
   * Vuelves al panel y presionas **`Marcar Enviado y Siguiente »`**.
   * Puedes despachar 15 a 20 clientes por minuto cómodamente.

### Opción B: Desde tu Celular con la App Instalada (.APK de Android)
1. En el panel de administrador o en tu celular, toca el botón verde **`Descargar APK Celular`** (o escanea el código QR que aparece en pantalla con la cámara de tu teléfono).
2. Se descargará el instalador `.apk` desde Google Drive ([Descargar APK](https://drive.google.com/file/d/133mJoUHWGUhyIpG4jm2th1lrYFxGWN00/view?usp=sharing)).
3. Toca la notificación de descarga y presiona **Instalar** (si te pregunta, selecciona *"Permitir instalar desde esta fuente"*).
4. Se creará el acceso directo con el icono dorado de **La Ruta del Oriente** en la pantalla principal de tu teléfono.
5. Inicia sesión como administrador y ve directo a la pestaña **`WhatsApp`**.
6. Toca **`Iniciar Despachador Guiado`**:
   * Al tocar **`Abrir WhatsApp »`**, tu celular abrirá automáticamente tu app de **WhatsApp / WhatsApp Business** con el chat de la farmacia y la oferta lista.
   * Presionas enviar y tocas siguiente. ¡Puedes enviar decenas de mensajes por minuto sin necesidad de usar el computador!

---

## 📁 Resumen de Carpetas y Respaldos en tu Computador

* **`c:\La_ruta_del_oriente\`**: Tu proyecto web oficial sincronizado con Firebase Hosting.
* **`C:\app_datosacorreo\`**: El motor de despacho de correos Node.js Titan SMTP (puerto 3000) y archivo Excel original.
* **`C:\laruta\`**: Tu versión móvil dedicada e independiente optimizada para smartphones.
