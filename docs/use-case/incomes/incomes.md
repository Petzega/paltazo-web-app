# Casos de Uso: Ingresos

> Módulo de gestión de ingresos. Registro de ingresos esporádicos (sueldo, devoluciones, ventas, etc.) con categorías propias, separadas de las de gasto.
> **Estado del módulo:** PROPUESTO — comportamiento previsto, NO implementado. Aprobado en sesión de definición del 30 oct 2026.

---

## CU-027: Registrar ingreso

### Objetivo
Registrar un nuevo ingreso con monto, categoría de ingreso, moneda, fecha y descripción opcional, para que se refleje en el balance mensual.

### Alcance
Módulo de ingresos (`/dashboard/add-income`). Acceso desde FAB `+` del dashboard o botón "Agregar ingreso".

### Actor principal
Usuario autenticado.

### Actores secundarios
Ninguno.

### Fuente
- Requisito de producto (30 oct 2026): registrar ingresos esporádicos con categorías propias, separadas de las de gasto.
- Comportamiento previsto, NO implementado.

### Precondiciones
- Usuario autenticado (`userId ≠ null`).
- Configuración inicial completada (CU-021).
- Al menos una moneda activa (CU-021/CU-022).
- Al menos una categoría de ingreso disponible (5 por defecto o personalizadas).

### Disparador
Usuario pulsa botón `+ Ingreso` en dashboard (FAB o botón en sección Balance).

### Flujo principal
1. Sistema redirige a `/dashboard/add-income`.
2. Formulario se inicializa con:
   - Moneda: `budget.currency` (moneda principal).
   - Categoría: primera categoría de ingreso por defecto (Sueldo 💼).
   - Fecha: hoy.
   - Monto: vacío.
   - Descripción: vacía.
3. Usuario ingresa monto mediante teclado numérico decimal (`inputMode="decimal"`).
   - Sistema formatea automáticamente como `X.XX` con separadores de miles.
4. Usuario puede cambiar moneda entre sus monedas activas (toggles).
5. Usuario selecciona categoría de ingreso entre las disponibles (tiles icono + label).
   - El selector muestra las 5 categorías default + personalizadas del usuario.
   - Incluye botón `+ Nueva categoría` en el selector (acceso rápido inline).
6. Usuario puede completar descripción (opcional, max 200 chars).
7. Usuario puede cambiar fecha con picker nativo (`<input type="date">`).
8. Usuario pulsa "✓ Guardar".
9. Sistema valida `numericValue > 0` y `categoryId` válido en `income_categories`.
10. Sistema llama `store.addIncome({ amount, currency, categoryId, description?, date })`.
11. Store persiste en Supabase (`repositories.addIncome()`) y actualiza estado local.
12. Sistema muestra toast "✓ Ingreso registrado" (2s, posicionado fijo arriba centrado).
13. Sistema limpia el formulario (moneda vuelve a la inicial).
14. Dashboard recalcula balance automáticamente.

### Flujos alternativos

**Paso 5 — Usuario crea categoría al vuelo:**
- Condición: Usuario pulsa `+ Nueva categoría` en el selector.
- Comportamiento: Abre modal inline (→ CU-031) con nombre, emoji y color. Al guardar, preselecciona automáticamente la nueva categoría y continúa en paso 6.

**Paso 9 — Monto ≤ 0 o vacío:**
- Condición: `numericValue <= 0`.
- Comportamiento: Botón "Guardar" permanece `disabled`.

**Paso 3 — Usuario quiere descartar cambios:**
- Condición: Usuario toca "←" (botón atrás) o "Cancelar".
- Si `hasChanges = true` → modal "¿Descartar cambios?" con "Cancelar" / "Descartar".
- Si `hasChanges = false` → `router.back()` inmediato.

### Excepciones

**Paso 11 — Error de red al persistir:**
- Condición: `db.addIncome()` falla.
- Respuesta: Toast no se muestra, formulario mantiene valores ingresados.
- Estado final: Ingreso NO registrado, usuario puede reintentar.

### Postcondiciones
- **En éxito:** nuevo registro en tabla `incomes` con UUID, `user_id`, `amount`, `currency`, `category_id`, `description?`, `date`, `created_at`. Toast de éxito por 2s. Formulario limpiado (moneda vuelve a inicial).
- **En fallo:** ingreso NO persistido. Estado local NO modificado. Usuario puede reintentar.

### Reglas de negocio
- Monto requerido, `> 0`, numérico, max 9 dígitos enteros, 2 decimales.
- Categoría de ingreso requerida; debe pertenecer a `income_categories` del usuario.
- Fecha requerida, formato `YYYY-MM-DD`, por defecto hoy.
- Descripción opcional, max 200 chars.
- Moneda requerida, debe ser una de las monedas activas del usuario.
- Ingreso siempre pertenece al usuario autenticado (`userId` inmutable).

### Criterios de aceptación
- Usuario puede ingresar monto con teclado numérico decimal.
- Usuario puede cambiar moneda con toggles entre sus monedas activas.
- Selector de categorías muestra solo categorías de ingreso (no mezcla con gastos).
- Botón `+ Nueva categoría` visible en el selector (acceso rápido inline).
- Usuario puede cambiar fecha con picker nativo.
- Botón "Guardar" deshabilitado si `monto ≤ 0`.
- Toast de éxito mostrado por 2s tras guardar.
- Formulario se limpia tras guardar (moneda vuelve a inicial).
- Modal de confirmación si usuario intenta salir con cambios sin guardar.
- Ingreso persistido en Supabase con todos los campos requeridos.
- Dashboard recalcula balance tras registrar ingreso.

### Preguntas pendientes
Ninguna. Decisiones cerradas:
- ~~¿Presets rápidos?~~ → **No.** Ingresos esporádicos, sin presets.
- ~~¿Acceso rápido `+ Nueva` desde selector?~~ → **Sí.** Inline, consistente con CU-024.

---

## CU-028: Editar ingreso

### Objetivo
Corregir un ingreso existente inline sin salir de la vista de listado.

### Alcance
Módulo de ingresos (`/dashboard/incomes`, edición inline).

### Actor principal
Usuario autenticado (propietario del ingreso).

### Fuente
- Requisito de producto (30 oct 2026): consistencia con CRUD de gastos (CU-010).
- Comportamiento previsto, NO implementado.

### Precondiciones
- Usuario en `/dashboard/incomes`.
- Ingreso pertenece al usuario (RLS).

### Disparador
Usuario hace clic en "✏️" de un ingreso.

### Flujo principal
1. Sistema setea `editingId = income.id` y carga `editForm` con valores actuales (`amount`, `description`, `categoryId`, `date`).
2. **Vista desktop:** fila de tabla se reemplaza por fila de edición con inputs inline (monto, descripción, categoría `<select>` de `income_categories`, fecha) + botones "✓ Guardar" / "Cancelar".
3. **Vista mobile:** card se expande con grid de inputs (monto + fecha en 2 cols), descripción, categoría `<select>`, botones.
4. Usuario modifica los campos deseados.
5. Usuario hace clic en "✓ Guardar".
6. Sistema valida `editForm.amount > 0`.
7. Sistema llama `store.updateIncome(editingId, { amount, description?, categoryId, date })`.
8. Store actualiza en Supabase y refleja cambios en lista.
9. Sistema setea `editingId = null` (vuelve a modo lectura).

### Flujos alternativos

**Paso 6 — Monto inválido (≤ 0 o vacío):**
- Condición: `!editForm.amount || parseFloat(editForm.amount) <= 0`.
- Comportamiento: No se ejecuta `updateIncome`, función retorna sin persistir.

**Paso 4 — Usuario cancela:**
- Condición: Usuario hace clic en "Cancelar".
- Comportamiento: `editingId = null` sin persistir cambios.

### Excepciones

**Paso 7 — Error de red:**
- Condición: `db.updateIncome()` falla.
- Respuesta: Store lanza error.
- Estado final: Ingreso NO actualizado.

### Postcondiciones
- **En éxito:** registro actualizado en Supabase. `incomes` del store reflejan cambios. Balance recalculado.

### Reglas de negocio
- `amount > 0`, numérico.
- `categoryId` perteneciente a `income_categories` del usuario.
- `date` en formato `YYYY-MM-DD`.
- `description` opcional.
- **Moneda NO editable** (el ingreso mantiene su moneda original).

### Criterios de aceptación
- Edición inline (no modal, no página nueva).
- Desktop: inputs en fila de tabla.
- Mobile: grid de inputs expandido.
- Guardar deshabilitado si `amount ≤ 0`.
- Cancelar → modo lectura sin persistir.

### Preguntas pendientes
Ninguna.

---

## CU-029: Eliminar ingreso

### Objetivo
Eliminar un ingreso existente con confirmación obligatoria.

### Alcance
Módulo de ingresos (`/dashboard/incomes`, modal de confirmación).

### Actor principal
Usuario autenticado (propietario del ingreso).

### Fuente
- Requisito de producto (30 oct 2026): consistencia con CU-011.
- Comportamiento previsto, NO implementado.

### Precondiciones
- Usuario en `/dashboard/incomes`.
- Ingreso pertenece al usuario (RLS).

### Disparador
Usuario hace clic en "🗑️" del ingreso.

### Flujo principal
1. Sistema setea `deletingId = income.id`.
2. Modal de confirmación aparece con:
   - Título: "¿Eliminar ingreso?"
   - Mensaje: "Esta acción no se puede deshacer."
   - Botones: "Cancelar" / "Eliminar".
3. Usuario hace clic en "Eliminar".
4. Sistema llama `store.deleteIncome(deletingId)`.
5. Store elimina registro en Supabase y remueve de `incomes`.
6. Sistema setea `deletingId = null` y `editingId = null` (si estaba en edición).
7. Lista se actualiza, balance recalculado.

### Flujos alternativos

**Paso 2 — Usuario cierra modal sin eliminar:**
- Condición: Usuario toca fuera del modal (backdrop).
- Comportamiento: `cancelDelete()` → `deletingId = null`.

### Excepciones

**Paso 5 — Error de red:**
- Condición: `db.deleteIncome()` falla.
- Respuesta: Store lanza error.
- Estado final: Ingreso NO eliminado.

### Postcondiciones
- **En éxito:** registro eliminado de Supabase (hard delete). `incomes` actualizado en store. Balance recalculado.

### Reglas de negocio
- Modal de confirmación **obligatorio** para acciones destructivas (convención global).

### Criterios de aceptación
- Modal centrado con backdrop blur.
- Título y mensaje correctos.
- Botones "Cancelar" (neutro) / "Eliminar" (error-container).
- Cerrar modal tocando fuera funciona.
- Lista y balance actualizados tras eliminar.

### Preguntas pendientes
Ninguna.

---

## CU-030: Listar ingresos del mes

### Objetivo
Ver todos los ingresos del mes agrupados por fecha, con totales y acceso rápido a editar/eliminar.

### Alcance
Módulo de ingresos (`/dashboard/incomes`).

### Actor principal
Usuario autenticado.

### Fuente
- Requisito de producto (30 oct 2026): consistencia con CU-009.
- Comportamiento previsto, NO implementado.

### Precondiciones
- Usuario autenticado.
- Usuario navega a `/dashboard/incomes` (desde botón "Ver todos" en sección Balance del dashboard).

### Disparador
Navegación a `/dashboard/incomes`.

### Flujo principal
1. Sistema calcula `monthPrefix` del mes actual (`YYYY-MM`).
2. Sistema filtra `incomes` del store al mes actual.
3. Sistema calcula `monthlyTotalIncome` en moneda principal del usuario.
4. Sistema ordena ingresos por fecha descendente.
5. Sistema agrupa ingresos por fecha en `Record<date, Income[]>`.
6. **Vista desktop:** tabla con columnas Fecha | Categoría | Descripción | Monto | Acciones.
7. **Vista mobile:** cards agrupadas por fecha, cada grupo muestra subtotal en moneda principal.
8. Header muestra total de registros y total ingresado.
9. Usuario puede hacer clic en "✏️" para editar inline (→ CU-028) o "🗑️" para eliminar (→ CU-029).

### Flujos alternativos

**Paso 6 — No hay ingresos:**
- Condición: `sorted.length === 0`.
- Comportamiento: Estado vacío con emoji "📭", texto "No hay ingresos registrados" y CTA "+ Agregar primer ingreso" (redirige a `/dashboard/add-income`).

### Excepciones
Ninguna.

### Postcondiciones
- **En éxito:** usuario ve listado completo de ingresos del mes agrupado por fecha. Total acumulado visible en cabecera.

### Reglas de negocio
- Filtrado estricto por mes actual (cliente).
- `monthlyTotalIncome` solo incluye ingresos en `budget.currency` (moneda principal).
- RLS garantiza que solo se muestran ingresos del usuario autenticado.

### Criterios de aceptación
- Listado ordenado por fecha descendente.
- Desktop: tabla con columnas correctas.
- Mobile: cards agrupadas con subtotal por fecha.
- Header muestra count + total ingresado.
- Empty state con CTA.

### Preguntas pendientes
Ninguna.

---

## CU-031: Crear categoría de ingreso

### Objetivo
Permitir al usuario registrar una categoría de ingreso personalizada con nombre, icono y color de fondo, para clasificar sus ingresos según sus necesidades.

### Alcance
Gestión de categorías de ingreso. Ubicación en navegación: Panel de gestión en `/dashboard/settings` sección "Categorías de ingreso", con acceso rápido `+ Nueva categoría` desde el selector al registrar ingreso (CU-027).

### Actor principal
Usuario autenticado.

### Actores secundarios
Ninguno.

### Fuente
- Requisito de producto (30 oct 2026): categorías de ingreso personalizables, separadas de las de gasto.
- Comportamiento previsto, NO implementado.

### Precondiciones
- Usuario autenticado con configuración inicial completada (CU-021).

### Disparador
El usuario pulsa "Agregar categoría" en la sección "Categorías de ingreso" de settings, o `+ Nueva categoría` desde el selector al registrar ingreso.

### Flujo principal
1. El sistema muestra el formulario: nombre, selector cerrado de iconos y paleta cerrada de colores, con icono 💼 y color esmeralda preseleccionados.
2. El usuario ingresa el nombre y ajusta icono/color si lo desea.
3. El usuario guarda.
4. El sistema valida: nombre obligatorio, máximo 30 caracteres, no duplicado entre las categorías de ingreso del usuario (sin distinguir mayúsculas/minúsculas).
5. El sistema crea la categoría y la hace disponible de inmediato en el selector de categorías al crear o editar ingresos.

### Flujos alternativos
- **Paso 4a — Nombre vacío o duplicado:** el sistema muestra mensaje inline y no guarda; el usuario corrige y vuelve al paso 3.
- **Paso 3a — El usuario cancela:** no se crea nada; vuelve a la vista previa.

### Excepciones
- **Error al guardar (paso 5):** mensaje de error; la categoría no se crea; el formulario conserva los valores ingresados.

### Postcondiciones
- **En éxito:** la categoría persiste, es visible solo para su creador y aparece en los selectores de ingresos.
- **En fallo:** no se persiste ningún cambio.

### Reglas de negocio
- Icono y color solo desde catálogos cerrados (mismos 16 emojis y 8 colores que categorías de gasto).
- Nombre obligatorio, máx. 30 caracteres, único por usuario sin distinguir mayúsculas.
- Las categorías de ingreso son privadas por usuario (aislamiento RLS).
- Las categorías personalizadas se suman a las 5 por defecto; no las reemplazan.

### Criterios de aceptación
- No permite guardar con nombre vacío ni duplicado.
- Icono y color se eligen únicamente desde los selectores cerrados.
- La categoría persiste entre sesiones.
- Aparece en el selector al crear o editar ingresos inmediatamente después de crearla.
- Default al abrir formulario: emoji 💼, color esmeralda.

### Catálogo cerrado de emojis y colores
Mismo catálogo que categorías de gasto (ver CU-024 en `categories/categories.md`):
- **16 emojis:** 🍔 🚗 🏠 🎬 🛒 💊 ✈️ 📚 💼 🐾 🎁 💡 ⚽ ☕ 📱 📦
- **8 colores Tailwind:** red, orange, amber, emerald, teal, blue, indigo, purple.

### Categorías de ingreso por defecto (seed al registrar usuario)
5 categorías creadas por trigger `handle_new_user` en tabla `income_categories`:
1. 💼 Sueldo (emerald)
2. 💡 Freelance (amber)
3. 🎁 Devolución (indigo)
4. 🛒 Venta (orange)
5. 📦 Otros (teal, **is_protected=true**)

### Preguntas pendientes
Ninguna. Decisiones cerradas:
- ~~¿Catálogo específico?~~ → **No.** Mismo 16/8 que gastos.
- ~~¿Default emoji/color?~~ → **💼 esmeralda.**

---

## CU-032: Editar categoría de ingreso

### Objetivo
Permitir al usuario modificar el nombre, icono o color de cualquier categoría de ingreso, incluidas las por defecto, para mantener su clasificación actualizada.

### Alcance
Gestión de categorías de ingreso.

### Actor principal
Usuario autenticado.

### Actores secundarios
Ninguno.

### Fuente
- Requisito de producto (30 oct 2026): "se debe poder editar las categorías de ingresos, así como las de gastos".
- Comportamiento previsto, NO implementado.

### Precondiciones
- Usuario autenticado.
- La categoría existe y no es "Otros" (`is_protected = false`).

### Disparador
El usuario elige la opción de editar una categoría de ingreso.

### Flujo principal
1. El sistema muestra el formulario con el nombre, icono y color actuales de la categoría.
2. El usuario modifica los campos deseados y guarda.
3. El sistema aplica las mismas validaciones de CU-031 (nombre obligatorio, máx. 30 caracteres, no duplicado).
4. El sistema actualiza la categoría; los ingresos asociados y todas las vistas (historial, dashboard, selectores) reflejan el nuevo nombre, icono y color.

### Flujos alternativos
- **Paso 3a — Validación fallida:** mensaje inline; la categoría conserva sus valores anteriores; el usuario corrige y vuelve al paso 2.
- **Paso 2a — El usuario cancela:** sin cambios.

### Excepciones
- **Error al guardar (paso 4):** mensaje de error; se conservan los valores anteriores de la categoría.

### Postcondiciones
- **En éxito:** la actualización se refleja en ingresos históricos y nuevos sin modificarlos individualmente.
- **En fallo:** la categoría queda sin cambios.

### Reglas de negocio
- "Otros" no es editable: es la categoría protegida de respaldo (ver CU-033).
- Las 5 categorías por defecto sí son editables (nombre, icono, color).
- La edición no altera montos, fechas, monedas ni descripciones de los ingresos asociados.

### Criterios de aceptación
- Los cambios se ven en historial, dashboard y selectores tras guardar.
- "Otros" no ofrece opción de edición.
- Se aplican las validaciones de nombre de CU-031.
- Cancelar o fallar deja la categoría exactamente como estaba.

### Preguntas pendientes
Ninguna.

---

## CU-033: Eliminar categoría de ingreso

### Objetivo
Permitir al usuario eliminar una categoría de ingreso que no necesita, reasignando sus ingresos asociados a "Otros" para no perder el historial.

### Alcance
Gestión de categorías de ingreso.

### Actor principal
Usuario autenticado.

### Actores secundarios
Ninguno.

### Fuente
- Requisito de producto (30 oct 2026): eliminación con advertencia previa, consistente con CU-026.
- Comportamiento previsto, NO implementado.

### Precondiciones
- Usuario autenticado.
- La categoría existe y no es "Otros" (`is_protected = false`).

### Disparador
El usuario elige la opción de eliminar una categoría de ingreso.

### Flujo principal
1. El sistema calcula cuántos ingresos están asociados a la categoría.
2. El sistema muestra modal de advertencia: *"Los N ingresos asociados a {categoría} pasarán a 'Otros'. Esta acción no se puede deshacer."*
3. El usuario confirma.
4. El sistema reasigna esos ingresos a "Otros" y elimina la categoría (operación atómica).
5. El sistema retira la categoría de los selectores; el historial muestra los ingresos reasignados con "Otros".

### Flujos alternativos
- **Paso 3a — El usuario cancela:** no se reasigna ni elimina nada.
- **Paso 1a — Categoría sin ingresos asociados:** mismo modal con N = 0 (confirmación obligatoria por convención de acciones destructivas).

### Excepciones
- **Fallo durante la operación (paso 4):** mensaje de error y estado sin cambios: reasignación y eliminación se aplican juntas o no se aplican (ningún ingreso puede quedar referenciando una categoría inexistente).

### Postcondiciones
- **En éxito:** no quedan ingresos referenciando la categoría eliminada; sus ingresos pertenecen ahora a "Otros"; la categoría puede volver a crearse como nueva (CU-031).
- **En fallo:** categoría e ingresos quedan exactamente como estaban.

### Reglas de negocio
- "Otros" no se puede eliminar.
- Aplica tanto a categorías por defecto como personalizadas.
- La reasignación conserva montos, fechas, monedas y descripciones de los ingresos.
- La advertencia con el número de ingresos afectados es previa y obligatoria, incluso con N = 0.

### Criterios de aceptación
- La advertencia indica el número de ingresos antes de confirmar.
- Tras confirmar, no existen referencias huérfanas a la categoría eliminada.
- Los ingresos reasignados conservan todos sus datos excepto la categoría.
- Cancelar deja categoría e ingresos intactos.
- "Otros" no ofrece opción de eliminación.

### Preguntas pendientes
Ninguna.
