# Casos de Uso: Gastos

> Módulo de gestión de gastos. CRUD atómico sobre el mes en curso.
> Categorías: por defecto + personalizadas del usuario (CU-024 a CU-026, PROPUESTO). Código actual: 5 hardcodeadas en `src/lib/categories.ts`.
> Monedas: las activas del usuario entre `S/`, `$` y `€` (CU-021 a CU-023, PROPUESTO). Código actual: `S/` y `$` fijas.

---

## CU-008: Crear gasto

### Objetivo
Registrar un nuevo gasto con monto, categoría, moneda y fecha para que se refleje en el presupuesto del mes.

### Alcance
Módulo de gastos (`/dashboard/add-expense`)

### Actor principal
Usuario autenticado

### Actores secundarios
—

### Fuente
- `src/app/dashboard/add-expense/page.tsx` (comportamiento implementado)
- `src/lib/store.tsx` → `addExpense()`
- `src/lib/categories.ts` → `EXPENSE_CATEGORIES`

### Precondiciones
- Usuario autenticado (`userId ≠ null`)
- Usuario navega a `/dashboard/add-expense` (desde FAB, botón "Agregar gasto" en header, o CTA en estado vacío)

### Disparador
Usuario hace clic en FAB `+`, botón "Agregar gasto", o CTA en estado vacío.

### Flujo principal
1. Sistema redirige a `/dashboard/add-expense`
2. Formulario se inicializa con:
   - Moneda: `budget.currency` (moneda principal del usuario)
   - Categoría: `food` (default)
   - Fecha: hoy (`new Date().toISOString().split('T')[0]`)
   - Monto: vacío
   - Descripción: vacía
3. Usuario ingresa monto mediante teclado numérico decimal (`inputMode="decimal"`)
   - Sistema formatea automáticamente como `X.XX` con separadores de miles
   - Input oculto con `opacity-0`, solo visible el display formateado
   - Usuario puede seleccionar preset rápido: `15.00 / 30.00 / 50.00 / 100.00` (en la moneda seleccionada)
4. Usuario puede cambiar moneda con toggles superiores (botones redondeados) entre sus monedas activas (PROPUESTO: CU-021/CU-022; código actual: `S/` o `$`)
5. Usuario puede completar descripción (opcional, max ~200 chars visibles)
6. Usuario selecciona categoría tocando un tile (icono + label) entre las categorías por defecto y sus categorías personalizadas (PROPUESTO: CU-024 a CU-026). Código actual, 5 fijas:
   - 🍽️ Comida
   - 🚗 Transporte
   - 💡 Servicios
   - 🎬 Entretenimiento
   - 📝 Otros
7. Usuario puede cambiar fecha con picker nativo (`<input type="date">`)
8. Usuario hace clic en "✓ Guardar y Continuar"
9. Sistema valida `numericValue > 0`
10. Sistema llama `store.addExpense({ amount, currency, category, description?, date })`
11. Store persiste en Supabase (vía `repositories.addExpense()`) y actualiza estado local
12. Sistema muestra toast "✓ Gasto registrado" (2s, posicionado fijo arriba centrado)
13. Sistema limpia el formulario:
    - Moneda vuelve a `initialCurrency`
    - Resto se resetea a defaults
14. Dashboard recalcula gastos del mes automáticamente

### Flujos alternativos

**Paso 3 — Usuario quiere descartar cambios:**
- Condición: Usuario toca "←" (botón atrás) o "Cancelar"
- Si `hasChanges = true` (monto, descripción, categoría o moneda cambiaron) → abre modal "¿Descartar cambios?" con opciones "Cancelar" / "Descartar"
- Si `hasChanges = false` → `router.back()` inmediato

**Paso 8 — Monto = 0 o vacío:**
- Condición: `numericValue <= 0`
- Comportamiento: Botón "Guardar y Continuar" permanece `disabled`

**Paso 8 — Usuario limpia formulario manualmente:**
- Condición: Usuario toca "🗑️ Limpiar"
- Comportamiento: Ejecuta `handleClear()` → resetea todos los campos a defaults

### Excepciones

**Paso 11 — Error de red al persistir:**
- Condición: `db.addExpense()` falla
- Respuesta: Store lanza error, toast no se muestra, formulario mantiene valores ingresados
- Estado final: Gasto NO registrado, usuario puede reintentar

### Postcondiciones
- **En éxito:** Nuevo registro en tabla `expenses` con UUID, `user_id`, `amount`, `currency`, `category`, `description?`, `date`, `created_at`. Toast de éxito por 2s. Formulario limpiado (moneda vuelve a inicial).
- **En fallo:** Gasto NO persistido. Estado local NO modificado. Usuario puede reintentar.

### Reglas de negocio
- Monto requerido, `> 0`, numérico, max 9 dígitos enteros, 2 decimales
- Categoría requerida (default `food`); debe pertenecer a las categorías disponibles del usuario: por defecto + personalizadas (PROPUESTO: CU-024 a CU-026; código actual: `EXPENSE_CATEGORIES`)
- Fecha requerida, formato `YYYY-MM-DD`, por defecto hoy
- Descripción opcional, max 200 chars
- Moneda requerida, debe ser una de las monedas activas del usuario (PROPUESTO: CU-021/CU-022; código actual: `CURRENCY_OPTIONS` con `S/` o `$`)
- Gasto siempre pertenece al usuario autenticado (`userId` inmutable)

### Criterios de aceptación
- Usuario puede ingresar monto con teclado numérico decimal
- Presets rápidos (`15/30/50/100`) funcionan y muestran monto en moneda seleccionada
- Usuario puede cambiar moneda con toggles entre sus monedas activas (código actual: `S/` o `$`)
- Usuario puede seleccionar categoría entre las disponibles (por defecto + personalizadas, PROPUESTO; código actual: 5 opciones) con icono + label
- Usuario puede cambiar fecha con picker nativo
- Botón "Guardar" deshabilitado si `monto ≤ 0`
- Toast de éxito mostrado por 2s tras guardar
- Formulario se limpia tras guardar (moneda vuelve a inicial)
- Modal de confirmación si usuario intenta salir con cambios sin guardar
- Gasto persistido en Supabase con todos los campos requeridos

### Preguntas pendientes
1. **Botón "Agregar categoría" (+):** RESUELTO (29 oct 2026) — la creación de categorías queda definida en CU-024 (PROPUESTO), con acceso rápido `+ Nueva categoría` desde el selector/modal de categoría al registrar gasto. Ubicación en navegación definida en `categories/categories.md` — CU-024, "Alcance".
2. **Offline-first con estado optimista:** Originalmente documentado como "store mantiene estado optimista; toast de error; retry al reconectar". **Estado: FUTURO** (comportamiento actual es síncrono, sin cola de sync persistente).
3. **Validación de descripción:** No hay validación explícita de longitud máxima en cliente. ¿Implementar validación de 200 chars?

---

## CU-009: Listar gastos del mes

### Objetivo
Ver todos los gastos del mes agrupados por fecha, con totales y acceso rápido a editar/eliminar.

### Alcance
Módulo de gastos (`/dashboard/expenses`)

### Actor principal
Usuario autenticado

### Fuente
- `src/app/dashboard/expenses/page.tsx` (comportamiento implementado)

### Precondiciones
- Usuario autenticado
- Usuario navega a `/dashboard/expenses` (desde BottomNav o botón "Ver reporte")

### Disparador
Navegación a `/dashboard/expenses`.

### Flujo principal
1. Sistema calcula `monthPrefix` del mes actual (`YYYY-MM`)
2. Sistema filtra `expenses` del store al mes actual
3. Sistema calcula `monthlyTotal` en moneda principal del usuario (`budget.currency`)
4. Sistema ordena gastos por fecha descendente
5. Sistema agrupa gastos por fecha en `Record<date, Expense[]>`
6. **Vista desktop:** tabla con columnas Fecha | Categoría | Descripción | Monto | Acciones
7. **Vista mobile:** cards agrupadas por fecha, cada grupo muestra subtotal en moneda principal
8. Header muestra total de registros y total gastado vs. límite configurado
9. Usuario puede hacer clic en "✏️" para editar inline (→ CU-010) o "🗑️" para eliminar (→ CU-011)

### Flujos alternativos

**Paso 6 — No hay gastos:**
- Condición: `sorted.length === 0`
- Comportamiento: Estado vacío con emoji "📭", texto "No hay gastos registrados" y CTA "+ Agregar primer gasto" (redirige a `/dashboard/add-expense`)

### Excepciones
—

### Postcondiciones
- **En éxito:** Usuario ve listado completo de gastos del mes agrupado por fecha. Total acumulado visible en cabecera.

### Reglas de negocio
- Filtrado estricto por mes actual (cliente)
- `monthlyTotal` solo incluye gastos en `budget.currency` (moneda principal)
- RLS garantiza que solo se muestran gastos del usuario autenticado

### Criterios de aceptación
- Listado ordenado por fecha descendente
- Desktop: tabla con columnas correctas
- Mobile: cards agrupadas con subtotal por fecha
- Header muestra count + total gastado vs. límite
- Empty state con CTA

### Preguntas pendientes
—

---

## CU-010: Editar gasto

### Objetivo
Corregir un gasto existente inline sin salir de la vista de listado.

### Alcance
Módulo de gastos (`/dashboard/expenses`, edición inline)

### Actor principal
Usuario autenticado (propietario del gasto)

### Fuente
- `src/app/dashboard/expenses/page.tsx` → `startEdit()` / `saveEdit()` (comportamiento implementado)

### Precondiciones
- Usuario en `/dashboard/expenses`
- Gasto pertenece al usuario (RLS)

### Disparador
Usuario hace clic en "✏️" de un gasto.

### Flujo principal
1. Sistema setea `editingId = expense.id` y carga `editForm` con valores actuales (`amount`, `description`, `category`, `date`)
2. **Vista desktop:** fila de tabla se reemplaza por fila de edición con inputs inline (monto, descripción, categoría `<select>`, fecha) + botones "✓ Guardar" / "Cancelar"
3. **Vista mobile:** card se expande con grid de inputs (monto + fecha en 2 cols), descripción, categoría `<select>`, botones
4. Usuario modifica los campos deseados
5. Usuario hace clic en "✓ Guardar"
6. Sistema valida `editForm.amount > 0`
7. Sistema llama `store.updateExpense(editingId, { amount, description?, category, date })`
8. Store actualiza en Supabase y refleja cambios en lista
9. Sistema setea `editingId = null` (vuelve a modo lectura)

### Flujos alternativos

**Paso 5 — Monto inválido (≤ 0 o vacío):**
- Condición: `!editForm.amount || parseFloat(editForm.amount) <= 0`
- Comportamiento: No se ejecuta `updateExpense`, función retorna sin persistir

**Paso 4 — Usuario cancela:**
- Condición: Usuario hace clic en "Cancelar"
- Comportamiento: `editingId = null` sin persistir cambios

### Excepciones

**Paso 7 — Error de red:**
- Condición: `db.updateExpense()` falla
- Respuesta: Store lanza error
- Estado final: Gasto NO actualizado

### Postcondiciones
- **En éxito:** Registro actualizado en Supabase. `expenses` del store reflejan cambios. Dashboard recalcula totales.

### Reglas de negocio
- `amount > 0`, numérico
- `category` perteneciente a `['food','transport','services','entertainment','other']`
- `date` en formato `YYYY-MM-DD`
- `description` opcional
- **Moneda NO editable** (el gasto mantiene su moneda original)

### Criterios de aceptación
- Edición inline (no modal, no página nueva)
- Desktop: inputs en fila de tabla
- Mobile: grid de inputs expandido
- Guardar deshabilitado si `amount ≤ 0`
- Cancelar → modo lectura sin persistir

### Preguntas pendientes
—

---

## CU-011: Eliminar gasto

### Objetivo
Eliminar un gasto existente con confirmación obligatoria.

### Alcance
Módulo de gastos (`/dashboard/expenses`, modal de confirmación)

### Actor principal
Usuario autenticado (propietario del gasto)

### Fuente
- `src/app/dashboard/expenses/page.tsx` → `confirmDelete()` / `handleDelete()` (comportamiento implementado)

### Precondiciones
- Usuario en `/dashboard/expenses`
- Gasto pertenece al usuario (RLS)

### Disparador
Usuario hace clic en "🗑️" del gasto.

### Flujo principal
1. Sistema setea `deletingId = expense.id`
2. Modal de confirmación aparece con:
   - Título: "¿Eliminar gasto?"
   - Mensaje: "Esta acción no se puede deshacer."
   - Botones: "Cancelar" / "Eliminar"
3. Usuario hace clic en "Eliminar"
4. Sistema llama `store.deleteExpense(deletingId)`
5. Store elimina registro en Supabase y remueve de `expenses`
6. Sistema setea `deletingId = null` y `editingId = null` (si estaba en edición)
7. Lista se actualiza, totales recalculados

### Flujos alternativos

**Paso 2 — Usuario cierra modal sin eliminar:**
- Condición: Usuario toca fuera del modal (backdrop)
- Comportamiento: `cancelDelete()` → `deletingId = null`
- Nota: Click en contenido del modal no propaga (`e.stopPropagation()`)

### Excepciones

**Paso 5 — Error de red:**
- Condición: `db.deleteExpense()` falla
- Respuesta: Store lanza error
- Estado final: Gasto NO eliminado

### Postcondiciones
- **En éxito:** Registro eliminado de Supabase (hard delete). `expenses` actualizado en store. Totales recalculados.

### Reglas de negocio
- Modal de confirmación **obligatorio** para acciones destructivas (convención global)

### Criterios de aceptación
- Modal centrado con backdrop blur
- Título y mensaje correctos
- Botones "Cancelar" (neutro) / "Eliminar" (error-container)
- Cerrar modal tocando fuera funciona
- Lista actualizada tras eliminar

### Preguntas pendientes
—
