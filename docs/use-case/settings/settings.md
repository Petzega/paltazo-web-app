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
- Usuario en `/dashboard/settings`o Usuario redireccionado desde `add-expenses` al intentar agregar una nueva categoría

**Flujo principal:**
1. El usuario se dirige a la sección de agregar categorías
2. Verifica que su categoría no exista en el listado de las pildoras de categorías guardadas hasta el momento
3. Ingresa el nombre de la categoría
4. Selecciona una de los íconos predefinidos
5. Selecciona el color del ícono para su categoría
6. Da click al botón guardar para terminar la configuración de la categoría
7. Da click al botón aceptar del modal de confirmación
8. Al guardar se muestra el toast de exito con el mensaje: "Guardado exitoso."
9. Se debe verificar que se haya guardado la pildora con la nueva categoría

**Flujos alternativos:**
- **2a. Categorías predeterminadas:**  se deben tener categorías agregadas: Comida, Transporte, Servicios, Ocio, Salud y cada categoría debe poderse editar
- **6a. Cancelar los datos:** al dar click al botón cancelar se borraran todos los datos ingresados, los iconos seleccionados y el color escogido
- **7a. Cancelar el registro:** al dar click al botón cancelar del modal de confirmación se cerrara el modal de confirmación y se regresará a la seccion de agregar categoría con los datos ingresados previamente

**Postcondiciones:**
- Se debe guardar en la bd de supabase para mantener siempre las categorías en algun sitio

**UI/UX:**
- Se debe tener una seccion para agregar categorías
- Se debe tener unas pildoras con las categorías y sus respectivos íconos
- Se debe tener un input para agregar el nombre de la categoría
- Al costado del input se debe tener una especie de combo box con las opciones de íconos predefinidos por la app para que el usuario pueda seleccionar
- Se debe tener una pequeña sección de opciones de colores para que el usuario pueda personalizar la categoría que el decida
- Se debe tener un botón para guardar las categorías
- Al costado del botón guardar debe haber un botón para limpiar los datos ingresados
- Se debe tener un modal de confirmación al momento de guardar con los botones de aceptar o cancelar
- Se debe tener un toast de exito al momento de guardar la categoría

---
## CU-019: Editar una categoría

**Actor:** Usuario autenticado

**Precondiciones:**
- Usuario logueado
- Usuario en `/dashboard/settings`o Usuario redireccionado desde `add-expenses` al intentar agregar una nueva categoría

**Flujo principal:**
1. El usuario se dirige a la sección de agregar categorías
2. Verifica las categorías existentes
3. Selecciona una categoría
4. Se completan los datos en el formulario de la sección de agregar categoría
5. El usuario podrá editar los datos que el crea conveniente
6. Da click al botón guardar para terminar la configuración
7. Da click al botón aceptar del modal de confirmación
8. Al guardar se muestra el toast de exito con el mensaje: "Guardado exitoso."

**Postcondiciones:**
- Se debe guardar los datos editados en la bd de supabase para mantener siempre las categorías en algun sitio

**Flujos alternativos:**
- **2a. Categorías predeterminadas:**  se deben tener categorías agregadas: Comida, Transporte, Servicios, Ocio, Salud con la opcion de editar la categoría
- **6a. Cancelar los datos:** al dar click al botón cancelar se borraran todos los datos ingresados, los iconos seleccionados y el color escogido
- **7a. Cancelar el registro:** al dar click al botón cancelar del modal de confirmación se cerrara el modal de confirmación y se regresará a la seccion de agregar categoría con los datos ingresados previamente

---
## CU-020: Eliminar una categoría

**Actor:** Usuario autenticado

**Precondiciones:**
- Usuario logueado
- Usuario en `/dashboard/settings`o Usuario redireccionado desde `add-expenses` al intentar agregar una nueva categoría

**Flujo principal:**
1. El usuario se dirige a la sección de agregar categorías
2. Verifica las categorías existentes
3. Mantiene seleccionado una pildora de categoría
4. Da click en el botón aceptar del modal de confirmación
5. Verifica que la pildora ya no se muestra

**Flujos alternativos:**
- **4a. Cancelar los datos:** al dar click al botón cancelar se borraran todos los datos ingresados, los iconos seleccionados, el color escogido y se deselecciona la pildora en cuestión

**Postcondiciones:**
- Se debe eliminar la categoría de la base de datos de supabase

**UI/UX:**
- Se debe tener una seccion para agregar categorías
- Se debe tener unas pildoras con las categorías y sus respectivos íconos
- Se debe tener un input para agregar el nombre de la categoría

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
