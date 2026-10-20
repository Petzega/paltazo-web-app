# Casos de Uso: Dashboard

> Panel principal post-login. Responde la pregunta del producto:
> *¿cuánto he gastado este mes y cuánto me queda antes del paltazo?*
> Soporta múltiples monedas simultáneas, con la moneda principal del usuario como foco.

---

## CU-012: Visualizar dashboard mensual

**Actor:** Usuario autenticado

**Precondiciones:**
- Usuario logueado (`userId ≠ null`)
- Usuario navega a `/dashboard` (ruta raíz post-login, redirigida por middleware)

**Flujo principal:**
1. Sistema carga `expenses`, `budget` y `budgets` del store
2. Sistema calcula `currentMonth` y `currentYear` desde `new Date()`
3. Sistema filtra `monthlyExpenses` por prefijo `YYYY-MM`
4. Sistema construye `currencySummaries`: un resumen por cada moneda con gastos en el mes + la moneda principal
5. Para cada moneda calcula:
   - `monthlyLimit`: presupuesto asignado (0 si no existe)
   - `totalExpenses`: suma de gastos en esa moneda
   - `percentage`: `min(totalExpenses / monthlyLimit * 100, 100)` (0 si no hay límite)
   - `remaining`: `max(monthlyLimit - totalExpenses, 0)`
   - `alertLevel`: `safe | warning | critical | exceeded`
   - `alertMessage`: texto contextual
6. Ordena monedas: `S/` primero, luego alfabético
7. Vista renderiza:
   - Saludo "¡Hola! 👋" + subtítulo "Mantén tu economía tan fresca como una palta"
   - Card de alerta contextual con nivel y días restantes del mes
   - Bloque "Presupuestos mensuales" con una sub-card por moneda (monto límite, barra de progreso, gastado/restante)
   - Card "Días restantes del mes" con contador
   - Botones "Ver reporte" → `/dashboard/expenses` y "Ajustes" → `/dashboard/settings`
   - Gráfico de barras de los últimos 7 días (→ CU-014)
   - Listado de gastos del día seleccionado en la barra
   - Tip motivacional inferior

**Flujos alternativos:**
- **4a. Usuario sin presupuesto configurado (`monthlyLimit = 0`):** sub-card muestra "Sin límite" y total gastado sin barra de progreso
- **5a. Moneda sin gastos y sin presupuesto:** no se muestra en el resumen (excepto la principal)

**Postcondiciones:**
- Usuario tiene visión completa de su situación mensual multi-moneda
- `primarySummary` se usa como referencia para la card de alerta superior

**Validaciones:**
- Cálculos puramente client-side sobre datos del store
- Filtrado por mes basado en `YYYY-MM` prefix del campo `date`

**UI/UX:**
- Layout responsive: mobile con max-width `xl` centrado; desktop en grid de 2 columnas
- Paleta semántica: primary (safe), warning (80%), danger (100% / exceeded)
- Barra de progreso con transición suave (`duration-700 ease-out`)
- Badge de días restantes en card de alerta
- Tip del día con icono 💡 y texto limitado a 1 línea (`line-clamp-1`)
- FAB "Agregar gasto" flotante en esquina inferior derecha

**Relacionado:**
- CU-013 (alertas de umbral)
- CU-014 (actividad últimos 7 días)
- CU-008 (FAB → crear gasto)

---

## CU-013: Alertas de umbral (80% / 100% / >100%)

**Actor:** Sistema (lógica de presentación reactiva)

**Precondiciones:**
- Dashboard renderizado (CU-012)
- Al menos una moneda con `monthlyLimit > 0` y gastos registrados

**Flujo principal:**
1. Tras cada recálculo de `currencySummaries`, el sistema evalúa `percentage` por moneda
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
4. Card superior muestra el mensaje de la `primarySummary` + días restantes
5. Si `percentage >= 80`, el texto sugiere un gasto diario recomendado:
   - `remaining / daysRemaining` formateado a 2 decimales
6. Barra de progreso de cada moneda adopta el color del nivel:
   - `>= 100%` → `bg-danger`
   - `>= 80%` → `bg-warning`
   - `< 80%` → `bg-primary`
7. Badge de porcentaje en sub-card cambia de estilo:
   - `>= 100%`: `bg-danger/15 text-danger`
   - `>= 80%`: `bg-warning/15 text-warning`
   - `< 100%` con límite: `bg-primary/15 text-primary`
   - sin límite: `bg-surface-container text-text-secondary`

**Flujos alternativos:**
- **1a. Sin presupuesto (`monthlyLimit = 0`):** `alertLevel = 'safe'`, no se muestra barra ni porcentaje
- **1b. Múltiples monedas:** cada una tiene su propio nivel; la card superior usa `primarySummary`

**Postcondiciones:**
- Usuario percibe visualmente el nivel de riesgo sin necesidad de leer números
- Sugerencia de gasto diario aparece solo cuando hay días restantes y saldo positivo

**Validaciones:**
- Cálculo de `percentage` capado en 100 para la barra (evita overflow visual)
- `remaining` acotado a 0 como mínimo (no muestra negativos)

**UI/UX:**
- Card superior con fondo `bg-secondary-container/40`, icono 🌿, y dos líneas de texto
- Transición suave entre niveles (colores cambian con cada recálculo)
- No hay modales ni toasts para alertas (solo feedback visual en dashboard)

**⚠️ Shortcut vs. brief:**
- El brief original (`product-brief-paltazo.md`) propone banderas idempotentes (`alerta_80_disparada`, etc.) para evitar spam al oscilar el saldo.
- Implementación actual: **reactiva, recalculada en cada render**. No persiste banderas.
- Consecuencia: si el gasto baja del umbral y vuelve a subir en el mismo mes, la alerta se muestra de nuevo.
- `shortcut: alertas no idempotentes — revisit when se necesite evitar re-notificación dentro del mismo mes`

**Relacionado:**
- CU-012 (dashboard como contexto de las alertas)
- CU-015 (configurar presupuesto que define los umbrales)

---

## CU-014: Consultar actividad de los últimos 7 días

**Actor:** Usuario autenticado

**Precondiciones:**
- Dashboard renderizado (CU-012)
- `expenses` cargado en store

**Flujo principal:**
1. Sistema calcula `last7Days` desde hoy hacia atrás (inclusive)
2. Para cada día:
   - Fecha ISO (`YYYY-MM-DD`)
   - Número de día del mes
   - Nombre del día abreviado: `['D','L','M','X','J','V','S']`
   - `count` = cantidad de gastos en esa fecha
3. Sistema calcula `maxBarCount = max(...counts)` (mínimo 1 para evitar división por cero)
4. Estado inicial `selectedBarDate = todayStr`
5. Renderiza gráfico de barras horizontal:
   - Cada barra tiene altura proporcional a `count / maxBarCount * 100` (mínimo 8% si hay gastos, 8% si no)
   - Barra seleccionada: `bg-primary`
   - Barra de hoy (si no está seleccionada): `bg-secondary`
   - Barras con gastos: `bg-surface-container-highest`
   - Barras vacías: `bg-surface-container-high`
6. Debajo de cada barra: nombre del día + número
7. Sobre la barra (si hay gastos): etiqueta con el count
8. Al tocar una barra, sistema setea `selectedBarDate = day.date`
9. Sección inferior "Gastos registrados para el día {fecha}" lista los gastos de ese día:
   - Ordenados por `createdAt` descendente
   - Header muestra contador
   - Vista desktop: tabla (Categoría | Descripción | Monto | Acciones)
   - Vista mobile: cards con icono de categoría, label, descripción, monto
10. Botón "Ver todos →" (desktop) lleva a `/dashboard/expenses`

**Flujos alternativos:**
- **9a. Sin gastos en la fecha seleccionada:** estado vacío "📭 No hay gastos registrados para este día"
- **5a. Todos los días con 0 gastos:** barras se muestran en altura mínima con color neutro

**Postcondiciones:**
- Usuario identifica visualmente qué días tuvo más actividad
- Usuario puede navegar entre días tocando las barras

**Validaciones:**
- `last7Days` incluye el día actual como último elemento
- `maxBarCount` garantizado ≥ 1

**UI/UX:**
- Card con fondo `bg-surface-container-low`, título "Actividad de los últimos 7 días"
- Barras con `max-w-[40px]` y `rounded-t-lg`
- Transición suave (`duration-200`) al seleccionar
- Hover en barras no seleccionadas con gastos → `bg-secondary`
- Listado inferior adaptativo (tabla vs. cards)

**Relacionado:**
- CU-012 (dashboard como contenedor)
- CU-009 (listado completo al hacer clic en "Ver reporte")

---

## Notas técnicas

**Estado calculado (todo client-side):**
- `monthlyExpenses`, `currencySummaries`, `last7Days`, `selectedBarDateExpenses` — todos en `useMemo`

**Responsive:**
- Mobile: `max-w-xl mx-auto`, padding `px-gutter`
- Desktop: `md:max-w-none md:px-space-xl`, grid de 2 columnas

**Navegación desde dashboard:**
- `/dashboard/add-expense` (FAB o botón header desktop)
- `/dashboard/expenses` ("Ver reporte" o "Ver todos →")
- `/dashboard/settings` ("Ajustes")

**Performance:**
- `useMemo` sobre filtros pesados para evitar recálculos en cada render
- `useCallback` para handlers (no aplicado en dashboard actual; candidato a refactor)
