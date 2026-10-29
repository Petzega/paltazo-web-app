# Casos de Uso: Onboarding

> Pantalla de bienvenida para usuarios no autenticados. Presenta la propuesta de valor de la aplicación y ofrece acceso al login.
> También incluye la configuración inicial del primer ingreso (CU-021, PROPUESTO).

---

## CU-018: Visualizar pantalla de onboarding

### Objetivo
Presentar la propuesta de valor de Paltazo a usuarios no autenticados y ofrecerles acceso a la pantalla de login.

### Alcance
Pantalla de onboarding (`/onboarding`).

### Actor principal
Usuario no autenticado.

### Fuente
- `src/app/onboarding/page.tsx` (comportamiento implementado)

### Precondiciones
- Usuario NO autenticado (`userId === null`)
- Usuario navega a `/onboarding` (ruta pública)

### Disparador
Usuario accede a `/onboarding` directamente o es redirigido desde otra ruta.

### Flujo principal
1. Sistema verifica si el usuario está autenticado (`isLoggedIn`)
2. Si está autenticado → redirige automáticamente a `/dashboard`
3. Si NO está autenticado → muestra pantalla de onboarding con:
   - Logo de Paltazo (🥑) con badge "⚡ PWA"
   - Título "Paltazo"
   - Subtítulo "Controla tus gastos antes de que te caiga la palta"
   - Tres tarjetas de features:
     - 📴 **Offline-first total**: "Apunta tus compras sin gastar datos ni depender de señal"
     - 💰 **Presupuesto en Soles (S/)**: "Monitorea tus topes mensuales con precisión de céntimos"
     - 🔔 **Alertas antes de fin de mes**: "Avisos oportunos para llegar tranquilo a tu quincena"
   - Botón primario "Comenzar →" que redirige a `/login`
   - Link secundario "¿Ya tienes cuenta? Iniciar sesión" que redirige a `/login`

### Flujos alternativos

**Paso 2 — Usuario ya está autenticado:**
- Condición: `isLoggedIn === true`
- Comportamiento: Sistema redirige automáticamente a `/dashboard` sin mostrar la pantalla de onboarding
- Retorno: Usuario aterriza en dashboard (CU-012)

### Excepciones
—

### Postcondiciones
- **En éxito:** Usuario no autenticado ve la pantalla de onboarding con propuesta de valor y CTAs claros
- **En redirección:** Usuario autenticado es llevado a `/dashboard` automáticamente

### Reglas de negocio
- `/onboarding` es ruta pública (no requiere autenticación, ver CU-006)
- Si el usuario ya tiene sesión activa, no debe ver onboarding (redirección automática)
- La pantalla es estática (no tiene interacción más allá de los CTAs)

### Criterios de aceptación
- ✅ Pantalla muestra logo, título, subtítulo y 3 features principales
- ✅ Botón "Comenzar" redirige a `/login`
- ✅ Link "Iniciar sesión" redirige a `/login`
- ✅ Si usuario está autenticado, redirige automáticamente a `/dashboard`
- ✅ Layout responsive (mobile-first, max-width `xl`)

### Preguntas pendientes
—

---

**Nota:** Este caso de uso corresponde a US-001 (Registro básico) en el sentido de que es el punto de entrada para nuevos usuarios, pero no es parte del flujo de registro en sí mismo. Es una pantalla de marketing/welcome.

---

## CU-021: Seleccionar moneda principal y presupuesto en el primer ingreso

> **Estado: PROPUESTO** — comportamiento previsto, NO implementado.

### Objetivo
Que el usuario recién registrado defina su moneda de trabajo (S/, $ o €) y su presupuesto mensual inicial antes de usar la app, una sola vez.

### Alcance
Configuración inicial posterior al registro (CU-002), previa al primer acceso al dashboard.

### Actor principal
Usuario recién registrado, autenticado.

### Actores secundarios
Ninguno.

### Fuente
- Requisito de producto comunicado por el usuario (28–29 oct 2026): selección de moneda y monto en el primer ingreso, solo la primera vez.
- Comportamiento previsto, NO implementado.

### Precondiciones
- El usuario se registró (CU-002) y tiene sesión activa.
- El usuario nunca completó la configuración inicial.

### Disparador
Primer ingreso a la app tras el registro.

### Flujo principal
1. El sistema detecta que la configuración inicial está pendiente y muestra la pantalla de configuración: selector de moneda (S/, $, €) y campo de monto de presupuesto mensual.
2. El usuario elige moneda e ingresa un monto mayor que cero.
3. El usuario confirma.
4. El sistema valida el monto, guarda la moneda principal, crea el presupuesto con ese monto y marca la configuración como completada.
5. El sistema redirige al dashboard, que usa la moneda y presupuesto definidos.

### Flujos alternativos
- **Paso 3a — Monto vacío o ≤ 0:** mensaje inline; la confirmación permanece deshabilitada hasta corregir el valor.
- **Paso 1a — Usuario sale sin completar (cierra sesión o abandona):** en su próximo ingreso el sistema vuelve a mostrar la pantalla; el usuario no accede al dashboard hasta completarla.

### Excepciones
- **Error al guardar (paso 4):** mensaje de error; el usuario permanece en la pantalla y la configuración sigue pendiente; no se persisten cambios parciales.

### Postcondiciones
- **En éxito:** moneda principal y presupuesto inicial creados; configuración marcada como completada; la pantalla no vuelve a mostrarse.
- **En fallo:** sin cambios persistidos; la configuración sigue pendiente.

### Reglas de negocio
- (PROPUESTO) Se ejecuta solo una vez y es obligatoria para usar la app.
- (PROPUESTO) Monedas disponibles: S/, $, €. Monto obligatorio y mayor que cero.
- (PROPUESTO) Las monedas no elegidas quedan disponibles para agregar después desde ajustes (CU-022).
- (PROPUESTO) Cambiar la moneda principal una vez completada la configuración queda fuera de alcance.

### Criterios de aceptación
- La pantalla aparece únicamente en el primer ingreso.
- No permite continuar sin moneda seleccionada y monto válido.
- Dashboard y selectores de gastos usan la moneda elegida.
- Completada la configuración, la pantalla no vuelve a aparecer en ingresos posteriores.

### Preguntas pendientes
- Impacto técnico anotado para implementación: el trigger de registro actual crea perfil y presupuesto fijo (S/ 1000); deberá dejar de crear valores por defecto para no contradecir este caso. Afecta a CU-002 (registro) y CU-015 (presupuestos por moneda), que deberán actualizarse al implementar.
