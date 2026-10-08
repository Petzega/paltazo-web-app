# Paltazo Web App — Guía de Desarrollo

> Aplicación PWA de control de gastos personales. Stack: Next.js 15 + TypeScript + Tailwind CSS + Supabase.

## Requisitos

- Node.js 20.x+
- npm 10.x+

## Instalación y arranque

```bash
npm install
cp .env.local.example .env.local   # Editar con credenciales reales
npm run dev
```

Abre `http://localhost:3000`.

## Credenciales

Archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pwosqcamfrepotaxrpbc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key del dashboard Supabase>
```

> La variable se llama `ANON_KEY` aunque en el dashboard aparece como "Publishable Key". Son lo mismo.

## Rutas

| Ruta | Descripción | Protegida |
|------|-------------|-----------|
| `/` | Redirect a `/dashboard` o `/onboarding` según sesión | — |
| `/onboarding` | Pantalla de bienvenida | No |
| `/login` | Login, registro, recuperación de contraseña | No |
| `/dashboard` | Inicio (resumen mensual) | Sí |
| `/dashboard/add-expense` | Formulario de nuevo gasto | Sí |
| `/dashboard/expenses` | Historial, editar, eliminar | Sí |
| `/dashboard/settings` | Presupuesto, acerca de, logout | Sí |
| `/budget` | Legacy (no usar) | — |

## Protección de rutas

`src/middleware.ts` — ejecuta en cada request del servidor.

- **Sin sesión** → redirige a `/login`
- **Con sesión en `/login`** → redirige a `/`
- **Públicas:** `/`, `/login`, `/onboarding`

⚠️ **BUG CONOCIDO (2026-10-08):** Después de `signOut()` + `router.push('/login')`, el middleware NO redirige al volver a `/dashboard`. El redirect 307 funciona con curl (sin cookies) pero falla con cliente logueado. Causa probable: cookies de Supabase persisten tras client-side signOut. Workaround en curso: usar `window.location.href = '/login'` + `scope: 'global'` en signOut. Ver BITACORA.md para detalles y estado.

## Estructura del proyecto

```
paltazo-web-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root: metadata + SW + AppProvider
│   │   ├── page.tsx                # Redirect según sesión
│   │   ├── globals.css             # Design tokens
│   │   ├── middleware.ts           # Protección de rutas
│   │   ├── onboarding/             # Bienvenida
│   │   ├── login/page.tsx          # Auth (login/register/reset/new-password)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Sidebar + BottomNav
│   │   │   ├── page.tsx            # Resumen mensual
│   │   │   ├── add-expense/        # Agregar gasto
│   │   │   ├── expenses/           # Historial
│   │   │   └── settings/           # Ajustes + logout
│   │   └── budget/                 # Legacy (ignorar)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Sidebar.tsx         # Con botón logout
│   │   │   ── ...
│   │   └── providers/
│   │       └── ServiceWorkerRegistrar.tsx
│   ├── lib/
│   │   ├── store.tsx               # Context global (Auth + Datos)
│   │   ├── categories.ts           # Categorías MVP
│   │   ├── db.ts                   # Dexie.js (IndexedDB) — legacy
│   │   └── supabase/
│   │       ├── client.ts           # createBrowserClient
│   │       ├── server.ts           # createServerClient (async)
│   │       ├── auth.ts             # signIn, signUp, signOut, resetPassword, onAuthStateChange
│   │       └── repositories.ts     # CRUD: expenses + budget
│   └── types/
│       └── index.ts
├── public/
│   ├── sw.js                       # Service worker (cache-first)
│   ├── manifest.json               # PWA
│   └── icons/
├── supabase/
│   └── schema.sql                  # Esquema SQL (referencia)
── docs/                           # Specs y diseño
── stitch/                         # Diseño de referencia
├── tailwind.config.ts              # Design tokens
├── BITACORA.md                     # Log de errores y soluciones
├── DEVELOPMENT.md                  # Este archivo
└── AGENTS.md                       # Reglas para agentes AI
```

## Estado de datos

| Capa | Tecnología | Estado |
|------|-----------|--------|
| Auth | Supabase Auth (`@supabase/ssr`) | ✅ Producción |
| Datos | Supabase PostgreSQL | ✅ Producción |
| Local | Dexie.js (IndexedDB) | ⚠️ Legacy, no se usa |
| Repository | `src/lib/supabase/repositories.ts` | ✅ Producción |
| Context | `src/lib/store.tsx` (React Context) | ✅ Producción |

## Autenticación

Flujo completo:

```
1. Usuario → /login → email + password
2. signIn/signUp → Supabase Auth
3. Trigger on_auth_user_created → INSERT en profiles
4. store.tsx (onAuthStateChange) → detecta sesión
5. store.tsx → carga expenses + budget desde Supabase
6. App → renderiza dashboard con datos reales
```

Recuperación de contraseña:

```
1. Login → "¿Olvidaste tu clave?" → modo reset
2. Email → Supabase envía link de recuperación
3. Link contiene hash con token → useEffect detecta ?type=recovery
4. Modo new-password → 2 campos (nueva + confirmar)
5. supabase.auth.updateUser({ password }) → actualiza
6. Redirect a login
```

Logout: `signOut({ scope: 'global' })` + `window.location.href = '/login'` (fuerza recarga completa para que el middleware detecte el cambio de sesión).

## Row Level Security (RLS)

Verificado en Supabase. 9 policies activas:

| Tabla | Policies |
|-------|----------|
| profiles | SELECT, INSERT, UPDATE (propio) |
| expenses | SELECT, INSERT, UPDATE, DELETE (propio) |
| budget_alerts | SELECT, INSERT (propio) |

Todas filtran por `auth.uid() = user_id`.

## PWA

- Manifest: `public/manifest.json`
- Service worker: `public/sw.js` (cache-first con network fallback)
- Iconos: `public/icon-192.png`, `public/icon-512.png`
- Registro: `src/components/providers/ServiceWorkerRegistrar.tsx`

## Design System

Tokens en `tailwind.config.ts` + `src/app/globals.css`:

- **Colores:** primary (#42690e), primary-container (#8fbc5a), secondary, tertiary, surface
- **Tipografía:** Inter (headline, body, label)
- **Espaciado:** gutter, space-xs/sm/md/lg/xl
- **Border radius:** sm, DEFAULT, md, lg, xl, full
- **Alertas:** 80% warning, 100% critical, 101% exceeded

## Comandos

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm start            # Servidor producción
npm run typecheck    # Verificar tipos TypeScript
npm run lint         # Linter
graphify update .    # Actualizar grafo de conocimiento (post-cambio de código)
```

## Pendientes

- [ ] **Verificar flujo de datos** → Login → agregar gasto → verificar tabla `expenses` en Supabase
- [ ] **Edge Function `check-budget`** → Alertas automáticas al 80/100/101% del presupuesto
- [ ] **Notificaciones push** → Para alertas de presupuesto
- [ ] **Fix middleware post-logout** → Confirmar que `window.location.href = '/login'` + `scope: 'global'` resuelve el bug de sesión persistente. Si no, crear endpoint `/api/auth/logout` server-side.
