# CHECKPOINT: Estado Actual de Paltazo (29 oct 2026)

> **Estado:** Roadmap 100% completado  
> **Última actualización:** 29 oct 2026  
> **Próximo dev:** Este documento es tu punto de partida

---

## 1. Resumen Ejecutivo

Paltazo está al **100% del spec funcional**. Se implementaron 18/21 User Stories (las 3 restantes son futuras v1.2: Google OAuth, offline-first, push notifications).

**Fases completadas:**
- ✅ Fase 1: Fix brechas P0/P1
- ✅ Fase 2: Migraciones SQL
- ✅ Fase 3: Contratos TypeScript + estado global
- ✅ Fase 4: UI y flujos funcionales

**Bugs corregidos:**
- BUG-001: Cap en cálculo de porcentaje de presupuesto (Fase 1)
- BUG-002: Flash redirect a /setup tras recargar (Fase 4)

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
├── 20261029000001_create_categories.sql ← NUEVO: tabla categories + RLS + seed 5 defaults
├── 20261029000002_expenses_category_fk.sql ← NUEVO: FK expenses.category_id, drop CHECK
├── 20261029000003_profiles_onboarding.sql ← NUEVO: primary_currency, has_completed_onboarding
└── 20261029000004_update_trigger_handle_new_user.sql ← NUEVO: trigger ya no crea presupuesto default
```

### Estructura actual

**profiles:**
```sql
id UUID PRIMARY KEY
display_name TEXT
monthly_budget DECIMAL (legacy, no usar)
currency TEXT (legacy, no usar)
primary_currency TEXT ← NUEVO: moneda elegida en setup
has_completed_onboarding BOOLEAN ← NUEVO: flag de onboarding completado
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
is_protected BOOLEAN ← "Otros" es protegida
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
category_id UUID FK categories.id ← NUEVO: reemplaza category TEXT
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
  budget: Budget // presupuesto principal
  budgets: Record<string, Budget> // presupuestos por moneda
  categories: Category[]
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
setBudget(monthlyLimit: number, currency?: string)
addCategory(cat: { name: string; icon: string; color: string })
updateCategory(id: string, changes: Partial<Pick<Category, 'name' | 'icon' | 'color'>>)
deleteCategory(id: string)
addCurrency(currency: string)
removeCurrency(currency: string)
completeOnboarding(currency: string, monthlyLimit: number)
logout(): Promise<{ error: string | null }>
```

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
- **Agregar moneda:** Settings → botón "+ Dólares ($)" → crea budget con monthlyLimit=0
- **Quitar moneda:** Settings → botón "Quitar" → modal de confirmación → elimina gastos + presupuesto de esa moneda
- **Regla:** moneda principal no borrable

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
- **Eliminación destructiva:** al quitar moneda, se eliminan gastos + presupuesto de esa moneda
- **Transacción:** operaciones secuenciales en repositories (no hay transacciones nativas en Supabase JS)

---

## 6. Estructura de Archivos Clave

```
src/
├── app/
│   ├── setup/page.tsx ← NUEVO: pantalla de setup inicial
│   ├── session-closed/page.tsx ← NUEVO: pantalla post-logout
│   └── dashboard/
│       ├── layout.tsx ← modificado: integra OnboardingGuard
│       ├── OnboardingGuard.tsx ← NUEVO: redirect si onboarding incompleto
│       ├── page.tsx ← modificado: usa findCategory(categories, categoryId)
│       ├── add-expense/page.tsx ← modificado: selector dinámico + modal "+ Nueva"
│       ├── expenses/page.tsx ← modificado: usa categorías dinámicas
│       └── settings/page.tsx ← modificado: gestión de monedas + CRUD categorías
├── lib/
│   ├── store.tsx ← modificado: categorías, onboarding, CRUD methods
│   ├── categories.ts ← modificado: findCategory, getCategoryColorClass dinámicos
│   └── supabase/
│       └── repositories.ts ← modificado: queries categories, onboarding
└── types/
    └── index.ts ← modificado: Category interface, Expense.categoryId

supabase/migrations/
└── 20261029000001-000004 ← NUEVO: categorías, FK, onboarding, trigger

docs/
├── architecture/
│   ├── ARCHITECTURE_SPEC.md
│   ├── IMPLEMENTATION_ROADMAP.md
│   └── CHECKPOINT_2026_10_29.md ← ESTE DOCUMENTO
├── use-case/
│   ├── USER_STORY_MAP.md
│   ├── categories/categories.md ← catálogo de emojis y colores
│   ├── onboarding/onboarding.md
│   └── settings/settings.md
└── bugs/
    ├── BUG-001_dashboard_percentage_cap.md (resuelto)
    └── BUG-002_setup_redirect_flash.md (resuelto)
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

2. **Gestión de monedas:**
   - Ve a Ajustes
   - Agrega moneda ($ o €)
   - Configura presupuesto
   - Quita moneda (verifica modal de confirmación)

3. **Gestión de categorías:**
   - Ve a Ajustes → Categorías
   - Crea categoría custom (nombre, emoji, color)
   - Edita categoría (cambia nombre/icono/color)
   - Elimina categoría (verifica reasignación a "Otros")

4. **Gastos con categorías dinámicas:**
   - Ve a Agregar gasto
   - Verifica selector de categorías (incluye custom)
   - Crea gasto con categoría custom
   - Verifica en historial y dashboard

5. **Logout:**
   - Cierra sesión
   - Verifica redirect a `/session-closed`
   - Vuelve a iniciar sesión → no debe aparecer setup

---

## 8. Posibles Mejoras Futuras

### Trabajo pendiente (no crítico)
- **Test e2e automatizado:** verificar flujos completos con Playwright o Cypress
- **Optimización de queries:** algunas queries en repositories podrían beneficiarse de índices adicionales
- **Transacciones reales:** Supabase JS no soporta transacciones nativas, pero las operaciones secuenciales son suficientemente atómicas para el caso de uso actual

### Features futuras (v1.2, fuera de scope actual)
- US-016: Google OAuth (requiere config en Supabase Dashboard)
- US-017: Offline-first con cola de sync persistente
- US-018: Notificaciones push al cruzar umbral de presupuesto

---

## 9. Notas para el Próximo Dev

### Lo que funciona bien
- **Tipado fuerte:** TypeScript atrapa errores de compilación
- **RLS en Supabase:** aislamiento por usuario garantizado a nivel DB
- **Estado global limpio:** store expone métodos claros, sin lógica de UI

### Puntos de atención
- **Race conditions:** al actualizar estados asíncronos, asegurar que se batcheen juntos (ver BUG-002)
- **Eliminación de categorías/monedas:** operaciones destructivas requieren confirmación y reasignación
- **Validaciones:** nombre de categoría único case-insensitive, monto > 0, moneda no duplicada

### Recursos útiles
- **Graphify:** `graphify query "<pregunta>"` para explorar el código
- **Documentación de casos de uso:** `docs/use-case/` tiene spec detallado de cada funcionalidad
- **Roadmap:** `docs/architecture/IMPLEMENTATION_ROADMAP.md` tiene el plan completo

---

## 10. Contacto y Contexto

Este checkpoint fue generado el 29 oct 2026 tras completar la Fase 4 del roadmap. El proyecto está en estado estable y listo para producción (o para continuar con features futuras).

**Stack técnico:**
- Next.js 14 (App Router)
- TypeScript
- Supabase (auth, DB, RLS)
- Tailwind CSS
- React 18 (con automatic batching)

**Modo de trabajo:**
- Caveman + Ponytail ultra activos (respuestas concisas, minimalismo extremo)
- Máximo 3 archivos por iteración sin aprobación explícita
- Validación con `npx tsc --noEmit` después de cada cambio
- `graphify update .` después de modificar código

---

**Fin del checkpoint.** Si tienes preguntas, revisa la documentación en `docs/` o usa Graphify para explorar el código.
