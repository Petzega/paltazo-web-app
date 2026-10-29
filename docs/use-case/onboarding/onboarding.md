# Casos de Uso: Onboarding

> Pantalla de bienvenida para usuarios no autenticados. Presenta la propuesta de valor de la aplicación y ofrece acceso al login.

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
