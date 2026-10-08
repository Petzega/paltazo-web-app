# Paltazo - Bitácora de Avance

## Estado actual del proyecto

**Stack:** Next.js 15 + TypeScript + Tailwind CSS + Supabase
**Framework auth:** `@supabase/ssr` con `createBrowserClient` (recomendado para Next.js 15 App Router)
**PWA:** Completada (manifest + service worker)
**Responsive:** Desktop completado

---

## Configuración de entorno (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://pwosqcamfrepotaxrpbc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...  # Copiar "Publishable Key" del dashboard Supabase
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
| `category` | TEXT | Categoría (food, transport, services, entertainment, other) |
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
| `level` | TEXT | Nivel: warning, critical, exceeded |
| `percentage` | NUMERIC(5,2) | Porcentaje del presupuesto usado |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

---

## Errores y soluciones

### Error 1: `login is not a function` en `src/app/login/page.tsx:14`

**Causa:** El store.tsx fue actualizado para usar Supabase (eliminando `login()` mock), pero el `login/page.tsx` seguía llamando `login()` del store. Adicionalmente, caché de Next.js mantenía el código antiguo.

**Solución:**
1. Actualizar `src/app/login/page.tsx` para usar `signIn()` y `signUp()` directamente desde `@/lib/supabase/auth`
2. Limpiar caché de Next.js:
```bash
Remove-Item -Recurse -Force .next
npm run dev
```

---

### Error 2: `Database error saving new user` (HTTP 500 en `/auth/v1/signup`)

**Causa:** El trigger `handle_new_user()` en Supabase fallaba al intentar insertar en la tabla `profiles`. Posibles causas:
- Schema `public` no especificado en la función
- Restricción UNIQUE en `profiles.id` causando conflicto
- Falta de `ON CONFLICT` en el INSERT

**Solución (aplicada, verificar que esté ejecutada):**

Ejecutar este SQL en **Supabase Dashboard → SQL Editor**:

```sql
-- 1. Limpiar trigger y función existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- 2. Crear función corregida
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

-- 3. Recrear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Diferencias clave de la versión corregida:**
- `SET search_path = public` → evita problemas de búsqueda de tablas
- `ON CONFLICT (id) DO NOTHING` → no falla si ya existe el perfil
- `public.handle_new_user()` → especifica schema explícitamente
- `EXCEPTION WHEN OTHERS` → captura errores inesperados sin bloquear el registro

---

### Error 3: `Uncaught SyntaxError: Invalid or unexpected token (at layout.js:728:29)`

**Causa:** Caché corrupto de Next.js (build anterior con código incompatible).

**Solución:**
```bash
Remove-Item -Recurse -Force .next
npm run dev
```

---

### Error 4: `relation "pg_log" does not exist` en Supabase

**Causa:** Supabase no expone `pg_log` directamente desde el SQL Editor. Los logs reales están en **Dashboard → Logs → Database**.

**Solución:** Usar solo los queries de diagnóstico compatibles (ver sección "Diagnóstico").

---

## Diagnóstico de Supabase (queries útiles)

```sql
-- Verificar que el trigger existe
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Verificar que la función existe
SELECT proname, pronamespace::regnamespace FROM pg_proc WHERE proname = 'handle_new_user';

-- Ver restricciones de la tabla profiles
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass;

-- Insert manual para probar la tabla (verifica que funciona sin trigger)
INSERT INTO public.profiles (id, display_name, monthly_budget, currency)
VALUES (gen_random_uuid(), 'test', 1000.00, 'S/');
```

---

## Flujo de autenticación actual

```
1. Usuario → /login → ingresa email/password
2. Frontend → supabase.auth.signUp() o signInWithPassword()
3. Supabase Auth → crea usuario en auth.users
4. Trigger on_auth_user_created → inserta fila en profiles
5. Store (onAuthStateChange) → detecta sesión activa
6. Store → carga expenses y budget desde Supabase
7. App → renderiza dashboard con datos reales
```

---

## Archivos clave de Supabase

| Archivo | Descripción |
|---------|-------------|
| `src/lib/supabase/client.ts` | Cliente browser de Supabase (createBrowserClient) |
| `src/lib/supabase/auth.ts` | Funciones: signIn, signUp, signOut, getUser, getSession, onAuthStateChange |
| `src/lib/supabase/repositories.ts` | CRUD: getExpenses, addExpense, updateExpense, deleteExpense, getBudget, upsertBudget |
| `src/lib/store.tsx` | Context global, usa Supabase auth + repositorios |
| `src/app/login/page.tsx` | Login/registro real con Supabase |
| `supabase/schema.sql` | Esquema original (referencia) |

---

## Pendientes confirmados

- [ ] **Resolver error 500 en signup** → Ejecutar SQL del Error 2 (trigger corregido)
- [ ] **Verificar que datos viajan correctamente** → Login → agregar gasto → revisar tabla `expenses` en Supabase
- [ ] **Edge Function `check-budget`** → Alertas automáticas al 80/100/101%
- [ ] **Notificaciones push** → Para alertas de presupuesto
- [ ] **Recuperación de contraseña** → "¿Olvidaste tu clave?" actualmente no funcional

---

## Comandos útiles

```bash
# Desarrollo
npm run dev

# Typecheck
npm run typecheck

# Build producción
npm run build

# Limpiar caché Next.js (cuando haya errores raros)
Remove-Item -Recurse -Force .next

# Actualizar grafo de conocimiento
graphify update .
```

---

## Notas para continuar en otro equipo

1. Clonar repositorio
2. `npm install`
3. Crear `.env.local` con las credenciales de Supabase (ver sección "Configuración de entorno")
4. Verificar que el trigger `handle_new_user()` esté creado en Supabase (ejecutar SQL del Error 2 si no)
5. `npm run dev`
6. Probar registro → debe crear fila en `profiles` automáticamente
