# Ocean Gold — Landing Page

Joyería de autor en Miami, FL. Reparación, transformación y personalización con 23 años de oficio.

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Motion (Framer Motion) · React Three Fiber · Vercel Analytics · Vercel Blob · GoHighLevel.

---

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Comandos disponibles:

```bash
npm run dev      # servidor de desarrollo
npm run build    # build de producción
npm run start    # servir el build
npm run lint     # ESLint
```

---

## Variables de entorno

Crear `.env.local` en la raíz con los siguientes valores (también deben existir en Vercel para producción):

```env
# Webhook de GHL al que se envían los leads del formulario
GHL_WEBHOOK_URL=

# URL del calendario de booking de GHL (iframe embed)
NEXT_PUBLIC_GHL_CALENDAR_URL=

# Número de WhatsApp de Ocean Gold Miami (formato: 1XXXXXXXXXX, sin "+" ni espacios)
NEXT_PUBLIC_WHATSAPP_NUMBER=

# Token de Vercel Blob para storage de fotos del formulario
BLOB_READ_WRITE_TOKEN=

# URL canónica del sitio (sin barra final)
NEXT_PUBLIC_SITE_URL=https://oceangold.example.com
```

> Las claves con prefijo `NEXT_PUBLIC_` se exponen al cliente. El resto solo se usan en server-side / route handlers.

---

## Prerrequisitos en GoHighLevel

**Antes del primer deploy a producción**, estos elementos deben existir en la subcuenta GHL de Ocean Gold. Si faltan, el webhook no podrá mapear los datos del lead y el flujo de seguimiento automático no se dispara.

### Tag
- `Landing-OceanGold` — se aplica a cada contacto creado desde la landing.

### Custom Fields (nivel contacto)
| Label en GHL | Tipo | Mapea desde (payload key) | Descripción |
|---|---|---|---|
| `feeling` | Single-line text | `feeling` | Sentimiento elegido en el quiz: Amor, Orgullo, Seguridad o Estatus. Clave técnica usada en el payload del webhook. |
| `Sentimiento` | Single-line text | `feeling` | Espejo del campo anterior con label humano en español. Independiente del campo "Respuestas Quiz" para permitir filtrado y segmentación directa por sentimiento en GHL UI sin tener que parsear JSON. |
| `service` | Dropdown | `service` | Valores: `reparacion`, `transformacion`, `personalizacion`, `mantenimiento`, `armado`, `diagnostico`. |
| `photoUrl` | URL o Single-line text | `photoUrl` | URL pública de la foto subida a Vercel Blob. |
| `quizAnswers` | Multi-line text | `quizAnswers` | JSON serializado con todas las respuestas del quiz (excluye `feeling` para mantenerlo independiente y filtrable). |

### Pipeline
- **Nombre**: `Ocean Gold Leads`
- **Etapas**:
  1. `Persona Interesada` (etapa inicial)
  2. `Cita Agendada`

### Workflow
**Nombre**: `Recepción Landing Ocean Gold`

Debe escuchar el webhook URL configurado en `GHL_WEBHOOK_URL` y ejecutar:

1. Crear contacto con los datos recibidos en el payload.
2. Aplicar tag `Landing-OceanGold`.
3. Mapear custom fields: `feeling` → ambos `feeling` y `Sentimiento`; `service` → `service`; `photoUrl` → `photoUrl`; `quizAnswers` → `quizAnswers`.
4. Mover contacto a etapa `Persona Interesada` del pipeline `Ocean Gold Leads`.
5. **Trigger separado**: mover a `Cita Agendada` cuando se detecte booking en el calendario asociado.
6. **Flujo de seguimiento**: si el contacto permanece en `Persona Interesada` 10–20 min sin agendar, enviar mensaje automático de WhatsApp invitando a hablar con un asesor.

---

## Estructura del proyecto

```
src/
  app/                       # App Router (layout, page, route handlers)
    api/lead/                # POST → Vercel Blob + webhook GHL
  components/
    sections/                # Secciones de la landing
    ui/                      # Primitivos reutilizables (Button, Card, Chip…)
  lib/
    analytics.ts             # track() fire-and-forget a Vercel Analytics
    constants.ts             # Copy, servicios, testimonios, env vars
    ghl.ts                   # postLead con retry y queue
    motion.ts                # Variants compartidas de Framer Motion
    schema.ts                # Builders JSON-LD
    utils.ts                 # cn() merge de clases Tailwind
  styles/                    # globals.css
legacy/                      # Snapshot de la landing v1 (HTML/CSS)
design-system.md             # Principios UI/UX y catálogo de eventos
```

---

## Conversion tracking

13 eventos custom enviados a Vercel Analytics. Ver `design-system.md` sección **Conversion Tracking** para la lista completa.

`navigator.doNotTrack === "1"` desactiva todo el tracking automáticamente.

---

## Deploy

Plataforma destino: **Vercel**.

1. Conectar el repo en Vercel.
2. Setear todas las variables de entorno listadas arriba en *Project Settings → Environment Variables*.
3. Confirmar con el equipo de GHL que los prerrequisitos están listos.
4. Verificar end-to-end con `design-system.md` checklist.
