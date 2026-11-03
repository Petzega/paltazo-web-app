# CHECKPOINT: Estado Actual de Paltazo (02 nov 2026)

> **Estado:** 100% spec funcional + 9/9 bugs corregidos  
> **Última actualización:** 02 nov 2026  
> **Próximo dev:** Este documento es tu punto de partida

---

## 1. Resumen Ejecutivo

Paltazo está al **100% del spec funcional**. Se implementaron 19/21 User Stories (las 3 restantes son futuras v1.2: Google OAuth, offline-first, push notifications).

**Fases completadas:**
- ✅ Fase 1: Fix brechas P0/P1
- ✅ Fase 2: Migraciones SQL
- ✅ Fase 3: Contratos TypeScript + estado global
- ✅ Fase 4: UI y flujos funcionales

**Bugs corregidos:**
- BUG-001: Cap en cálculo de porcentaje de presupuesto (Fase 1)
- BUG-002: Flash redirect a /setup tras recargar — Fix: validación de onboarding (Fase 4)
- BUG-003: Fechas mostradas como día anterior por UTC — Fix: hora local y parseo T12:00:00 (31 oct 2026)
- BUG-004: No se puede eliminar moneda principal — Fix: promoción automática + botón Quitar (01 nov 2026)
- BUG-005: Tabla push_subscriptions sin RLS — Fix: habilitar RLS y crear policies (01 nov 2026)
- BUG-006: Eliminar moneda no elimina incomes — Fix: RPC actualizada incluye DELETE FROM incomes (01 nov 2026)
- BUG-007: checkBudgetThreshold UTC bug — Fix: usa date.startsWith(prefix) en lugar de new Date() (01 nov 2026)
- BUG-008: Dashboard muestra S/ fantasma — Fix: solo agregar monedas existentes en budgets (01 nov 2026)
- BUG-009: Monedas en orden fijo + principal invisible — Fix: ordenar budgets por `created_at ASC`, setear principal en primera moneda, persistir promoción en DB (02 nov 2026)

**Bugs pendientes:**
Ninguno

**Mejoras implementadas:**
- **01 nov 2026:** Dashboard título con fecha local "Sábado, 31 de octubre" (formato RAE, sin año)
- **01 nov 2026:** Dashboard empty state cuando no hay monedas configuradas (mensaje + botón a settings)
- **01 nov 2026:** `currencySummaries` y `balanceSummaries` solo incluyen monedas que existen en `budgets` (fix BUG-008)
- **01 nov 2026:** Sort alfabético en dashboard (sin priorizar S/ sobre otras monedas)
- **01 nov 2026:** CU-023 permite eliminar moneda principal (con promoción automática)
- **01 nov 2026:** CU-023 modal de confirmación incluye ingresos en el conteo
- **02 nov 2026:** CU-022 implementado: agregar moneda a demanda (S/, $, €) desde settings; primera moneda se setea automáticamente como principal
- **02 nov 2026:** BUG-009 fix completo: `getBudgets` ordena por `created_at ASC`; `addCurrency` setea principal si es primera moneda; `removeCurrency` promueve la más antigua y persiste `primary_currency` en DB; `setBudget` actualiza `budgetState` si `monthlyLimit === 0` (primera moneda en onboarding)

---

## 2. Estado de la Base de Datos

### Migraciones aplicadas
```
supabase/migrations/
├── 20261008182458_create_schema.sql (esquema inicial)
├── 20261008190000_add_currency_to_expenses.sql
├── 20261009020000_create_budgets.sql
├── 20261015000000_drop_budget_alerts.sql
├── 20261018000000_fix_budgets_trigger.sql
├── 20261029000001_create_categories.sql — tabla categories + RLS + seed 5 defaults
├── 20261029000002_expenses_category_fk.sql — FK expenses.category_id, drop CHECK
├── 20261029000003_profiles_onboarding.sql — primary_currency, has_completed_onboarding
├── 20261029000004_update_trigger_handle_new_user.sql — trigger ya no crea presupuesto default
├── 20261029000005_create_atomic_functions.sql — delete_currency_purging_data (ACTUALIZADA por migración 2)
├── 20261029000006_create_income_categories.sql — tabla income_categories
├── 20261029000007_create_push_subscriptions.sql — tabla push_subscriptions (ACTUALIZADA con RLS por migración 1)
├── 20261101000001_fix_push_subscriptions_rls.sql ← FIX CRÍTICO: habilita RLS en push_subscriptions
└── 20261101000002_fix_delete_currency_includes_incomes.sql ← FIX CRÍTICO: RPC elimina incomes al borrar moneda
```

**Nota:** Las migraciones 1 y 2 de nov fueron aplicadas manualmente vía `docker exec` porque el proyecto no estaba linkeado a Supabase cloud. Para producción: `supabase link` + `supabase db push`.

### Estructura actual

**profiles:**
```sql
id UUID PRIMARY KEY
display_name TEXT
monthly_budget DECIMAL (legacy, no usar)
currency TEXT (legacy, no usar)
primary_currency TEXT — moneda elegida en setup
has_completed_onboarding BOOLEAN — flag de onboarding completado
created_at TIMESTAMPTZ
```

**categories:**
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL
name TEXT NOT NULL
icon TEXT NOT NULL (emoji)
color TEXT NOT NULL (red|orange|amber|emerald|teal|blue|indigo|purple)
is_default BOOLEAN
is_protected BOOLEAN — "Otros" es protegida
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
UNIQUE(user_id, name)
```

**expenses:**
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL
amount DECIMAL
description TEXT
date DATE
currency TEXT
category_id UUID FK categories.id — reemplaza category TEXT
created_at TIMESTAMPTZ
synced_at TIMESTAMPTZ
```

**budgets:**
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL
currency TEXT
monthly_limit NUMERIC
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
UNIQUE(user_id, currency)
```

**Nota:** La tabla `budgets` tiene `created_at TIMESTAMPTZ` (default `now()`). `getBudgets` ordena por `created_at ASC` para preservar el orden de configuración del usuario entre sesiones.

### Datos seed

Al registrar un nuevo usuario, el trigger `handle_new_user` crea:
- 5 categorías default: Comida (🍔, orange), Transporte (🚗, blue), Servicios (💡, amber), Entretenimiento (🎬, purple), Otros (📦, teal, is_protected=true)
- Perfil con `has_completed_onboarding = false`

---

## 3. Estado del Código TypeScript

### Tipos (src/types/index.ts)

```typescript
export interface Category {
  id: string
  userId: string
  name: string
  icon: string
  color: string
  isDefault: boolean
  isProtected: boolean
}

export interface Expense {
  id: string
  userId: string
  amount: number
  currency: string
  categoryId: string // ← FK a categories.id, ya no es string hardcodeado
  description?: string
  date: string
  createdAt: string
  syncedAt?: string
}

export interface Budget {
  userId: string
  monthlyLimit: number
  currency: string
  updatedAt: string
}
```

### Store (src/lib/store.tsx)

**Estado global:**
```typescript
{
  expenses: Expense[]
  incomes: Income[]
  budget: Budget // presupuesto principal
  budgets: Record<string, Budget> // presupuestos por moneda
  categories: Category[]
  incomeCategories: IncomeCategory[]
  hasCompletedOnboarding: boolean
  isLoggedIn: boolean
  userId: string | null
  isLoading: boolean
}
```

**Métodos disponibles:**
```typescript
addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'userId'>)
updateExpense(id: string, changes: Partial<Expense>)
deleteExpense(id: string)
addIncome(income: Omit<Income, 'id' | 'createdAt' | 'updatedAt' | 'userId'>)
updateIncome(id: string, changes: Partial<Income>)
deleteIncome(id: string)
setBudget(monthlyLimit: number, currency?: string)
addCategory(cat: { name: string; icon: string; color: string })
updateCategory(id: string, changes: Partial<Pick<Category, 'name' | 'icon' | 'color'>>)
deleteCategory(id: string)
addIncomeCategory(cat: { name: string; icon: string; color: string })
updateIncomeCategory(id: string, changes: Partial<Pick<IncomeCategory, 'name' | 'icon' | 'color'>>)
deleteIncomeCategory(id: string)
addCurrency(currency: string)
removeCurrency(currency: string)
completeOnboarding(currency: string, monthlyLimit: number)
logout(): Promise<{ error: string | null }>
```

**Métodos privados importantes:**
- `loadUserData(id)` — carga expenses, incomes, budgets, categories, incomeCategories, profile
- `checkBudgetThreshold(currency, amount)` — dispara notificación si cruza 80% del límite
- `syncPending()` — sincroniza cola offline con Supabase
- `requestNotificationPermission()` — solicita permisos de push

### Repositories (src/lib/supabase/repositories.ts)

Queries disponibles para categorías, gastos, presupuestos, y perfil de onboarding. Todas usan el cliente Supabase con RLS.

---

## 4. Flujo de la Aplicación

### Registro y Setup (CU-021)
1. Usuario se registra → trigger crea perfil con `has_completed_onboarding = false`
2. Login → middleware verifica sesión
3. Store carga datos → detecta `has_completed_onboarding = false`
4. `OnboardingGuard` redirige a `/setup`
5. Usuario elige moneda y presupuesto → `completeOnboarding()` actualiza DB
6. Redirige a `/dashboard`
7. Ingresos posteriores → `OnboardingGuard` permite acceso directo

### Gestión de Monedas (CU-022, CU-023)
- **Agregar moneda:** Settings → botón "+ Dólares ($)" o "+ Euros (€)" → crea budget con monthlyLimit=0. Si es la primera moneda, se setea como principal y se persiste en `profiles.primary_currency`
- **Quitar moneda:** Settings → botón "Quitar" → modal de confirmación → elimina gastos + ingresos + presupuesto de esa moneda
- **Eliminar moneda principal:** Permitido (fix BUG-004). La moneda más antigua (por `created_at ASC`) sePromueve automáticamente a principal y se persiste en DB. Si era la última moneda, se limpia `primary_currency` a NULL
- **Orden de visualización:** Monedas se muestran en el orden en que fueron configuradas (`created_at ASC` en `getBudgets`)
- **Monedas soportadas:** S/, $, € (SUPPORTED_CURRENCIES en settings/page.tsx)

### Gestión de Categorías (CU-024, CU-025, CU-026)
- **Crear:** Settings → "+ Nueva categoría" → modal con nombre, icono (16 emojis), color (8 colores)
- **Editar:** Settings → botón "Editar" por categoría → modal pre-llenado
- **Eliminar:** Settings → botón "Eliminar" → modal de confirmación → reasigna gastos a "Otros"
- **Regla:** "Otros" no editable ni eliminable (is_protected=true)
- **Acceso rápido:** Add-expense → botón "+ Nueva" → modal inline

### Gastos
- Crear gasto → selector de categorías dinámicas (incluye custom)
- Historial → muestra categorías con icono y color
- Dashboard → agrupa por categoría, calcula porcentajes de presupuesto

---

## 5. Decisiones Técnicas Tomadas

### Onboarding
- **Redirect client-side:** `OnboardingGuard` en layout de dashboard, no en middleware (evita query adicional en cada request)
- **Race condition fix:** `setIsLoading(false)` dentro de `.then()` y `.catch()`, no en `.finally()` (BUG-002)

### Categorías
- **FK en vez de string:** `expenses.category_id` es FK a `categories.id` (no CHECK constraint)
- **Eliminación con reasignación:** al eliminar categoría, gastos se reasignan a "Otros" (transacción atómica en repositories)
- **Catálogo cerrado:** 16 emojis, 8 colores Tailwind (definidos en docs/use-case/categories/categories.md)

### Monedas
- **A demanda:** usuario elige qué monedas activar (S/, $, €)
- **Eliminación destructiva:** al quitar moneda, se eliminan gastos + ingresos + presupuesto (RPC atómica `delete_currency_purging_data`, fix BUG-006)
- **Moneda principal eliminable:** si se elimina, la moneda más antigua (por `created_at ASC`) sePromueve a principal y se persiste en `profiles.primary_currency` (fix BUG-004)
- **Primera moneda = principal:** `addCurrency` setea `primary_currency` y `budgetState` si es la primera moneda del usuario
- **Orden de visualización:** `getBudgets` ordena por `created_at ASC`. Fix BUG-009: orden persiste entre sesiones
- **DefaultBudget fantasma:** `DEFAULT_BUDGET` hardcodea `S/`. Fix BUG-008: dashboard no agrega `budget.currency` automáticamente si no existe en `budgets`. Fix adicional: `setBudget` actualiza `budgetState` si `monthlyLimit === 0` (primera moneda en onboarding)
- **Transacción:** operaciones secuenciales en repositories (no hay transacciones nativas en Supabase JS)

---

## 6. Estructura de Archivos Clave

```
src/
├── app/
│   ├── setup/page.tsx — pantalla de setup inicial
│   ├── session-closed/page.tsx — pantalla post-logout
│   └── dashboard/
│       ├── layout.tsx — integra OnboardingGuard
│       ├── OnboardingGuard.tsx — redirect si onboarding incompleto
│       ├── page.tsx — dashboard: fecha local, empty state, sort alfabético
│       ├── add-expense/page.tsx — selector dinámico, DatePicker custom, getLocalDate()
│       ├── add-income/page.tsx — selector dinámico, DatePicker custom, getLocalDate()
│       ├── expenses/page.tsx — lista con categorías dinámicas, fix UTC
│       ├── incomes/page.tsx — lista de ingresos
│       └── settings/page.tsx — gestión monedas (orden configuración) + CRUD categorías
├── components/
│   ├── ui/
│   │   ├── DatePicker.tsx — calendario custom con navegación de mes/año
│   │   └── ... (otros componentes)
│   └── providers/
├── lib/
│   ├── store.tsx — estado global: incomes, categorías, fix sync/budgetThreshold
│   ├── categories.ts — findCategory, getColorClass con mapa estático
│   ├── expenseConstants.ts — formatAmount, CATEGORY_EMOJIS/COLORS, getLocalDate()
│   ├── offline.ts — cache de conexión IndexedDB
│   └── supabase/
│       ├── client.ts
│       ├── auth.ts
│       └── repositories.ts — queries, fix auth server route, RPC wrappers
└── types/
    └── index.ts — interfaces Expense, Income, Budget, Category, IncomeCategory

supabase/migrations/
├── 20261008182458_create_schema.sql
├── 20261008190000_add_currency_to_expenses.sql
├── 20261009020000_create_budgets.sql
├── 20261015000000_drop_budget_alerts.sql
├── 20261018000000_fix_budgets_trigger.sql
├── 20261029000001_create_categories.sql
├── 20261029000002_expenses_category_fk.sql
├── 20261029000003_profiles_onboarding.sql
├── 20261029000004_update_trigger_handle_new_user.sql
├── 20261029000005_create_atomic_functions.sql
├── 20261029000006_create_income_categories.sql
├── 20261029000007_create_push_subscriptions.sql
├── 20261101000001_fix_push_subscriptions_rls.sql
└── 20261101000002_fix_delete_currency_includes_incomes.sql

docs/
├── architecture/
│   ├── ARCHITECTURE_SPEC.md
│   ├── IMPLEMENTATION_ROADMAP.md
│   └── CHECKPOINT_2026_10_29.md ← ESTE DOCUMENTO
├── bugs/
│   ├── README.md ← índice de todos los bugs
│   ├── BUG-001_dashboard_percentage_cap.md (resuelto)
│   ├── BUG-002_setup_redirect_flash.md (resuelto)
│   ├── BUG-003_date_timezone_utc.md (resuelto)
│   ├── BUG-004_remove_primary_currency.md (resuelto)
│   ├── BUG-005_push_subscriptions_rls.md (resuelto)
│   ├── BUG-006_delete_currency_includes_incomes.md (resuelto)
│   ├── BUG-007_checkBudgetThreshold_UTC.md (resuelto)
│   ├── BUG-008_dashboard_soles_ghost.md (resuelto)
│   └── BUG-009_currency_display_order.md (resuelto)
├── use-case/
│   ├── README.md ← índice de casos de uso
│   ├── auth/auth.md
│   ├── dashboard/dashboard.md — CU-012 a CU-014, CU-034
│   ├── expenses/expenses.md
│   ├── incomes/incomes.md
│   ├── settings/settings.md — CU-015 a CU-017, CU-022, CU-023
│   ├── categories/categories.md
│   ├── onboarding/onboarding.md
│   └── future/future.md
└── design/
```

---

## 7. Cómo Ejecutar y Probar

### Setup inicial
```bash
npm install
npm run dev
```

### Probar flujo completo
1. **Registro y setup:**
   - Ve a `http://localhost:3000`
   - Regístrate con nuevo usuario
   - Completa setup (moneda + presupuesto)
   - Verifica que redirige a `/dashboard` sin flash a `/setup`
   - **Validar:** moneda de setup aparece como "Principal" en Settings

2. **Gestión de monedas:**
   - Ve a Ajustes → "Presupuestos por moneda"
   - **Orden:** monedas deben aparecer en el orden en que se configuraron (no orden fijo S/, $, €)
   - Agrega moneda ($ o €) → aparece al final, no como principal
   - Configura presupuesto → botón muestra "✓" feedback
   - Quita moneda → modal debe contar gastos + ingresos
   - **Eliminar moneda principal:** permitido, la siguiente moneda sePromueve automáticamente
   - **Eliminar última moneda:** dashboard muestra empty state "No tienes monedas configuradas"

3. **Dashboard con múltiples monedas:**
   - Registra gastos en diferentes monedas
   - Verifica que dashboard NO muestra monedas que no estén en `budgets` (fix BUG-008)
   - Verifica que las monedas se ordenan alfabéticamente en dashboard (fix BUG-008)
   - Verifica fecha en formato local: "Sábado, 2 de noviembre" (fix BUG-003)

4. **Gestión de categorías:**
   - Ve a Ajustes → Categorías
   - Crea categoría custom (nombre, emoji, color)
   - Edita categoría (cambia nombre/icono/color)
   - Elimina categoría (verifica reasignación a "Otros")

5. **Gastos e ingresos:**
   - Ve a Agregar gasto → selector dinámico de categorías
   - Crea gasto con categoría custom → verifica en historial y dashboard
   - Agrega ingreso → verifica en dashboard (sección "Balance del mes")
   - **Fechas:** verifica que gastos registrados a las 8pm aparecen en el día correcto (no día anterior)

6. **Presupuesto y alertas:**
   - Configura presupuesto de 1000
   - Registra gastos hasta 800 → alerta de umbral 80%
   - Supera 1000 → alerta "Superado" con barra roja (no se queda en 100%)
   - `checkBudgetThreshold` usa `startsWith(prefix)`, NO `new Date(e.date)`

7. **Logout:**
   - Cierra sesión desde Settings o sidebar
   - Verifica redirect a `/session-closed`
   - Vuelve a iniciar sesión → no debe aparecer setup

8. **Offline-first (básico):**
   - Desconecta red → registra gasto → aparece en cola pending
   - Reconecta → `syncPending()` sincroniza automáticamente

---

## 8. Posibles Mejoras Futuras

### Trabajo pendiente (no crítico)
- **Tests unitarios:** funciones no triviales sin test (`formatAmount`, `findCategory`, `getLocalDate`, `checkBudgetThreshold`, `syncPending`)
- **Tests e2e:** Playwright para flujos completos (registro → setup → gasto → dashboard → logout)
- **Rate limiting:** endpoint `/api/notifications/subscribe` no tiene rate limit
- **Service worker versioning:** `public/sw.js` necesita cache-busting al cambiar assets

### Features futuras (v1.2, fuera de scope actual)
- **US-016:** Google OAuth (requiere config en Supabase Dashboard)
- **US-017:** Offline-first con cola de sync persistente en IndexedDB (actual: cola en memoria)
- **US-018:** Notificaciones push al cruzar umbral de presupuesto (infraestructura lista, falta integración)
- **US-019:** Exportar datos (CSV/PDF de gastos mensuales)
- **US-020:** Presupuestos por categoría (no solo por moneda)

---

## 9. Notas para el Próximo Dev

### Lo que funciona bien
- **Tipado fuerte:** TypeScript atrapa errores de compilación. Ejecutar `npx tsc --noEmit` antes de commit.
- **RLS en Supabase:** aislamiento por usuario garantizado a nivel DB. Todas las tablas con `user_id` tienen RLS.
- **Estado global limpio:** store expone métodos claros, sin lógica de UI.
- **Fechas locales:** `getLocalDate()` y `new Date(date + 'T12:00:00')` patrón consistente.

### Convenciones establecidas (NO romper)
- **Fechas:** nunca usar `new Date(dateString)` sin `T12:00:00`. Siempre `getLocalDate()` para "hoy".
- **Monedas:** dashboard itera sobre `budgets`, NO sobre `budget.currency` automáticamente (fix BUG-008).
- **Tailwind:** NO usar clases dinámicas (`bg-${color}-500`). Usar mapa estático con strings completos.
- **Sort:** dashboard ordena alfabéticamente (no priorizar S/). Settings usa orden de inserción.

### Puntos de atención
- **DEFAULT_BUDGET hardcodea S/:** es un fallback de inicialización. No usar como referencia de moneda activa.
- **Race conditions:** `applySession` usa `useCallback([])`. Al actualizar estados, batchear juntos (ver BUG-002).
- **Eliminación de monedas:** RPC atómica `delete_currency_purging_data` — si agregas otra entidad, actualizar la función.
- **Supabase local:** proyecto NO linkeado a cloud. Para deploy: `supabase link` + `supabase db push`.

### Comandos útiles
```bash
npm run dev              # Dev server
npx tsc --noEmit         # Type check
graphify query "..."     # Explorar código
graphify update .        # Actualizar grafo tras cambios
docker ps | grep supabase # Verificar Supabase local
```

### Agente de documentación
Hay un agente `docs-keeper` en `.agents/skills/docs-keeper/SKILL.md`. Úsalo con `/docs-update` después de cambios significativos para mantener bugs, casos de uso y checkpoint sincronizados.

### Recursos
- **Bugs:** `docs/bugs/README.md` — índice completo
- **Casos de uso:** `docs/use-case/README.md` — spec detallado de cada funcionalidad
- **Roadmap:** `docs/architecture/IMPLEMENTATION_ROADMAP.md`
- **Graphify:** `graphify query "<pregunta>"` para explorar el código
- **Supabase:** Studio en `http://localhost:54333`

---

## 10. Contacto y Contexto

Este checkpoint fue actualizado el **02 nov 2026** tras corregir 9 bugs (BUG-001 a BUG-009). El proyecto está en estado estable y listo para producción o para continuar con features futuras.

**Stack técnico:**
- Next.js 14 (App Router)
- TypeScript
- Supabase (auth, DB, RLS, Edge Functions)
- Tailwind CSS
- React 18 (con automatic batching)
- IndexedDB (cache offline básico)

**Estado de producción:**
- [ ] Aplicar migraciones 20261101000001 y 20261101000002 en Supabase cloud
- [ ] Limpiar incomes huérfanos si hubo eliminaciones antes de BUG-006 (ver BUG-006 docs para query SQL)
- [ ] Configurar rate limiting en `/api/notifications/subscribe`
- [ ] Agregar tests unitarios para funciones críticas

**Modo de trabajo:**
- Caveman + Ponytail ultra activos (respuestas concisas, minimalismo extremo)
- Máximo 3 archivos por iteración sin aprobación explícita
- Validación con `npx tsc --noEmit` después de cada cambio
- `graphify update .` después de modificar código

---

**Fin del checkpoint.** Si tienes preguntas, revisa la documentación en `docs/` o usa Graphify para explorar el código.
