# Paltazo — Bitácora de Avance

## Estado del proyecto (2026-10-18)

**Stack:** Next.js 15 + TypeScript + Tailwind CSS + Supabase Local
**PWA:** ✅ Completada
**Auth:** ✅ Supabase Auth con middleware de protección
**RLS:** ✅ 7 policies verificadas
**Supabase Local:** ✅ Docker + CLI configurado (puertos 54331-54334)
**Docker:** ✅ Dockerfile + docker-compose.yml para deploy standalone
**Estado general:** MVP funcional con autenticación, RLS, budgets y desarrollo local. Pendiente: Edge Function de alertas, notificaciones push, y fix definitivo del bug de logout.

---

## Configuración de entorno

### Local (Supabase en Docker)

Archivo `.env.development.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54331
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-de-supabase-start>
```

**Puertos:**
- API: 54331
- DB: 54332
- Studio: 54333
- Inbucket: 54334

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

- [ ] **Fix middleware post-logout** — Confirmar que `window.location.href` + `scope: global` resuelve el bug de sesión persistente. Si no, crear endpoint `/api/auth/logout` server-side. (BUG-005)

### Pendientes 📋

- [ ] **Edge Function `check-budget`** → Alertas automáticas al 80/100/101% del presupuesto. Debe ejecutarse tras cada INSERT en `expenses`.
- [ ] **Notificaciones push** → Para alertas de presupuesto. Requiere: suscripción del usuario, permisos del navegador, envío desde Edge Function.

### Completados recientemente ✅

- [x] Docker + docker-compose para deploy standalone (2026-10-17)
- [x] Puertos Supabase local actualizados a 54331-54334 (2026-10-17)
- [x] Fix .env.development.local apuntando a puertos correctos (2026-10-17)
- [x] Trigger budgets para usuarios nuevos + fix existentes (2026-10-18)
- [x] Modal add-expense: reset completo post-guardado (2026-10-18)

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

---

## Auditoría de código — Actualización 2026-10-15

Se aplicaron 16 fixes tras auditoría completa del repositorio:

**Eliminado (código muerto):**
- Ruta `/budget/` (legacy, no enlazada)
- `src/lib/supabase/server.ts` (no importado)
- `supabase/schema.sql` (desactualizado, migraciones son fuente de verdad)
- Tipos `BudgetAlert`, `BudgetAlertLevel`, `Profile` (no usados)
- Función `generateId()` (la DB genera UUIDs)
- Tabla `budget_alerts` (nunca se escribía en ella) — migración `20261015000000_drop_budget_alerts.sql`

**Bugs corregidos:**
- Dashboard mezclaba monedas en total del día (filtro por moneda principal)
- `budget` state quedaba obsoleto tras `setBudget` (ahora lee desde `budgets[currency]`)
- Validación de contraseña < 6 chars cliente-lado en registro y new-password

**Mejoras:**
- Client singleton compartido en `client.ts` (antes 3 instancias)
- Botón logout duplicado eliminado (uno solo via `logout()` del store)
- FAB "Agregar gasto" extraído a componente compartido `AddExpenseFab`
- Balance fantasma eliminado del onboarding (no logueados no tienen datos)
- Etiqueta "este mes" → "en total" en expenses (no filtraba por mes)
- Label "Total gastado" → "Total gastado (moneda)" para claridad multi-moneda
- Memo `last7Days` ahora recalcula al cambiar el día

**Neto:** -264 líneas de código

---

## Auditoría de código — Actualización 2026-10-16

Se aplicaron 12 fixes tras auditoría del repositorio:

**Bugs críticos corregidos:**
- División por cero en `dashboard/page.tsx:202` — guard `daysRemaining > 0` antes de dividir `remaining / daysRemaining`
- `getBudget()` leía de tabla `profiles` en vez de `budgets` — ahora lee correctamente de la tabla dedicada
- Eliminación de gastos sin confirmación — agregado modal de confirmación con "Cancelar" / "Eliminar"
- Tipos `any` en errores de autenticación — reemplazados con `unknown` + guard `instanceof Error`
- Logout no limpiaba estado del store — ahora usa `store.logout()` en vez de `signOut()` directo

**Limpieza y refactor:**
- Eliminado export nombrado `createClient()` en `client.ts` — solo queda default singleton
- Eliminado directorio vacío `supabase/snippets/` (no se usaba)
- Eliminado mapa duplicado `categoryNames` en `add-expense/page.tsx` — ahora usa `EXPENSE_CATEGORIES.find()`
- Agregada función `getCategoryColorClass()` en `categories.ts` — centraliza clases de color por categoría

**Performance:**
- Filtro mensual por string prefix (`YYYY-MM`) en `dashboard/page.tsx:46-49` — evita `new Date()` por fila

**Neto:** Código más robusto, menos duplicación, fuente única de verdad para datos de categorías y presupuesto.

---

## Avances 2026-10-17/18

### Infraestructura
- **Docker**: Dockerfile multi-stage + docker-compose.yml para deploy standalone
- **Puertos Supabase local**: cambiados de 54321-54324 a 54331-54334 (conflicto con PostgreSQL nativo)
- **.env.development.local**: corregido para apuntar a puertos locales correctos (antes apuntaba a 54321 con clave incorrecta → app se conectaba a cloud)

### Base de datos
- **Migración 20261018000000_fix_budgets_trigger.sql**: trigger `handle_new_user()` ahora inserta en tabla `budgets` al crear usuario nuevo
- **Fix datos existentes**: INSERT manual para usuarios sin budgets

### UI/UX
- **Modal add-expense**: form resetea completamente tras guardado (category, currency, date) — evita modal "¿Descartar cambios?" al retroceder

### Auditoría aplicada
- Ownership validation en updateExpense/deleteExpense
- Recovery token validation en login
- Monthly total filter en expenses page
- Eliminación de getBudget redundante
- isSubmitting state para prevenir doble-click
- Limpieza de dead code (Input.tsx, Card.tsx, AuthGuard.tsx)

---

## Bitácora de Bugs

> Registro estructurado de bugs detectados, causa raíz, fix aplicado y prevención. Consulta obligatoria antes de modificar código relacionado.

| ID | Fecha | Severidad | Síntoma | Causa raíz | Fix aplicado | Prevención |
|----|-------|-----------|---------|------------|--------------|------------|
| BUG-001 | 2026-10-08 | 🔴 Crítica | `login is not a function` | Caché Next.js + código antiguo en login/page.tsx | Actualizar a signIn/signUp de auth.ts + `rm -rf .next` | No modificar store sin actualizar consumidores |
| BUG-002 | 2026-10-08 | 🔴 Crítica | `Database error saving new user` (500 en /auth/v1/signup) | Trigger handle_new_user() fallaba al insertar en profiles | Recrear función con EXCEPTION handler + RAISE WARNING | Siempre EXCEPTION WHEN OTHERS en triggers SECURITY DEFINER |
| BUG-003 | 2026-10-08 | 🟡 Media | `Uncaught SyntaxError` en layout.js | Caché corrupto de Next.js | `rm -rf .next && npm run dev` | Hard refresh + limpiar caché tras cambios grandes |
| BUG-004 | 2026-10-08 | 🟢 Baja | `relation "pg_log" does not exist` | Supabase no expone pg_log desde SQL Editor | Usar Dashboard → Logs → Database | Documentar en troubleshooting |
| BUG-005 | 2026-10-08 | 🔴 Crítica | Middleware no redirige después de logout | Cookies de sesión persisten tras client-side signOut | `signOut({ scope: 'global' })` + `window.location.href` | **PENDIENTE**: crear endpoint /api/auth/logout server-side |
| BUG-006 | 2026-10-08 | 🟢 Baja | Vector (analytics) no arranca en Windows | Docker Desktop socket en 192.168.65.254:2375 falla | Desactivar analytics en config.toml | No afecta funcionalidad |
| BUG-007 | 2026-10-15 | 🟡 Media | Dashboard mezclaba monedas en total del día | Sin filtro por moneda principal | Agregar filtro de moneda en cálculo de totales | Always filter by primary currency |
| BUG-008 | 2026-10-15 | 🟡 Media | Budget state quedaba obsoleto tras setBudget | Leía de budgets[currency] pero no se actualizaba | Corregir lectura en store.tsx | Single source of truth |
| BUG-009 | 2026-10-15 | 🟡 Media | Contraseña < 6 chars aceptada en registro | Sin validación cliente-lado | Agregar validación en login y new-password | Validar en cliente Y servidor |
| BUG-010 | 2026-10-16 | 🔴 Crítica | División por cero en dashboard | daysRemaining = 0 al final del mes | Guard `daysRemaining > 0` antes de dividir | Always validate divisor |
| BUG-011 | 2026-10-16 | 🔴 Crítica | getBudget() leía de tabla profiles en vez de budgets | Tabla budgets existe pero código legacy usaba profiles | Cambiar lectura a tabla budgets | Migraciones son fuente de verdad |
| BUG-012 | 2026-10-16 |  Media | Eliminación de gastos sin confirmación | Botón delete ejecutaba directamente | Agregar modal de confirmación | Siempre confirmar destructivos |
| BUG-013 | 2026-10-16 | 🟡 Media | Tipos `any` en errores de autenticación | Catch sin tipo específico | Reemplazar con `unknown` + instanceof Error | TypeScript strict mode |
| BUG-014 | 2026-10-16 | 🟡 Media | Logout no limpiaba estado del store | Usaba signOut() directo en vez de store.logout() | Cambiar a store.logout() | Centralizar logout en store |
| BUG-015 | 2026-10-17 |  Media | App se conecta a Supabase cloud en vez de local | .env.development.local apunta a puerto 54321 (no existe) con clave incorrecta | Actualizar a puerto 54331 con clave correcta | Jerarquía Next.js: .env.development.local > .env.local |
| BUG-016 | 2026-10-18 | 🔴 Crítica | Presupuesto muestra S/ 500 en vez de S/ 1000 | Trigger handle_new_user() no inserta en tabla budgets | Agregar INSERT en budgets al trigger + fix usuarios existentes | Trigger debe crear todos los registros relacionados |
| BUG-017 | 2026-10-18 | 🟡 Media | Modal "¿Descartar cambios?" aparece tras guardar gasto | handleSave no resetea category/currency/date, hasChanges sigue true | Llamar handleClear() tras guardado exitoso | Resetear formulario post-save |

---

## Reglas de prevención (derivadas de bugs)

1. **Triggers**: Siempre EXCEPTION WHEN OTHERS + RAISE WARNING. Nunca fallar silenciosamente.
2. **Divisiones**: Validar divisor > 0 antes de dividir.
3. **Destructivos**: Siempre modal de confirmación antes de eliminar/editar.
4. **Tipos**: Nunca `any` en catch — usar `unknown` + type guard.
5. **Logout**: Centralizar en store, usar scope: global + hard reload.
6. **Formularios**: Resetear TODOS los campos post-save, no solo los obvios.
7. **Entorno**: Verificar jerarquía de .env (development.local > local > development).
8. **Triggers multi-tabla**: Si una entidad tiene tablas relacionadas (profiles + budgets), el trigger debe crear todas.
9. **Migraciones**: Son fuente de verdad. No leer de tablas legacy.
10. **Caché**: `rm -rf .next` tras cambios grandes de estructura.

