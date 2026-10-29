# Casos de Uso: Categorías

> Gestión de categorías de gasto: creación, edición y eliminación, incluida la personalización de las categorías por defecto.
> **Estado del módulo:** PROPUESTO — comportamiento previsto, NO implementado. El código actual tiene 5 categorías hardcodeadas (`src/lib/categories.ts`) y un `CHECK` en `expenses.category` que impide valores personalizados.

---

## CU-024: Crear categoría

### Objetivo
Permitir al usuario registrar una categoría personalizada con nombre, icono y color de fondo, para clasificar sus gastos según sus necesidades.

### Alcance
Gestión de categorías. Ubicación exacta en la navegación: PENDIENTE de diseño (desde ajustes o desde el selector de categoría al registrar gasto).

### Actor principal
Usuario autenticado.

### Actores secundarios
Ninguno.

### Fuente
- Requisito de producto comunicado por el usuario (28–29 oct 2026): categorías personalizables con icono, color de fondo y nombre; icono y color mediante selectores cerrados.
- Comportamiento previsto, NO implementado. Reemplaza la pregunta pendiente sobre el botón "Agregar categoría" en CU-008 y la decisión del handoff de descartar categorías custom.

### Precondiciones
- Usuario autenticado con configuración inicial completada (CU-021).

### Disparador
El usuario pulsa "Agregar categoría".

### Flujo principal
1. El sistema muestra el formulario: nombre, selector cerrado de iconos y paleta cerrada de colores, con icono y color preseleccionados.
2. El usuario ingresa el nombre y ajusta icono/color si lo desea.
3. El usuario guarda.
4. El sistema valida: nombre obligatorio, máximo 30 caracteres, no duplicado entre las categorías del usuario (sin distinguir mayúsculas/minúsculas).
5. El sistema crea la categoría y la hace disponible de inmediato en el selector de categorías al crear o editar gastos.

### Flujos alternativos
- **Paso 4a — Nombre vacío o duplicado:** el sistema muestra mensaje inline y no guarda; el usuario corrige y vuelve al paso 3.
- **Paso 3a — El usuario cancela:** no se crea nada; vuelve a la vista previa.

### Excepciones
- **Error al guardar (paso 5):** mensaje de error; la categoría no se crea; el formulario conserva los valores ingresados.

### Postcondiciones
- **En éxito:** la categoría persiste, es visible solo para su creador y aparece en los selectores de gastos.
- **En fallo:** no se persiste ningún cambio.

### Reglas de negocio
- (PROPUESTO) Icono y color solo desde catálogos cerrados definidos por el producto.
- (PROPUESTO) Nombre obligatorio, máx. 30 caracteres, único por usuario sin distinguir mayúsculas.
- (PROPUESTO) Las categorías personalizadas son privadas por usuario (aislamiento por usuario, igual que gastos y presupuestos).
- (PROPUESTO) Las categorías personalizadas se suman a las 5 por defecto; no las reemplazan.

### Criterios de aceptación
- No permite guardar con nombre vacío ni duplicado.
- Icono y color se eligen únicamente desde los selectores cerrados.
- La categoría persiste entre sesiones.
- Aparece en el selector al crear o editar gastos inmediatamente después de crearla.

### Preguntas pendientes
- Catálogo exacto de emojis y paleta de colores: PENDIENTE de diseño.
- Ubicación de la gestión de categorías en la navegación: PENDIENTE de diseño.
- Impacto técnico anotado para implementación: requiere tabla de categorías en Supabase y eliminar el `CHECK` actual de `expenses.category`.

---

## CU-025: Editar categoría

### Objetivo
Permitir al usuario modificar el nombre, icono o color de cualquier categoría, incluidas las por defecto, para mantener su clasificación actualizada.

### Alcance
Gestión de categorías.

### Actor principal
Usuario autenticado.

### Actores secundarios
Ninguno.

### Fuente
- Requisito de producto comunicado por el usuario (28–29 oct 2026): todas las categorías personalizables; "Otros" protegida como respaldo.
- Comportamiento previsto, NO implementado.

### Precondiciones
- Usuario autenticado.
- La categoría existe y no es "Otros".

### Disparador
El usuario elige la opción de editar una categoría.

### Flujo principal
1. El sistema muestra el formulario con el nombre, icono y color actuales de la categoría.
2. El usuario modifica los campos deseados y guarda.
3. El sistema aplica las mismas validaciones de CU-024 (nombre obligatorio, máx. 30 caracteres, no duplicado).
4. El sistema actualiza la categoría; los gastos asociados y todas las vistas (historial, dashboard, selectores) reflejan el nuevo nombre, icono y color.

### Flujos alternativos
- **Paso 3a — Validación fallida:** mensaje inline; la categoría conserva sus valores anteriores; el usuario corrige y vuelve al paso 2.
- **Paso 2a — El usuario cancela:** sin cambios.

### Excepciones
- **Error al guardar (paso 4):** mensaje de error; se conservan los valores anteriores de la categoría.

### Postcondiciones
- **En éxito:** la actualización se refleja en gastos históricos y nuevos sin modificarlos individualmente.
- **En fallo:** la categoría queda sin cambios.

### Reglas de negocio
- (PROPUESTO) "Otros" no es editable: es la categoría protegida de respaldo (ver CU-026).
- (PROPUESTO) Las 5 categorías por defecto sí son editables (nombre, icono, color).
- (PROPUESTO) La edición no altera montos, fechas, monedas ni descripciones de los gastos asociados.

### Criterios de aceptación
- Los cambios se ven en historial, dashboard y selectores tras guardar.
- "Otros" no ofrece opción de edición.
- Se aplican las validaciones de nombre de CU-024.
- Cancelar o fallar deja la categoría exactamente como estaba.

### Preguntas pendientes
Ninguna de negocio.

---

## CU-026: Eliminar categoría

### Objetivo
Permitir al usuario eliminar una categoría que no necesita, reasignando sus gastos asociados a "Otros" para no perder el historial.

### Alcance
Gestión de categorías.

### Actor principal
Usuario autenticado.

### Actores secundarios
Ninguno.

### Fuente
- Requisito de producto comunicado por el usuario (28–29 oct 2026): eliminación con advertencia previa de que los gastos asociados cambiarán a "Otros"; "Otros" protegida.
- Comportamiento previsto, NO implementado.

### Precondiciones
- Usuario autenticado.
- La categoría existe y no es "Otros".

### Disparador
El usuario elige la opción de eliminar una categoría.

### Flujo principal
1. El sistema calcula cuántos gastos están asociados a la categoría.
2. El sistema muestra modal de advertencia: *"Los N gastos asociados a {categoría} pasarán a 'Otros'. Esta acción no se puede deshacer."*
3. El usuario confirma.
4. El sistema reasigna esos gastos a "Otros" y elimina la categoría.
5. El sistema retira la categoría de los selectores; el historial muestra los gastos reasignados con "Otros".

### Flujos alternativos
- **Paso 3a — El usuario cancela:** no se reasigna ni elimina nada.
- **Paso 1a — Categoría sin gastos asociados:** mismo modal con N = 0 (confirmación obligatoria por convención de acciones destructivas).

### Excepciones
- **Fallo durante la operación (paso 4):** mensaje de error y estado sin cambios: reasignación y eliminación se aplican juntas o no se aplican (ningún gasto puede quedar referenciando una categoría inexistente).

### Postcondiciones
- **En éxito:** no quedan gastos referenciando la categoría eliminada; sus gastos pertenecen ahora a "Otros"; la categoría puede volver a crearse como nueva (CU-024).
- **En fallo:** categoría y gastos quedan exactamente como estaban.

### Reglas de negocio
- (PROPUESTO) "Otros" no se puede eliminar.
- (PROPUESTO) Aplica tanto a categorías por defecto como personalizadas.
- (PROPUESTO) La reasignación conserva montos, fechas, monedas y descripciones de los gastos.
- (PROPUESTO) La advertencia con el número de gastos afectados es previa y obligatoria, incluso con N = 0.

### Criterios de aceptación
- La advertencia indica el número de gastos antes de confirmar.
- Tras confirmar, no existen referencias huérfanas a la categoría eliminada.
- Los gastos reasignados conservan todos sus datos excepto la categoría.
- Cancelar deja categoría y gastos intactos.
- "Otros" no ofrece opción de eliminación.

### Preguntas pendientes
Ninguna de negocio.
