# Paltazo — Bitácora de Avance

## Estado del proyecto (2026-10-08)

**Stack:** Next.js 15 + TypeScript + Tailwind CSS + Supabase
**PWA:** ✅ Completada
**Auth:** ✅ Supabase Auth con middleware de protección
**RLS:** ✅ 9 policies verificadas
**Supabase Local:** ✅ Docker + CLI configurado (Windows/Linux)
**Estado general:** MVP funcional con autenticación, RLS y desarrollo local. Pendiente: verificar flujo de datos completo, Edge Function de alertas, notificaciones push, y fix del bug de logout.

---

## Configuración de entorno

### Local (Supabase en Docker)

Archivo `.env.development.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_<TU_ANON_KEY_LOCAL>
```

**Guía completa:** Ver `supabase/LOCAL_SETUP.md`

### Cloud (Supabase producción)

Archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pwosqcamfrepotaxrpbc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key del dashboard Supabase>
```

> **Importante:** La variable se llama `NEXT_PUBLIC_SUPABASE_ANON_KEY`, aunque en el dashboard Supabase aparece como "Publishable Key" o "anon key". Son lo mismo.

---

## Esquema de base de datos

### Tabla: `profiles`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK, FK → auth.users) | ID del usuario Supabase |
| `display_name` | TEXT | Nombre del usuario |
| `monthly_budget` | NUMERIC(10,2) | Presupuesto mensual (default 1000) |
| `currency` | TEXT | Moneda (default 'S/') |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

### Tabla: `expenses`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK, default gen_random_uuid()) | ID del gasto |
| `user_id` | UUID (FK → auth.users) | ID del usuario |
| `amount` | NUMERIC(10,2) | Monto del gasto |
| `currency` | TEXT | Moneda (S/, $) |
| `category` | TEXT | food, transport, services, entertainment, other |
| `description` | TEXT (nullable) | Descripción |
| `date` | DATE | Fecha del gasto |
| `created_at` | TIMESTAMPTZ | Fecha de creación |
| `synced_at` | TIMESTAMPTZ | Última sincronización |

### Tabla: `budget_alerts`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | ID de la alerta |
| `user_id` | UUID (FK → auth.users) | ID del usuario |
| `expense_id` | UUID (FK → expenses) | ID del gasto que generó la alerta |
| `level` | TEXT | warning, critical, exceeded |
| `percentage` | NUMERIC(5,2) | Porcentaje del presupuesto usado |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

### Trigger: `on_auth_user_created`
Función `public.handle_new_user()` (SECURITY DEFINER) que inserta automáticamente un perfil en `public.profiles` cuando se crea un usuario en `auth.users`. Ver sección "Error 2" para el SQL exacto.

---

## Archivos clave

| Archivo | Descripción |
|---------|-------------|
| `src/lib/supabase/client.ts` | Cliente browser (createBrowserClient) |
| `src/lib/supabase/server.ts` | Cliente server (createServerClient, async) |
| `src/lib/supabase/auth.ts` | signIn, signUp, signOut, resetPassword, onAuthStateChange |
| `src/lib/supabase/repositories.ts` | CRUD: getExpenses, addExpense, updateExpense, deleteExpense, getBudget, upsertBudget |
| `src/lib/store.tsx` | Context global (Auth + Datos). Carga datos en onAuthStateChange |
| `src/middleware.ts` | Protección de rutas. Redirige a /login sin sesión, a / si ya autenticado |
| `src/app/login/page.tsx` | 4 modos: login, register, reset, new-password |
| `src/app/dashboard/layout.tsx` | Sidebar + BottomNav |
| `src/components/ui/Sidebar.tsx` | Sidebar desktop + botón logout |
| `src/components/ui/BottomNav.tsx` | Navegación móvil |
| `src/app/dashboard/settings/page.tsx` | Presupuesto, acerca de, sección logout |
| `public/sw.js` | Service worker (cache-first) |
| `public/manifest.json` | PWA manifest |
| `supabase/schema.sql` | Esquema SQL completo (referencia) |
| `supabase/LOCAL_SETUP.md` | **Guía completa de Supabase Local (Docker)** |
| `.env.local` | Credenciales Supabase cloud (no commitear) |
| `.env.development.local` | Credenciales Supabase local (no commitear) |

---

## Errores y soluciones

### Error 1: `login is not a function` en `src/app/login/page.tsx:14`

**Causa:** store.tsx actualizado a Supabase (eliminado `login()` mock) pero login/page.tsx seguía llamándolo. Caché Next.js mantenía código antiguo.

**Solución:**
1. Actualizar `src/app/login/page.tsx` → usar `signIn()` y `signUp()` de `@/lib/supabase/auth`
2. Limpiar caché: `rm -rf .next && npm run dev`

---

### Error 2: `Database error saving new user` (HTTP 500 en `/auth/v1/signup`)

**Causa:** Trigger `handle_new_user()` fallaba al insertar en `profiles`.

**Solución** — Ejecutar en **Supabase Dashboard → SQL Editor**:

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, monthly_budget, currency)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    1000.00,
    'S/'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

### Error 3: `Uncaught SyntaxError: Invalid or unexpected token (at layout.js:728:29)`

**Causa:** Caché corrupto de Next.js.

**Solución:** `rm -rf .next && npm run dev`

---

### Error 4: `relation "pg_log" does not exist` en Supabase

**Causa:** Supabase no expone `pg_log` desde SQL Editor. Logs reales en **Dashboard → Logs → Database**.

---

### Bug 5: Middleware no redirige después de logout (2026-10-08)

**Síntoma:** Después de `signOut()` + `router.push('/login')`, el usuario puede navegar a `/dashboard` sin sesión. `curl` sin cookies sí recibe redirect 307 → `/login`.

**Causa probable:** Las cookies de sesión de Supabase persisten en el navegador tras `signOut()` con navegación client-side. El middleware lee cookies del request, y Next.js las mantiene cached tras client navigation.

**Workarounds aplicados:**
1. `signOut({ scope: 'global' })` — cierra sesión en todos los dispositivos
2. `window.location.href = '/login'` en lugar de `router.push('/login')` — fuerza recarga completa del navegador

**Estado:** Pendiente de confirmación. Si persiste, crear endpoint `/api/auth/logout` que limpie cookies server-side antes de redirigir.

---

### Bug 6: Vector (analytics) no arranca en Windows (2026-10-08)

**Síntoma:** Contenedor `supabase_vector_paltazo-web-app` en loop de restart (status: `Restarting (0)`).

**Causa:** Vector intenta conectarse al socket de Docker Desktop en `192.168.65.254:2375` pero falla con `Connection refused`. Esto es un problema conocido de Docker Desktop en Windows.

**Impacto:** No afecta desarrollo. Solo desactiva la sección de Analytics del Studio local.

**Solución:** Desactivar analytics en `supabase/config.toml`:

```toml
[analytics]
enabled = false
```

Luego:
```bash
supabase stop
supabase start
```

---

## Diagnóstico de Supabase (queries útiles)

```sql
-- Verificar trigger
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Verificar función
SELECT proname, pronamespace::regnamespace FROM pg_proc WHERE proname = 'handle_new_user';

-- Ver restricciones de profiles
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint WHERE conrelid = 'profiles'::regclass;

-- Insert manual para probar tabla
INSERT INTO public.profiles (id, display_name, monthly_budget, currency)
VALUES (gen_random_uuid(), 'test', 1000.00, 'S/');

-- Verificar RLS habilitado
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('profiles', 'expenses', 'budget_alerts');

-- Verificar policies
SELECT policyname, tablename, cmd FROM pg_policies
WHERE schemaname = 'public' ORDER BY tablename;
```

---

## Pendientes y estado

### Completados ✅

- [x] Error 500 en signup — Trigger `handle_new_user()` corregido
- [x] PWA completa — manifest + service worker (cache-first)
- [x] Iconos PWA — `icon-192.png`, `icon-512.png`
- [x] Recuperación de contraseña — Flujo completo: reset email → hash recovery → update password
- [x] Protección de rutas con middleware — `src/middleware.ts` redirige a `/login` sin sesión
- [x] RLS verificado — 9 policies activas (3 profiles, 4 expenses, 2 budget_alerts)
- [x] Botón logout en Sidebar y Settings
- [x] **Supabase Local** — Configuración completa para desarrollo con Docker (Windows/Linux)

### En progreso 🔄

- [ ] **Fix middleware post-logout** — Confirmar que `window.location.href` + `scope: global` resuelve el bug de sesión persistente. Si no, crear endpoint `/api/auth/logout` server-side.

### Pendientes 📋

- [ ] **Verificar flujo de datos completo** → Login → agregar gasto → revisar tabla `expenses` en Supabase. Confirmar que los datos viajan del frontend al backend correctamente.
- [ ] **Edge Function `check-budget`** → Alertas automáticas al 80/100/101% del presupuesto. Debe ejecutarse tras cada INSERT en `expenses`. Niveles: warning (80%), critical (100%), exceeded (101%).
- [ ] **Notificaciones push** → Para alertas de presupuesto. Requiere: suscripción del usuario, permisos del navegador, envío desde Edge Function.

---

## Migraciones de Base de Datos

### 20261008182458_create_schema.sql

Creación inicial de todas las tablas, RLS y triggers:
- `profiles` (con trigger automático desde `auth.users`)
- `expenses`
- `budget_alerts`
- 9 policies de RLS
- Trigger `on_auth_user_created`

### 20261008190000_add_currency_to_expenses.sql

Agrega columna `currency` a la tabla `expenses`:

```sql
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'S/';
```

---

## Comandos útiles

### Desarrollo
```bash
npm run dev
npm run typecheck
npm run lint
npm run build
rm -rf .next                    # Limpiar caché Next.js
graphify update .               # Actualizar grafo de conocimiento (post-cambio de código)
```

### Supabase Local
```bash
supabase start                  # Iniciar todos los servicios
supabase stop                   # Detener (datos persisten)
supabase db reset               # Reset completo (borra datos locales)
supabase migration up           # Aplicar migraciones pendientes
supabase migration new nombre   # Crear nueva migración
supabase db psql                # Abrir psql conectado a la DB local
```

### Docker
```bash
docker ps -a --filter name=supabase          # Ver contenedores
docker logs supabase_db_paltazo-web-app      # Ver logs
docker volume ls --filter label=com.supabase.cli.project=paltazo-web-app  # Ver backups
```

---

## Notas para continuar en otro equipo

1. Clonar repositorio
2. `npm install`
3. **Supabase Local (recomendado para desarrollo):**
   - Ver `supabase/LOCAL_SETUP.md` para requisitos (Docker + Supabase CLI)
   - `supabase start` (levanta todos los servicios)
   - `cp .env.development.local.example .env.development.local`
4. **Supabase Cloud (alternativa):**
   - Copiar `.env.local.example` → `.env.local` y editar con credenciales reales
5. Verificar que el trigger `handle_new_user()` esté creado (ejecutar SQL del Error 2 si no)
6. Verificar RLS activo (ejecutar queries de la sección "Diagnóstico")
7. `npm run dev`
8. Probar registro → debe crear fila en `profiles` automáticamente
9. Probar agregar gasto → verificar tabla `expenses` en Supabase Dashboard
10. **Bug conocido:** Si el logout no redirige correctamente, revisar Bug 5 arriba
