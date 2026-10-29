# Casos de Uso: Autenticación

> Módulo de autenticación con Supabase Auth. Email/password + recovery flow.
> Google OAuth declarado como shortcut (pendiente).

---

## CU-001: Iniciar sesión con email y contraseña

### Objetivo
Que un usuario con cuenta registrada pueda acceder a su dashboard personal tras validar sus credenciales.

### Alcance
Módulo de autenticación de Paltazo.

### Actor principal
Usuario con cuenta registrada y no autenticado en el momento de iniciar el caso.

### Actores secundarios
Ninguno.

### Fuente
- `docs/necesidad_proyecto_paltazo.md` — Flujo principal, punto 1.
- `docs/use-case/USER_STORY_MAP.md` — US-002 (Login con credenciales, MVP).

### Precondiciones
- El usuario tiene una cuenta registrada en Supabase Auth.
- No hay sesión activa. Si el usuario ya está autenticado e intenta acceder a `/login`, el middleware (CU-006) lo redirige a `/`.
- La configuración de Supabase Auth tiene desactivada la confirmación obligatoria de email (auto-login inmediato tras registro).

### Disparador
El usuario navega a `/login`.

### Flujo principal
1. El sistema muestra el formulario en modo **"Ingresar"** (toggle por defecto).
2. El usuario introduce email y contraseña.
3. El usuario pulsa "Ingresar".
4. El sistema valida formato de email en cliente (`type="email"`).
5. El sistema invoca `signIn(email, password)` → `supabase.auth.signInWithPassword()`.
6. Supabase valida credenciales y devuelve sesión.
7. El sistema actualiza el store (`userId`, datos del usuario).
8. El sistema redirige a `/` (dashboard).

### Flujos alternativos
- **Paso 5a — Credenciales inválidas:** Supabase devuelve error → el sistema muestra mensaje inline *"Email o contraseña incorrectos"* y permanece en el formulario. *(Ref. histórica: BUG-001 — caché corrupto causaba "login is not a function", ya resuelto.)*
- **Paso 5b — Error de red:** el sistema muestra toast *"Error de conexión"* y mantiene al usuario en el formulario.
- **Paso 1b — Usuario ya autenticado accede a `/login`:** el middleware detecta sesión válida y redirige automáticamente a `/` sin mostrar el formulario.

### Excepciones
- **Error inesperado de Supabase:** toast genérico de error; usuario permanece en `/login`.

### Postcondiciones
- **En éxito:** sesión activa en Supabase Auth (cookies httpOnly), `userId ≠ null` en el store, usuario en `/`.
- **En fallo:** usuario permanece en `/login` con mensaje inline o toast según el caso; el store no se modifica.

### Reglas de negocio
- Email con formato válido (HTML `type="email"`).
- Contraseña mínima de 6 caracteres (validación de Supabase; el cliente no necesita validarla porque el campo es libre, pero el servidor rechazará valores menores).
- El botón "Ingresar" se deshabilita mientras `loading = true` (muestra ⏳).

### Criterios de aceptación
- Credenciales válidas → redirige a `/`.
- Credenciales inválidas → mensaje inline *"Email o contraseña incorrectos"*.
- Botón deshabilitado mientras `loading = true`.
- No hay flash de ruta protegida antes de la redirección cuando un usuario ya logueado entra a `/login`.

### Preguntas pendientes
- **Naming de `/`:** ¿se mantiene como "dashboard" o se renombra a "home"? (Tangencial a auth; afecta al módulo `dashboard/`.)

---

## CU-002: Registrarse con email y contraseña

### Objetivo
Que un usuario nuevo pueda crear una cuenta, con un perfil creado por el sistema, y continuar a la configuración inicial del primer ingreso (CU-021, PROPUESTO), donde definirá su moneda principal y presupuesto inicial.

### Alcance
Módulo de autenticación de Paltazo.

### Actor principal
Usuario nuevo sin cuenta.

### Actores secundarios
Ninguno.

### Fuente
- `docs/necesidad_proyecto_paltazo.md` — Alcance del MVP: "Autenticación para proteger y sincronizar datos personales".
- `docs/use-case/USER_STORY_MAP.md` — US-001 (Registro básico, MVP).

### Precondiciones
- El email introducido no existe en Supabase Auth.
- El usuario no tiene sesión activa.

### Disparador
El usuario, estando en `/login`, pulsa "Crear cuenta" tras cambiar al modo "Registrarse".

### Flujo principal
1. El sistema muestra el formulario en modo **"Registrarse"** (tras toggle o link).
2. El sistema muestra el campo adicional **"Nombre completo"** (opcional, icono 👤).
3. El usuario introduce nombre (opcional), email y contraseña.
4. El usuario pulsa "Crear cuenta".
5. El sistema valida en cliente:
   - Formato de email válido (`type="email"`).
   - Contraseña ≥ 6 caracteres.
   - Nombre ≤ 200 caracteres (si se indicó).
6. El sistema invoca `signUp(email, password, name)` → `supabase.auth.signUp()`.
7. Supabase crea el usuario en `auth.users`.
8. (PROPUESTO) El trigger `handle_new_user` inserta únicamente el registro en `profiles` con `display_name`, sin moneda ni presupuesto por defecto: ambos se definen en el primer ingreso (CU-021). *Código actual: también inserta `budgets` con `monthly_limit = 1000` y moneda fija.*
9. El sistema invoca automáticamente `signIn(email, password)` → `supabase.auth.signInWithPassword()`.
10. Supabase devuelve sesión activa.
11. El sistema actualiza el store (`userId`, datos del usuario).
12. (PROPUESTO) El sistema redirige a la configuración inicial del primer ingreso (CU-021). *Código actual: redirige a `/` (dashboard).*

### Flujos alternativos
- **Paso 5a — Contraseña < 6 caracteres:** el sistema muestra inline *"La contraseña debe tener al menos 6 caracteres"* y no envía la solicitud. *(Ref. histórica: BUG-009 — contraseña < 6 chars aceptada, fix: validación cliente.)*
- **Paso 6a — Email ya existe:** Supabase devuelve error → el sistema muestra inline *"Este email ya está registrado"*.
- **Paso 6b — Email con formato inválido:** el sistema muestra inline error de formato y no envía la solicitud.
- **Paso 8a — Trigger falla al crear perfil:** el trigger captura el error con `EXCEPTION WHEN OTHERS` y retorna el usuario de todos modos (ver "Decisiones pendientes" al final de este archivo). El sistema muestra *"Error al crear perfil, contacta soporte"*. *(Ref. histórica: BUG-002 — trigger sin EXCEPTION handler; BUG-016 — trigger no insertaba en `budgets`, fix: migración 20261018000000. Con CU-021 el trigger dejará de crear presupuesto por defecto.)*
- **Paso 9a — Error de red en signUp:** el sistema muestra toast *"Error al crear cuenta"* y permanece en el formulario.
- **Paso 9b — Error en el auto-login (la cuenta ya fue creada):** el sistema muestra toast de error. El usuario puede volver a `/login` e ingresar manualmente con sus credenciales.

### Excepciones
- **Error inesperado de Supabase:** toast genérico de error; usuario permanece en `/login`.

### Postcondiciones
- **En éxito (PROPUESTO):** usuario en `auth.users`, perfil en `profiles` con `display_name`, sesión activa en Supabase Auth, `userId ≠ null` en el store, usuario en la configuración inicial (CU-021). Sin presupuesto por defecto: moneda y presupuesto se crean en CU-021. *Código actual: también crea presupuesto default S/ 1000 y redirige a `/`.*
- **En fallo (validación cliente):** usuario permanece en `/login` con mensaje inline; no se crea cuenta.
- **En fallo (trigger):** cuenta creada en `auth.users` pero posiblemente sin perfil; usuario NO continúa a la configuración inicial. Requiere soporte o reparación manual.

### Reglas de negocio
- Email con formato válido.
- Contraseña ≥ 6 caracteres (cliente y servidor).
- Nombre completo opcional, máximo 200 caracteres.
- (PROPUESTO) Al registrarse, el sistema crea automáticamente únicamente el perfil en `profiles`. La moneda principal y el presupuesto inicial los define el usuario en el primer ingreso (CU-021); ya no existe presupuesto default S/ 1000. *Código actual: también crea `budgets` con S/ 1000 y moneda fija.*
- Tras el registro exitoso, el sistema ejecuta auto-login inmediato (no se solicita confirmación de email; Supabase está configurado sin confirmación obligatoria).

### Criterios de aceptación
- Acepta email con formato válido.
- Contraseña mínima de 6 caracteres (validada en cliente y servidor).
- Nombre completo es opcional (máx 200 caracteres).
- (PROPUESTO) Tras el registro se crea el perfil y el usuario continúa a la configuración inicial de moneda y presupuesto (CU-021). *Código actual: se crea `budgets` default (S/ 1000) y entra al dashboard.*
- Si el email ya existe → mensaje inline *"Este email ya está registrado"*.

### Preguntas pendientes
- Ninguna específica de este caso.

---

## CU-003: Solicitar enlace de recuperación de contraseña

### Objetivo
Que un usuario con cuenta registrada, sin acceso a su contraseña, pueda solicitar un enlace de recuperación por email para restablecerla.

### Alcance
Módulo de autenticación de Paltazo.

### Actor principal
Usuario con cuenta registrada, no autenticado en el momento de iniciar el caso.

### Actores secundarios
Ninguno.

### Fuente
- `docs/use-case/USER_STORY_MAP.md` — US-003 (Flujo de recuperación, MVP).

### Precondiciones
- El usuario tiene una cuenta registrada en Supabase Auth.
- El usuario no tiene sesión activa (o, si la tiene, decide cerrarla primero para iniciar el flujo desde `/login`).

### Disparador
El usuario, estando en `/login` en modo "Ingresar", pulsa "¿Olvidaste tu clave?".

### Flujo principal
1. El sistema cambia el formulario a modo **"reset"** (oculta campos de login/registro y muestra únicamente el campo email).
2. El usuario introduce su email.
3. El usuario pulsa "Enviar enlace".
4. El sistema valida formato de email en cliente (`type="email"`).
5. El sistema invoca `resetPassword(email)` → `supabase.auth.resetPasswordForEmail(email, { redirectTo: '/login' })`.
6. Supabase envía un email con enlace de recuperación (token con expiración de 1 hora).
7. El sistema muestra mensaje de éxito: *"Revisa tu correo para restablecer la contraseña"* (caja azul, primario/10).

### Flujos alternativos
- **Paso 5a — Email no registrado:** Supabase **no revela** si el email existe (política de seguridad) → el sistema muestra el mismo mensaje de éxito del paso 7. No se envía email, pero el usuario no puede distinguirlo de un caso válido.
- **Paso 5b — Error de red:** el sistema muestra toast *"Error al enviar enlace"* y mantiene al usuario en el formulario.
- **Flujo alternativo de navegación — Usuario quiere volver:** el usuario pulsa "← Volver al inicio de sesión" → el sistema regresa al modo "Ingresar" sin enviar solicitud.

### Excepciones
- **Error inesperado de Supabase:** toast genérico de error; usuario permanece en el formulario.

### Postcondiciones
- **En éxito:** email de recuperación enviado (si el email existe en Supabase); formulario en modo "reset" con mensaje de éxito visible.
- **En fallo:** usuario permanece en el formulario con toast de error; no se envía email.

### Reglas de negocio
- Email con formato válido.
- Por seguridad, el sistema **no revela** si el email existe en Supabase Auth.
- El token de recuperación expira en **1 hora** (configurable en Supabase).
- El `redirectTo` del enlace apunta a `/login`, donde el sistema detectará el hash `#type=recovery` (ver CU-004).

### Criterios de aceptación
- Solicita email y envía enlace de recuperación.
- No revela si el email existe (mismo mensaje en todos los casos).
- El enlace contiene un token con expiración de 1 hora.
- Mensaje de éxito visible tras la solicitud.
- El usuario puede volver al modo "Ingresar" en cualquier momento con "← Volver al inicio de sesión".

### Preguntas pendientes
- **Entorno de emails:** en desarrollo local, los emails se capturan en Inbucket (puerto 54334). En producción, Supabase Email Provider o SMTP custom. (Documentado, no bloquea.)
- **Pantalla de confirmación post-solicitud (RESUELTO):** Se mantiene el feedback inline en `/login` ("Revisa tu correo para continuar") sin pantalla intermedia separada, optimizando simplicidad y consistencia visual.

---

## CU-004: Establecer nueva contraseña con token de recuperación

### Objetivo
Que un usuario con un enlace de recuperación válido pueda establecer una nueva contraseña y volver a iniciar sesión.

### Alcance
Módulo de autenticación de Paltazo.

### Actor principal
Usuario con enlace de recuperación válido (recibido por email tras CU-003).

### Actores secundarios
Ninguno.

### Fuente
- `docs/use-case/USER_STORY_MAP.md` — US-003 (Flujo de recuperación, MVP).

### Precondiciones
- El usuario recibió un email de recuperación (ver CU-003).
- La URL contiene el hash `#type=recovery&access_token=...`.
- El token de recuperación no ha expirado (vigencia: 1 hora).

### Disparador
El usuario hace clic en el enlace del email de recuperación.

### Flujo principal
1. El navegador abre el enlace; Supabase redirige a `/login#type=recovery&access_token=...`.
2. Un `useEffect` detecta el hash con `type=recovery`.
3. El sistema valida que `access_token` esté presente en el hash.
4. El sistema cambia el formulario a modo **"new-password"** (muestra campos "Nueva contraseña" y "Confirmar contraseña").
5. El usuario introduce la nueva contraseña y la confirmación.
6. El usuario pulsa "Actualizar contraseña".
7. El sistema valida en cliente:
   - Ambas contraseñas coinciden.
   - Contraseña ≥ 6 caracteres.
8. El sistema invoca `supabase.auth.updateUser({ password })`.
9. Supabase actualiza la contraseña e invalida el token de recuperación.
10. El sistema muestra mensaje de éxito: *"Contraseña actualizada. Inicia sesión."* (caja azul, primario/10).
11. El sistema cambia al modo "login" con los campos de contraseña vacíos.

### Flujos alternativos
- **Paso 3a — Token inválido o expirado:** el sistema muestra inline *"Enlace de recuperación inválido. Solicita uno nuevo."* con un enlace a `/login` para reiniciar el flujo (CU-003).
- **Paso 7a — Contraseñas no coinciden:** el sistema muestra inline *"Las contraseñas no coinciden"* y no envía la solicitud.
- **Paso 7b — Contraseña < 6 caracteres:** el sistema muestra inline *"La contraseña debe tener al menos 6 caracteres"* y no envía la solicitud.
- **Paso 8a — Error de Supabase al actualizar:** el sistema muestra toast *"Error al actualizar contraseña"* y mantiene al usuario en el formulario "new-password".

### Excepciones
- **Error inesperado de Supabase:** toast genérico de error; usuario permanece en el formulario.

### Postcondiciones
- **En éxito:** contraseña actualizada en Supabase Auth, token de recuperación invalidado, formulario en modo "login" con mensaje de éxito visible.
- **En fallo (token):** usuario no puede continuar; debe solicitar un nuevo enlace (CU-003).
- **En fallo (validación):** usuario permanece en modo "new-password" con mensaje inline.

### Reglas de negocio
- `access_token` debe estar presente en el hash URL.
- Contraseña ≥ 6 caracteres.
- La confirmación debe coincidir con la contraseña.
- El token de recuperación se invalida tras el uso exitoso (un token solo puede usarse una vez).
- Vigencia del token: 1 hora.

### Criterios de aceptación
- Token válido → muestra formulario de nueva contraseña.
- Nueva contraseña y confirmación deben coincidir (≥ 6 caracteres).
- Token inválido o expirado → mensaje inline con opción de solicitar nuevo enlace.
- Tras actualización exitosa → mensaje de éxito y formulario vuelve a modo "login".

### Preguntas pendientes
- Ninguna específica de este caso.

---

## CU-005: Cerrar sesión

### Objetivo
Que un usuario autenticado pueda cerrar su sesión en todos los dispositivos y volver a la pantalla de "Sesión cerrada", desde donde podrá iniciar sesión de nuevo.

### Alcance
Módulo de autenticación de Paltazo.

### Actor principal
Usuario autenticado.

### Actores secundarios
Ninguno.

### Fuente
- `docs/use-case/USER_STORY_MAP.md` — US-004 (Logout global, MVP).

### Precondiciones
- El usuario tiene una sesión activa.
- `userId ≠ null` en el store.

### Disparador
El usuario pulsa "Cerrar sesión" desde cualquiera de los puntos de entrada: Sidebar (icono 🚪) o página de Ajustes (ver también CU-017 en `settings/settings.md`).

### Flujo principal
1. El usuario pulsa "Cerrar sesión".
2. El sistema invoca `store.logout()` → `signOut({ scope: 'global' })`.
3. Supabase invalida todas las sesiones del usuario en todos los dispositivos.
4. El sistema limpia el store: `userId = null`, `expenses = []`.
5. El sistema redirige a la pantalla **"Sesión cerrada"**.
6. El usuario ve el mensaje de cierre y un botón para volver a iniciar sesión.
7. El usuario pulsa el botón y el sistema lo redirige a `/login`.

### Flujos alternativos
- **Paso 2a — Error en `signOut`:** el sistema muestra toast *"Error al cerrar sesión"* y mantiene al usuario logueado en la misma pantalla.
- **Paso 5a — Cookies persistentes (BUG-005):** si las cookies no se invalidan correctamente tras `scope: global`, el sistema fuerza una recarga completa con `window.location.href` hacia la pantalla de sesión cerrada para asegurar el estado limpio. *(Ref. histórica: BUG-005 — cookies persisten tras logout; fix: `scope: global` + hard reload.)*
- **Flujo alternativo — Sin confirmación:** el logout no requiere modal de confirmación (acción reversible; convención de producto).

### Excepciones
- **Fallo de red durante `signOut`:** el sistema conserva la sesión local y muestra toast de error; el usuario puede reintentar.

### Postcondiciones
- **En éxito:** sesión invalidada en Supabase Auth (todas las cookies eliminadas), store limpiado (`userId = null`, `expenses = []`), usuario en la pantalla "Sesión cerrada".
- **En fallo:** usuario permanece logueado con toast de error; sesión y store intactos.

### Reglas de negocio
- `signOut({ scope: 'global' })` invalida todas las sesiones del usuario en todos los dispositivos.
- El logout **no requiere confirmación** (acción reversible; convención de producto).
- El logout se centraliza en `store.logout()`; todos los puntos de entrada (Sidebar, Ajustes) invocan la misma función (ver también CU-017).
- Tras el logout, el usuario **no** va directamente a `/login`, sino a una pantalla intermedia de "Sesión cerrada".

### Criterios de aceptación
- Invalida todas las sesiones del usuario en todos los dispositivos (`scope: global`).
- Limpia estado global (`userId = null`, `expenses = []`).
- Redirige a la pantalla "Sesión cerrada", con botón a `/login`.
- Botón accesible desde Sidebar y desde Ajustes.
- No requiere modal de confirmación.

### Preguntas pendientes
- **Ruta concreta de la pantalla "Sesión cerrada" (RESUELTO):** Se ratifica el requisito de una pantalla dedicada `/session-closed` (o `/logout-success`) con botón para volver a `/login`.
- **Deuda técnica en código:** Actualmente el logout redirige a `/onboarding` (`Sidebar.tsx`, `settings/page.tsx`). Esto queda clasificado como brecha P0 a implementar en código para cumplir con la especificación.

---

## CU-006: Proteger rutas con middleware

### Objetivo
Impedir que usuarios no autenticados accedan a rutas protegidas, redirigir a usuarios ya autenticados fuera de `/login`, y manejar la expiración de sesión durante el uso de la app.

### Alcance
Módulo de autenticación de Paltazo (middleware de Next.js en `src/middleware.ts`).

### Actor principal
Sistema (Next.js middleware).

### Actores secundarios
Ninguno.

### Fuente
- `docs/use-case/USER_STORY_MAP.md` — US-005 (Middleware de autenticación, MVP).

### Precondiciones
- Una request HTTP entra al servidor Next.js.
- El middleware está configurado en `src/middleware.ts`.

### Disparador
Cada request HTTP que llega al servidor Next.js.

### Flujo principal
1. La request llega al middleware.
2. El middleware excluye rutas estáticas (`/_next`, `/api`, `/favicon`, imágenes).
3. El middleware crea un cliente Supabase server-side con las cookies del request.
4. El middleware invoca `supabase.auth.getUser()` para obtener la sesión.
5. El sistema evalúa:
   - Si `user = null` y la ruta NO es pública → redirigir a `/login`.
   - Si `user ≠ null` y la ruta es `/login` → redirigir a `/`.
   - Si `user = null` y la ruta es pública → permitir acceso.
   - Si `user ≠ null` y la ruta es protegida → permitir acceso.
6. El middleware retorna `NextResponse` con cookies actualizadas.

### Flujos alternativos
- **Paso 2a — Ruta estática:** retornar `NextResponse.next()` sin validar auth.
- **Paso 4a — Cookies inválidas o expiradas:** `getUser()` devuelve `user = null` → redirigir a `/login`.
  - **Si el usuario estaba en mitad de una acción (ej. registrando un gasto):** los datos en curso **se pierden** (redirect silencioso, sin modal ni toast).
- **Paso 5a — Usuario ya autenticado intenta acceder a `/login`:** redirigir a `/` (evitar loop). *(Ref. histórica: BUG-005 — cookies persisten tras logout; fix: `scope: global` en `signOut()` + hard reload.)*

### Excepciones
- **Fallo de conexión con Supabase en el middleware:** se trata como sesión inválida → redirect a `/login` (fail closed).

### Postcondiciones
- **En todos los casos:** usuario no autenticado queda en `/login`; usuario autenticado en ruta solicitada; cookies de sesión actualizadas en response.

### Rutas públicas
- `/login`
- `/onboarding` (splash/logo de Paltazo)
- `/` (pública en `middleware.ts` para permitir el routing client-side de `src/app/page.tsx`, la cual redirige a `/dashboard` si hay sesión o a `/onboarding` si no la hay)

### Rutas protegidas
- `/dashboard` y `/dashboard/*`
- `/settings` y `/settings/*`
- Cualquier ruta de la app no listada en `publicPaths`

### Reglas de negocio
- El middleware valida sesión en cada request server-side.
- Cookies de sesión válidas (Supabase Auth, httpOnly).
- Si la sesión expira durante el uso, el redirect a `/login` es **silencioso** (sin modal ni toast); los datos en curso se pierden.
- El matcher excluye `/_next/static`, `/_next/image` y rutas de imágenes.

### Criterios de aceptación
- Rutas públicas: `/login`, `/onboarding`.
- Usuario no logueado en ruta protegida → redirige a `/login`.
- Usuario logueado en `/login` → redirige a `/`.
- No hay flash de ruta protegida antes de la redirección.
- Sesión expirada durante uso → redirect silencioso a `/login`.

### Preguntas pendientes
- Ninguna específica de este caso.

---

## CU-007: Iniciar sesión con Google (OAuth) — shortcut

> **Estado: SHORTCUT.** Este caso describe el flujo previsto para cuando la funcionalidad se implemente. Hoy el botón es visible en la UI pero no ejecuta ninguna acción.

### Objetivo
Que un usuario con cuenta Google pueda iniciar sesión en Paltazo con un solo clic, evitando recordar una contraseña adicional.

### Alcance
Módulo de autenticación de Paltazo.

### Actor principal
Usuario con cuenta Google.

### Actores secundarios
Ninguno.

### Fuente
- `docs/use-case/USER_STORY_MAP.md` — US-016 (Google OAuth, release v1.2, shortcut).

### Precondiciones
- ⚠️ **SHORTCUT:** funcionalidad no implementada.
- El botón "Continuar con Google" está renderizado en la UI pero no ejecuta ninguna acción.
- Cuando se implemente, requerirá configurar Google OAuth en Supabase Dashboard.

### Disparador
El usuario pulsa "Continuar con Google" en `/login`.

### Flujo principal (previsto para cuando se implemente)
1. El usuario pulsa "Continuar con Google".
2. El sistema invoca `supabase.auth.signInWithOAuth({ provider: 'google' })`.
3. Supabase redirige a la pantalla de consentimiento de Google OAuth.
4. El usuario autoriza el acceso.
5. Supabase redirige a `/auth/callback` con un código.
6. El sistema intercambia el código por una sesión.
7. Si el usuario es nuevo → se crea en `auth.users`; el trigger `handle_new_user` crea `profiles` y `budgets` default (ver CU-002).
8. El sistema redirige a `/` (dashboard).

### Flujos alternativos
- **Paso 4a — Usuario deniega permisos:** Google redirige de vuelta con error; el sistema muestra toast *"No se pudo iniciar sesión con Google"* y vuelve a `/login`.
- **Paso 6a — Código inválido o expirado:** el sistema muestra toast *"Enlace de autenticación inválido. Intenta de nuevo."* y vuelve a `/login`.
- **Paso 7a — Usuario nuevo (primera vez):** tras crear la cuenta, el sistema ejecuta auto-login (igual que en CU-002, sin confirmación de email).

### Excepciones
- **Error inesperado de Supabase o Google:** toast genérico; usuario vuelve a `/login`.

### Postcondiciones
- **En éxito (cuando se implemente):** sesión activa en Supabase Auth, perfil creado si era usuario nuevo, usuario en `/`.
- **En fallo:** usuario permanece en `/login` con mensaje de error.

### Estado actual (shortcut)
- Botón renderizado en la UI (líneas 288-294 de `login/page.tsx`).
- Click no ejecuta ninguna acción.
- Se añade un **tooltip o indicador visual** sobre el botón con el texto *"No disponible por el momento"*, para que el usuario sepa que la opción existe pero aún no está activa.

### Reglas de negocio
- Requiere configurar Google OAuth en Supabase Dashboard (client ID, client secret, redirect URLs).
- Requiere endpoint `/auth/callback` para intercambiar el código.
- Al crear un usuario nuevo vía OAuth, se aplican las mismas reglas que en CU-002 (creación de `profiles` y `budgets` default).
- No se requiere confirmación de email para cuentas creadas vía OAuth (el email ya viene verificado por Google).

### Criterios de aceptación
- Botón "Continuar con Google" visible en la pantalla de login.
- Tooltip visible que indique *"No disponible por el momento"* (mientras sea shortcut).
- Cuando se active: flujo OAuth completo con callback `/auth/callback`.
- Usuario nuevo → crea `profiles` y `budgets` automáticamente.

### Preguntas pendientes
- **Fecha concreta de activación:** PENDIENTE. El botón permanece como shortcut hasta que se decida implementar.
- **Proveedores adicionales:** hoy solo se contempla Google. Si en el futuro se añaden otros (Apple, GitHub), cada uno amerita su propio flujo alternativo o caso.

---

## Anexo: Notas técnicas

**Estado global afectado:**
- `userId`: string | null (identificador del usuario autenticado).
- `expenses`: array de gastos del usuario.
- `budgets`: objeto con presupuestos por moneda (esquema multi-moneda; tabla `budgets` en Supabase).
- `budgetState`: presupuesto de la moneda principal.

**Auth flow:**
- Supabase Auth maneja sesiones vía cookies httpOnly.
- `onAuthStateChange` en el store escucha cambios de sesión.
- `getSession()` se llama al cargar la app para restaurar sesión.

**Security:**
- Contraseñas hasheadas con bcrypt (Supabase Auth).
- Tokens de recuperación expiran en **1 hora** (configurado en Supabase).
- `scope: global` en `signOut()` invalida todas las sesiones.
- Middleware valida sesión en cada request server-side.
- **No hay confirmación de email** para registros nuevos (auto-login inmediato).

**Testing local:**
- Emails de confirmación/recuperación se capturan en Inbucket (puerto 54334).
- No requiere SMTP real en desarrollo.
- Cloud: Supabase Email Provider o SMTP custom.

---

## Decisiones pendientes

> Decisiones tangenciales al módulo de autenticación que surgieron durante la revisión.
> No bloquean los casos de uso actuales, pero deben resolverse antes de implementar o extender.

### 1. Naming "dashboard" vs "home"
- **Contexto:** la ruta `/` actúa como landing del usuario autenticado. Hoy se llama "dashboard" en la documentación, pero el producto evalúa renombrarla a "home".
- **Impacto:** solo afecta al módulo `dashboard/` y a los textos de UI. Los casos de uso de auth siguen siendo válidos con cualquiera de los dos nombres.
- **Estado:** PENDIENTE.

### 2. Ruta concreta de la pantalla "Sesión cerrada"
- **Contexto:** CU-005 establece que el logout redirige a una pantalla intermedia "Sesión cerrada" con botón a `/login`. La ruta específica (`/logout-success`, `/session-closed`, `/goodbye`, etc.) no está decidida.
- **Impacto:** decisión de routing, no de caso de uso.
- **Estado:** PENDIENTE.

### 3. Alcance del rol admin
- **Contexto:** se mencionó la posibilidad de introducir un rol `admin` además del rol `user`. No hay casos de uso de administración definidos.
- **Impacto:** cuando se defina, se abrirá un inventario nuevo de casos de administración (gestión de usuarios, permisos, etc.).
- **Estado:** PENDIENTE — fuera del MVP.

### 4. Discrepancia de moneda: `'PEN'` (documentación) vs `'S/'` (código) — REEMPLAZADA
- **Estado:** REEMPLAZADA (29 oct 2026) por CU-021 a CU-023: la moneda principal la elige el usuario en el primer ingreso entre `S/`, `$` y `€`, y las monedas se gestionan a demanda. La convención ISO `'PEN'` deja de aplicar como decisión vigente; al implementar se usarán los símbolos definidos en los nuevos casos de uso.
- **Histórico:** la documentación usaba `'PEN'` y el código `'S/'`; ya no aplica porque la moneda deja de ser fija.

### 5. Trigger `handle_new_user` tolerante a fallos
- **Contexto:** el trigger `handle_new_user` captura errores con `EXCEPTION WHEN OTHERS` y retorna el usuario de todos modos (`RETURN NEW`). Esto significa que un usuario puede quedar creado en `auth.users` sin registro correspondiente en `profiles` ni `budgets`, pero el signup se considera exitoso desde la perspectiva de Supabase Auth.
- **Impacto:** el sistema puede terminar con usuarios "huérfanos" de perfil. El CU-002 paso 8a contempla este caso, pero la detección y recuperación depende de la lógica de la aplicación (ej. verificar post-login que exista `profiles`).
- **Actualización (29 oct 2026):** con CU-021 el trigger dejará de crear el presupuesto por defecto; la tolerancia a fallos seguirá aplicando solo a `profiles`.
- **Estado:** PENDIENTE de revisión por backend — decidir si este comportamiento tolerante es aceptado o si se endurece el trigger.
