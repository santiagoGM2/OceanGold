/**
 * Constantes globales de Ocean Gold.
 * Los valores con `?? ""` se rellenan vía variables de entorno antes de deploy.
 * Ver README.md para la lista completa de env vars requeridas.
 */

export const BUSINESS = {
  name: "DuJoyero",
  tagline: "El Renacimiento de tu Joya",
  location: "Miami, FL",
  address: {
    street: "111 NE 1st Street, Suite 313",
    neighborhood: "Downtown Miami",
    city: "Miami",
    region: "FL",
    country: "US",
    full: "111 NE 1st Street, Suite 313, Downtown Miami, FL",
  },
  hours: {
    open: "12:00",
    close: "19:00",
    label: "12:00 PM – 7:00 PM",
  },
  yearsOfCraft: 23,
  storiesRecovered: 2000,
  averageRating: 4.9,
  diagnosticDuration: "10 a 20 minutos",
  differentiators: [
    "23 años de experiencia artesanal",
    "Diagnóstico gratuito virtual o presencial (10 a 20 minutos)",
    "Especialistas en joyería cubana y latina en 10K, 14K, 18K, 22K y 24K",
    "Garantía explícita por escrito",
    "Servicio express disponible",
    "Comunicación proactiva en cada etapa: foto al recibir la pieza, aviso al comenzar el trabajo y notificación al terminar",
  ],
} as const;

// Número real de DuJoyero Miami: +1 (305) 413-3739 — formato wa.me E.164 sin "+".
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "13054133739";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://oceangold.example.com";

export const SERVICES = [
  {
    id: "reparacion",
    index: "01",
    name: "Reparación",
    tagline: "Mi joya favorita se rompió",
    desc: "Protegemos tu historia. Reparamos uñas flojas, soldaduras, cierres desgastados y reconstrucciones complejas con técnicas de orfebrería tradicional.",
    icon: "wrench",
  },
  {
    id: "transformacion",
    index: "02",
    name: "Transformación",
    tagline: "Tengo oro antiguo y quiero algo moderno",
    desc: "Tu herencia evoluciona contigo. Fundimos el oro original conservando su valor emocional y diseñamos una pieza nueva que sí encaja con quién eres hoy.",
    icon: "shuffle",
  },
  {
    id: "personalizacion",
    index: "03",
    name: "Personalización",
    tagline: "Quiero crear una pieza desde cero",
    desc: "Desde la idea hasta la pieza terminada. Te guiamos en metal, piedras, forma y simbolismo para crear una joya verdaderamente tuya.",
    icon: "pencilRuler",
  },
  {
    id: "mantenimiento",
    index: "04",
    name: "Pre-polish & Mantenimiento",
    tagline: "Mi joya está opaca o sin brillo",
    desc: "Devolvemos el brillo original a piezas que el tiempo apagó. Pulido, baño y restauración fina sin perder el carácter de la pieza.",
    icon: "sparkles",
  },
  {
    id: "armado",
    index: "05",
    name: "Armado",
    tagline: "Se me desarmó o perdió una pieza",
    desc: "Reconstruimos cadenas, broches, engastes y piezas múltiples cuidando que el resultado final preserve la integridad estructural y estética.",
    icon: "puzzle",
  },
  {
    id: "diagnostico",
    index: "06",
    name: "Diagnóstico",
    tagline: "Quiero que un experto me diga qué tiene",
    desc: "Un maestro joyero examina tu pieza, identifica daños no evidentes y te explica qué se puede hacer, qué no, y qué te conviene priorizar.",
    icon: "searchCheck",
  },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];

export const FEELINGS = ["Amor", "Orgullo", "Seguridad", "Estatus"] as const;
export type Feeling = (typeof FEELINGS)[number];

export const STATS = [
  { value: BUSINESS.yearsOfCraft, suffix: "", label: "Años de oficio artesanal" },
  { value: BUSINESS.storiesRecovered, prefix: "+", label: "Historias recuperadas" },
  {
    value: BUSINESS.averageRating,
    decimals: 1,
    label: "Calificación promedio",
  },
] as const;

export const TESTIMONIALS = [
  {
    id: "elena",
    name: "Elena R.",
    role: "Cliente que protegió su legado",
    quote:
      "Tenía mi anillo de compromiso con una uña floja y me daba pánico perder el diamante, así que lo guardé por meses. En la asesoría entendí que no solo reparaban un anillo, protegían mi historia. Ahora no dejo de usarlo.",
  },
  {
    id: "claudia",
    name: "Claudia M.",
    role: "Cliente que evolucionó su herencia",
    quote:
      "Tenía joyas de mi abuela que eran hermosas pero no encajaban conmigo. Pensé que era 'malo' fundirlas, hasta que me mostraron que podía evolucionar su oro en un diseño que hoy me hace sentir empoderada y conectada con ella al mismo tiempo.",
  },
  {
    id: "javier",
    name: "Javier L.",
    role: "Cliente que redescubrió su patrimonio",
    quote:
      "Pensé que mi cadena no tenía arreglo. En la cita virtual me hicieron ver detalles que ningún joyero me habían explicado antes. No me vendieron una reparación, me hicieron descubrir el valor real de lo que ya tenía.",
  },
] as const;

export const COPY = {
  hero: {
    title: "No importa en qué estado está. Toda joya tiene un siguiente capítulo.",
    subtitle: "Porque lo que esa pieza representa para ti merece seguir brillando.",
    cta: "Quiero ser parte de estas historias",
  },
  beforeAfter: {
    eyebrow: "Antes y después",
    title: "El resultado habla por sí solo",
    hint: "Desliza para ver la transformación",
    cta: "Mi joya merece esto",
  },
  situations: {
    eyebrow: "Tu situación",
    title: "¿Cuál es tu caso?",
    cta: "No estás seguro cuál es tu caso, hablemos",
    waMessage:
      "Hola, quiero hablar con un asesor sobre mi joya. No estoy seguro qué necesita.",
  },
  testimonials: {
    eyebrow: "Espejo de evolución",
    title: "Historias que volvieron a brillar",
    cta: "Quiero vivir esta experiencia",
  },
  alert: {
    eyebrow: "Alerta de conservación",
    title:
      "¿Sabías que un cierre desgastado es la razón #1 por la que se pierden las herencias familiares para siempre?",
    body: "No esperes a que el daño sea irreversible. Un diagnóstico a tiempo es la diferencia entre conservar tu historia o perderla.",
    localStat:
      "En Miami, más del 60% de las joyas familiares se pierden por daños que se pudieron reparar a tiempo.",
    cta: "Quiero proteger mi joya ahora",
  },
  form: {
    photo: {
      title: "Sube una foto de tu joya",
      titlePersonalizacion:
        "Sube una referencia o imagen de lo que tienes en mente (opcional)",
      analyzing: "Analizando estructura y valor emocional...",
    },
    aha: {
      title: "Foto recibida. Nuestros maestros joyeros ya pueden ver el potencial oculto en tu pieza.",
      subtitle: "Has dado el paso que el 90% de la gente posterga.",
      cta: "Continuar",
    },
    feeling: {
      question:
        "Si pudieras recuperar el brillo de esta joya hoy mismo, ¿qué sentimiento recuperas tú con ella?",
    },
    contact: {
      reassurance: (name: string) =>
        `Perfecto, ${name}. Ya tenemos todo lo que necesitamos para preparar tu diagnóstico. El siguiente paso es agendar unos minutos contigo, ya sea de forma virtual o en nuestras oficinas, para que un asesor pueda ver exactamente qué quieres hacer con tu joya y guiarte de la mejor forma. Es rápido, es gratuito y marca la diferencia.`,
    },
  },
  authority: {
    eyebrow: "Autoridad y estatus",
    title: "Por qué DuJoyero",
    points: [
      `+${BUSINESS.storiesRecovered.toLocaleString("es")} historias recuperadas`,
      "Expertos en evolución de oro y piedras preciosas",
      `${BUSINESS.yearsOfCraft} años de oficio artesanal en ${BUSINESS.location}`,
    ],
  },
  gift: {
    eyebrow: "El regalo perfecto",
    title: "Hay regalos que se vuelven herencia",
    body: "Una joya creada o restaurada a mano en nuestro taller no se queda en el momento — gana valor con cada año, con cada generación. Es el único regalo que se transforma en historia.",
    cta: "Diseñar el regalo perfecto",
    videoAlt: "Joya entregada como regalo perfecto en DuJoyero Miami",
  },
} as const;

/**
 * Mensaje de WhatsApp que se abre tras completar el formulario. Corto y
 * directo — el asesor ya tiene en el CRM todo el contexto (feeling, foto,
 * quiz), así que el mensaje sólo necesita iniciar la conversación.
 */
export function buildPostFormWhatsAppMessage(opts: {
  name?: string | null;
}): string {
  const firstName = (opts.name ?? "").trim().split(/\s+/)[0] || "";
  const greeting = firstName ? `Hola, soy ${firstName}.` : "Hola.";
  return `${greeting} Acabo de completar mi diagnóstico premium en DuJoyero y me gustaría activar mi acceso preferencial.`;
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
