# Ocean Gold — Design System & Conversion Tracking

Documento vivo. Lo mantenemos al día con cada cambio sustancial en tokens, primitivos o eventos de tracking.

---

## Polish Premium (Fase E.5)

Síntesis de cuatro skills consultadas y aplicadas en esta fase.

### De `nextlevelbuilder/ui-ux-pro-max-skill`
- **Breakpoints obligatorios**: 375 / 768 / 1024 / 1440 px. Auditados en cada sección.
- **Cursor pointer + focus visibles** en todos los interactivos. Cumplido en `Button`, `Chip`, cards, links.
- **Anti-pattern descartado**: AI gradients morados/rosas, emojis como iconos (usamos `lucide-react`).
- **WCAG AA 4.5:1 mínimo** en body, verificado oro-sobre-malachite.

### De `pbakaus/impeccable`
- **OKLCH** para color (ya usado en Fase A, validado).
- **Restraint + precision**: descartamos Three.js (228 KB) cuando demostró costar 35 pts Lighthouse; mantuvimos SVG vectorial que entrega el mismo wow factor con cero overhead.
- **Curvas easing no-default**: nada de `ease-in` puro. Custom curves por contexto (ver tabla abajo).
- **Polish del detalle**: focus states, loading patterns, validation feedback son first-class (no afterthought).
- **Strip unnecessary layers**: la Hero subtitle es ahora estática (sin `motion.p`) porque la animación palabra-por-palabra del título ya cuenta la historia.

### De `emilkowalski/skill` (Sonner / Vaul author)
- **Custom easings adoptados**:
  - Entering/exiting: `cubic-bezier(0.23, 1, 0.32, 1)` — usado en motion variants de las secciones.
  - On-screen movement: `cubic-bezier(0.77, 0, 0.175, 1)` — usado en transiciones entre form steps.
  - El brand easing `cubic-bezier(0.16, 1, 0.3, 1)` se mantiene para reveals de larga duración (>500 ms).
- **Duraciones <300 ms para UI utility** (button press, dropdowns, tooltips).
- **`transform: scale(0.97)` en `:active`** para todos los CTAs primarios (feedback táctil real).
- **Nunca animar `scale(0)` → 1**: empezar siempre en `0.95` mínimo. Aplicado al chip de sentimiento, al 60% del Alert, a los stats de Authority.
- **Solo animar `transform` y `opacity`** (GPU-accelerated). Todas las animaciones nuevas cumplen.
- **No animar acciones repetitivas** (teclado, command palettes). La validación del form no se anima.

### De `leonxlnx/taste-skill`
- **Asimetría > centrado**: Hero, Situations y Authority tienen contenido alineado al borde izquierdo del container, con el resto del viewport respirando.
- **Anti-slop**: removimos chunks innecesarios (Three.js), gradientes prefab, iconos genéricos.
- **Deliberate reduction + strategic amplification**: el "60%" del Alert es el único elemento que rompe la escala tipográfica con scale + glow — está estratégicamente amplificado.

### Tabla de easings adoptados

| Curva | Cuándo |
|---|---|
| `cubic-bezier(0.23, 1, 0.32, 1)` (Emil ease-out) | Entradas/salidas de elementos: cards, AHA reveal, form steps |
| `cubic-bezier(0.77, 0, 0.175, 1)` (Emil ease-in-out) | Movimientos persistentes: parallax, carousel transitions |
| `cubic-bezier(0.16, 1, 0.3, 1)` (brand `--ease`) | Reveals largos (>500 ms): hero stagger, scroll reveal de secciones |
| Spring `stiffness: 220, damping: 28` | Progress bar del form |

---

## Filosofía

Premium nivel agencia top de Miami. No plantilla. La landing tiene que transmitir 23 años de oficio artesanal en cada detalle visual: tipografía con historia (Cinzel), respiración generosa entre elementos, oro nunca chillón, oscuridad malachite que sugiere noche/lujo, y micro-interacciones que se sienten talladas a mano (no rebotadas).

Principios extraídos de UI/UX Pro Max y aplicados:

1. **Rhythm** — la composición respira. Espaciado base de 4/8px y secciones con `py-20` desktop / `py-12` móvil. Los textos respetan max-width legible (48ch en hero subtitle, 30ch en service descriptions).
2. **Jerarquía** — un solo H1 por página, H2 por sección. Eyebrow (label superior tracking-[0.4em]) → H2 → body → CTA. El ojo siempre sabe a dónde ir.
3. **Color con propósito** — el oro es acento, no fondo. El malachite (oklch ≈ 6.5% lightness, croma 0.018, hue 158) es el lienzo. Los contrastes oro sobre malachite alcanzan WCAG AA (verificado contra `coolors.co/contrast-checker`).
4. **Micro-interacciones legibles** — hover lift 4px + glow dorado suave. Transiciones 300–500ms con `cubic-bezier(0.16, 1, 0.3, 1)`. Nada rebota, todo se acomoda.
5. **Respeto al usuario** — `prefers-reduced-motion` desactiva todas las animaciones. `Do-Not-Track` desactiva analytics. Focus rings dorados accesibles siempre visibles con teclado.

---

## Paleta cruda (OKLCH)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `oklch(6.5% 0.018 158)` | Fondo principal malachite. |
| `--bg-1` | `oklch(10% 0.020 158)` | Superficie elevada 1 (cards). |
| `--bg-2` | `oklch(14% 0.022 158)` | Superficie elevada 2 (hover de cards). |
| `--gold` | `oklch(65% 0.096 72)` | Acento dorado base. |
| `--gold-l` | `oklch(74% 0.072 72)` | Hover/highlight dorado. |
| `--gold-d` | `oklch(50% 0.070 72)` | Dorado oscuro. |
| `--gold-dim` | `oklch(38% 0.045 72)` | Bordes y separadores. |
| `--champagne` | `oklch(86% 0.026 80)` | Wordmark, énfasis sutil en títulos. |
| `--ivory` | `oklch(94% 0.010 85)` | Texto fuerte (títulos). |
| `--ivory-2` | `oklch(78% 0.010 85)` | Texto secundario. |
| `--text` | `oklch(83% 0.010 85)` | Texto cuerpo. |

## Tokens semánticos

| Token | Mapea a | Cuándo usarlo |
|---|---|---|
| `surface-0` | Negro malachite sólido | Fondo del body. |
| `surface-1` | `--bg-1` | Cards, contenedores de form. |
| `surface-2` | `--bg-2` | Hover de cards. |
| `border-subtle` | `gold-dim` @ 18% | Separadores, bordes de cards. |
| `border-gold` | `gold` | Bordes activos, CTAs principales. |
| `text-default` | `--text` | Cuerpo. |
| `text-muted` | `ivory-2` | Texto secundario, labels. |
| `text-strong` | `ivory` | Títulos. |
| `accent-gold` | `gold` | Acentos, CTAs. |
| `accent-gold-soft` | `gold` @ 12% | Backgrounds sutiles selected. |
| `accent-gold-glow` | `gold` @ 30% | Box-shadow de hover/focus. |

Estos tokens se exponen a Tailwind v4 a través de `@theme inline` en `src/app/globals.css`, así que se usan como utility classes (`bg-surface-1`, `border-border-subtle`, `text-text-muted`, etc).

---

## Tipografía

| Familia | Pesos | Uso |
|---|---|---|
| **Cinzel** (serif) | 300, 400, 500, 600 | Títulos (h1, h2, h3), wordmark, números destacados. |
| **Jost** (sans) | 200, 300, 400, 500 + italic 200, 300 | Body, CTAs, labels, formulario. |

Cargadas vía `next/font/google` con `display: swap` y `adjustFontFallback: true`.

Escalas con `clamp()`:

- H1 hero: `clamp(2.4rem, 5.2vw, 6rem)`
- H2 sección: `clamp(2rem, 4vw, 3.5rem)`
- H2 alerta: `clamp(1.8rem, 3.4vw, 3rem)`
- Subtitle hero: `clamp(0.95rem, 1.6vw, 1.1rem)`
- Body: 16–18px
- Eyebrow: 0.67rem, `tracking-[0.4em]`, uppercase, weight 300

---

## Espaciado

Base 4px. Secciones de la landing usan `py-20 md:py-28`, `px-6 md:px-14`. Cards `p-8` desktop / `p-6` móvil. Gaps entre items `gap-6`, entre formulario steps `gap-8`.

---

## Easing

Único easing del proyecto: `cubic-bezier(0.16, 1, 0.3, 1)`. Expuesto como `--ease-brand` y en `src/lib/motion.ts` como constante `EASE_BRAND`.

Duraciones:
- Hover/state: 300ms
- Section reveal: 600–700ms
- Form step transition: 400–500ms

---

## Animación

Todas las animaciones viven en `src/lib/motion.ts` como `Variants` de Motion. Los componentes importan los variants en lugar de definir animaciones inline, para mantener coherencia.

- `fadeUp` — entrada de bloques de texto/cards.
- `fadeIn` — entrada simple sin desplazamiento (modales, overlays).
- `staggerContainer` — wrappers de grids para animar hijos secuencialmente.
- `lift` — hover de cards interactivas.
- `slideRight` — transición entre pasos del formulario.
- `viewport` — config compartida (`{ once: true, amount: 0.2 }`) para `whileInView`.

Todas respetan `useReducedMotion()` cuando se aplican en componentes cliente.

---

## Primitivos UI

- `Button` — variantes `gold-outline`, `gold-filled`, `ghost`. Tamaños `sm`, `md`, `lg`. También `ButtonLink` que detecta URLs externas y aplica `target="_blank"` con `rel="noopener noreferrer"`.
- `Card` — superficie base con borde sutil. Prop `interactive` añade hover lift + glow + cursor pointer.
- `Chip` — chip seleccionable single-select, accesible vía `aria-pressed`. Para los 4 sentimientos del quiz.

---

## Accesibilidad (WCAG AA)

- Contraste mínimo 4.5:1 en body, 3:1 en títulos large.
- Oro (`oklch(65% 0.096 72)`) sobre malachite (`oklch(6.5% 0.018 158)`) — contraste ~7:1 (verificado).
- Texto cuerpo `--text` (oklch 83% l) sobre malachite — contraste ~10:1.
- Focus rings dorados siempre visibles (`outline: 2px solid var(--accent-gold); outline-offset: 3px;`).
- Imágenes con `alt` descriptivo (nunca decorativo en contexto informativo).
- Chips con `aria-pressed` para estado seleccionado.

---

## Conversion Tracking

13 eventos custom enviados a Vercel Analytics. Cada uno disparado fire-and-forget desde `src/lib/analytics.ts`. Si `navigator.doNotTrack === "1"`, no se envía nada.

| # | Evento | Props | Cuándo se dispara |
|---|---|---|---|
| 1 | `landing_viewed` | — | Mount de `<LandingTracker>` en `app/page.tsx`. Una vez por sesión. |
| 2 | `cta_clicked` | `{ section, label }` | Cualquier elemento con `data-cta-section` y `data-cta-label` clickeado. Delegación global. |
| 3 | `before_after_interacted` | — | Primer pointer/touch del slider B/A (debounced 500ms). |
| 4 | `situation_selected` | `{ service }` | onClick de cualquiera de las 6 cards de Situaciones. |
| 5 | `form_opened` | — | Mount de `<LeadForm>`. |
| 6 | `form_step_completed` | `{ step_number, step_name }` | Avance exitoso de cada step 1-4. |
| 7 | `form_step_abandoned` | `{ step_number, time_spent_ms }` | Listener `beforeunload` con timer por step. |
| 8 | `aha_reveal_continued` | — | Click en botón "Continuar" del Step2b. |
| 9 | `feeling_selected` | `{ feeling }` | Click en chip de sentimiento. |
| 10 | `lead_submitted_to_ghl` | `{ success, retry_count }` | Respuesta de `/api/lead`. |
| 11 | `calendar_loaded` | — | onLoad del iframe GHL. |
| 12 | `booking_completed` | `{ day, time }` | Callback `postMessage` del iframe GHL. |
| 13 | `whatsapp_redirect` | — | Justo antes de `window.location.href = waUrl`. |

### Dashboards sugeridos (para el equipo de marketing)

- **Funnel principal**: `landing_viewed` → `form_opened` → `form_step_completed (step 4)` → `booking_completed` → `whatsapp_redirect`. Mide drop-off entre pasos.
- **Abandono por step**: `form_step_abandoned` agrupado por `step_number`. Identifica dónde se pierde más gente.
- **Servicios más demandados**: `situation_selected` agrupado por `service`. Informa decisiones de catálogo.
- **Sentimiento dominante**: `feeling_selected` agrupado por `feeling`. Informa decisiones de copy y marketing.
- **CTAs efectivos**: `cta_clicked` agrupado por `section + label`. Identifica qué CTAs convierten.

---

## Checklist de verificación end-to-end

Marcar antes de cada deploy a producción:

- [ ] Flujo completo: landing → form → foto → AHA → quiz → sentimiento → contacto → calendario → WhatsApp.
- [ ] Las 4 ramas del quiz funcionan (Reparación/Mantenimiento/Armado, Transformación, Personalización, Diagnóstico).
- [ ] `feeling` persiste y llega a GHL como custom field + a WhatsApp final.
- [ ] Mensaje WhatsApp final tiene día/hora/sentimiento URL-encoded (o fallback genérico).
- [ ] Microinteracción AHA aparece en orden correcto y respeta `prefers-reduced-motion`.
- [ ] Jewel3D carga en desktop ≥1024px, degrada a WebP en móvil/tablet, bundle ≤80kb gz.
- [ ] BeforeAfterSlider funciona con touch real en iOS Safari y Android Chrome.
- [ ] Lighthouse ≥ 95 en Performance/Accessibility/Best Practices/SEO.
- [ ] Schema validator pasa sin errores (`validator.schema.org` y `search.google.com/test/rich-results`).
- [ ] Recovery flow: abandonar en step 4 → contacto en GHL → WhatsApp de seguimiento tras 10–20 min.
- [ ] `prefers-reduced-motion` desactiva todas las animaciones.
- [ ] WCAG AA verificado con Lighthouse Accessibility ≥ 95.
- [ ] Bugs v1 corregidos: "Miami, FL" en todo el sitio; contador "+2.000" sin flicker; WhatsApp con número real.
- [ ] 13 eventos custom llegan a Vercel Analytics con props correctas.
- [ ] DNT verificado: con `navigator.doNotTrack === "1"`, no se envía nada.
- [ ] Prerrequisitos GHL confirmados (tag, 4 custom fields, pipeline `Ocean Gold Leads`, workflow `Recepción Landing Ocean Gold`).
