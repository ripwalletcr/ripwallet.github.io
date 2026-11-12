/**
 * Tutoriales de Spent. Cada tutorial puede tener varias versiones (p. ej. una
 * por versión de iOS); cada versión es una lista de pasos con su captura.
 * Las imágenes viven en public/images/spent/tutoriales/<slug>/<version>/.
 */

export interface TutorialMedia {
  /** Ruta dentro de public/ */
  src: string;
  alt: string;
  /** Texto corto debajo de la imagen (opcional) */
  caption?: string;
  /** "video" para .mp4; por defecto imagen */
  type?: "image" | "video";
}

export interface TutorialStep {
  title: string;
  /** HTML simple permitido (<strong>, <em>) */
  body?: string;
  media?: TutorialMedia[];
}

export interface TutorialVersion {
  id: string;
  label: string;
  note?: string;
  /** Atajo listo para descargar en esta versión (opcional) */
  shortcut?: { url: string; text: string };
  steps: TutorialStep[];
}

export interface Tutorial {
  slug: string;
  title: string;
  summary: string;
  /** Logo del app relacionada, ruta dentro de public/ */
  icon: string;
  platform: string;
  versions: TutorialVersion[];
}

const ios26 = "/images/spent/tutoriales/apple-pay/ios26";
const ios27 = "/images/spent/tutoriales/apple-pay/ios27";

export const applePayTutorial: Tutorial = {
  slug: "apple-pay",
  title: "Registra tus gastos automáticamente con Apple Pay",
  summary:
    "Crea una automatización en Atajos para que cada vez que pagues con Apple Pay el gasto se agregue solo a Spent, con el comercio y el monto.",
  icon: "/images/spent/tutoriales/icon-apple-wallet.png",
  platform: "iPhone",
  versions: [
    {
      id: "ios27",
      label: "iOS 27",
      note: "En iOS 27 el atajo ya trae la automatización incluida: lo agregas desde Spent y queda listo, sin configurar variables. Asegúrate de tener la versión más reciente de Spent.",
      steps: [
        {
          title: "Abre Trackear con Apple Pay",
          body: "En Spent, ve a la pestaña <strong>Ajustes</strong> y toca <strong>Trackear con Apple Pay</strong>.",
          media: [{ src: `${ios27}/01-ajustes.webp`, alt: "Ajustes de Spent con la opción Trackear con Apple Pay" }],
        },
        {
          title: "Agrega el atajo a Shortcuts",
          body: "Toca <strong>Agregar a Shortcuts</strong>. Aquí mismo puedes elegir el <strong>Sobre predeterminado</strong> donde caen los gastos (o dejarlo en <em>Preguntar</em>). Spent recuerda en qué sobre pones cada comercio y lo usa la próxima vez.",
          media: [{ src: `${ios27}/02-agregar-shortcuts.webp`, alt: "Pantalla Trackear con Apple Pay con el botón Agregar a Shortcuts" }],
        },
        {
          title: "Toca Agregar atajo",
          body: "Se abre el app de Atajos con <strong>Track Expenses on Spent</strong>. Toca <strong>Agregar atajo</strong>.",
          media: [{ src: `${ios27}/03-agregar-atajo.webp`, alt: "Atajo Track Expenses on Spent con el botón Agregar atajo" }],
        },
        {
          title: "Revisa que esté todo conectado",
          body: "El atajo se activa <strong>cuando se use cualquier tarjeta</strong> y la acción <strong>Registrar pago con Apple Pay</strong> ya trae el <strong>Monto</strong>, el <strong>Comercio</strong> y la <strong>Tarjeta</strong>. No tienes que cambiar nada.",
          media: [{ src: `${ios27}/04-atajo.webp`, alt: "Atajo con la acción Registrar pago con Apple Pay configurada" }],
        },
        {
          title: "Ajusta las opciones (opcional)",
          body: "Toca la flecha junto a <strong>Cualquier tarjeta</strong> si quieres limitarlo a ciertas tarjetas, categorías o comercios. Deja <strong>Automatización</strong> activada y enciende <strong>Notificar</strong> si quieres un aviso cada vez que se registre un gasto.",
          media: [{ src: `${ios27}/05-opciones.webp`, alt: "Opciones del disparador: tarjetas, categorías, comercios, automatización y notificar" }],
        },
        {
          title: "Listo",
          body: "La próxima vez que pagues con Apple Pay, el gasto aparece solo en Spent, con el nombre del comercio y la tarjeta que usaste.",
          media: [{ src: `${ios27}/06-listo.webp`, alt: "Sobre en Spent con gastos registrados automáticamente" }],
        },
      ],
    },
    {
      id: "ios26",
      label: "iOS 26",
      shortcut: {
        url: "https://www.icloud.com/shortcuts/d092a1f4c8824d0c8fe9eb89e41dba8c",
        text: "Descárgalo desde iCloud. Igual vas a necesitar crear la automatización (pasos 2 a 5) y elegirlo en lugar de crear uno nuevo.",
      },
      note: "Si estás en iOS 18 o anterior, sigue estos mismos pasos: la única diferencia es que la automatización se llama <strong>Transacción</strong> en lugar de Wallet.",
      steps: [
        {
          title: "Instala el app de Atajos",
          body: 'Descarga <a href="https://apps.apple.com/us/app/shortcuts/id915249334" target="_blank" rel="noopener">Atajos (Shortcuts)</a> desde el App Store si no lo tienes en tu iPhone.',
        },
        {
          title: "Abre la sección de Automatización",
          body: "Dentro del app de Atajos, toca la pestaña <strong>Automatización</strong>.",
          media: [{ src: `${ios26}/02-automatizacion.png`, alt: "Pestaña Automatización en el app de Atajos" }],
        },
        {
          title: "Crea una nueva automatización",
          body: "Toca el botón <strong>+</strong>, arriba a la derecha.",
          media: [{ src: `${ios26}/03-nueva.png`, alt: "Botón para crear una nueva automatización" }],
        },
        {
          title: "Busca la automatización Wallet",
          body: "En la lista de disparadores, busca y selecciona <strong>Wallet</strong>.",
          media: [
            { src: `${ios26}/04-wallet.png`, alt: "Automatización Wallet en iOS 26", caption: "iOS 26" },
            {
              src: `${ios26}/04-transaccion-ios18.png`,
              alt: "Automatización Transacción en iOS 18",
              caption: "iOS 18 o anterior",
            },
          ],
        },
        {
          title: "Selecciona tus tarjetas y las opciones",
          body: "Elige las tarjetas que quieres registrar, marca <strong>Ejecutar de inmediato</strong> y dale <strong>Siguiente</strong>.",
          media: [{ src: `${ios26}/05-tarjetas.png`, alt: "Opciones Ejecutar de inmediato y Notificar al ejecutar" }],
        },
        {
          title: "Crea un nuevo atajo",
          body: "Selecciona la opción <strong>Crear nuevo atajo</strong>.",
          media: [{ src: `${ios26}/07-nuevo-atajo.png`, alt: "Opción Crear nuevo atajo" }],
        },
        {
          title: "Agrega la acción de Spent",
          body: "En <strong>Buscar acciones</strong>, escribe <em>Spent</em> y selecciona la acción para agregar el gasto.",
          media: [
            {
              src: `${ios26}/08-buscar-spent.mp4`,
              alt: "Buscando la acción de Spent en Atajos",
              type: "video",
            },
          ],
        },
        {
          title: "Usa el comercio como nombre",
          body: "En <strong>Nombre</strong>, toca <strong>Seleccionar variable</strong> y elige <strong>Entrada de atajo</strong>. Luego toca <strong>Entrada de atajo</strong> y selecciona <strong>Comercio</strong>.",
          media: [{ src: `${ios26}/09-nombre.png`, alt: "Nombre configurado con la variable Comercio" }],
        },
        {
          title: "Usa la cantidad como monto",
          body: "En <strong>Monto</strong>, toca <strong>Seleccionar variable</strong> y elige <strong>Entrada de atajo</strong>. Luego toca <strong>Entrada de atajo</strong> y selecciona <strong>Cantidad</strong>.",
          media: [{ src: `${ios26}/10-monto.png`, alt: "Monto configurado con la variable Cantidad" }],
        },
        {
          title: "Guarda y listo",
          body: "Toca el check ✔︎ arriba a la derecha. A partir de ahora, cada pago con Apple Pay se registra solo en Spent.",
          media: [{ src: `${ios26}/11-listo.png`, alt: "Automatización terminada" }],
        },
      ],
    },
  ],
};

const gpay = "/images/spent/tutoriales/google-pay";

export const googlePayTutorial: Tutorial = {
  slug: "google-pay",
  title: "Registra tus gastos automáticamente con Google Pay",
  summary:
    "Dale acceso a Spent a las notificaciones de Google Pay para que, justo después de pagar, te sugiera agregar el gasto con el comercio y el monto.",
  icon: "/images/spent/tutoriales/icon-google-pay.png",
  platform: "Android",
  versions: [
    {
      id: "android",
      label: "Android",
      note: "Spent solo lee las notificaciones del app de Google Pay para detectar el comercio y el monto. Según cómo Google Pay redacte la notificación, el dato puede no ser exacto, así que revísalo antes de guardarlo.",
      steps: [
        {
          title: "Abre la detección automática de Google Pay",
          body: "En Spent, abre <strong>Detección automática de Google Pay</strong>.",
          media: [{ src: `${gpay}/01-deteccion.webp`, alt: "Pantalla Detección automática de Google Pay en Spent" }],
        },
        {
          title: "Activa el interruptor y permite las notificaciones",
          body: "Activa <strong>Activar detección automática de Google Pay</strong>. Si Android te pregunta si Spent puede enviarte notificaciones, toca <strong>Permitir</strong>: así es como Spent te avisa de cada pago.",
          media: [{ src: `${gpay}/02-permitir-notificaciones.webp`, alt: "Diálogo para permitir que Spent envíe notificaciones" }],
        },
        {
          title: "Busca Spent en el acceso a notificaciones",
          body: "Se abre la pantalla <strong>Controlar, responder y leer notificaciones</strong>. Baja hasta la sección <strong>Sin permiso</strong> y toca <strong>Spent</strong>. Si no se abre sola, usa <strong>Abrir configuración de acceso a notificaciones</strong> en Spent.",
          media: [{ src: `${gpay}/03-lista.webp`, alt: "Lista de apps con acceso a notificaciones, con Spent en Sin permiso" }],
        },
        {
          title: "Si el interruptor sale gris, desbloquéalo",
          body: "Algunos teléfonos bloquean este permiso y muestran <em>Controlada por configuración restringida</em> o <em>A la app se le negó el acceso</em>. Para desbloquearlo, ve a <strong>Configuración › Apps › Spent</strong>, toca el menú <strong>⋮</strong> arriba a la derecha y elige <strong>Permitir configuración restringida</strong>. Luego regresa a esta pantalla.",
          media: [
            { src: `${gpay}/04-restringida.webp`, alt: "Permiso de notificaciones controlado por configuración restringida", caption: "Interruptor bloqueado" },
            { src: `${gpay}/05-acceso-negado.webp`, alt: "Aviso: a la app se le negó el acceso", caption: "Aviso al tocarlo" },
          ],
        },
        {
          title: "Permite el acceso a las notificaciones",
          body: "Activa <strong>Permitir acceso a las notificaciones</strong> y confirma con <strong>Permitir</strong>.",
          media: [{ src: `${gpay}/06-permitir-acceso.webp`, alt: "Diálogo para permitir que Spent tenga acceso a las notificaciones" }],
        },
        {
          title: "Deja solo lo necesario (opcional)",
          body: "Spent solo necesita <strong>Notificaciones</strong> y <strong>Silencio</strong>. Puedes desmarcar <strong>Tiempo real</strong> y <strong>Conversaciones</strong> si prefieres que no lea esas.",
          media: [{ src: `${gpay}/07-permisos.webp`, alt: "Permisos de notificaciones con Tiempo real y Conversaciones desmarcados" }],
        },
        {
          title: "Regresa a Spent y paga como siempre",
          body: "Vuelve a Spent con el interruptor activado. La próxima vez que pagues con Google Pay, Spent te va a preguntar si quieres registrar el gasto.",
          media: [{ src: `${gpay}/08-listo.webp`, alt: "Detección automática de Google Pay activada en Spent" }],
        },
      ],
    },
  ],
};

export const spentTutoriales: Tutorial[] = [applePayTutorial, googlePayTutorial];
