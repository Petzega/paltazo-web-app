# Casos de Uso: Autenticación

> Módulo de autenticación con Supabase Auth. Email/password + recovery flow.
> Google OAuth declarado como shortcut (pendiente).

---

## CU-001: Login (Inicio de sesión)

**Actor:** Usuario no autenticado

**Precondiciones:**
- Usuario tiene cuenta confirmada
- Usuario NO está en `/login` (middleware redirige si ya está logueado)

**Flujo principal:**
1. Usuario navega a `/login`
2. Formulario muestra modo "Ingresar" (default)
3. Usuario ingresa email y contraseña
4. Usuario hace clic en "Ingresar →"
5. Sistema llama `signIn(email, password)` → `supabase.auth.signInWithPassword()`
6. Supabase valida credenciales
7. Sistema redirige a `/` (dashboard)
8. Store actualiza `userId` y carga datos del usuario

**Flujos alternativos:**
- **5a. Credenciales inválidas:** Supabase retorna error → mostrar mensaje inline "Email o contraseña incorrectos"
- **5b. Cuenta no confirmada:** Supabase retorna error → mostrar "Confirma tu correo antes de iniciar sesión"
- **5c. Error de red:** mostrar toast "Error de conexión", mantener en formulario

**Postcondiciones:**
- Sesión activa en Supabase Auth (cookies httpOnly)
- `userId` en store ≠ null
- Usuario en `/`

**Validaciones:**
- Email requerido, formato válido (HTML `type="email"`)
- Contraseña requerida (cliente: `required` HTML, servidor: Supabase)

**UI/UX:**
- Toggle "Ingresar / Registrarse" en parte superior
- Botón "¿Olvidaste tu clave?" visible solo en modo login
- Botón "Ingresar →" deshabilitado mientras `loading = true` (muestra ⏳)
- Campos con iconos: ✉️ email, 🔑 contraseña

**Relacionado:**
- BUG-001: caché corrupto causaba "login is not a function"
- BUG-005: middleware post-logout sesión persistente
- Middleware: si usuario ya autenticado y accede a `/login`, redirige a `/`

---

## CU-002: Registro (Crear cuenta)

**Actor:** Usuario nuevo

**Precondiciones:**
- Usuario no tiene cuenta
- Email no existe en Supabase Auth

**Flujo principal:**
1. Usuario navega a `/login`
2. Usuario hace clic en "Registrarse" (toggle o link "Regístrate")
3. Formulario cambia a modo registro (muestra campo "Nombre completo")
4. Usuario ingresa: nombre (opcional), email, contraseña
5. Usuario hace clic en "Crear cuenta →"
6. Sistema valida contraseña ≥ 6 caracteres
7. Sistema llama `signUp(email, password, name)` → `supabase.auth.signUp()`
8. Supabase crea usuario en `auth.users`
9. Trigger `handle_new_user` inserta en `profiles` y `budgets` (S/ 1000 default)
10. Sistema intenta `signIn(email, password)` automáticamente
11. Si auto-login exitoso → redirige a `/`
12. Si auto-login falla (email requiere confirmación) → mostrar "Revisa tu correo para confirmar tu cuenta"

**Flujos alternativos:**
- **6a. Contraseña < 6 caracteres:** mostrar inline "La contraseña debe tener al menos 6 caracteres", no enviar
- **7a. Email ya existe:** Supabase retorna error → mostrar "Este email ya está registrado"
- **7b. Email inválido:** mostrar error de formato
- **9a. Trigger falla:** EXCEPTION WHEN OTHERS captura error, usuario creado pero sin profile/budget → mostrar "Error al crear perfil, contacta soporte"
- **10a. Error de red en signUp:** mostrar toast "Error al crear cuenta"

**Postcondiciones:**
- Usuario en `auth.users` con `email_confirmed_at = null` (si confirmación requerida) o sesión activa
- Registro en `profiles` con `display_name`, `primary_currency = 'PEN'`
- Registro en `budgets` con `amount = 1000`, `currency = 'PEN'`

**Validaciones:**
- Email requerido, formato válido
- Contraseña requerida, ≥ 6 caracteres (cliente + servidor)
- Nombre opcional, max 200 chars

**UI/UX:**
- Campo "Nombre completo" aparece solo en modo registro (icono 👤)
- Toggle entre login/registro sin recargar página
- Mensaje de éxito si requiere confirmación de email

**Relacionado:**
- BUG-002: trigger sin EXCEPTION handler causaba "Database error saving new user"
- BUG-009: contraseña < 6 chars aceptada → fix: validación cliente-lado
- BUG-016: trigger no insertaba en `budgets` → fix: migración 20261018000000

---

## CU-003: Recuperar contraseña (Solicitar enlace)

**Actor:** Usuario autenticado que olvidó su contraseña

**Precondiciones:**
- Usuario tiene cuenta confirmada
- Usuario NO está logueado (o quiere cerrar sesión primero)

**Flujo principal:**
1. Usuario está en `/login` modo "Ingresar"
2. Usuario hace clic en "¿Olvidaste tu clave?"
3. Formulario cambia a modo "reset" (oculta campos de login/registro)
4. Usuario ingresa email
5. Usuario hace clic en "Enviar enlace →"
6. Sistema llama `resetPassword(email)` → `supabase.auth.resetPasswordForEmail(email, { redirectTo: /login })`
7. Supabase envía email con enlace de recuperación (via Inbucket en local)
8. Sistema muestra mensaje de éxito "Revisa tu correo para restablecer la contraseña"

**Flujos alternativos:**
- **6a. Email no existe:** Supabase NO revela si email existe (seguridad) → mostrar mismo mensaje de éxito
- **6b. Error de red:** mostrar toast "Error al enviar enlace"
- **Usuario quiere volver:** hace clic en "← Volver al inicio de sesión" → regresa a modo login

**Postcondiciones:**
- Email de recuperación enviado (si email existe)
- Formulario en modo reset con mensaje de éxito

**Validaciones:**
- Email requerido, formato válido

**UI/UX:**
- Solo campo email visible
- Botón "← Volver al inicio de sesión" debajo del submit
- Mensaje de éxito en caja azul (primary/10)

**Relacionado:**
- Local: emails se capturan en Inbucket (http://127.0.0.1:54334)
- Cloud: emails se envían vía Supabase Email Provider

---

## CU-004: Nueva contraseña (Reset con token)

**Actor:** Usuario con enlace de recuperación válido

**Precondiciones:**
- Usuario recibió email de recuperación
- URL contiene hash `#type=recovery&access_token=...`
- Token de recuperación válido (no expirado)

**Flujo principal:**
1. Usuario hace clic en enlace de email
2. Supabase redirige a `/login#type=recovery&access_token=...`
3. `useEffect` detecta hash con `type=recovery`
4. Sistema valida que `access_token` exista en hash
5. Formulario cambia a modo "new-password" (muestra campos "Nueva contraseña" y "Confirmar contraseña")
6. Usuario ingresa nueva contraseña y confirmación
7. Usuario hace clic en "Actualizar contraseña →"
8. Sistema valida: contraseñas coinciden, longitud ≥ 6
9. Sistema llama `supabase.auth.updateUser({ password })`
10. Supabase actualiza contraseña e invalida token
11. Sistema muestra "Contraseña actualizada. Inicia sesión."
12. Sistema cambia a modo "login" con campos de contraseña vacíos

**Flujos alternativos:**
- **4a. Token inválido o expirado:** mostrar inline "Enlace de recuperación inválido. Solicita uno nuevo."
- **8a. Contraseñas no coinciden:** mostrar inline "Las contraseñas no coinciden", no enviar
- **8b. Contraseña < 6 caracteres:** mostrar inline "La contraseña debe tener al menos 6 caracteres", no enviar
- **9a. Error al actualizar:** mostrar toast "Error al actualizar contraseña"

**Postcondiciones:**
- Contraseña actualizada en Supabase Auth
- Token de recuperación invalidado
- Usuario en modo "login" con mensaje de éxito

**Validaciones:**
- `access_token` presente en hash URL
- Contraseña requerida, ≥ 6 caracteres
- Confirmación requerida, debe coincidir con contraseña

**UI/UX:**
- Campos "Nueva contraseña" y "Confirmar contraseña" con icono 🔑
- Botón "← Volver al inicio de sesión" visible
- Mensaje de éxito en caja azul

**Relacionado:**
- Token recovery validation aplicada en audit 2026-10-16
- `redirectTo` configurado como `/login` en `resetPassword()`

---

## CU-005: Logout (Cerrar sesión)

**Actor:** Usuario autenticado

**Precondiciones:**
- Usuario logueado
- `userId` en store ≠ null

**Flujo principal:**
1. Usuario hace clic en botón "Cerrar sesión" (Sidebar o Settings)
2. Sistema llama `store.logout()` → `signOut({ scope: 'global' })`
3. Supabase invalida todas las sesiones del usuario (todos los dispositivos)
4. Sistema setea `userId = null`, `expenses = []` en store
5. Middleware detecta sesión inválida en próximo request
6. Middleware redirige a `/login`

**Flujos alternativos:**
- **2a. Error en signOut:** mostrar toast "Error al cerrar sesión", mantener logueado
- **5a. Cookies persisten (BUG-005):** `scope: global` + `window.location.href = '/login'` fuerza recarga completa

**Postcondiciones:**
- Sesión invalidada en Supabase Auth (todas las cookies eliminadas)
- Store limpiado (`userId = null`, `expenses = []`)
- Usuario en `/login`

**Validaciones:**
- Ninguna (cualquier usuario logueado puede hacer logout)

**UI/UX:**
- Botón "Cerrar sesión" en Sidebar (icono 🚪) y Settings
- No requiere confirmación (acción reversible)

**Relacionado:**
- BUG-005: middleware post-logout sesión persistente → fix: `scope: global` + hard reload
- BUG-014: logout no limpiaba estado del store → fix: centralizar en `store.logout()`
- `signOut()` exportado desde `src/lib/supabase/auth.ts`

---

## CU-006: Protección de rutas (Middleware)

**Actor:** Sistema (Next.js middleware)

**Precondiciones:**
- Request HTTP entra al servidor Next.js
- Middleware configurado en `src/middleware.ts`

**Flujo principal:**
1. Request llega al middleware
2. Middleware excluye rutas estáticas (`/_next`, `/api`, `/favicon`, imágenes)
3. Middleware crea cliente Supabase server-side con cookies del request
4. Middleware llama `supabase.auth.getUser()` para obtener sesión
5. Sistema evalúa:
   - Si `user = null` y ruta NO es pública → redirigir a `/login`
   - Si `user ≠ null` y ruta es `/login` → redirigir a `/`
   - Si `user = null` y ruta es pública → permitir acceso
   - Si `user ≠ null` y ruta es protegida → permitir acceso
6. Middleware retorna `NextResponse` con cookies actualizadas

**Flujos alternativos:**
- **2a. Ruta estática:** retornar `NextResponse.next()` sin validar auth
- **4a. Cookies inválidas:** `getUser()` retorna `user = null` → redirigir a `/login`
- **5a. Usuario intenta acceder a `/login` estando logueado:** redirigir a `/` (evitar loop)

**Rutas públicas:**
- `/` (dashboard, requiere auth → si no logueado, redirige a `/login`)
- `/login`
- `/onboarding`

**Rutas protegidas:**
- `/dashboard/*`
- `/settings/*`
- Cualquier ruta no listada en `publicPaths`

**Postcondiciones:**
- Usuario no autenticado en `/login`
- Usuario autenticado en ruta solicitada
- Cookies de sesión actualizadas en response

**Validaciones:**
- Cookie de sesión válida (Supabase Auth)
- Ruta no es pública si `user = null`

**UI/UX:**
- Redirección automática (sin mensaje de error)
- Usuario no ve flash de ruta protegida antes de redirección

**Relacionado:**
- BUG-005: cookies persisten tras logout → `scope: global` en `signOut()`
- Matcher excluye `/_next/static`, `/_next/image`, imágenes

---

## CU-007: Google OAuth (Login social)

**Actor:** Usuario con cuenta Google

**Precondiciones:**
- ⚠️ **SHORTCUT**: Funcionalidad no implementada
- Botón visible en UI pero no funcional

**Flujo principal (cuando se implemente):**
1. Usuario hace clic en "Continuar con Google"
2. Sistema llama `supabase.auth.signInWithOAuth({ provider: 'google' })`
3. Supabase redirige a Google OAuth consent screen
4. Usuario autoriza acceso
5. Supabase redirige a `/auth/callback` con código
6. Sistema intercambia código por sesión
7. Si usuario nuevo → crear en `auth.users` + trigger crea `profiles` y `budgets`
8. Redirigir a `/`

**Estado actual:**
- Botón renderizado en UI (líneas 288-294 de `login/page.tsx`)
- Click no ejecuta ninguna acción
- Comentario: `// shortcut: Google OAuth pendiente — revisit when se active integración social`

**Relacionado:**
- Requiere configurar Google OAuth en Supabase Dashboard
- Requiere endpoint `/auth/callback` para intercambiar código

---

## Notas técnicas

**Estado global afectado:**
- `userId`: string | null (identificador del usuario autenticado)
- `expenses`: array de gastos del usuario
- `budgets`: object con presupuestos por moneda
- `budgetState`: presupuesto de la moneda principal

**Auth flow:**
- Supabase Auth maneja sesiones vía cookies httpOnly
- `onAuthStateChange` en store escucha cambios de sesión
- `getSession()` se llama al cargar app para restaurar sesión

**Security:**
- Contraseñas hasheadas con bcrypt (Supabase Auth)
- Tokens de recuperación expiran en 24h (configurable)
- `scope: global` en `signOut()` invalida todas las sesiones
- Middleware valida sesión en cada request server-side

**Testing local:**
- Emails de confirmación/recuperación se capturan en Inbucket (puerto 54334)
- No requiere SMTP real en desarrollo
- Cloud: Supabase Email Provider o custom SMTP
