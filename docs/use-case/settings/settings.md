# Casos de Uso: Configuración (Settings)

> Ajustes del usuario: presupuestos por moneda, información de la app y cierre de sesión.
> Ruta: `/dashboard/settings`.

---

## CU-015: Configurar presupuesto por moneda

### Objetivo
Permitir al usuario definir o modificar el límite mensual de gasto para cada moneda activa del usuario, de forma independiente. (PROPUESTO: monedas activas entre S/, $ y € según CU-021/CU-022; código actual: S/ y $ fijas).

### Alcance
Módulo de configuración, sección "💰 Presupuestos por moneda".

### Actor principal
Usuario autenticado.

### Actores secundarios
—

### Fuente
Código: `src/app/dashboard/settings/page.tsx` líneas 53-108.

### Precondiciones
- Usuario autenticado con sesión activa.
- Usuario ha navegado a `/dashboard/settings` (acceso desde Dashboard → botón "Ajustes").

### Disparador
Usuario accede a la sección de presupuestos en la página de ajustes.

### Flujo principal
1. Sistema inicializa estado `budgetInputs` con valores actuales:
   - Si `budget.monthlyLimit > 0`, carga el valor en el input correspondiente a `budget.currency`.
   - Para cada `budgets[currency]` con `monthlyLimit > 0`, carga el valor en su input.
2. Sistema renderiza sección "💰 Presupuestos por moneda" con un bloque por moneda activa del usuario (PROPUESTO: CU-021/CU-022; código actual: un bloque por moneda en `CURRENCY_OPTIONS`, S/ y $).
3. Cada bloque muestra:
   - Label de moneda (ej: "Soles (S/)").
   - Badge "Principal" (fondo `bg-primary/10`) si coincide con `budget.currency`.
   - Badge "Configurado" (fondo `bg-surface-container`) si existe budget para esa moneda y no es la principal.
   - Input numérico (`type="number"`, `step="0.01"`) con símbolo de moneda como prefijo visual (`absolute left-3`).
   - Botón "Guardar" (fondo `bg-primary`), deshabilitado si el valor está vacío o es ≤ 0.
4. Usuario modifica el valor de una moneda en el input.
5. Usuario hace clic en "Guardar".
6. Sistema valida que `val > 0`.
7. Sistema llama a `setBudget(val, currency)` del store.
8. Store persiste en Supabase (tabla `budgets`) y actualiza `budget` / `budgets` local.
9. Botón muestra "✓" por 2 segundos como feedback visual, luego vuelve a "Guardar".
10. Dashboard (CU-012) refleja el nuevo límite en el próximo render al recalcular `currencySummaries`.

### Flujos alternativos
**Paso 5 — Usuario deja el campo vacío o ingresa valor ≤ 0:**
- Condición: `!currentValue || parseFloat(currentValue) <= 0`.
- Comportamiento: Botón "Guardar" permanece `disabled` (opacidad 0.5). No se ejecuta ninguna acción.

**Paso 8 — Error de red o fallo en Supabase:**
- Condición: Promesa `setBudget()` rechaza.
- Comportamiento: Estado local no se actualiza. Usuario puede reintentar. (Nota: código actual no maneja error explícitamente con toast, pero store mantiene estado optimista).

**Paso 1 — Usuario no tiene presupuestos previos:**
- Condición: `budget.monthlyLimit === 0` y `budgets` vacío.
- Comportamiento: Todos los inputs muestran valor vacío (placeholder "0.00"). Usuario ingresa primer presupuesto.

### Excepciones
—

### Postcondiciones
- **En éxito:** Registro en `budgets` actualizado con nuevo `monthlyLimit` y `currency`. Si la moneda modificada es la principal (`budget.currency`), el objeto `budget` también se actualiza. Dashboard recalcula `currencySummaries` con nuevo `monthlyLimit` (afecta CU-013 alertas de umbral).
- **En fallo:** Estado local y Supabase permanecen sin cambios.

### Reglas de negocio
- Monto requerido, debe ser > 0, numérico con hasta 2 decimales (`step="0.01"`).
- El presupuesto se configura solo sobre monedas activas del usuario (PROPUESTO: CU-021/CU-022; código actual: `CURRENCY_OPTIONS` con S/ o $). Monedas soportadas limitadas a S/, $ y €; no se permiten otras monedas.
- Cada moneda tiene su propio presupuesto independiente (no hay límite global).
- El presupuesto principal (`budget.currency`) se usa como referencia para alertas de umbral en CU-013.

### Criterios de aceptación
- Usuario puede ver y modificar presupuestos de cada moneda activa de forma independiente (código actual: S/ y $).
- Input muestra símbolo de moneda como prefijo visual.
- Badge "Principal" aparece solo en la moneda configurada como principal (`budget.currency`).
- Badge "Configurado" aparece en monedas secundarias que ya tienen un presupuesto definido.
- Botón "Guardar" se deshabilita si el valor está vacío o es ≤ 0.
- Tras guardar exitosamente, botón muestra "✓" por 2 segundos como feedback.
- Cambios se reflejan inmediatamente en el dashboard (CU-012).

### Preguntas pendientes
- Impacto técnico al implementar CU-021 a CU-023: esta sección deja de iterar el `CURRENCY_OPTIONS` fijo y pasa a iterar las monedas activas del usuario.

---

## CU-016: Consultar información de la app

### Objetivo
Mostrar al usuario información estática sobre la aplicación (versión, tipo, almacenamiento) y los umbrales de alerta de presupuesto.

### Alcance
Módulo de configuración, secciones "📊 Niveles de alerta" y "🌿 Acerca de Paltazo".

### Actor principal
Usuario autenticado.

### Actores secundarios
—

### Fuente
Código: `src/app/dashboard/settings/page.tsx` líneas 110-157.

### Precondiciones
- Usuario autenticado con sesión activa.
- Usuario ha navegado a `/dashboard/settings`.

### Disparador
Usuario accede a la página de ajustes.

### Flujo principal
1. Sistema renderiza sección "📊 Niveles de alerta" con tres niveles visuales:
   - 🟡 **Advertencia** (80%): punto de color `bg-warning`, texto "Advertencia".
   - 🔴 **Límite alcanzado** (100%): punto de color `bg-danger`, texto "Límite alcanzado".
   - 🔴 **Superado** (101%): punto de color `bg-danger` con opacidad 0.7, texto "Superado".
2. Sistema renderiza sección "🌿 Acerca de Paltazo" con:
   - Versión: "1.0.0".
   - Tipo: "App web progresiva".
   - Almacenamiento: "Supabase".
3. Usuario lee la información (vista de solo lectura, no editable).

### Flujos alternativos
—

### Excepciones
—

### Postcondiciones
- **En éxito:** Usuario conoce versión, tipo de app y proveedor de almacenamiento. Usuario entiende los umbrales de alerta (80%, 100%, 101%) que se aplican en el dashboard (CU-013).

### Reglas de negocio
- Información estática, no configurable por el usuario.
- Niveles de alerta mostrados aquí son referencia visual de los umbrales aplicados en CU-013.

### Criterios de aceptación
- Sección "Niveles de alerta" muestra tres niveles con colores semánticos (warning, danger).
- Sección "Acerca de Paltazo" muestra versión, tipo y almacenamiento.
- Toda la información es de solo lectura (sin inputs ni botones de edición).
- Layout responsive: apilado en mobile, grid de 2 columnas en desktop.

### Preguntas pendientes
—

---

## CU-017: Cerrar sesión desde ajustes

### Objetivo
Permitir al usuario cerrar su sesión desde la página de ajustes, limpiando el estado local y redirigiendo a la pantalla de sesión cerrada.

### Alcance
Módulo de configuración, botón "Cerrar sesión" en parte inferior de `/dashboard/settings`.

### Actor principal
Usuario autenticado.

### Actores secundarios
—

### Fuente
Código: `src/app/dashboard/settings/page.tsx` líneas 160-170.
Referencia cruzada: CU-005 (logout global desde sidebar).

### Precondiciones
- Usuario autenticado con sesión activa.
- Usuario ha navegado a `/dashboard/settings`.

### Disparador
Usuario hace clic en el botón "Cerrar sesión" en la parte inferior de la página de ajustes.

### Flujo principal
1. Usuario hace clic en botón "Cerrar sesión" (fondo `bg-danger/10`, texto `text-danger`).
2. Sistema ejecuta `logout()` del store, que internamente llama a `signOut({ scope: 'global' })` de Supabase.
3. Store limpia estado local: `userId = null`, `expenses = []`, `budget` resetea a valores por defecto.
4. Supabase invalida todas las sesiones del usuario en todos los dispositivos (scope global).
5. Sistema redirige a la pantalla "Sesión cerrada" (ruta PENDIENTE de definir, ver preguntas pendientes).
6. Pantalla "Sesión cerrada" muestra mensaje de confirmación y botón para volver a `/login`.

### Flujos alternativos
**Paso 3 — Error al cerrar sesión en Supabase:**
- Condición: Promesa `signOut()` rechaza.
- Comportamiento: Estado local se limpia de todos modos. Usuario es redirigido a pantalla de sesión cerrada. (Nota: código actual no maneja error explícitamente, pero redirección ocurre siempre).

### Excepciones
—

### Postcondiciones
- **En éxito:** Sesión del usuario invalidada en Supabase. Estado local limpiado. Usuario redirigido a pantalla "Sesión cerrada" con botón a `/login`.
- **En fallo:** (No aplica, redirección ocurre siempre).

### Reglas de negocio
- No requiere confirmación (acción reversible: usuario puede volver a iniciar sesión).
- Scope `global`: invalida sesiones en todos los dispositivos, no solo el actual.
- Este es uno de los dos puntos de entrada para logout. El otro es el sidebar (icono 🚪, ver CU-005).

### Criterios de aceptación
- Botón "Cerrar sesión" visible en parte inferior de `/dashboard/settings`.
- Al hacer clic, sesión se cierra inmediatamente (sin modal de confirmación).
- Usuario es redirigido a pantalla "Sesión cerrada" (no a `/onboarding` ni `/login` directamente).
- Estado local se limpia completamente (expenses, budget, userId).
- Usuario puede volver a iniciar sesión desde la pantalla de sesión cerrada.

### Preguntas pendientes
1. **Ruta de destino:** Código actual redirige a `/onboarding` (línea 164), pero handoff de autenticación indica que debería redirigir a pantalla "Sesión cerrada". ¿Definir ruta explícita (`/logout-success`, `/session-closed`, `/goodbye`) o reutilizar `/onboarding` con estado "sesión cerrada"?
2. **Consistencia con CU-005:** Sidebar usa mismo flujo (CU-005). Asegurar que ambos puntos de entrada redirijan a la misma pantalla de destino.

---

## CU-022: Agregar moneda

> **Estado: PROPUESTO** — comportamiento previsto, NO implementado.

### Objetivo
Permitir al usuario activar una moneda adicional (de S/, $, €) cuando la necesite, en lugar de mostrar todas las monedas siempre.

### Alcance
Módulo de configuración, sección de monedas en `/dashboard/settings`.

### Actor principal
Usuario autenticado.

### Actores secundarios
Ninguno.

### Fuente
- Requisito de producto comunicado por el usuario (28–29 oct 2026): monedas agregables a demanda desde configuraciones.
- Comportamiento previsto, NO implementado. Reemplaza la decisión del handoff "Monedas: S/ y $ hardcoded, no configurables por usuario".

### Precondiciones
- Usuario autenticado con configuración inicial completada (CU-021).
- Existe al menos una moneda soportada que el usuario no tiene activa.

### Disparador
El usuario pulsa "Agregar moneda" en ajustes.

### Flujo principal
1. El sistema muestra únicamente las monedas soportadas que el usuario no tiene activas.
2. El usuario selecciona una y confirma.
3. El sistema activa la moneda y la incorpora a los selectores de gastos y a la sección de presupuestos, sin presupuesto configurado inicialmente.

### Flujos alternativos
- **Paso 1a — Todas las monedas ya activas:** no se muestra la acción "Agregar moneda".
- **Paso 2a — El usuario cancela:** sin cambios.

### Excepciones
- **Error al activar (paso 3):** mensaje de error; la moneda no queda activa.

### Postcondiciones
- **En éxito:** la moneda queda disponible para registrar gastos (CU-008) y configurar presupuesto (CU-015); persiste entre sesiones.
- **En fallo:** sin cambios.

### Reglas de negocio
- (PROPUESTO) Monedas soportadas limitadas a S/, $, €.
- (PROPUESTO) No se puede activar dos veces la misma moneda.
- (PROPUESTO) Agregar una moneda no crea presupuesto automáticamente; el usuario lo define con CU-015.

### Criterios de aceptación
- Solo se ofrecen monedas no activas.
- Tras agregar, la moneda aparece en alta de gasto y en presupuestos.
- La activación persiste entre sesiones.

### Preguntas pendientes
Ninguna de negocio.

---

## CU-023: Quitar moneda

> **Estado: PROPUESTO** — comportamiento previsto, NO implementado. ⚠️ Incluye eliminación definitiva de datos, decisión explícita del usuario.

### Objetivo
Permitir al usuario dejar de usar una moneda secundaria que ya no necesita, eliminando sus datos asociados.

### Alcance
Módulo de configuración, sección de monedas en `/dashboard/settings`.

### Actor principal
Usuario autenticado.

### Actores secundarios
Ninguno.

### Fuente
- Requisito de producto comunicado por el usuario (28–29 oct 2026): al quitar una moneda se eliminan también sus gastos y presupuesto, con confirmación explícita.
- Comportamiento previsto, NO implementado.

### Precondiciones
- Usuario autenticado.
- La moneda está activa y NO es la moneda principal.

### Disparador
El usuario pulsa "Quitar" sobre una moneda activa.

### Flujo principal
1. El sistema calcula los datos asociados: cantidad de gastos y presupuesto en esa moneda.
2. El sistema muestra modal de confirmación: *"Se eliminarán N gastos y el presupuesto en {moneda}. Esta acción no se puede deshacer."*
3. El usuario confirma.
4. El sistema elimina los gastos y el presupuesto de esa moneda y la desactiva.
5. El sistema actualiza selectores, historial y dashboard, que dejan de mostrar esa moneda.

### Flujos alternativos
- **Paso 3a — El usuario cancela:** no se elimina nada.
- **Paso 1a — Moneda sin datos asociados:** mismo modal con N = 0 (confirmación obligatoria por convención de acciones destructivas).

### Excepciones
- **Fallo durante la eliminación (paso 4):** mensaje de error y estado sin cambios: o se eliminan todos los datos asociados o ninguno.

### Postcondiciones
- **En éxito:** no quedan gastos ni presupuesto en esa moneda; la moneda puede volver a agregarse (CU-022) partiendo de cero.
- **En fallo:** moneda y datos quedan intactos.

### Reglas de negocio
- (PROPUESTO) La moneda principal no se puede quitar; siempre existe al menos una moneda activa.
- (PROPUESTO) La eliminación de gastos y presupuesto es definitiva y siempre requiere confirmación explícita informando la cantidad de gastos.

### Criterios de aceptación
- El modal informa la cantidad de gastos antes de confirmar.
- Cancelar no modifica ningún dato.
- Tras confirmar, no quedan registros en esa moneda ni aparece en selectores, historial o dashboard.
- No es posible quitar la moneda principal.

### Preguntas pendientes
Ninguna de negocio.

---
## Notas técnicas

**Monedas soportadas (hardcoded):**
> Estado actual del código. Será reemplazado por CU-021 a CU-023 (PROPUESTO): selección inicial y gestión a demanda de S/, $ y €.
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
