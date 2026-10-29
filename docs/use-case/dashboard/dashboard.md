# Casos de Uso: Dashboard

> Panel principal post-login. Responde la pregunta del producto:
> *¿cuánto he gastado este mes y cuánto me queda antes del paltazo?*
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
- `src/lib/store.tsx` → `expenses`, `budget`, `budgets`

### Precondiciones
- Usuario autenticado (`userId ≠ null`)
- Datos cargados en store: `expenses`, `budget`, `budgets`

### Disparador
Usuario navega a `/dashboard` (ruta raíz post-login).

### Flujo principal
1. Sistema obtiene fecha actual (`new Date()`): `currentMonth`, `currentYear`, `daysInMonth`, `currentDay`, `daysRemaining`
2. Sistema filtra `expenses` al mes actual usando prefijo `YYYY-MM` → `monthlyExpenses`
3. Sistema construye `currencySummaries`:
   - Recolecta monedas activas: monedas con gastos en el mes + moneda principal + monedas en `budgets`
   - Para cada moneda calcula:
     - `monthlyLimit`: presupuesto asignado (0 si no existe)
     - `totalExpenses`: suma de gastos en esa moneda
     - `percentage`: `min(totalExpenses / monthlyLimit * 100, 100)` (0 si no hay límite)
     - `remaining`: `max(monthlyLimit - totalExpenses, 0)`
     - `alertLevel`: `safe | warning | critical | exceeded`
     - `alertMessage`: texto contextual según nivel
4. Sistema ordena monedas: `S/` primero, luego alfabético
5. Sistema identifica `primarySummary` (moneda principal o primera disponible)
6. Vista renderiza:
   - **Header:** Saludo "¡Hola! 👋" + subtítulo "Mantén tu economía tan fresca como una palta"
   - **Card de alerta contextual:** `primarySummary.alertMessage` + badge "Quedan X días"
   - **Bloque "Presupuestos mensuales":**
     - Badge con count de monedas
     - Una sub-card por moneda: monto límite, barra de progreso, gastado/restante
     - **Días restantes del mes:** integrado dentro de este bloque (no es card separada)
     - Botones "📊 Ver reporte" → `/dashboard/expenses` y "⚙️ Ajustes" → `/dashboard/settings`
   - **Gráfico de barras** de los últimos 7 días (→ CU-014)
   - **Listado de gastos** del día seleccionado en la barra
   - **Tip motivacional inferior:** "💡 Consejo Paltazo del día"

### Flujos alternativos

**Paso 3 — Usuario sin presupuesto configurado (`monthlyLimit = 0`):**
- Condición: `monthlyLimit === 0`
- Comportamiento: Sub-card muestra "Sin límite" y total gastado sin barra de progreso. Mensaje: "{currency} {amount} registrados (sin presupuesto configurado)"

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

**⚠️ BUG CONOCIDO: Nivel `exceeded` inalcanzable**
- **Problema:** `percentage` se calcula con `Math.min((totalExpenses / monthlyLimit) * 100, 100)`, lo que capa el valor máximo en 100. Por lo tanto, `percentage >= 101` nunca se cumple.
- **Impacto:** El nivel `exceeded` (rojo intenso para >100%) es código muerto. Usuarios que gasten 150% de su presupuesto solo ven `critical` (rojo), no `exceeded`.
- **Estado:** BUG documentado. Requiere decisión: eliminar el cap de 100% en el cálculo, o eliminar el nivel `exceeded` de la documentación.
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
