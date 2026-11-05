# MASTER PROMPT — Stitch · Paltazo (PWA de control de gastos)

> **Cómo usar:** este archivo es el prompt maestro. Pégalo en Stitch (`generate_screen_from_text`) **una vez por pantalla**, cambiando solo el bloque `## PANTALLA A GENERAR`.
> **Precondición:** el proyecto Stitch debe tener cargada la design system `stitch/paltazo/DESIGN.md` (tokens + `styleGuidelines`). Si es el primer prompt, sube primero ese DESIGN.md con `upload_design_md` para que Stitch genere/acepte la design system, y luego reusa el `designSystem` id devuelto en las siguientes pantallas.
>
> **Fuentes:** `docs/necesidad_proyecto_paltazo.md`, `docs/stack_tecnologico_paltazo.md`, `docs/use-case/**` (CU-001..CU-034), `docs/use-case/USER_STORY_MAP.md` (US-001..US-027), `docs/bugs/**` (BUG-001..009), `docs/architecture/CHECKPOINT_2026_10_29.md`, `orch/product-brief-paltazo.md`, `docs/design/paltazo_web_design.md`, `docs/design/paltazo_web_desing_fix.md`.

---

## BLOQUE 1 — DESIGN SYSTEM (usar tal cual, no regenerar)

```text
DISIGN SYSTEM OBLIGATORIO — Paltazo
Usa EXCLUSIVAMENTE el design system "Paltazo" ya cargado en este proyecto (DESIGN.md).
NO propongas ni generes una paleta, tipografía o escala de espaciado nueva. NO inventes colores, sombras, bordes, gradientes ni componentes que no estén en los tokens.

Tokens:
- primary: #42690e   (verde palta oscuro, acciones principales)
- primary-container: #8fbc5a (verde palta fresco, acentos y barra de progreso)
- secondary: #396a1c (verde profundo, chips y chips activos)
- secondary-container: #b9f393
- surface: #F9FAF7 (fondo de app)
- surface-container-low: #f6f3f2 (cards secundarias)
- surface-container-lowest: #ffffff (cards elevadas, tablas)
- surface-container: #f0eded, -high: #eae7e7, -highest: #e5e2e1 (tracks, chips)
- on-surface: #1c1b1b (texto principal)
- on-surface-variant: #43493a
- text-secondary: #6B7280 (texto secundario)
- outline: #737969, outline-variant: #c3c9b6 (bordes de input)
- warning: #F59E0B (alerta 80%)
- danger: #EF4444 (alerta 100% / >100%)
- error-container: #ffdad6 / on-error-container: #93000a (botón destructivo en modal)
- tertiary: #904181 (acento raro, no lo uses salvo indicación)
- Iconos: Google Material Symbols Outlined (no emojis sueltos como iconografía de UI; los emojis SÍ se usan como iconos de categoría).

Tipografía: Inter en todos los niveles.
  headline-xl 36/44 700 · headline-lg 28/36 600 · headline-md 20/28 600 · headline-sm 18/24 600
  body-lg 16/24 400 · body-md 14/20 400 · body-sm 12/16 400
  label-lg 14/20 600 · label-md 12/16 600 · label-sm 11/14 500

Espaciado (base 8px): space-xs 4 · space-sm 8 · space-md 16 · space-lg 24 · space-xl 32 · gutter 16.
Radios: cards y modales 16-24px (rounded-2xl / rounded-3xl), botones y pills 9999px (rounded-full), inputs rounded-xl.

Reglas de estilo:
- Mobile-first. Viewport mobile de referencia: 390x844 (iPhone 14). Máximo 640px de contenido (max-w-xl), padding horizontal 16px (px-gutter).
- En mobile usa la escala de tipografía MOBILE: headline-xl-mobile 30/38 700 · headline-lg-mobile 24/32 600 · body-lg 16/24 · body-md 14/20 · body-sm 12/16 · label-lg 14/20 600 · label-md 12/16 600 · label-sm 11/14 500. La escala desktop (headline-xl 36/44, headline-lg 28/36, headline-md 20/28, headline-sm 18/24) es SOLO desktop.
- Desktop 1440x900: SIDEBAR FIJA a la izquierda (240px) con navegación, contenido principal a la derecha. Cambia SOLO el layout, nunca la identidad visual.
- Mismos componentes, colores y espaciado en mobile y desktop.
- Tarjetas: bg-surface-container-low o bg-surface-container-lowest, rounded-2xl/3xl, padding 16-24px, sombra muy suave (shadow-sm).
- Botón primario: rounded-full bg-primary text-on-primary font-semibold, hover bg-secondary.
- Botón secundario/ghost: rounded-full bg-surface-container-high text-on-surface.
- Inputs: bg-surface-container-lowest, border 1px outline-variant, rounded-xl, h-11/h-12, focus ring en primary.
- Pills/chips: rounded-full bg-surface-container; chip activo bg-primary-container text-on-primary-container.
- Iconografía de categoría: círculo o cuadrado redondeado 40-44px con fondo tintado del color de la categoría (patrón `bg-{color}-500/15 text-{color}-600`) y emoji de 20-22px centrado.
- Iconografía de UI: Material Symbols Outlined, 18-22px.
- Aria-labels en todo botón solo-icono. Foco visible. Contraste AA.
- Textos EXACTOS en español (Perú). No inventes ni traduzcas copys.
- Áreas táctiles: todo botón o control interactivo tiene un área de toque mínima de 44x44px en mobile.
```

---

## BLOQUE 1B — SHELL MOBILE (obligatorio en TODAS las pantallas mobile)

> Este bloque es **la diferencia real** entre mobile y desktop. Aplícalo a cada pantalla mobile. Si una pantalla dice "sin bottom nav" (P01, P02, P03, P04), se respetan solo las partes que apliquen.

```text
SHELL MOBILE OBLIGATORIO — Paltazo (aplica a toda pantalla mobile, 390x844)

NAVEGACIÓN INFERIOR (bottom nav): 
- Barra fija al fondo: fixed bottom-0 left-0 right-0 z-50, bg-surface/90 backdrop-blur-xl, sombra sutil superior (shadow-[0_-2px_12px_rgba(0,0,0,0.04)]).
- Safe area: padding-bottom env(safe-area-inset-bottom). 
- Altura de la barra 64px (h-16), contenido centrado con max-w-xl mx-auto y px-gutter.
- 3 o 4 tabs,Distribution justify-around. Cada tab: columna con icono Material Symbols 24px arriba y label-sm 11px debajo; área táctil mínimo 56x44px.
  - Tabs: Inicio (home) · Gastos (receipt_long) · Ingresos (trending_up) · Ajustes (settings).
  - Tab activo: text-primary font-bold. Tab inactivo: text-text-secondary, hover text-on-surface.
  - En P16 (Estados vacíos) NO muestres bottom nav: es un board de componentes, no una pantalla de la app.

HEADER FIJO (top bar): en las pantallas con navegación (P05..P10):
- fixed top-0 w-full z-50, bg-surface/85 backdrop-blur-xl, sombra inferior sutil (shadow-[0_1px_8px_rgba(0,0,0,0.03)]).
- Safe area: padding-top env(safe-area-inset-top).
- Altura 64px (h-16), px-gutter, flex items-center justify-between.
- Izquierda: logo 🥑 + "Paltazo" en headline-sm font-bold text-secondary tracking-tight. En pantallas de segundo nivel (P06, P07, P10), la izquierda es un icon-button "←" (atrás, aria-label "Volver", 44x44) y el título va a su derecha.
- Derecha: badge de conexión + avatar de usuario 40px circular con aria-label "Perfil de usuario".
- El contenido arranca con padding-top 64px (pt-16) para no quedar bajo el header.

FAB (botón flotante de acción):
- Solo en P05 (Dashboard), P06 (Gastos) y P08 (Ingresos).
- fixed bottom-20 right-4 (o right-gutter), z-40, 56x56 (w-14 h-14), rounded-full, bg-primary, sombra (shadow-lg), icono Material Symbols "add" 28px en on-primary. aria-label "Agregar gasto" / "Agregar ingreso".
- NO aparece en P07, P09 (ya estás en el formulario), P10, P01..P04, ni en los modales P11..P15, ni en P16/P17.
- Debe quedar POR ENCIMA de la bottom nav (bottom-20 = 80px, la nav ocupa los últimos 64px).

SAFE AREAS Y SCROLL:
- Todo el contenido scrolleable lleva padding-bottom para que la bottom nav no lo tape: pb-24 en el caso normal; pb-32 si hay FAB.
- Respeta env(safe-area-inset-bottom) en la bottom nav y env(safe-area-inset-top) en el header.
- overscroll-behavior-y: none en body.

NAVEGACIÓN INFERIOR vs SIDEBAR:
- En mobile NO existe sidebar. La navegación es la bottom nav. La única excepción: P04 (setup) y P02/P03/P01 son pantallas sin navegación (son pre-app), van centradas sin bottom nav ni header fijo.

DIFERENCIAS DE CONTENIDO mobile vs desktop (no solo de layout):
- Tablas → cards apiladas (nunca una tabla estrecha en mobile).
- Filtros en línea → filtros en un bloque apilado.
- Acciones de fila (iconos) → icon-buttons 44x44 dentro de la card.
- Colores, tipografía, radios, espaciado, textos, estados: IDÉNTICOS. Cambia solo el layout y la densidad de información.
```

---

## BLOQUE 1C — SHELL DESKTOP (obligatorio en TODAS las pantallas desktop)

```text
SHELL DESKTOP OBLIGATORIO — Paltazo (aplica a toda pantalla desktop, 1440x900)

SIDEBAR:
- Fija a la izquierda, 240px de ancho, altura completa (h-screen), sticky top-0.
- Fondo bg-surface (misma superficie que el contenido, sin borde vertical innecesario) o bg-surface-container-low.
- Padding: p-space-lg (24px). Layout interno: flex flex-col h-full.
- Arriba (mb-space-xl): logo 🥑 + "Paltazo" en headline-sm font-bold text-on-surface tracking-tight.
- Navegación (flex-1, flex-col gap-space-xs): 4 items, cada uno button flex items-center gap-3 px-4 py-3 rounded-xl text-left, con icono Material Symbols 22px + label-lg.
  - Items: Inicio (home) /dashboard · Gastos (receipt_long) /dashboard/expenses · Ingresos (trending_up) /dashboard/incomes · Ajustes (settings) /dashboard/settings.
  - Item activo: bg-primary-container text-on-primary-container font-semibold.
  - Item inactivo: text-text-secondary hover:bg-surface-container-high hover:text-on-surface.
- Pie (pt-space-md border-t border-surface-container-high): botón "🚪 Cerrar sesión" (flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-danger/10 hover:text-danger) y debajo "Paltazo v1.0.0" en body-sm text-text-secondary px-4.
- Excepción: P01, P02, P03 y P04 NO llevan sidebar (son pantallas pre-app, centradas).

CONTENIDO:
- A la derecha de la sidebar, área principal con padding md:px-space-xl (32px).
- Grid de 2 columnas en las pantallas de contenido denso (P05, P10): md:grid-cols-2 con gap-space-lg, y las secciones anchas (presupuestos, monedas, categorías) ocupan md:col-span-2.
- Contenido máx 1200px centrado dentro del área principal.
- Sin header fijo en desktop: el saludo/título va dentro del contenido con padding-top md:pt-space-xl.
- La bottom nav y el FAB NO existen en desktop. En su lugar, la acción principal es un botón inline (rounded-full bg-secondary text-on-secondary px-4 py-2 label-md font-semibold) en el header del contenido.
- Sin safe areas (no hay notch en desktop).

DIFERENCIA CON MOBILE: el contenido, los textos, los colores, los estados y los componentes son los MISMOS. Solo cambia el layout (sidebar en vez de bottom nav, tabla en vez de cards, acciones inline en vez de FAB).
```

---

## BLOQUE 2 — CONTEXTO DE PRODUCTO Y REGLAS FUNCIONALES

```text
CONTEXTO DE PRODUCTO — Paltazo
Paltazo es una Progressive Web App (PWA) offline-first de finanzas personales. Stack: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/Radix + Zustand + Dexie (IndexedDB) + TanStack Query + Supabase (Postgres + Auth + RLS + Edge Functions) + Vercel. Dominio: paltazo.vercel.app.

Problema: las personas anotan sus gastos tarde, en notas o chats, y descubren demasiado tarde que agotaron su presupuesto mensual.
Propuesta de valor: "Paltazo ayuda a detectar el 'paltazo' antes de que ocurra". Una sola pregunta: ¿cuánto he gastado este mes y cuánto me queda antes de pasar mi límite?

Usuario: persona que administra gastos personales, usa sobre todo el celular pero también desktop, a veces sin señal. Busca control práctico, no contabilidad.
Restricción de negocio: costo operativo ~$0/mes. Solo 3 monedas soportadas: S/, $, € (Soles, Dólares, Euros). Multi-moneda: presupuesto independiente por moneda; NUNCA se mezclan monedas ni se hacen conversiones.

REGLAS FUNCIONALES TRANSVERSALES (aplícalas a TODAS las pantallas):

R1 · Multi-moneda real. El usuario tiene un conjunto de monedas ACTIVAS (las que él agregó). Cada gasto, ingreso, presupuesto, alerta y total es POR MONEDA. El selector de moneda muestra solo monedas activas. La moneda principal (la primera que configuró) lleva badge "Principal". Si el usuario no tiene ninguna moneda configurada, la app muestra empty state: emoji 💰 (50% opacity), "No tienes monedas configuradas", "Agrega una moneda y configura tu presupuesto mensual para comenzar a registrar gastos", botón "⚙️ Configurar moneda" → /dashboard/settings.

R2 · Umbrales de alerta de presupuesto (por moneda, evaluados de forma reactiva):
   - ≥ 80%  → nivel warning  → barra bg-warning, badge bg-warning/15 text-warning, mensaje "Ritmo de gasto moderado en {moneda}"
   - ≥ 100% → nivel critical → barra bg-danger, badge bg-danger/15 text-danger, mensaje "Alcanzaste tu límite en {moneda}"
   - > 100% → nivel exceeded → barra bg-danger intenso, badge bg-danger/15 text-danger, mensaje "Has superado tu presupuesto en {moneda}"
   - < 80%  → nivel safe     → barra bg-primary, badge bg-primary/15 text-primary, mensaje "{moneda} dentro del límite"
   - Si monthlyLimit = 0 → SIN barra, SIN porcentaje, badge neutro bg-surface-container text-text-secondary, texto "Sin límite" y "{moneda} sin presupuesto configurado".
   - IMPORTANTE: el porcentaje NO se cape a 100. Puede mostrar 115%. La barra se dibuja al 100% pero el badge muestra el valor real (>100%).
   - Si ≥ 80% y hay días restantes → se sugiere el gasto diario recomendado: remaining / daysRemaining con 2 decimales.

R3 · Registro de gastos (CU-008). Mínimo: monto + categoría. Opcionales: descripción (máx 200 chars), fecha (default hoy, editable con picker nativo).
   - Monto: input numérico decimal, formato automático X.XX con separador de miles. Se ve un display formateado grande (el input real va invisible con opacity-0 detrás).
   - Presets rápidos: 15.00 / 30.00 / 50.00 / 100.00, cada uno etiquetado con el símbolo de la moneda seleccionada ("S/ 15.00").
   - Categorías: carrusel HORIZONTAL SCROLLEABLE de tiles circulares (icono emoji + label debajo), con la categoría actual resaltada. Al final del carrusel, un tile "+ Nueva" para crear categoría.
   - Moneda: toggles redondeados (pills) arriba; si el usuario solo tiene 1 moneda, se muestra solo esa.
   - Fecha: pill con `<input type="date">` nativo, muestra la fecha en español.
   - Botón principal: "✓ Guardar y Continuar" (gastos) — deshabilitado (opacity 50%) si monto ≤ 0 o vacío.
   - Botones secundarios en el header: "←" atrás y "🗑️ Limpiar".
   - Al guardar: toast fijo arriba centrado "✓ Gasto registrado" durante 2s, el formulario se limpia y la moneda vuelve a la inicial.
   - Si el usuario sale con cambios sin guardar (atrás o Cancelar): modal "¿Descartar cambios?" con botones "Cancelar" (neutro) y "Descartar" (rojo).
   - Si el usuario toca "+ Nueva" en el carrusel: modal inline "Nueva categoría" con campo Nombre (placeholder "Ej: Compras"), selector de Icono (grid de 16 emojis) y selector de Color (grid de 8 colores). Validación inline: nombre obligatorio, máx 30 chars, no duplicado (case-insensitive). Si guarda desde aquí, la categoría nueva queda preseleccionada y el usuario sigue en el formulario.

R4 · Edición inline (CU-010 gastos / CU-028 ingresos). NUNCA modal, NUNCA página nueva. La fila de tabla o la card se expande en el lugar.
   - Desktop: la fila de la tabla se reemplaza por inputs inline (monto, descripción, categoría como <select>, fecha) + botones "✓ Guardar" y "Cancelar".
   - Mobile: la card se expande con un grid de inputs (monto + fecha en 2 columnas, luego descripción, luego categoría <select>, luego botones).
   - La MONEDA NO es editable en la edición (el registro conserva su moneda original). No muestres selector de moneda en modo edición.
   - Guardar deshabilitado si monto ≤ 0. Cancelar vuelve a modo lectura sin persistir.
   - Al guardar, la tabla vuelve a modo lectura con los valores nuevos y los totales del mes se recalculan al instante.

R5 · Eliminación (CU-011 gastos / CU-029 ingresos). Modal de confirmación OBLIGATORIO para toda acción destructiva.
   - Modal centrado, backdrop con blur, fondo surface-container-lowest, rounded-2xl.
   - Título: "¿Eliminar gasto?" (o "¿Eliminar ingreso?"). Mensaje: "Esta acción no se puede deshacer."
   - Botones: "Cancelar" (bg-surface-container, neutro) y "Eliminar" (bg-error-container text-on-error-container).
   - Click en el backdrop cierra el modal. Click dentro del contenido no lo cierra.

R5b · Eliminación de CATEGORÍA (CU-026 gastos / CU-033 ingresos). Modal de ADVERTENCIA con el número de registros afectados, porque no se borran: se reasignan.
   - Título: "⚠️ Eliminar categoría".
   - Cuerpo: "Los {N} gastos asociados a {categoría} pasarán a 'Otros'. Esta acción no se puede deshacer." (o "Los {N} ingresos asociados a {categoría} pasarán a 'Otros'...").
   - N puede ser 0: la confirmación sigue siendo obligatoria (convención de acciones destructivas).
   - Los registros reasignados conservan monto, fecha, moneda y descripción; solo cambian de categoría.
   - Si la operación falla, no queda ningún registro huérfano: se reasignan y se borra juntos o no pasa nada.
   - La categoría "Otros" (protegida) NO ofrece botón de eliminar ni de editar: muestra un badge "Protegida".

R6 · Listados mensuales (CU-009 / CU-030). Solo mes actual. Orden descendente por fecha, agrupados por fecha.
   - Desktop: TABLA con columnas Fecha | Categoría | Descripción | Monto | Acciones (icono editar ✏️ y eliminar 🗑️, 36x36 hit area).
   - Mobile: CARDS agrupadas por fecha; cada grupo tiene un header sticky con la fecha y un SUBTOTAL en la moneda principal; dentro, cards con icono de categoría, label, descripción y monto.
   - Header superior de la pantalla: total de registros + total del mes vs límite ("12 gastos · S/ 1,200.00 de S/ 1,500.00").
   - Empty state: emoji 📭, "No hay gastos registrados" (o "No hay ingresos registrados"), CTA "+ Agregar primer gasto" (o "+ Agregar primer ingreso").

R7 · Offline-first (CU-019). Indicador de conexión en el header: cuando no hay red, un badge "Sin conexión · N cambios pendientes" con icono cloud_off; cuando hay red, "Sincronizado". Incluye una vista de estado de cola de sincronización en Ajustes ("Sincronización" con N pendientes, N sincronizados, N con error y botón "Sincronizar ahora").

R8 · Notificaciones push (CU-020). Bloque de consentimiento en Ajustes: "🔔 Alertas de presupuesto" con toggle y botón "Activar notificaciones". Incluir estado: permiso concedido / denegado / no solicitado. Cuando está activo, explicar que avisará al cruzar 80%, 100% y >100%.

R9 · Login social (CU-007). Botón "Continuar con Google" visible en /login con indicador visual de "No disponible por el momento" (deshabilitado). NO lo hagas funcional.

R10 · Modal de nueva categoría (CU-024 / CU-031). Modal con: input Nombre (máx 30 chars, placeholder "Ej: Compras"), selector de Icono = grid de 16 emojis (🍔 Comida/Restaurantes, 🚗 Transporte/Movilidad, 🏠 Hogar/Vivienda, 🎬 Entretenimiento/Ocio, 🛒 Compras/Supermercado, 💊 Salud/Farmacia, ✈️ Viajes/Vacaciones, 📚 Educación/Cursos, 💼 Trabajo/Negocio, 🐾 Mascotas, 🎁 Regalos/Donaciones, 💡 Servicios/Luz-Agua-Internet, ⚽ Deportes/Fitness, ☕ Café/Snacks, 📱 Tecnología/Suscripciones, 📦 Otros), selector de Color = grid de 8 colores Tailwind (red, orange, amber, emerald, teal, blue, indigo, purple, cada uno como swatch con fondo `bg-{color}-500/15 text-{color}-600`). Icono y color vienen preseleccionados. Para categorías de INGRESO el default es 💼 + emerald. Para categorías de GASTO el default es 🍔 + orange.

R11 · Módulos de categorías separados. Categorías de GASTO (tabla categories) y categorías de INGRESO (tabla income_categories) son independientes: un panel de gestión por cada uno, con su propio "+ Nueva categoría" y su propio catálogo. Nunca mezcles ambas listas en un mismo selector.

R12 · Protected routes: /login, /onboarding, /session-closed, /setup son públicas. Todo lo demás exige sesión. Usuario autenticado que entra a /login es redirigido a /. Usuario no autenticado en ruta protegida va a /login. Sin flash de contenido protegido.

R13 · Fechas en zona horaria LOCAL. Formato de saludo del dashboard: "{Weekday}, {day} de {month}" en español, con coma y sin año. Ejemplos: "Sábado, 31 de octubre", "Hoy, 4 de noviembre".

R14 · Empty states y estados de carga. Cada listado, cada dashboard y cada selector de categoría debe tener su empty state. Nunca muestres ceros falsos: si no hay datos, muestra el empty state, no "S/ 0.00".

R15 · Accesibilidad. HTML semántico, aria-label en botones de solo icono, foco visible en todos los controles, contraste mínimo AA, navegación por teclado, y en los modales el foco debe atraparse dentro del diálogo.
```

---

## BLOQUE 3 — MAPA COMPLETO DE PANTALLAS (las 17 que hay que generar)

```text
MAPA DE PANTALLAS — generates TODAS estas, en este orden. Cada una es un archivo separado.

P01 · /onboarding            Landing público (propuesta de valor)                     MOBILE + DESKTOP
P02 · /login                 Autenticación: ingreso, registro, recuperación, reset     MOBILE + DESKTOP
P03 · /session-closed        Sesión cerrada                                          MOBILE + DESKTOP
P04 · /setup                 Configuración inicial (moneda + presupuesto)             MOBILE + DESKTOP
P05 · /dashboard              Dashboard mensual multi-moneda + balance + 7 días        MOBILE + DESKTOP
P06 · /dashboard/expenses     Historial de gastos del mes (tabla / cards)              MOBILE + DESKTOP
P07 · /dashboard/add-expense  Nuevo gasto                                             MOBILE + DESKTOP
P08 · /dashboard/incomes      Historial de ingresos del mes                           MOBILE + DESKTOP
P09 · /dashboard/add-income   Nuevo ingreso                                           MOBILE + DESKTOP
P10 · /dashboard/settings     Ajustes: presupuestos, monedas, categorías, alertas     MOBILE + DESKTOP
P11 · Modal: eliminar         Confirmación destructiva (gasto e ingreso)               DESKTOP
P12 · Modal: descartar        Confirmación de descarte de cambios                     DESKTOP
P13 · Modal: nueva categoría  Alta/edición de categoría (gasto e ingreso)              DESKTOP
P14 · Modal: quitar moneda    Confirmación con conteo de datos a eliminar              DESKTOP
P15 · Modal: eliminar cat.    Advertencia de reasignación a "Otros"                     DESKTOP
P16 · Estados vacíos          Empty states de dashboard y listados                     MOBILE
P17 · Estados de alerta       Dashboard en nivel warning / critical / exceeded         DESKTOP

Reglas de generación:
- Para cada pantalla P01..P10, genera DOS variantes: mobile (deviceType MOBILE, 390x844) y desktop (deviceType DESKTOP, 1440x900). Son 20 pantallas de producto.
- P11..P17 son variantes de estado: P11..P15 y P17 en DESKTOP, P16 en MOBILE.
- Usa el MISMO designSystem id en todas las pantallas (consistencia estricta).
- **DOBLE PASADA OBLIGATORIA por pantalla:**
  1. PRIMERA PASADA — MOBILE (deviceType MOBILE): pega Bloque 1 (design system) + Bloque 1B (shell mobile) + Bloque 2 (reglas) + Bloque 4 (pantalla) + Bloque 5. Genera SOLO la versión mobile.
  2. SEGUNDA PASADA — DESKTOP (deviceType DESKTOP): pega Bloque 1 + Bloque 1C (shell desktop) + Bloque 2 + Bloque 4 + Bloque 5. En el Bloque 4, la variante desktop se genera desde el MISMO bloque de pantalla (el bloque ya dice "Mobile: ..." / "Desktop: ..."), NO desde la versión mobile renderizada.
- El bloque de pantalla (Bloque 4) siempre incluye el texto "LAYOUT MOBILE (...)" y "LAYOUT DESKTOP (...)" para P05..P10, y usa el shell de la variante pedida. NO generes un layout híbrido.
- En mobile NUNCA muestres sidebar; en desktop NUNCA muestres bottom nav ni FAB.
- En desktop, la sidebar es la navegación global: logo 🥑 "Paltazo", enlaces "Inicio" (/dashboard), "Gastos" (/dashboard/expenses), "Ingresos" (/dashboard/incomes), "Ajustes" (/dashboard/settings), y al pie "🚪 Cerrar sesión" + "Paltazo v1.0.0". El item activo usa bg-primary-container text-on-primary-container font-semibold; los inactivos text-text-secondary con hover bg-surface-container-high.
- En mobile, la navegación es una bottom bar fija con 3-4 tabs (Inicio, Gastos, Ingresos, Ajustes), el activo en text-primary font-bold, más un FAB "+" de color primary para agregar gasto (accede a /dashboard/add-expense).
- NO inventes pantallas extra (no hay home separado, no hay perfil, no hay banco, no hay reporte PDF).
```

---

## BLOQUE 4 — ESPECIFICACIÓN DETALLADA POR PANTALLA

> Sustituye el bloque `## PANTALLA A GENERAR` por uno de estos y elimina los demás.

### P01 — /onboarding

```text
## PANTALLA A GENERAR: P01 · /onboarding (Landing público)

Objetivo: presentar la propuesta de valor a un usuario NO autenticado y ofrecer acceso al login.
Layout mobile: pantalla centrada vertical, ancho completo, mucho aire. Layout desktop: tarjeta centrada de 400-480px sobre surface, con la marca arriba.

Contenido (de arriba hacia abajo):
1. Logo 🥑 grande, con badge "⚡ PWA" al lado (pill bg-secondary-container text-on-secondary-container).
2. Título "Paltazo" — headline-xl desktop / headline-lg-mobile, font-bold, tracking-tight, color on-surface.
3. Subtítulo "Controla tus gastos antes de que te caiga la palta" — body-lg, text-text-secondary, centrado, max-width ~32ch.
4. Tres feature cards apiladas (mobile) / en columna (desktop), cada una rounded-2xl bg-surface-container-low p-4:
   - 📴 "Offline-first total" — "Apunta tus compras sin gastar datos ni depender de señal"
   - 💰 "Presupuesto por moneda" — "Monitorea tus topes mensuales con precisión de céntimos"
   - 🔔 "Alertas antes de fin de mes" — "Avisos oportunos para llegar tranquilo a tu quincena"
5. Botón primario full-width "Comenzar →" (rounded-full bg-primary text-on-primary font-semibold) → /login.
6. Link secundario centrado "¿Ya tienes cuenta? Iniciar sesión" (label-md text-text-secondary, con underline al hover) → /login.

Sin header, sin sidebar, sin bottom nav. Sin inputs. Sin logos de terceros.
Si el usuario ya está autenticado, esta pantalla redirige a /dashboard (no lo diseñes, solo tenlo en cuenta).
```

### P02 — /login

```text
## PANTALLA A GENERAR: P02 · /login (Autenticación)

Objetivo: una sola pantalla que cambia de modo según el estado. Diseña el modo "Ingresar" como estado principal, e incluye como variantes visibles en la misma pantalla los modos "Registrarse", "Recuperar" y "Nueva contraseña".
Layout: tarjeta centrada de 400-500px, fondo surface. Sin sidebar, sin bottom nav. Logo 🥑 "Paltazo" arriba, centrado, con link "← Volver" al inicio (solo en modos secondary).

MODO "INGRESAR" (principal):
- Título "¡Hola de nuevo!" headline-lg font-bold. Subtítulo "Ingresa para ver cuánto te queda este mes" body-md text-text-secondary.
- Campo "Email": label-lg, input h-11 rounded-xl border outline-variant, placeholder "tu@email.com", type email, prefijo icono mail.
- Campo "Contraseña": label-lg, input h-11, placeholder "••••••••", type password, ojo toggle a la derecha (icon-only button con aria-label "Mostrar contraseña").
- Inline de error: caja bg-error-container text-on-error-container rounded-xl p-3 body-md, icono error a la izquierda. Textos posibles: "Email o contraseña incorrectos" / "Confirma tu correo antes de iniciar sesión" / "Error de conexión" (este último como toast, no inline).
- Link "¿Olvidaste tu clave?" alineado a la derecha bajo el campo de contraseña (label-md text-primary) → cambia a modo "Recuperar".
- Botón primario full-width "Ingresar" (rounded-full bg-primary text-on-primary font-semibold h-12). Cuando está cargando: deshabilitado, opacity 60%, texto "⏳ Ingresando...".
- Separador: línea horizontal con "o" centrado (border-outline-variant), texto body-sm text-text-secondary.
- Botón outlined full-width "Continuar con Google" (rounded-full bg-surface-container-lowest border border-outline-variant text-on-surface font-semibold, ícono oficial de Google a la izquierda). DESHABILITADO (opacity 55) con un badge/tooltip visible "No disponible por el momento" (pill bg-surface-container text-text-secondary, con ícono info).
- Link inferior centrado "¿No tienes cuenta? Crear cuenta" (label-md text-primary font-semibold) → cambia a modo "Registrarse".

MODO "REGISTRARSE":
- Título "Crea tu cuenta" / subtítulo "Empieza a controlar tus gastos en menos de 15 segundos".
- Campo "Nombre completo" (icono 👤 o person), placeholder "Tu nombre", helper "Opcional · máximo 200 caracteres".
- Campo "Email" (type email).
- Campo "Contraseña" (type password, ojo toggle). Helper: "Mínimo 6 caracteres".
- Inline de error: "Este email ya está registrado" / "La contraseña debe tener al menos 6 caracteres".
- Botón primario full-width "Crear cuenta" (estado cargando: "⏳ Creando cuenta...").
- Link inferior "¿Ya tienes cuenta? Iniciar sesión".

MODO "RECUPERAR":
- Título "Recupera tu contraseña" / subtítulo "Te enviamos un enlace para restablecerla".
- Solo campo "Email".
- Link "← Volver al inicio de sesión" (label-md text-text-secondary) que devuelve al modo Ingresar SIN enviar nada.
- Botón primario full-width "Enviar enlace".
- Después de enviar: caja de éxito bg-primary/10 text-primary rounded-xl p-3 body-md con icono check — "Revisa tu correo para restablecer la contraseña". NO reveles si el email existe: el mismo mensaje para email válido o inexistente.

MODO "NUEVA CONTRASEÑA":
- Título "Elige una nueva contraseña" / subtítulo "Ingresa el enlace que te enviamos por correo para continuar".
- Campo "Nueva contraseña" (type password) y campo "Confirmar contraseña" (type password), ambos con ojo toggle.
- Inline de error: "Las contraseñas no coinciden" / "La contraseña debe tener al menos 6 caracteres" / "Enlace de recuperación inválido. Solicita uno nuevo." (este último con link a /login para reiniciar).
- Botón primario full-width "Actualizar contraseña".
- Al éxito: caja de éxito "✓ Contraseña actualizada. Inicia sesión." y vuelve al modo Ingresar con campos vacíos.

Notas: los 4 modos son el MISMO componente con contenido distinto, no 4 pantallas distintas. Mantén la altura de tarjeta estable. Todos los inputs con label visible (no solo placeholder) y foco visible en primary.
```

### P03 — /session-closed

```text
## PANTALLA A GENERAR: P03 · /session-closed (Sesión cerrada)

Objetivo: confirmar el cierre de sesión e.invitar a volver a entrar. Ruta pública.
Layout: tarjeta centrada de 400px sobre surface. Sin sidebar, sin bottom nav, sin inputs.

Contenido:
1. Ilustración: emoji 🥑 grande (56-64px) dentro de un círculo bg-primary/10, centrado.
2. Título "Sesión cerrada" — headline-lg font-bold, centrado.
3. Texto body-md text-text-secondary centrado, max-width ~32ch: "Cerraste sesión en todos tus dispositivos. Tus gastos siguen guardados y seguros."
4. Botón primario full-width "Iniciar sesión" (rounded-full bg-primary text-on-primary) → /login.
5. Link secundario centrado "Volver al inicio" (label-md text-text-secondary) → /onboarding.

Tono sobrio y tranquilo. Nada de confeti, nada de alertas de error.
```

### P04 — /setup

```text
## PANTALLA A GENERAR: P04 · /setup (Configuración inicial, primer ingreso)

Objetivo: el usuario recién registrado elige su moneda principal y su presupuesto mensual. Solo se muestra UNA vez y es obligatoria.
Layout: tarjeta centrada de 440px, fondo surface. Sin sidebar (todavía no hay sesión completa de app), sin bottom nav. Muestra un indicador de paso sutil: "Paso 1 de 1".

Contenido:
1. Emoji 🥑 con badge "⚡ PWA" (pill). Título "Bienvenido a Paltazo" headline-lg font-bold. Subtítulo body-md text-text-secondary "Casi listo. Define tu moneda y tu presupuesto mensual para empezar."
2. Sección "1. Elige tu moneda principal" — label-lg font-semibold.
   Tres cards seleccionables en fila (mobile apiladas o en scroll horizontal, desktop en grid de 3), cada una rounded-2xl p-4 con borde:
   - "Soles" / símbolo grande "S/" / helper "Moneda local (PEN)"
   - "Dólares" / símbolo grande "$" / helper "Dólar estadounidense (USD)"
   - "Euros" / símbolo grande "€" / helper "Euro (EUR)"
   Seleccionada: border-primary bg-primary/10 ring, con check-circle de primary arriba a la derecha. No seleccionada: border-outline-variant bg-surface-container-lowest.
3. Sección "2. Define tu presupuesto mensual" — label-lg font-semibold, con helper body-sm text-text-secondary "El máximo que quieres gastar este mes en {moneda}".
   Un input grande numérico centered-right: símbolo de la moneda como prefijo visual a la izquierda dentro del campo, placeholder "0.00", h-14, headline-sm font-bold, fondo bg-surface-container-lowest, borde outline-variant.
   Debajo, 3 chips de sugerencia rápidos (rounded-full bg-surface-container text-on-surface-variant): "S/ 1,000", "S/ 1,500", "S/ 2,000" — al tocar uno rellena el input (con la moneda elegida). Helper dinámico: "Ejemplo: S/ 1,500.00".
4. Inline de error bajo el input: "Ingresa un monto mayor a cero" (bg-error-container text-on-error-container rounded-xl p-3).
5. Botón primario full-width "Comenzar" (rounded-full bg-primary text-on-primary h-12), DESHABILITADO (opacity 50%) hasta que haya moneda elegida y monto > 0. Estado cargando: "⏳ Guardando...".
6. Nota al pie body-sm text-text-secondary centrada: "Podrás cambiar esto más adelante en Ajustes."

Copy: no uses "Paso 1 de 1" si no es un wizard real; en su lugar muestra el badge "Configuración inicial". Las sugerencias dependen de la moneda elegida (si elige $, muestra "$ 500 / $ 1,000 / $ 2,000").
```

### P05 — /dashboard

```text
## PANTALLA A GENERAR: P05 · /dashboard (Dashboard mensual multi-moneda)

Objetivo: responder en UNA MIRADA cuánto gastó, cuánto le queda y en qué estado está su presupuesto, por cada moneda. Es la pantalla más importante de la app.

LAYOUT MOBILE (390x844): header fijo + bottom nav + FAB.
LAYOUT DESKTOP (1440x900): sidebar izquierda 240px + contenido principal. Contenido en grid de 2 columnas: columna izquierda (más ancha, ~62%) con Balance + Presupuestos + Gráfico; columna derecha (~38%) con la card de alerta, el tip motivacional y el listado del día.

SECCIÓN 1 — Header (fijo en mobile, parte del contenido en desktop)
- Izquierda: logo 🥑 + "Paltazo" (headline-sm font-bold text-secondary).
- Derecha en mobile: badge de conexión ("Sin conexión · N pendientes" con cloud_off, o "Sincronizado" con cloud_done) — pill bg-surface-container text-text-secondary.
- Avatar circular de usuario a la derecha (40px, imagen genérica, aria-label "Perfil de usuario").
- En desktop el header del contenido lleva el saludo y el selector de mes; la marca vive en la sidebar.

SECCIÓN 2 — Saludo
- H1 "¡Hola, Carlos! 👋" — headline-xl desktop / headline-lg-mobile, font-bold, tracking-tight.
- Subtítulo body-sm text-text-secondary con la FECHA EN FORMATO LOCAL: "Sábado, 31 de octubre" (weekday, día, mes; con coma; sin año).
- A la derecha (solo desktop): pill con icono calendar_today + "Octubre 2026" (bg-surface-container text-secondary font-semibold).

SECCIÓN 3 — Card de alerta contextual (banner, NO pantalla separada)
- rounded-2xl bg-surface-container-low p-4, flex con icono circular 32px a la izquierda.
- Icono circular: bg-secondary text-on-secondary (icono eco) en nivel safe; bg-warning text-white en warning; bg-danger text-white en critical/exceeded.
- Línea 1: mensaje del nivel — "Ritmo de gasto moderado en S/" (label-lg font-semibold) y a la derecha el badge "Quedan 12 días" (pill bg-primary/10 text-primary font-medium, con icono).
- Línea 2: body-sm text-on-surface-variant con el detalle: en warning "Has alcanzado el 80% de tu meta mensual. Te sugerimos mantener tus consumos diarios en S/ 25.00 para cerrar el mes en verde." / en exceeded "Te pasaste por S/ 180.00 este mes. Ajusta tus consumos o repite el presupuesto del próximo mes." / en safe "S/ dentro del límite. Mantén el ritmo para llegar tranquilo a fin de mes."

SECCIÓN 4 — "💵 Balance del mes" (grid 2 col desktop, 1 col mobile)
- Título label-lg font-semibold con emoji, y a la derecha un badge con el conteo de monedas (pill bg-surface-container text-text-secondary, ej. "2"), y un link "Ver todos →" (label-md text-primary).
- Una sub-card por moneda activa, rounded-2xl bg-surface-container-lowest p-4:
  - Línea 1: símbolo + nombre de moneda (headline-sm font-bold) y a la derecha el BALANCE NETO con indicador: "↑ +S/ 350.00" en emerald si positivo, "↓ -S/ 120.00" en danger si negativo, neutro si 0 (body-lg font-bold).
  - Línea 2 (grid 2 columnas small): "Ingresos" label-sm text-text-secondary arriba + "+S/ 1,500.00" en emerald font-semibold abajo; "Gastos" label-sm text-text-secondary arriba + "-S/ 1,150.00" en danger font-semibold abajo.
- Si no hay ingresos en el mes: la sub-card muestra "Sin ingresos" en lugar del total de ingresos, y el balance = -total gastado.
- Si NO hay ninguna moneda activa: esta sección NO se renderiza (se oculta entera, no muestra ceros falsos).

SECCIÓN 5 — "Presupuestos mensuales" (DESPUÉS del balance, nunca antes)
- Título label-lg font-semibold + badge con conteo de monedas (oculto si 0) + link "Ver reporte →".
- Sub-card por moneda, rounded-2xl bg-surface-container-lowest p-4:
  - Línea 1: "Presupuesto mensual" label-sm text-text-secondary uppercase tracking-wider, y el límite en headline-sm font-bold ("S/ 1,500.00"). A la derecha badge de nivel: pill bg-warning/15 text-warning con punto animado y "80% utilizado" (o bg-primary/15 text-primary "45% utilizado", o bg-danger/15 text-danger "115% utilizado" con ">100%" cuando excede).
  - Línea 2: barra de progreso. Track: w-full h-3 rounded-full bg-surface-container-highest overflow-hidden; relleno: h-full rounded-full con transition-all duration-700 (bg-warning si ≥80%, bg-danger si ≥100%, bg-primary si <80%). El relleno representa el porcentaje real, con tope visual al 100%.
  - Línea 3: flex justify-between body-sm: "S/ 1,200.00 gastados (80%)" (text-on-surface-variant font-medium) a la izquierda y "Límite S/ 1,500.00" (text-text-secondary) a la derecha.
  - Línea 4 (solo si monthlyLimit = 0): texto text-text-secondary "{moneda} sin presupuesto configurado" y SIN barra.
  - Bloque "Saldo disponible" anidado: rounded-2xl bg-surface-container-low p-4, flex items-center justify-between. Izquierda: icono 40px en bg-primary-fixed text-primary (icono savings) + label-sm text-text-secondary "Saldo disponible" + headline-sm font-bold text-secondary "S/ 300.00 restantes". Derecha: label-sm text-text-secondary "Días restantes del mes" + label-lg font-semibold "12 días".
- Botones rápidos al pie de la card (grid 2): "Ver reporte" (icono analytics, text-primary) y "Ajustes" (icono tune, text-secondary), ambos rounded-full bg-surface-container-high hover:bg-surface-variant label-md, full-width, con ícono + texto, y active:scale-95.
- EMPTY STATE de la sección (cuando no hay ninguna moneda): card centrada py-8 con emoji 💰 (48px, opacity 50%), "No tienes monedas configuradas" (label-lg font-semibold), "Agrega una moneda y configura tu presupuesto mensual para comenzar a registrar gastos" (body-sm text-text-secondary, max-w-sm, centrado), y botón "⚙️ Configurar moneda" (rounded-full bg-primary text-on-primary label-md font-semibold) → /dashboard/settings.

SECCIÓN 6 — "Actividad de los últimos 7 días" (gráfico de barras)
- Card rounded-2xl bg-surface-container-low p-4, título label-lg font-semibold.
- Gráfico: flex items-end justify-between, gap-2, h-32. Exactamente 7 barras (hoy inclusive). Cada barra es un button con flex-1 flex-col items-center justify-end h-24:
  - Relleno: w-full max-w-[40px] rounded-t-lg, altura proporcional al count (mínimo 8% si count = 0).
  - Color: barra SELECCIONADA = bg-primary; barra de HOY (si no está seleccionada) = bg-secondary; barra con gastos no seleccionada = bg-surface-container-highest (hover:bg-secondary); barra vacía = bg-surface-container-high.
  - Encima de la barra, el count en label-sm font-semibold text-on-surface (solo si count > 0).
  - Debajo: letra del día (D/L/M/X/J/V/S) en label-sm font-medium, y debajo el número del día en label-xs text-text-secondary.
- Debajo del gráfico: título "Gastos registrados para el {fecha}" (headline-sm font-bold) + badge con el conteo de gastos del día (pill bg-surface-container text-text-secondary).
- Listado del día seleccionado: Desktop = tabla (Categoría | Descripción | Monto | Acciones "Editar"); Mobile = cards con icono de categoría (40px, fondo tintado del color), label de la categoría, descripción, y monto alineado a la derecha (label-lg font-semibold). Botón "Ver todos →" (desktop) → /dashboard/expenses.
- Si el día seleccionado no tiene gastos: empty state inline "📭 No hay gastos registrados para este día" (body-md text-text-secondary, centrado, py-4).

SECCIÓN 7 — Tip motivacional (desktop: card propia en la columna derecha; mobile: card al final)
- rounded-2xl bg-secondary-container/40 p-4. Título label-lg font-semibold text-on-secondary-container "💡 Consejo Paltazo del día". Cuerpo body-sm text-on-surface-variant: "Registrar tus gastos en el momento evita los sustos de fin de mes. Hoy llevas 3 registros, y ya tienes el 80% de tu presupuesto cubierto con 12 días por delante."

NAVEGACIÓN:
- Mobile: aplica el shell mobile del Bloque 1B (bottom nav de 4 tabs + FAB "+" → /dashboard/add-expense). El FAB va en P05 y P06.
- Desktop: aplica el shell desktop del Bloque 1C (sidebar izquierda de 240px con los 4 items + "🚪 Cerrar sesión" + "Paltazo v1.0.0").
```

### P06 — /dashboard/expenses

```text
## PANTALLA A GENERAR: P06 · /dashboard/expenses (Historial de gastos del mes)

Objetivo: ver todos los gastos del mes agrupados por fecha, con total vs límite, y editar/eliminar en el sitio.

Layout mobile: header fijo + bottom nav + FAB. Layout desktop: sidebar + contenido.

HEADER:
- Mobile: barra fija con ← atrás (icon-only, aria-label "Volver"), título "Gastos" (headline-sm font-bold) y a la derecha badge de conexión.
- Desktop: en el contenido, H1 "Gastos" headline-xl font-bold + subtítulo "Octubre 2026" body-sm text-text-secondary, y a la derecha el botón "Ver reporte"/"Nuevo gasto" (rounded-full bg-secondary text-on-secondary label-md font-semibold, icono add).
- En mobile, el H1 va dentro del contenido (no en la barra).

CARD DE RESUMEN (arriba del listado), rounded-2xl bg-surface-container-low p-4:
- Fila 1: "Este mes" label-sm text-text-secondary uppercase tracking-wider, y a la derecha el total gastado en headline-lg font-bold ("S/ 1,200.00").
- Fila 2: barra de progreso del mes (mismos tokens y reglas de color que el dashboard) con "Límite S/ 1,500.00" a la derecha.
- Fila 3: 3 micro-stats en grid de 3: "12 gastos" / "S/ 25.00 promedio" / "3 categorías". label-sm text-text-secondary + label-lg font-semibold.

LISTADO:
- Desktop: una tabla por grupo de fecha. Header de grupo: fila con fondo bg-surface-container, py-2 px-3, "Sábado, 31 de octubre" (label-lg font-semibold) a la izquierda y el SUBTOTAL del día a la derecha (label-lg font-bold). Debajo, filas con: columna Fecha (day + mes corto, ej. "31 oct"), columna Categoría (chip con punto del color de la categoría + label), columna Descripción (body-md, text-on-surface-variant, truncate, "—" si está vacía), columna Monto (label-lg font-semibold alineado a la derecha) y columna Acciones (2 icon-buttons 36x36: ✏️ editar y 🗑️ eliminar, con aria-label). Zebra sutil: filas alternas con bg-surface-container-lowest / bg-surface-container-low.
- Mobile: cards. Un header de grupo sticky con la fecha (label-lg font-semibold) y el subtotal del día (label-lg font-bold). Debajo, cards rounded-2xl bg-surface-container-lowest p-3 flex items-center gap-3: icono de categoría 40px (fondo tintado del color, emoji 20px), en el medio el label de la categoría (label-lg font-semibold) y debajo la descripción (body-sm text-text-secondary, 2 líneas máx), a la derecha el monto (label-lg font-semibold) y debajo los icon-buttons editar/eliminar.

ESTADO VACÍO:
- Card centrada py-10: emoji 📭 (48px opacity 50%), "No hay gastos registrados" (headline-sm font-bold), "Registra tu primer gasto para empezar a controlar tu presupuesto" (body-md text-text-secondary, centrado, max-w-xs), botón "+ Agregar primer gasto" (rounded-full bg-primary text-on-primary label-md font-semibold) → /dashboard/add-expense.

FAQs: si el usuario tiene múltiples monedas, los grupos muestran el subtotal en la MONEDA PRINCIPAL del usuario, y cada fila muestra su símbolo de moneda junto al monto.

EDICIÓN INLINE (CU-010):
- Cuando el usuario pulsa "✏️", la fila de la tabla (desktop) o la card (mobile) se EXPANDE en el lugar con los inputs inline — monto, fecha (2 columnas en mobile), descripción, categoría como <select> — y los botones "✓ Guardar" y "Cancelar". NO es un modal ni una pantalla nueva.
- La MONEDA no se puede editar en este modo (el gasto conserva su moneda original).
- "Guardar" deshabilitado si el monto ≤ 0. "Cancelar" vuelve a modo lectura sin persistir.
- Al guardar, la fila vuelve a modo lectura con los valores nuevos y los totales del mes se recalculan al instante.
```

### P07 — /dashboard/add-expense

```text
## PANTALLA A GENERAR: P07 · /dashboard/add-expense (Nuevo gasto)

Objetivo: registrar un gasto en menos de 15 segundos. Pantalla completa (no modal) en mobile; en desktop es una página con panel de contenido centrado de 480px, con la sidebar global visible.

HEADER:
- Mobile: barra fija con ← atrás (icon-only, aria-label "Volver"), título "Nuevo Gasto" (headline-sm font-bold) y subtítulo "Registra tu gasto" (label-sm text-text-secondary) al lado, y a la derecha el botón "🗑️ Limpiar" (icon-only con aria-label, color text-text-secondary).
- Desktop: mismo header pero dentro del panel de contenido.

FORMULARIO (orden vertical):
1. Etiqueta "Monto a registrar" — label-md text-text-secondary uppercase tracking-wider.
2. BLOQUE DE MONTO (destacado, rounded-3xl bg-surface-container-low p-4):
   - Toggle de MONEDA arriba: pills rounded-full; la moneda activa bg-primary text-on-primary font-bold, las demás bg-surface-container text-on-surface-variant. Solo las monedas ACTIVAS del usuario. Si solo hay una, se muestra una sola pill (no un toggle inútil).
   - Display del monto: texto centered, headline-xl font-bold tracking-tight, con el símbolo de la moneda delante y separador de miles ("S/ 1,250.00"). Debajo, un input real invisible (opacity-0) para el teclado numérico decimal.
   - Presets rápidos: fila de 4 pills rounded-full bg-surface-container text-on-surface-variant hover:bg-secondary-fixed hover:text-on-secondary-fixed, label-sm, cada uno con la moneda delante: "S/ 15.00", "S/ 30.00", "S/ 50.00", "S/ 100.00".
3. Campo "Descripción" con label a la izquierda y a la derecha el helper "Opcional pero útil" (label-sm text-text-secondary). Input h-12 con placeholder "Ej. Almuerzo, taxi a Miraflores, súper" e icono de nota a la izquierda (text-outline-variant 20px). Helper bajo el campo: contador "0/200" en label-xs text-text-secondary alineado a la derecha.
4. Campo "Categoría" — label-lg font-semibold, y a la derecha el nombre de la categoría seleccionada en label-sm text-primary font-bold.
   Carrusel HORIZONTAL SCROLLEABLE (overflow-x-auto, snap) de tiles circulares de 40px: emoji 22px centrado + label-xs debajo, centered. Categoría seleccionada: círculo con bg-primary text-on-primary + ring; no seleccionada: bg-surface-container text-on-surface-variant. Al FINAL del carrusel, un tile con borde discontinuo bg-surface-container que muestra "+ Nueva" (label-xs) y abre el modal de nueva categoría.
5. Campo "Fecha del gasto" — label-sm text-text-secondary + pill con icono calendar_today que abre un input[type=date] nativo; muestra la fecha en español ("Hoy, 4 de noviembre" si es hoy).
6. Botón principal full-width "✓ Guardar y Continuar" — rounded-full bg-primary text-on-primary h-12 label-lg font-semibold. DESHABILITADO (opacity 50%) si el monto ≤ 0 o está vacío.
7. Link centrado "Cancelar" (label-md text-text-secondary).

ESTADOS:
- Toast de éxito al guardar: barra fija superior centrada, rounded-full bg-on-surface text-surface px-4 py-2 label-md font-semibold, con check "✓ Gasto registrado", visible 2 segundos.
- Modal "¿Descartar cambios?" (variante, ver P12).
- Modal "Nueva categoría" inline (variante, ver P13).

No muestres spinners de carga al escribir el monto. El guardado es inmediato.
```

### P08 — /dashboard/incomes

```text
## PANTALLA A GENERAR: P08 · /dashboard/incomes (Historial de ingresos del mes)

Objetivo: ver los ingresos del mes agrupados por fecha, con total, y editar/eliminar inline. Misma estructura que P06 (historial de gastos) pero con identidad de INGRESO.

Diferencias obligatorias respecto a P06:
- Título "Ingresos". Subtítulo "Octubre 2026".
- Botón principal "+ Nuevo ingreso" (icono add) → /dashboard/add-income.
- Card de resumen: "Ingresos del mes" label-sm uppercase, total en EMERALD (text-emerald, font-bold, headline-lg). Stat: "3 ingresos" / "S/ 500.00 promedio" / "2 categorías". Sin barra de progreso ni límite (los ingresos no tienen presupuesto).
- Filas y cards: el icono de categoría usa la paleta de CATEGORÍAS DE INGRESO. Montos en emerald (no danger), con prefijo "+".
- Empty state: emoji 📭, "No hay ingresos registrados", "Registra tus ingresos para conocer tu balance real del mes", botón "+ Agregar primer ingreso" → /dashboard/add-income.
- Sidebar: el item "Ingresos" aparece activo.
- EDICIÓN INLINE (CU-028): cuando el usuario pulsa "✏️" en una fila (desktop) o en una card (mobile), esa fila se EXPANDE en el lugar con los inputs inline — monto, fecha (2 columnas en mobile), descripción, categoría como <select> (solo categorías de ingreso) — y los botones "✓ Guardar" y "Cancelar". NO es un modal ni una pantalla nueva. La MONEDA no se puede editar en este modo. "Guardar" queda deshabilitado si el monto ≤ 0; "Cancelar" vuelve a modo lectura sin persistir. Al guardar, la fila vuelve a modo lectura con los valores nuevos y el balance del mes se recalcula al instante.

Usa EXACTAMENTE los mismos tokens, paddings, radios, tipografías y estados de interacción de P06. Solo cambia el contenido y el color de los montos a emerald.
```

### P09 — /dashboard/add-income

```text
## PANTALLA A GENERAR: P09 · /dashboard/add-income (Nuevo ingreso)

Objetivo: registrar un ingreso esporádico (sueldo, devolución, venta, freelance). Misma estructura que P07 con identidad de ingreso.

Diferencias obligatorias respecto a P07 (Nuevo gasto):
- Título "Nuevo Ingreso" / subtítulo "Registra un ingreso".
- Botón principal "✓ Guardar" (NO "Guardar y Continuar" — los ingresos no tienen presets ni flujo continuo).
- SIN presets rápidos de monto (decisión de producto: los ingresos son esporádicos, sin presets). En su lugar, el bloque de monto queda más compacto.
- El carrusel de categorías muestra EXCLUSIVAMENTE categorías de INGRESO: Sueldo (💼), Freelance (💡), Devolución (🎁), Venta (🛒), Otros (📦), más las personalizadas. El tile "+ Nueva" abre el modal de nueva categoría DE INGRESO (default 💼 + emerald).
- Mismos toggles de moneda activa, mismo input de monto formateado, misma descripción opcional (máx 200, placeholder "Ej. Sueldo de octubre"), misma fecha con picker nativo, mismo botón "🗑️ Limpiar".
- Toast de éxito: "✓ Ingreso registrado" (2s).
- Modal "¿Descartar cambios?" idéntico al de P07.

Copia, tokens, espaciados y radios idénticos a P07. Solo cambia el copy y el set de categorías.
```

### P10 — /dashboard/settings

```text
## PANTALLA A GENERAR: P10 · /dashboard/settings (Ajustes)

Objetivo: todo lo configurable en una sola pantalla, agrupada en secciones con cards. Layout mobile: secciones apiladas. Layout desktop: grid de 2 columnas (md:grid-cols-2), con las secciones de presupuestos, monedas y categorías ocupando ambas columnas (md:col-span-2).

HEADER:
- Mobile: barra fija con ← atrás, título "Ajustes" (headline-sm font-bold). El H1 "Ajustes" grande va en el contenido en desktop (headline-xl font-bold) y en mobile también dentro del contenido (headline-lg-mobile).
- Desktop: sidebar con "Ajustes" activo.

SECCIÓN 1 — "💰 Presupuestos por moneda" (col-span 2)
- Card rounded-2xl bg-surface-container-low p-4.
- Helper body-sm text-text-secondary: "Define el límite de gasto mensual de cada moneda. Cada presupuesto es independiente."
- Un bloque por moneda activa del usuario, en un grid (mobile 1 col, desktop 2 col):
  - Label-lg font-semibold con el nombre ("Soles (S/)"), y a la derecha dos badges: "Principal" (pill bg-primary/10 text-primary font-semibold, solo en la moneda principal) y "Configurado" (pill bg-surface-container text-text-secondary, en monedas con límite ya definido y que no son la principal).
  - Input numérico h-12 rounded-xl bg-surface-container-lowest border border-outline-variant, con el SÍMBOLO de la moneda como prefijo visual a la izquierda (absolute left-3, text-text-secondary), placeholder "0.00", step 0.01.
  - Botón "Guardar" (rounded-full bg-primary text-on-primary label-md font-semibold, ancho auto a la derecha del input, o full-width en mobile). DESHABILITADO (opacity 50%) si el valor está vacío o ≤ 0. Tras guardar, el botón muestra "✓" durante 2s y luego vuelve a "Guardar".
- Debajo, fila de botones "+ Moneda" para cada moneda soportada NO activa: "+ Soles (S/)", "+ Dólares ($)", "+ Euros (€)" — pills rounded-full bg-surface-container text-on-surface-variant border border-outline-variant label-md. Si el usuario ya tiene las 3, no se muestra esta fila.

SECCIÓN 2 — "💱 Monedas activas" (col-span 2)
- Card rounded-2xl bg-surface-container-low p-4. Helper body-sm text-text-secondary "Las monedas que usas. Solo aparecen aquí las que agregaste."
- Lista de las monedas activas: cada fila flex justify-between items-center py-2 border-b border-outline-variant/40 (última sin borde): izquierda el símbolo grande (headline-md font-bold text-on-surface) + nombre ("Soles (S/)") +, si aplica, badge "Principal"; derecha un botón "Quitar" (rounded-full border border-danger/30 text-danger bg-danger/10 label-md font-semibold, hover:bg-danger hover:text-white).
- Si el usuario no tiene ninguna moneda: empty state inline "No tienes monedas configuradas" + "Agrega una moneda arriba para empezar".

SECCIÓN 3 — "🏷️ Categorías de gasto" (col-span 2)
- Card rounded-2xl bg-surface-container-low p-4.
- Helper body-sm text-text-secondary "Personaliza cómo clasificas tus gastos."
- Grid de 2 columnas (desktop) / 1 columna (mobile) de items: cada item flex items-center gap-3 p-3 rounded-2xl bg-surface-container-lowest: ícono 44px rounded-2xl con fondo tintado del color de la categoría y emoji 22px, al medio el nombre (label-lg font-semibold) y debajo el nombre del color ("Rojo", "Naranja", "Ámbar", "Esmeralda", "Verde azulado", "Azul", "Índigo", "Púrpura") en label-sm text-text-secondary, a la derecha dos icon-buttons 36x36: editar (✏️) y eliminar (🗑️). Si la categoría está protegida (Otros), en vez de editar/eliminar muestra un badge "Protegida" (pill bg-surface-container text-text-secondary).
- Footer de la card: botón "+ Nueva categoría" (rounded-full bg-primary text-on-primary label-md font-semibold, ancho completo o auto).

SECCIÓN 4 — "💰 Categorías de ingreso" (col-span 2)
- Igual que la sección 3 pero con identidad de ingreso: título "💰 Categorías de ingreso", helper "Clasifica tus ingresos (sueldo, devoluciones, ventas).", y su propio botón "+ Nueva categoría". NO mezcles las dos listas.

SECCIÓN 5 — "🔔 Alertas de presupuesto" (1 col)
- Card rounded-2xl bg-surface-container-low p-4.
- Toggle de "Notificaciones push" (switch de 44x24, bg-primary cuando activo, bg-surface-container-highest cuando inactivo) con label-lg font-semibold "Notificaciones push" y helper body-sm text-text-secondary "Recibe un aviso al cruzar 80%, 100% y más de 100% de tu presupuesto."
- Estado del permiso, debajo, como fila label-sm: "Permiso: concedido" / "Permiso: denegado" / "Permiso: no solicitado", con un link "Activar notificaciones" (label-md text-primary font-semibold) cuando no esté concedido.
- Hint visual de los tres niveles: tres filas con punto de color + texto + porcentaje — punto bg-warning + "Advertencia" + "80%" (text-warning font-semibold); punto bg-danger + "Límite alcanzado" + "100%" (text-danger); punto bg-danger/70 + "Superado" + "101%".

SECCIÓN 6 — "📊 Niveles de alerta" (1 col) — SOLO LECTURA
- Card rounded-2xl bg-surface-container-low p-4, título label-lg font-semibold.
- Tres filas: punto bg-warning + "Advertencia" + "80%"; punto bg-danger + "Límite alcanzado" + "100%"; punto bg-danger/70 + "Superado" + "101%". Sin inputs ni botones.
- Helper body-sm text-text-secondary "Estos umbrales se aplican a cada moneda por separado."

SECCIÓN 7 — "🌿 Acerca de Paltazo" (1 col) — SOLO LECTURA
- Card rounded-2xl bg-surface-container-low p-4, título label-lg font-semibold.
- Filas label-md en dos columnas: "Versión" / "1.0.0"; "Tipo" / "App web progresiva"; "Almacenamiento" / "Supabase". Sin inputs.

SECCIÓN 8 — "🔄 Sincronización" (1 col)
- Card rounded-2xl bg-surface-container-low p-4, título label-lg font-semibold.
- Estado: "Conexión" (En línea / Sin conexión con badge bg-warning/15 text-warning), "Cambios pendientes" (N), "Sincronizados" (N), "Con error" (N). Botón "Sincronizar ahora" (rounded-full bg-surface-container-high label-md font-semibold).

SECCIÓN 9 — "🚪 Cerrar sesión" (col-span 2, al final)
- Card rounded-2xl bg-danger/10 p-4. Título label-lg font-semibold text-danger "Cerrar sesión", helper body-sm text-on-surface-variant "Se cerrarán todas tus sesiones en todos los dispositivos." Botón "Cerrar sesión" (rounded-full bg-danger text-white label-md font-semibold, hover:bg-danger/90). Sin modal de confirmación (acción reversible).

Nota: la sección de "Niveles de alerta" y "Acerca de Paltazo" se muestran juntas en la misma fila de 2 columnas en desktop. Todo el contenido de Settings es scrollable; en mobile hay padding-bottom para la bottom nav.
```

### P11 — Modal: eliminar

```text
## PANTALLA A GENERAR: P11 · Modal de confirmación destructiva (eliminar gasto / eliminar ingreso)

Objetivo: el patrón de modal destructivo que se usa en toda la app. Genera UNA pantalla desktop mostrando este modal sobre un fondo atenuado con un listado de gastos visible detrás (desenfocado por el backdrop).

ESTRUCTURA:
- Fondo: la pantalla de /dashboard/expenses (tabla de gastos) con un overlay oscuro (bg-on-surface/40) y backdrop-filter blur(4px).
- Modal centrado, ancho 400px, rounded-2xl bg-surface-container-lowest p-6, sombra fuerte.
- Título: "¿Eliminar gasto?" — headline-md font-bold text-on-surface, centrado.
- Mensaje: "Esta acción no se puede deshacer." — body-md text-text-secondary, centrado.
- Fila de botones, grid 2 columnas gap-3, mt-6:
  - "Cancelar" — rounded-full bg-surface-container text-on-surface label-lg font-medium hover:bg-surface-container-high.
  - "Eliminar" — rounded-full bg-error-container text-on-error-container label-lg font-medium hover:bg-error hover:text-on-error.
- Debajo del texto, en body-sm text-text-secondary: "Se eliminará permanentemente y se recalculará tu presupuesto del mes." (opcional, solo si no satura).

BUENAS PRÁCTICAS: focus trap dentro del modal, Esc cierra, click en el backdrop cierra, el click dentro del contenido NO cierra el modal. El botón "Eliminar" es el visualmente destructivo (rojo), "Cancelar" es el neutro.
La variante de ingreso es idéntica con el texto "¿Eliminar ingreso?".
```

### P12 — Modal: descartar cambios

```text
## PANTALLA A GENERAR: P12 · Modal "¿Descartar cambios?" (al salir del formulario de gasto/ingreso con cambios sin guardar)

Objetivo: el patrón de modal de confirmación NO destructivo que evita perder datos. Pantalla desktop con el formulario de nuevo gasto visible detrás, atenuado y desenfocado.

ESTRUCTURA:
- Fondo: /dashboard/add-expense atenuado (overlay bg-on-surface/40 + blur).
- Modal centrado 400px, rounded-2xl bg-surface-container-lowest p-6.
- Título: "¿Descartar cambios?" — headline-md font-bold, centrado.
- Mensaje: "No guardaste este gasto. Si sales ahora, se perderá." — body-md text-text-secondary, centrado.
- Botones grid 2: "Cancelar" (rounded-full bg-surface-container text-on-surface label-lg font-medium) y "Descartar" (rounded-full bg-error-container text-on-error-container label-lg font-medium). "Descartar" es la acción que el usuario quiere evitar, pero debe verse claramente como la consecuencia.

Mismo comportamiento de accesibilidad que P11: focus trap, Esc cierra, click en backdrop cierra.
```

### P13 — Modal: nueva categoría

```text
## PANTALLA A GENERAR: P13 · Modal "Nueva categoría" (crear o editar una categoría de gasto o de ingreso)

Objetivo: el patrón de alta/edición de categoría con nombre, icono y color. Pantalla desktop con el modal sobre el formulario de gasto atenuado.

ESTRUCTURA:
- Fondo: /dashboard/add-expense atenuado con blur.
- Modal centrado 440px, rounded-2xl bg-surface-container-lowest p-6, con título "Nueva categoría" (headline-md font-bold) a la izquierda y un icon-button de cierre "✕" a la derecha (36x36, aria-label "Cerrar").
- Campo "Nombre" — label-lg font-semibold, input h-11 rounded-xl border border-outline-variant bg-surface-container-lowest, placeholder "Ej: Compras". Debajo, contador/helper "Máximo 30 caracteres" (label-sm text-text-secondary). Inline de error (body-sm text-error mt-1): "El nombre es obligatorio" / "Ya tienes una categoría con ese nombre".
- Campo "Icono" — label-lg font-semibold, luego un grid de 8 columnas (desktop) de 40x40 botones cuadrados redondeados con el emoji 20px, fondo bg-surface-container hover:bg-surface-container-high, el seleccionado con bg-primary/15 + ring-primary + check.
  Los 16 emojis disponibles (usa estos, en este orden): 🍔 Comida / Restaurantes · 🚗 Transporte / Movilidad · 🏠 Hogar / Vivienda · 🎬 Entretenimiento / Ocio · 🛒 Compras / Supermercado · 💊 Salud / Farmacia · ✈️ Viajes / Vacaciones · 📚 Educación / Cursos · 💼 Trabajo / Negocio · 🐾 Mascotas · 🎁 Regalos / Donaciones · 💡 Servicios / Luz, Agua, Internet · ⚽ Deportes / Fitness · ☕ Café / Snacks · 📱 Tecnología / Suscripciones · 📦 Otros
- Campo "Color" — label-lg font-semibold, luego un grid de 8 swatches circulares de 36px con el patrón `bg-{color}-500/15 text-{color}-600`, el seleccionado con ring-2 ring-on-surface y un check. Los 8 colores: Rojo, Naranja, Ámbar, Esmeralda, Verde azulado (teal), Azul, Índigo, Púrpura.
- Al pie, grid 2 botones: "Cancelar" (rounded-full bg-surface-container text-on-surface label-lg font-medium) y "Guardar" (rounded-full bg-primary text-on-primary label-lg font-semibold).
- Default para categorías de GASTO: 🍔 + Naranja. Default para categorías de INGRESO: 💼 + Esmeralda.
- En modo EDICIÓN, el título es "Editar categoría", los campos vienen prellenados y el botón es "Guardar cambios". La categoría "Otros" (protegida) NO se puede editar ni eliminar: no muestres esos botones para ella, muestra un badge "Protegida".
```

### P14 — Modal: quitar moneda / eliminar categoría

```text
## PANTALLA A GENERAR: P14 · Modal de advertencia destructiva (quitar moneda / eliminar categoría)

Objetivo: los dos modales de Ajustes que exigen confirmación explícita por pérdida o reasignación de datos. Genera una pantalla desktop con la pantalla de Ajustes atenuada detrás (se ve la sección "Monedas activas" con el botón "Quitar" y la sección "Categorías de gasto" con sus tiles).

MODAL A — Quitar moneda:
- Fondo: /dashboard/settings atenuado (overlay bg-on-surface/40 + backdrop blur).
- Modal centrado 420px, rounded-2xl bg-surface-container-lowest p-6.
- Título: "⚠️ Quitar moneda" — headline-md font-bold, centrado.
- Cuerpo (body-md text-on-surface-variant, centrado):
  - Moneda NO principal: "Se eliminarán 8 gastos y el presupuesto en Dólares ($). Esta acción no se puede deshacer."
  - Moneda PRINCIPAL: "Se eliminarán 8 gastos, 2 ingresos y el presupuesto en Soles (S/). La moneda más antigua se configurará como principal. Esta acción no se puede deshacer."
- Lista visual del impacto: 3 filas con ícono y número en cards rounded-xl bg-surface-container p-3 — 🧾 "8 gastos" / 💵 "2 ingresos" / 🎯 "1 presupuesto".
- Botones grid 2: "Cancelar" (bg-surface-container text-on-surface) y "Quitar moneda" (bg-danger text-white font-semibold, hover:bg-danger/90).
- Si la moneda no tiene datos asociados, el mensaje usa 0 ("Se eliminarán 0 gastos y el presupuesto en Dólares ($)") — la confirmación sigue siendo obligatoria.

MODAL B — Eliminar categoría (variante, misma pantalla):
- Mismo contenedor y estructura, pero:
  - Título: "⚠️ Eliminar categoría".
  - Cuerpo: "Los 6 gastos asociados a Comida pasarán a 'Otros'. Esta acción no se puede deshacer." (o "Los 3 ingresos asociados a Sueldo pasarán a 'Otros'...").
  - Impacto: una sola fila 🧾 "6 gastos" (o "3 ingresos") en card rounded-xl bg-surface-container p-3.
  - Helper body-sm text-text-secondary: "Los gastos conservarán su monto, fecha y moneda."
  - Botón destructivo: "Eliminar categoría" (bg-danger text-white font-semibold).
  - Si N = 0: "Los 0 gastos asociados a Comida pasarán a 'Otros'." — la confirmación sigue siendo obligatoria.

Mismo comportamiento de accesibilidad que P11: focus trap, Esc cierra, click en backdrop cierra.
```

```text
## PANTALLA A GENERAR: P14 · Modal de confirmación al quitar una moneda

Objetivo: el usuario va a quitar una moneda; se le informa exactamente cuántos datos se van a perder. Pantalla desktop con la pantalla de Ajustes atenuada detrás (se ve la sección "Monedas activas" con el botón "Quitar").

ESTRUCTURA:
- Fondo: /dashboard/settings atenuado (overlay bg-on-surface/40 + blur).
- Modal centrado 420px, rounded-2xl bg-surface-container-lowest p-6.
- Título: "⚠️ Quitar moneda" — headline-md font-bold, centrado.
- Cuerpo (body-md text-on-surface-variant, centrado):
  - Caso moneda NO principal: "Se eliminarán 8 gastos y el presupuesto en Dólares ($). Esta acción no se puede deshacer."
  - Caso moneda PRINCIPAL: "Se eliminarán 8 gastos, 2 ingresos y el presupuesto en Soles (S/). La moneda más antigua se configurará como principal. Esta acción no se puede deshacer."
- Lista visual del impacto (opcional pero recomendada): 3 filas con ícono y número — 🧾 "8 gastos" / 💵 "2 ingresos" / 🎯 "1 presupuesto" — en cards rounded-xl bg-surface-container p-3.
- Botones grid 2: "Cancelar" (bg-surface-container text-on-surface) y "Quitar moneda" (bg-danger text-white font-semibold, hover:bg-danger/90).
- Si la moneda no tiene datos asociados, el mensaje usa 0: "Se eliminarán 0 gastos y el presupuesto en Dólares ($). Esta acción no se puede deshacer." — la confirmación sigue siendo obligatoria.

Mismo comportamiento de accesibilidad que P11.
```

### P15 — Modal: eliminar categoría

```text
## PANTALLA A GENERAR: P15 · Modal de advertencia al eliminar una categoría

Objetivo: el patrón de modal de advertencia con RECUENTO de registros afectados, porque los registros NO se borran: se reasignan a "Otros". Pantalla desktop con la pantalla de Ajustes atenuada detrás (se ve la sección "Categorías de gasto" con sus tiles de categoría y sus botones de eliminar).

ESTRUCTURA:
- Fondo: /dashboard/settings atenuado (overlay bg-on-surface/40 + backdrop blur).
- Modal centrado 420px, rounded-2xl bg-surface-container-lowest p-6.
- Título: "⚠️ Eliminar categoría" — headline-md font-bold, centrado.
- Cuerpo (body-md text-on-surface-variant, centrado): "Los 6 gastos asociados a Comida pasarán a 'Otros'. Esta acción no se puede deshacer."
- Fila de impacto: un card rounded-xl bg-surface-container p-3 flex items-center gap-3: ícono 🧾 en 40px + "6 gastos" (label-lg font-semibold) + a la derecha "se reasignan" (label-sm text-text-secondary).
- Helper body-sm text-text-secondary: "Los gastos conservarán su monto, fecha y moneda."
- Botones grid 2: "Cancelar" (bg-surface-container text-on-surface label-lg font-medium) y "Eliminar categoría" (bg-danger text-white label-lg font-semibold hover:bg-danger/90).
- Variante con N = 0: "Los 0 gastos asociados a Comida pasarán a 'Otros'. Esta acción no se puede deshacer." — la confirmación sigue siendo obligatoria.
- Variante de INGRESO: "Los 3 ingresos asociados a Sueldo pasarán a 'Otros'. Esta acción no se puede deshacer."
- La categoría "Otros" (protegida) nunca muestra este modal: su tile no tiene botón de eliminar, solo un badge "Protegida".

Mismo comportamiento de accesibilidad que P11: focus trap, Esc cierra, click en backdrop cierra.
```

### P16 — Estados vacíos

```text
## PANTALLA A GENERAR: P16 · Estados vacíos (mobile)

Objetivo: un board de 3 estados vacíos, apilados verticalmente en una sola pantalla mobile de 390x844, separados por líneas divisorias.

TARJETA 1 — Dashboard sin monedas configuradas:
- Card rounded-2xl bg-surface-container-low p-6, centrada.
- Emoji 💰 48px opacity 50.
- "No tienes monedas configuradas" — headline-sm font-bold.
- "Agrega una moneda y configura tu presupuesto mensual para comenzar a registrar gastos" — body-md text-text-secondary, max-w-xs, centrado.
- Botón "⚙️ Configurar moneda" — rounded-full bg-primary text-on-primary label-md font-semibold, con ícono settings.

TARJETA 2 — Historial de gastos vacío:
- Card rounded-2xl bg-surface-container-low p-6, centrada.
- Emoji 📭 48px opacity 50.
- "No hay gastos registrados" — headline-sm font-bold.
- "Registra tu primer gasto para controlar tu presupuesto" — body-md text-text-secondary.
- Botón "+ Agregar primer gasto" — rounded-full bg-primary text-on-primary label-md font-semibold.

TARJETA 3 — Día sin gastos en el dashboard (variante compacta):
- Card rounded-2xl bg-surface-container-lowest p-4, centrada.
- Emoji 📭 32px opacity 50.
- "No hay gastos registrados para este día" — body-md text-text-secondary.
- Sin botón.

TARJETA 4 (bonus, parte de la misma pantalla) — Historial de ingresos vacío:
- Igual que la tarjeta 2 pero con "No hay ingresos registrados" y botón "+ Agregar primer ingreso".

Nunca muestres ceros falsos ("S/ 0.00") donde va un empty state.
```

### P17 — Estados de alerta

```text
## PANTALLA A GENERAR: P17 · Dashboard en estados de alerta (desktop)

Objetivo: mostrar el MISMO dashboard en sus tres niveles de alerta, para que se vea el cambio de color del sistema de alertas. Genera una pantalla desktop (1440x900) con la sidebar y el contenido del dashboard, en estado WARNING (80%), con dos小幅 variantes del bloque de presupuesto al costado. Prioriza mostrar bien el bloque de presupuesto y la card de alerta contextual.

LÓGICA (aplica a las 3 variantes del bloque de presupuesto):
- WARNING (80%): badge "80% utilizado" bg-warning/15 text-warning con punto bg-warning; barra de progreso bg-warning; mensaje "Ritmo de gasto moderado en S/"; card de alerta con icono bg-warning; detalle "Has alcanzado el 80% de tu meta mensual. Te sugerimos mantener tus consumos diarios en S/ 25.00 para cerrar el mes en verde."; saldo restante S/ 300.00.
- CRITICAL (100%): badge "100% utilizado" bg-danger/15 text-danger con punto bg-danger; barra bg-danger; mensaje "Alcanzaste tu límite en S/"; detalle "Llegaste al 100% de tu presupuesto. Cierra el mes sin nuevos consumos o ajusta tu límite en Ajustes."; saldo restante S/ 0.00.
- EXCEEDED (115%): badge ">100% utilizado" bg-danger/15 text-danger con punto bg-danger; barra bg-danger al 100% visual; mensaje "Has superado tu presupuesto en S/"; detalle "Te pasaste por S/ 225.00 este mes. Revisa tus consumos o repite el presupuesto del próximo mes."; saldo restante S/ 0.00 (nunca negativo).

En las tres variantes la barra de progreso representa el porcentaje real pero se dibuja llena al 100% (tope visual); el badge muestra el valor real (>100% cuando excede).

Estructura: sidebar izquierda (Inicio activo) + H1 "¡Hola, Carlos! 👋" + subtítulo con la fecha local + pill del mes + card de alerta contextual + grid de 2 columnas con el bloque "Presupuestos mensuales" a la izquierda.
```

---

## BLOQUE 5 — INSTRUCCIONES FINALES PARA STITCH

```text
INSTRUCCIONES FINALES

1. NO propongas alternativas ni hagas preguntas de clarificación: toda la información necesaria está en este prompt.
2. NO inventes funcionalidad que no esté aquí. Si una pantalla necesita un dato que no se especifica, usa un placeholder realista (nombres, montos, fechas en español de Perú: "Carlos", "S/ 1,500.00", "Sábado, 31 de octubre").
3. NO inventes navegación nueva: las rutas son /onboarding, /login, /session-closed, /setup, /dashboard, /dashboard/expenses, /dashboard/add-expense, /dashboard/incomes, /dashboard/add-income, /dashboard/settings.
4. Mantén EXACTAMENTE los mismos tokens (colores, tipografía, espaciado, radios) en todas las pantallas. La diferencia mobile vs desktop es SOLO layout (sidebar vs bottom nav, tabla vs cards).
5. Usa Material Symbols Outlined para la iconografía de UI y emojis SOLO para los iconos de categoría.
6. Todos los textos visibles van en español (Perú), con los emojis donde el spec los indica.
7. Incluye aria-labels en botones de solo icono y foco visible.
8. Respeta los estados: disabled (opacity 50%), hover, activo (bg-primary-container / bg-primary), error inline (bg-error-container), success inline (bg-primary/10), toast (fondo oscuro, fijo arriba, centrado).
9. Cada pantalla debe verse como la MISMA app: si un revisor pone las 20 pantallas lado a lado, deben compartir tipografía, radios, sombras, densidad y paleta sin una sola excepción.
10. ENTREGA EL HTML con Tailwind (config con los tokens de color, borderRadius, spacing y fontSize del design system) y el nombre de archivo = ID de pantalla (P01…P17).
11. VIEWPORT OBLIGATORIO:
    - MOBILE → viewport de 390x844, layout mobile-first, escala tipográfica mobile (headline-lg-mobile 30/38, headline-xl-mobile 24/32), bottom nav + FAB, SIN sidebar.
    - DESKTOP → viewport de 1440x900, sidebar fija de 240px, escala tipográfica desktop (headline-xl 36/44, headline-lg 28/36), SIN bottom nav y SIN FAB.
    - Nunca generes un layout híbrido. Nunca generes ambas versiones en un solo HTML.
12. Aplica SIEMPRE el shell del bloque correspondiente: Bloque 1B en MOBILE, Bloque 1C en DESKTOP. Ninguna pantalla queda sin shell (salvo P01–P04 en mobile, que son pre-app: centradas, sin bottom nav ni header fijo).
```

---

## Uso desde el MCP (resumen operativo)

```text
# 1) Cargar design system (solo la primera vez)
upload_design_md(projectId="<ID>", designMdBase64=base64(stitch/paltazo/DESIGN.md))
# luego create_design_system_from_design_md(projectId="<ID>") → devuelve designSystem id

# 2) Por cada pantalla, DOS llamadas (mobile primero, luego desktop)
#    PASADA 1 — MOBILE
generate_screen_from_text(
  projectId="<ID>",
  designSystem="assets/<designSystem id>",
  deviceType="MOBILE",
  prompt="BLOQUE 1 + BLOQUE 1B + BLOQUE 2 + BLOQUE 4(Pxx) + BLOQUE 5"
)
#    PASADA 2 — DESKTOP
generate_screen_from_text(
  projectId="<ID>",
  designSystem="assets/<designSystem id>",
  deviceType="DESKTOP",
  prompt="BLOQUE 1 + BLOQUE 1C + BLOQUE 2 + BLOQUE 4(Pxx) + BLOQUE 5"
)
```

> **Nota:** Stitch tiene límite de contexto por prompt. Si truncas, divide así: mantén siempre el BLOQUE 1 (design system) + el bloque de shell (1B o 1C) + el bloque de pantalla; el BLOQUE 2 (reglas) solo debe ir completo en las pantallas complejas (P02, P04, P05, P07, P10) y puede resumirse en las demás.
>
> **Orden recomendado:** genera primero las 10 variantes mobile, luego las 10 desktop. Así primero fijas el lenguaje visual móvil (que es el prioritario: la app es mobile-first) y las desktop salen como adaptación.
>
> **Verificación posterior:** al bajar los assets (`download_assets`), revisa que (a) ninguna pantalla desktop tenga bottom nav, (b) ninguna mobile tenga sidebar, (c) las 20 pantallas compartan paleta y tipografía. Un HTML generado con el shell equivocado se detecta en 5 segundos mirando si existe un `fixed bottom-0` en un desktop.

---

## Checklist de cobertura funcional (verificación antes de enviar)

| Área | Pantallas | Estado |
|---|---|---|
| Auth: login, registro, recuperación, nueva contraseña, Google (shortcut) | P02 | ✅ CU-001..004, CU-007 |
| Auth: sesión cerrada | P03 | ✅ CU-005 |
| Auth: primer ingreso / setup moneda + presupuesto | P04 | ✅ CU-021 |
| Onboarding público | P01 | ✅ CU-018 |
| Dashboard: multi-moneda, balance, presupuestos, 7 días, días restantes, empty state | P05, P16, P17 | ✅ CU-012, CU-014, CU-034 |
| Gastos: crear (monto, presets, moneda, categoría, fecha, descripción), editar inline, eliminar, listar, empty | P06, P07, P11 | ✅ CU-008..011 |
| Ingresos: crear, editar inline, eliminar, listar, empty | P08, P09, P11 | ✅ CU-027..030 |
| Settings: presupuestos por moneda, monedas (agregar/quitar), categorías de gasto, categorías de ingreso, niveles de alerta, acerca de, push, sync, logout | P10, P14 | ✅ CU-015..017, CU-022, CU-023 |
| Categorías: crear/editar (16 emojis, 8 colores), "Otros" protegida, reasignación a "Otros" | P13, P15 | ✅ CU-024..026, CU-031..033 |
| Alertas: 80% / 100% / >100%, sin límite, sugerencia de gasto diario | P17 | ✅ CU-013 |
| Offline: indicador de conexión + cola de sync | P05 (header), P10 §8 | ✅ CU-019 |
| Push: consentimiento | P10 §5 | ✅ CU-020 |
| Multi-moneda: S/ $ €, principal, promoción automática | P02, P04, P06, P07, P10 | ✅ CU-021..023 |
| Responsive mobile + desktop | todas | ✅ |
| Accesibilidad: aria-labels, foco, focus trap | P11–P15 | ✅ |
| Rutas protegidas / middleware (sin flash) | todas | ✅ CU-006 |

**Total: 34 casos de uso (CU-001..CU-034) + 27 historias de usuario (US-001..US-027) cubiertos.**
