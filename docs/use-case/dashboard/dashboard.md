# Casos de Uso: Dashboard

> Panel principal post-login. Responde la pregunta del producto:
> *¿cuánto dinero tengo disponible ahora y cuánto he gastado este mes?*
> Soporta múltiples monedas simultáneas, con la moneda principal del usuario como foco.

---

## CU-012: Visualizar dashboard mensual

### Objetivo
Ver en una mirada el estado del presupuesto mensual, gasto acumulado y remaining por cada moneda que el usuario maneja.

### Alcance
Dashboard principal (`/dashboard` o `/`)

### Actor principal
Usuario autenticado

### Fuente
- `src/app/dashboard/page.tsx` (comportamiento implementado)
- `src/lib/store.tsx` → `expenses`, `incomes`, `budget`, `budgets`
- `src/lib/tips.ts` → `TIPS`, `loadTips()`, `getTipOfDay()` (rotación barajada)
- `src/components/ui/BottomNav.tsx` → navegación inferior (Inicio, Ingresos, Gastos, Ajustes)

### Precondiciones
- Usuario autenticado (`userId ≠ null`)
- Datos cargados en store: `expenses`, `budget`, `budgets`

### Disparador
Usuario navega a `/dashboard` (ruta raíz post-login).

### Flujo principal
1. Sistema obtiene fecha actual (`new Date()`): `currentMonth`, `currentYear`, `daysInMonth`, `currentDay`, `daysRemaining`
2. Sistema filtra `expenses` al mes actual usando prefijo `YYYY-MM` → `monthlyExpenses`
3. Sistema construye `currencySummaries`:
   - Recolecta monedas activas: monedas con gastos en el mes + monedas en `budgets`
   - **NO agrega `budget.currency` automáticamente** (puede ser DEFAULT_BUDGET fantasma si no existe en `budgets`)
   - Para cada moneda calcula:
     - `monthlyLimit`: presupuesto asignado (0 si no existe)
     - `totalExpenses`: suma de gastos en esa moneda
     - `percentage`: `totalExpenses / monthlyLimit * 100` (sin tope del 100%, 0 si no hay límite)
     - `remaining`: `max(monthlyLimit - totalExpenses, 0)`
     - `alertLevel`: `safe | warning | critical | exceeded`
     - `alertMessage`: texto contextual según nivel
4. Sistema ordena monedas alfabéticamente (sin priorizar S/, fix BUG-008)
5. Sistema identifica `primarySummary` (primera moneda disponible)
6. Vista renderiza:
   - **Header:** Saludo "¡Hola! 👋" + subtítulo con fecha local (formato RAE, sin año).
   - **Tip Paltazo del día:** `src/lib/tips.ts` → `getTipOfDay(tips)`. Lista desde Supabase (tabla `tips`, lectura pública) con fallback a 30 consejos hardcoded. Rotación barajada sin repetición vía `localStorage` (`paltazo:tips-v1`): un tip por día, se baraja al agotar. Ubicado justo debajo del header.
   - **"💰 Saldo disponible":** ver CU-034. Muestra saldo histórico total (chanchito) por moneda. Reemplaza el antiguo "Balance del mes".
   - **"Presupuestos mensuales":** CU-012 clásico (mensual, con barra de progreso, días restantes).
   - **Gráfico de barras** de los últimos 7 días (→ CU-014)
   - **Listado de gastos** del día seleccionado en la barra

### Flujos alternativos

**Paso 3 — Usuario sin presupuesto configurado (`monthlyLimit = 0`):**
- Condición: `monthlyLimit === 0`
- Comportamiento: Sub-card muestra "Sin límite" y total gastado sin barra de progreso. Mensaje: "{currency} {amount} registrados (sin presupuesto configurado)"

**Paso 3 — Usuario sin monedas configuradas (empty state):**
- Condición: `currencySummaries.length === 0` (usuario no tiene presupuestos configurados ni gastos en el mes)
- Comportamiento: Sección "Presupuestos mensuales" muestra empty state con:
  - Emoji 💰 (opacity 50%)
  - Mensaje principal: "No tienes monedas configuradas"
  - Mensaje secundario: "Agrega una moneda y configura tu presupuesto mensual para comenzar a registrar gastos"
  - Botón "⚙️ Configurar moneda" que navega a `/dashboard/settings`
  - Badge de count de monedas se oculta
  - Sección de balance (`balanceSummaries`) también se oculta (no muestra "S/ +0.00 -0.00" ficticio)

**Paso 3 — Moneda sin gastos y sin presupuesto:**
- Condición: Moneda no tiene gastos en el mes ni presupuesto
- Comportamiento: No se muestra en el resumen (excepto la moneda principal que siempre aparece)

**Paso 6 — Barra de gráfico sin gastos seleccionada:**
- Condición: `selectedBarDateExpenses.length === 0`
- Comportamiento: Estado vacío "📭 No hay gastos registrados para este día"

### Excepciones
—

### Postcondiciones
- **En éxito:** Usuario tiene visión completa de su situación mensual multi-moneda
- `primarySummary` se usa como referencia para la card de alerta superior

### Reglas de negocio
- Cálculos puramente client-side sobre datos del store
- Filtrado por mes basado en `YYYY-MM` prefix del campo `date`
- Moneda principal siempre visible, incluso sin gastos

### Criterios de aceptación
- ✅ Dashboard muestra una sub-card por moneda con gastos o presupuesto
- ✅ Moneda principal (`S/`) aparece primero
- ✅ Barra de progreso refleja porcentaje de gasto
- ✅ Card de alerta contextual muestra mensaje según nivel
- ✅ Badge de días restantes visible
- ✅ Gráfico de barras interactivo (click para seleccionar día)
- ✅ Listado inferior muestra gastos del día seleccionado
- ✅ Botones de navegación a expenses y settings

### Preguntas pendientes
—

---

## CU-013: Alertas de umbral

### Objetivo
Alertas visuales reactivas cuando el gasto mensual cruza umbrales de 80%, 100% o >100%.

### Alcance
Dashboard principal (lógica de presentación dentro de CU-012)

### Actor principal
Sistema (lógica reactiva, no interacción directa del usuario)

### Fuente
- `src/app/dashboard/page.tsx` → `CurrencySummary` interface y cálculos (comportamiento implementado)

### Precondiciones
- Dashboard renderizado (CU-012)
- Al menos una moneda con `monthlyLimit > 0` y gastos registrados

### Disparador
Recálculo de `currencySummaries` tras cualquier cambio en `expenses` o `budgets`.

### Flujo principal
1. Sistema evalúa `percentage` por moneda
2. Asigna `alertLevel` según la regla:
   - `percentage >= 101` → `exceeded` (rojo intenso)
   - `percentage >= 100` → `critical` (rojo)
   - `percentage >= 80` → `warning` (amarillo)
   - resto → `safe` (primary)
3. Sistema compone `alertMessage`:
   - `exceeded`: "Has superado tu presupuesto en {currency}"
   - `critical`: "Alcanzaste tu límite en {currency}"
   - `warning`: "Ritmo de gasto moderado en {currency}"
   - `safe` con límite: "{currency} dentro del límite"
   - `safe` sin límite: "{currency} sin presupuesto configurado"
4. Card superior muestra `primarySummary.alertMessage` + días restantes
5. Si `percentage >= 80`, texto sugiere gasto diario recomendado:
   - `remaining / daysRemaining` formateado a 2 decimales
6. Barra de progreso adopta color del nivel:
   - `>= 100%` → `bg-danger`
   - `>= 80%` → `bg-warning`
   - `< 80%` → `bg-primary`
7. Badge de porcentaje en sub-card cambia de estilo:
   - `>= 100%`: `bg-danger/15 text-danger`
   - `>= 80%`: `bg-warning/15 text-warning`
   - `< 100%` con límite: `bg-primary/15 text-primary`
   - sin límite: `bg-surface-container text-text-secondary`

### Flujos alternativos

**Paso 1 — Sin presupuesto (`monthlyLimit = 0`):**
- Condición: `monthlyLimit === 0`
- Comportamiento: `alertLevel = 'safe'`, no se muestra barra ni porcentaje

**Paso 1 — Múltiples monedas:**
- Condición: Usuario tiene más de una moneda
- Comportamiento: Cada moneda tiene su propio nivel; la card superior usa `primarySummary`

### Excepciones

**Resolución formal de BUG-001 (Nivel `exceeded`):**
- **Decisión cerrada:** Eliminar el tope `Math.min((totalExpenses / monthlyLimit) * 100, 100)` en el cálculo de `percentage` en `src/app/dashboard/page.tsx`.
- **Comportamiento requerido:** Valores `percentage >= 101` activarán efectivamente el nivel `exceeded` (alerta en rojo intenso y mensaje "Has superado tu presupuesto en {currency}"), eliminando la condición de código muerto.
- **Workaround actual:** El badge muestra ">100%" visualmente, pero el `alertLevel` interno nunca alcanza `exceeded`.

### Postcondiciones
- **En éxito:** Usuario percibe visualmente el nivel de riesgo sin necesidad de leer números
- Sugerencia de gasto diario aparece solo cuando hay días restantes y saldo positivo

### Reglas de negocio
- Cálculo de `percentage` capado en 100 para la barra (evita overflow visual) — **pero esto causa el BUG del nivel `exceeded`**
- `remaining` acotado a 0 como mínimo (no muestra negativos)
- **⚠️ Shortcut:** Alertas no idempotentes. El brief original propone banderas para evitar spam al oscilar el saldo. Implementación actual: reactiva, recalculada en cada render. Si el gasto baja del umbral y vuelve a subir en el mismo mes, la alerta se muestra de nuevo.

### Criterios de aceptación
- ✅ Card superior muestra mensaje contextual según nivel
- ✅ Barra de progreso cambia de color según umbral
- ✅ Badge de porcentaje adopta estilo del nivel
- ✅ Sugerencia de gasto diario cuando aplica
- ✅ Transición suave entre niveles

### Preguntas pendientes
1. **BUG `exceeded`:** ¿Eliminar el cap de 100% en el cálculo, o eliminar el nivel `exceeded` de la documentación? (Requiere decisión de producto)

---

## CU-014: Consultar actividad de los últimos 7 días

### Objetivo
Visualizar en un gráfico de barras la distribución de gastos por día durante la última semana, permitiendo explorar el detalle de cada día.

### Alcance
Dashboard principal (sección inferior)

### Actor principal
Usuario autenticado

### Fuente
- `src/app/dashboard/page.tsx` → `last7Days`, `selectedBarDate`, `selectedBarDateExpenses` (comportamiento implementado)

### Precondiciones
- Dashboard renderizado (CU-012)
- `expenses` cargado en store

### Disparador
Dashboard carga datos iniciales.

### Flujo principal
1. Sistema calcula `last7Days` desde hoy hacia atrás (inclusive):
   - Para cada día: `date` (ISO), `day` (número), `dayName` (D/L/M/X/J/V/S), `count` (cantidad de gastos)
2. Sistema calcula `maxBarCount = max(...counts)` (mínimo 1 para evitar división por cero)
3. Estado inicial `selectedBarDate = todayStr`
4. Sistema renderiza gráfico de barras horizontal:
   - Cada barra tiene altura proporcional a `count / maxBarCount * 100`
   - Barras con gastos: altura mínima 8% si no hay gastos
   - Barra seleccionada: `bg-primary`
   - Barra de hoy (si no está seleccionada): `bg-secondary`
   - Barras con gastos no seleccionadas: `bg-surface-container-highest` (hover → `bg-secondary`)
   - Barras vacías: `bg-surface-container-high`
5. Debajo de cada barra: nombre del día + número
6. Sobre la barra (si hay gastos): etiqueta con el count
7. Al tocar una barra, sistema setea `selectedBarDate = day.date`
8. Sección inferior "Gastos registrados para el día {fecha}" lista los gastos de ese día:
   - Ordenados por `createdAt` descendente
   - Header muestra contador (badge)
   - Vista desktop: tabla (Categoría | Descripción | Monto | Acciones "Editar")
   - Vista mobile: cards con icono de categoría, label, descripción, monto
9. Botón "Ver todos →" (desktop) lleva a `/dashboard/expenses`

### Flujos alternativos

**Paso 8 — Sin gastos en la fecha seleccionada:**
- Condición: `selectedBarDateExpenses.length === 0`
- Comportamiento: Estado vacío "📭 No hay gastos registrados para este día"

**Paso 4 — Todos los días con 0 gastos:**
- Condición: `maxBarCount === 1` (no hay gastos en los últimos 7 días)
- Comportamiento: Barras se muestran en altura mínima (8%) con color neutro

### Excepciones
—

### Postcondiciones
- **En éxito:** Usuario identifica visualmente qué días tuvo más actividad. Usuario puede navegar entre días tocando las barras.

### Reglas de negocio
- `last7Days` incluye el día actual como último elemento
- `maxBarCount` garantizado ≥ 1
- Gastos del día se filtran por `date === selectedBarDate`

### Criterios de aceptación
- ✅ Gráfico muestra exactamente 7 barras (hoy inclusive)
- ✅ Barras proporcionales al count de gastos
- ✅ Barra seleccionada cambia de color (primary)
- ✅ Barra de hoy se distingue (secondary) si no está seleccionada
- ✅ Click en barra actualiza listado inferior
- ✅ Listado muestra gastos del día seleccionado
- ✅ Empty state cuando no hay gastos en el día
- ✅ Botón "Ver todos" navega a vista completa

### Preguntas pendientes
—

---

## CU-034: Visualizar saldo disponible en dashboard

### Objetivo
Mostrar el **saldo histórico total** (acumulado) por moneda: la suma de todos los ingresos menos la suma de todos los gastos registrados desde el primer día. Responde: *¿cuánto dinero tengo disponible ahora (mi "chanchito")?* Complementa "Presupuestos mensuales", que sigue siendo mensual.

### Alcance
Dashboard principal (`/dashboard`). Extensión de CU-012. Sección superior ubicada **antes** del bloque "Presupuestos mensuales".

### Actor principal
Usuario autenticado.

### Actores secundarios
Ninguno.

### Fuente
- Requisito de producto (03 nov 2026): "mapear todos los ingresos (salario, deuda, préstamo, etc.) como un chanchito que se reduce con los gastos".

### Precondiciones
- Dashboard renderizado (CU-012).
- Datos cargados en store: `expenses`, `incomes`, `budgets`.

### Disparador
Cualquier cambio en `expenses` o `incomes` (recálculo reactivo).

### Flujo principal
1. Sistema construye `balanceSummaries` por moneda, **sin filtro de fecha**:
   - Recolecta monedas activas: monedas con gastos o ingresos en cualquier fecha + monedas en `budgets`
   - **NO agrega `budget.currency` automáticamente** (fix BUG-008)
   - Para cada moneda activa calcula:
     - `totalIncome`: suma de **todos** los ingresos en esa moneda (histórico absoluto).
     - `totalExpense`: suma de **todos** los gastos en esa moneda (histórico absoluto).
     - `balance`: `totalIncome - totalExpense`.
2. Sistema ordena monedas alfabéticamente (sin priorizar S/, fix BUG-008).
3. Vista renderiza sección "💰 Saldo disponible":
   - Título de sección (sin badge de count de monedas).
   - Una sub-card por moneda con: total ingresado (emerald), total gastado (red), **saldo neto destacado** (headline-lg, color emerald/rojo/neutro según signo).
   - Saldo positivo → texto `emerald` con signo `+`.
   - Saldo negativo → texto `red`.
   - Saldo cero → texto neutro.
4. Sección incluye botón "📥 Ver todos →" que navega a `/dashboard/incomes`.

### Flujos alternativos

**Paso 1 — Usuario sin ingresos registrados:**
- Condición: No hay `incomes` en el histórico.
- Comportamiento: Sub-cards muestran ingresos en 0. Balance = − total gastado.

**Paso 1 — Moneda con ingresos pero sin gastos:**
- Condición: Moneda tiene ingresos pero no gastos en el histórico.
- Comportamiento: Balance = + total ingresado. Gastos muestra `0.00`.

**Paso 3 — Usuario sin monedas activas:**
- Condición: No hay monedas configuradas (caso borde, no debería ocurrir post-onboarding).
- Comportamiento: Sección no se renderiza.

### Excepciones
Ninguna.

### Postcondiciones
- **En éxito:** usuario ve su dinero disponible acumulado por moneda, independiente del mes.
- Recálculo reactivo tras cualquier cambio en ingresos o gastos.

### Reglas de negocio
- Cálculos puramente client-side sobre datos del store.
- **Balance por moneda (no se mezclan monedas, no se usa tipo de cambio).**
- **Histórico absoluto**: no se reinicia cada mes, no usa filtro `YYYY-MM`.
- Sección complementa (no reemplaza) bloque de presupuestos (que sí es mensual).
- Moneda principal siempre visible, incluso sin ingresos.

### Criterios de aceptación
- ✅ Sección "💰 Saldo disponible" visible en dashboard.
- ✅ Se ubica antes de "Presupuestos mensuales".
- ✅ Una sub-card por moneda activa.
- ✅ Saldo con color según signo (emerald positivo, red negativo, neutro cero).
- ✅ Saldo suma todo el histórico (no solo el mes).
- ✅ Recalcula reactivamente al agregar/editar/eliminar ingreso o gasto.
- ✅ Botón "📥 Ver todos →" navega a `/dashboard/incomes`.

### Preguntas pendientes
Ninguna. Decisiones cerradas:
- ~~¿Mensual o histórico?~~ → **Histórico absoluto (chanchito).**
- ~~¿Por moneda o unificado?~~ → **Por moneda (sin tipo de cambio).**
- ~~¿Reemplaza "Balance del mes"?~~ → **Sí, lo sustituye.**
