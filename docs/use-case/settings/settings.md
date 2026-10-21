# Casos de Uso: Configuración (Settings)

> Ajustes del usuario: presupuestos por moneda, información de la app y cierre de sesión.
> Ruta: `/dashboard/settings`.

---

## CU-015: Configurar presupuesto por moneda

**Actor:** Usuario autenticado

**Precondiciones:**
- Usuario logueado
- Usuario en `/dashboard/settings` (acceso desde Dashboard → "Ajustes")

**Flujo principal:**
1. Sistema inicializa `budgetInputs` con los valores actuales:
   - Si `budget.monthlyLimit > 0` → input de `budget.currency` tiene ese valor
   - Para cada budget en `budgets` con `monthlyLimit > 0` → input correspondiente
2. Sistema renderiza sección "💰 Presupuestos por moneda" con un bloque por moneda en `CURRENCY_OPTIONS`:
   - `S/` (Soles) y `$` (Dólares)
3. Cada bloque muestra:
   - Label de moneda
   - Badge "Principal" si coincide con `budget.currency`
   - Badge "Configurado" si ya existe budget para esa moneda (y no es la principal)
   - Input numérico con símbolo de moneda a la izquierda
   - Botón "Guardar"
4. Usuario modifica el valor de una moneda
5. Usuario hace clic en "Guardar"
6. Sistema valida `val > 0`
7. Sistema llama `store.setBudget(val, currency)`
8. Store persiste en Supabase (tabla `budgets`) y actualiza `budget` / `budgets` local
9. Botón muestra "✓" por 2 segundos como feedback, luego vuelve a "Guardar"
10. Dashboard refleja nuevo límite en próximo render

**Flujos alternativos:**
- **6a. Valor vacío o ≤ 0:** botón permanece `disabled`
- **7a. Error de red:** toast de error; store mantiene estado optimista
- **Usuario quiere ver el límite actual:** cada moneda muestra su valor persistido al cargar la página

**Postcondiciones:**
- Registro en `budgets` actualizado con `monthlyLimit` y `currency`
- `budget` principal puede actualizarse si la moneda modificada es la principal
- Dashboard recalcula `currencySummaries` con nuevo `monthlyLimit`

**Validaciones:**
- Monto requerido, `> 0`, numérico (`step="0.01"`)
- Moneda debe estar en `CURRENCY_OPTIONS` (`S/` o `$`)

**UI/UX:**
- Card principal con grid responsivo
- Input con prefijo visual de moneda (`absolute left-3`)
- Botón "Guardar" en primary; cambia a "✓" temporalmente (2s)
- Badge "Principal" en primary/10, "Configurado" en surface
- Layout mobile apilado; desktop en grid de 2 columnas (sección ocupa ambos en `md:col-span-2`)

**Relacionado:**
- CU-012 (dashboard consume los presupuestos)
- CU-013 (umbrales dependen del `monthlyLimit`)
- CU-002 (registro inicial crea presupuesto default S/ 1000)

---

## CU-016: Consultar información de la app

**Actor:** Usuario autenticado

**Precondiciones:**
- Usuario en `/dashboard/settings`

**Flujo principal:**
1. Sistema renderiza sección "🌿 Acerca de Paltazo" con:
   - Versión: `1.0.0`
   - Tipo: "App web progresiva"
   - Almacenamiento: "Supabase"
2. Sistema renderiza sección "📊 Niveles de alerta" con referencia visual:
   - 🟡 Advertencia: 80%
   - 🔴 Límite alcanzado: 100%
   - 🔴 Superado: 101%
3. Usuario lee la información (solo lectura, no editable)

**Flujos alternativos:**
- Ninguno (vista pasiva)

**Postcondiciones:**
- Usuario conoce versión, tipo de app y proveedor de almacenamiento
- Usuario entiende los umbrales de alerta

**Validaciones:**
- Ninguna (información estática)

**UI/UX:**
- Dos cards separadas: una con info técnica, otra con niveles de alerta
- Niveles de alerta con dots de color semántico (`bg-warning`, `bg-danger`)
- Layout responsive: apilado en mobile, grid de 2 columnas en desktop

**Relacionado:**
- CU-013 (los niveles mostrados aquí son los mismos que se aplican en dashboard)

---

## CU-017: Cerrar sesión desde ajustes

**Actor:** Usuario autenticado

**Precondiciones:**
- Usuario logueado
- Usuario en `/dashboard/settings`

**Flujo principal:**
1. Usuario hace clic en botón "Cerrar sesión" (parte inferior de la página)
2. Sistema llama `store.logout()` → `signOut({ scope: 'global' })`
3. Supabase invalida todas las sesiones del usuario
4. Store setea `userId = null`, `expenses = []`
5. Sistema ejecuta `window.location.href = '/onboarding'`
6. Navegador recarga y redirige a pantalla de onboarding

**Flujos alternativos:**
- **2a. Error en signOut:** toast de error; usuario permanece logueado
- **5a. Usuario intenta volver atrás:** middleware detecta sesión inválida y redirige a `/login`

**Postcondiciones:**
- Sesión invalidada en Supabase Auth (todas las cookies eliminadas)
- Store limpiado
- Usuario en `/onboarding` (pantalla de bienvenida)

**Validaciones:**
- Ninguna (acción reversible)

**UI/UX:**
- Botón full-width en `bg-danger/10 text-danger hover:bg-danger/20`
- Separado del resto del contenido con `mt-space-lg`
- Sin modal de confirmación (acción reversible al poder volver a loguear)

**Relacionado:**
- CU-005 (logout centralizado en `store.logout()`)
- CU-006 (middleware protege rutas post-logout)

---

## CU-018: Opción de agregar categorías

**Actor:** Usuario autenticado

**Precondiciones:**
- Usuario logueado
- Usuario en `/dashboard/settings` o Usuario redireccionado desde `add-expenses` al intentar agregar una nueva categoría

**Flujo principal:**
1. Usuario hace clic en botón "Agregar" (añadir sección para agregar nuevas categorías)
2. 
3. Sistema llama `store.logout()` → `signOut({ scope: 'global' })`
4. Supabase invalida todas las sesiones del usuario
5. Store setea `userId = null`, `expenses = []`
6. Sistema ejecuta `window.location.href = '/onboarding'`
7. Navegador recarga y redirige a pantalla de onboarding

---
## Notas técnicas

**Monedas soportadas (hardcoded):**
```ts
const CURRENCY_OPTIONS = [
  { value: 'S/', label: 'Soles (S/)' },
  { value: '$', label: 'Dólares ($)' },
]
```

**Estado global afectado:**
- `budget`: `{ monthlyLimit, currency }` — presupuesto principal
- `budgets`: `Record<string, { monthlyLimit, currency }>` — presupuestos por moneda

**Persistencia:**
- `setBudget(amount, currency)` en `src/lib/store.tsx` llama a `upsertBudget()` en `src/lib/supabase/repositories.ts`
- Supabase RLS garantiza que cada usuario solo modifica sus propios budgets

**Responsive:**
- Mobile: secciones apiladas, padding `px-gutter`
- Desktop: grid `md:grid-cols-2`, padding `md:px-space-xl`
- Sección de presupuestos ocupa ambos columns (`md:col-span-2`)
