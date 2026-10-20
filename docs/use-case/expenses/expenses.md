# Casos de Uso: Gastos

> Módulo de gestión de gastos. CRUD atómico sobre el mes en curso.
> Categorías del sistema: comida, transporte, servicios, ocio, otros.
> Monedas soportadas en MVP: `S/` (PEN) y `$` (USD).

---

## CU-008: Crear gasto

**Actor:** Usuario autenticado

**Precondiciones:**
- Usuario logueado (`userId ≠ null`)
- Usuario está en `/dashboard/add-expense` (acceso desde FAB o botón "Agregar gasto")

**Flujo principal:**
1. Usuario hace clic en FAB `+` o botón "Agregar gasto"
2. Sistema redirige a `/dashboard/add-expense`
3. Formulario se inicializa con:
   - Moneda: `budget.currency` (principal del usuario)
   - Categoría: `food` (default)
   - Fecha: hoy (`new Date().toISOString().split('T')[0]`)
   - Monto vacío, descripción vacía
4. Usuario ingresa monto mediante teclado numérico decimal (input oculto con `inputMode="decimal"`)
   - Formato automático `X.XX` con separadores de miles
   - Opcionalmente selecciona preset rápido: `15.00 / 30.00 / 50.00 / 100.00`
5. Usuario puede cambiar moneda (`S/` o `$`) con toggles superiores
6. Usuario puede completar descripción (opcional, max ~200 chars visibles)
7. Usuario selecciona categoría tocando uno de los 5 tiles (icono + label)
8. Usuario puede cambiar fecha con picker nativo (`<input type="date">`)
9. Usuario hace clic en "✓ Guardar y Continuar"
10. Sistema valida `numericValue > 0`
11. Sistema llama `store.addExpense({ amount, currency, category, description?, date })`
12. Store persiste en Supabase (vía `repositories.ts`) y actualiza estado local
13. Sistema muestra toast "✓ Gasto registrado" (2s)
14. Sistema limpia el formulario (moneda vuelve a la inicial, resto se resetea)
15. Dashboard recalcula gastos del mes automáticamente

**Flujos alternativos:**
- **9a. Monto = 0 o vacío:** botón "Guardar" permanece `disabled` (`numericValue <= 0`)
- **11a. Error de red al persistir:** store mantiene estado optimista; toast de error; retry al reconectar (offline-first)
- **Usuario quiere descartar:** toca "←" o "Cancelar"
  - Si hay cambios sin guardar → abre modal "¿Descartar cambios?" con opciones "Cancelar" / "Descartar"
  - Si no hay cambios → `router.back()` inmediato

**Postcondiciones:**
- Nuevo registro en tabla `expenses` con UUID, `user_id`, `amount`, `currency`, `category`, `description?`, `date`, `created_at`
- `expenses` en store actualizado
- Dashboard refleja nuevo acumulado y alerta si cruza umbral

**Validaciones:**
- Monto requerido, `> 0`, numérico, max 9 dígitos enteros, 2 decimales
- Categoría requerida (default `food`); debe pertenecer a `EXPENSE_CATEGORIES`
- Fecha requerida, formato `YYYY-MM-DD`, por defecto hoy
- Descripción opcional, max 200 chars
- Moneda requerida, debe estar en `CURRENCY_OPTIONS` (`S/` o `$`)

**UI/UX:**
- Layout tipo panel lateral en desktop (`md:w-[420px] md:fixed md:right-0`)
- Display de monto grande con efecto focus (ring primary)
- Presets horizontales scrolleables
- Grid de categorías 5 columnas con tile activo en `primary-container`
- Sección informativa de sync "☁️ Sincronizado en la nube"
- Tip motivacional inferior ("🌿 ¡Excelente hábito!")
- Botones: "✓ Guardar y Continuar" (primario), "🗑️ Limpiar", "Cancelar"

**Relacionado:**
- CU-012: Dashboard refleja el nuevo gasto inmediatamente
- CU-013: Si el gasto cruza umbral 80% / 100% / >100%, se dispara alerta visual
- Store: `addExpense()` en `src/lib/store.tsx`
- Repositorio: `insertExpense()` en `src/lib/supabase/repositories.ts`

---

## CU-009: Listar gastos del mes

**Actor:** Usuario autenticado

**Precondiciones:**
- Usuario logueado
- Usuario navega a `/dashboard/expenses` (desde botón "Ver reporte" en Dashboard o BottomNav)

**Flujo principal:**
1. Sistema carga `expenses` del store filtrados al mes actual (prefix `YYYY-MM`)
2. Sistema calcula `monthlyTotal` en la moneda principal del usuario
3. Sistema ordena gastos por fecha descendente
4. Sistema agrupa gastos por fecha en estructura `Record<date, Expense[]>`
5. Vista desktop: tabla con columnas Fecha | Categoría | Descripción | Monto | Acciones
6. Vista mobile: cards agrupadas por fecha, cada grupo muestra subtotal en moneda principal
7. Header muestra total de registros y total gastado vs. límite configurado
8. Usuario puede hacer clic en "✏️" para editar inline (→ CU-010) o "🗑️" para eliminar (→ CU-011)

**Flujos alternativos:**
- **5a. No hay gastos:** se muestra estado vacío con emoji "📭", texto "No hay gastos registrados" y CTA "+ Agregar primer gasto"

**Postcondiciones:**
- Usuario ve listado completo de gastos del mes agrupado por fecha
- Total acumulado visible en cabecera

**Validaciones:**
- Filtrado estricto por `user_id` (garantizado por Supabase RLS)
- Mes corriente calculado desde `new Date()` del cliente

**UI/UX:**
- Card superior con "Total gastado (X)" + "Límite: X"
- Desktop: tabla sobria con hover
- Mobile: cards con icono de categoría, label, descripción (o "Sin descripción"), monto alineado a la derecha
- Botón "➕ Agregar gasto" visible en header (desktop) y FAB flotante (mobile)
- Cada grupo de fecha muestra subtotal en moneda principal

**Relacionado:**
- CU-008 (crear desde esta vista vía FAB)
- CU-010 y CU-011 (acciones inline)

---

## CU-010: Editar gasto

**Actor:** Usuario autenticado (propietario del gasto)

**Precondiciones:**
- Usuario en `/dashboard/expenses`
- Gasto objetivo pertenece al usuario (RLS)

**Flujo principal:**
1. Usuario hace clic en botón "✏️" de un gasto
2. Sistema setea `editingId = expense.id` y carga `editForm` con valores actuales (`amount`, `description`, `category`, `date`)
3. Vista desktop: la fila de tabla se reemplaza por fila de edición con inputs inline (monto, descripción, categoría `<select>`, fecha) + botones "✓ Guardar" / "Cancelar"
4. Vista mobile: la card se expande con grid de inputs (monto + fecha en 2 cols), descripción, categoría, botones
5. Usuario modifica los campos deseados
6. Usuario hace clic en "✓ Guardar"
7. Sistema valida `editForm.amount > 0`
8. Sistema llama `store.updateExpense(editingId, { amount, description?, category, date })`
9. Store actualiza en Supabase y refleja cambios en lista
10. Sistema setea `editingId = null` (vuelve a modo lectura)

**Flujos alternativos:**
- **6a. Monto inválido (≤ 0 o vacío):** no se dispara `updateExpense`, botón permanece inoperativo
- **8a. Error de red:** store mantiene cambio optimista, toast de error al fallar
- **Usuario cancela:** clic en "Cancelar" → `editingId = null` sin persistir cambios

**Postcondiciones:**
- Registro actualizado en Supabase con nuevos valores
- `expenses` del store reflejan los cambios
- Dashboard recalcula totales si corresponde

**Validaciones:**
- `amount > 0`, numérico
- `category` perteneciente a `['food','transport','services','entertainment','other']`
- `date` en formato `YYYY-MM-DD`
- `description` opcional

**UI/UX:**
- Edición inline (no modal, no página nueva)
- Inputs con `bg-surface-container border border-outline focus:border-primary`
- Botones: "✓ Guardar" (primary), "Cancelar" (surface)
- En mobile, layout de 2 columnas para monto/fecha, descripción full-width, categoría full-width

**Relacionado:**
- CU-009 (vista desde la cual se edita)
- CU-012: Dashboard refleja cambios al volver

---

## CU-011: Eliminar gasto

**Actor:** Usuario autenticado (propietario del gasto)

**Precondiciones:**
- Usuario en `/dashboard/expenses`
- Gasto objetivo pertenece al usuario (RLS)

**Flujo principal:**
1. Usuario hace clic en botón "🗑️" del gasto
2. Sistema setea `deletingId = expense.id`
3. Modal de confirmación aparece con:
   - Título: "¿Eliminar gasto?"
   - Mensaje: "Esta acción no se puede deshacer."
   - Botones: "Cancelar" / "Eliminar"
4. Usuario hace clic en "Eliminar"
5. Sistema llama `store.deleteExpense(deletingId)`
6. Store elimina registro en Supabase y remueve de `expenses`
7. Sistema setea `deletingId = null` y `editingId = null` (si estaba en edición)
8. Lista se actualiza, totales recalculados

**Flujos alternativos:**
- **3a. Usuario cierra modal tocando fuera:** `cancelDelete()` → `deletingId = null`
- **5a. Error de red:** store mantiene estado optimista, toast de error; gasto reaparece al fallar rollback

**Postcondiciones:**
- Registro eliminado de Supabase (hard delete)
- `expenses` actualizado en store
- Totales del dashboard recalculados

**Validaciones:**
- Modal de confirmación **obligatorio** para acciones destructivas (convención global)

**UI/UX:**
- Modal centrado con backdrop `bg-black/40 backdrop-blur-sm`
- Botón "Eliminar" en `bg-error-container text-on-error-container hover:bg-error`
- Botón "Cancelar" neutro

**Relacionado:**
- CU-009 (vista desde la cual se elimina)
- Convención de modales destructivos (ver README use-case)

---

## Notas técnicas

**Modelo de datos (Expense):**
```
id: UUID (PK)
user_id: UUID (FK profiles.id)
amount: number
currency: 'S/' | '$'
category: 'food' | 'transport' | 'services' | 'entertainment' | 'other'
description?: string
date: string (YYYY-MM-DD)
created_at: string
```

**Categorías (`EXPENSE_CATEGORIES` en `src/lib/categories.ts`):**
- `food` 🍽️ Comida
- `transport` 🚗 Transporte
- `services` 💡 Servicios
- `entertainment` 🎮 Ocio
- `other` 📦 Otros

**Estado global afectado:**
- `expenses`: array completo filtrado por usuario
- `budget`: objeto con `monthlyLimit` y `currency` principal
- `budgets`: mapa de presupuestos por moneda

**Offline-first:**
- Las mutaciones pasan por el store, que mantiene estado optimista
- Supabase es fuente de verdad; al fallar red, se reintenta al reconectar
