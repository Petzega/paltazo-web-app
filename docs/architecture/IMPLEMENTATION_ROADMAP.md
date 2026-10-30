# Roadmap de Implementación — Paltazo

> **Fecha:** 29 oct 2026
> **Fuentes:** `docs/use-case/` (21 US, 26 CU) + `docs/architecture/ARCHITECTURE_SPEC.md`
> **Estado:** Plan de ejecución para llevar la app al 100% del spec.

---

## 1. Estado actual consolidado

| Estado | Cantidad | Detalle |
|--------|----------|---------|
| ✅ Implementado | 15 US | Auth, gastos, dashboard, settings, onboarding marketing |
| ⚠️ Hecho con brecha P0 | 2 US | Logout (redirect incorrecto), alertas (cap 100%) |
| 📝 Propuesto sin release | 3 US | Setup inicial, monedas a demanda, categorías custom |
| 🔜 Futuro v1.2 | 3 US | Google OAuth, offline-first, push notifications |

---

## 2. Historias implementadas (15/21)

### Auth
- **US-001** Registro básico → CU-002 ✅
- **US-002** Login con credenciales → CU-001 ✅
- **US-003** Recuperar contraseña → CU-003, CU-004 ✅
- **US-005** Middleware de autenticación → CU-006 ✅

### Gastos
- **US-006** Crear gasto con presets y multi-moneda → CU-008 ✅
- **US-007** Historial agrupado por fecha → CU-009 ✅
- **US-008** Edición inline → CU-010 ✅
- **US-009** Eliminación con confirmación → CU-011 ✅

### Dashboard
- **US-010** Resumen multi-moneda con días restantes → CU-012 ✅
- **US-011** Gráfico de barras últimos 7 días → CU-014 ✅
- **US-012** Alertas visuales 80% / 100% / >100% → CU-013 ⚠️ *BUG-001: cap en `Math.min(pct, 100)`*

### Settings
- **US-013** Presupuesto por moneda → CU-015 ✅
- **US-014** Info de la app y niveles de alerta → CU-016 ✅
- **US-015** Logout desde settings → CU-017, CU-005 ⚠️ *redirige a `/onboarding` en lugar de `/session-closed`*

### Onboarding marketing
- **CU-018** Visualizar pantalla de onboarding → `/onboarding` ✅

---

## 3. Brechas técnicas críticas (P0 & P1)

### P0-1: Logout no redirige a `/session-closed`
- **US afectadas:** US-004, US-015
- **Problema:** `store.logout()` redirige a `/onboarding` (`Sidebar.tsx`, `settings/page.tsx`).
- **Spec exige:** redirigir a `/session-closed` (ruta pública) con botón "Volver a ingresar" → `/login`.
- **Archivos:** `src/lib/store.tsx`, `src/components/ui/Sidebar.tsx`, `src/app/dashboard/settings/page.tsx`, `src/middleware.ts`.
- **Solución:**
  1. Crear `src/app/session-closed/page.tsx` (pública).
  2. Capturar `{ error }` de `signOut()`. Si error → toast, no limpiar sesión. Si OK → limpiar store + redirigir a `/session-closed`.
  3. Añadir `/session-closed` a `publicPaths` en `src/middleware.ts`.

### P1-1: BUG-001 en cálculo de porcentaje de presupuesto
- **US afectada:** US-012
- **Problema:** `src/app/dashboard/page.tsx:48-50` usa `Math.min(pct, 100)`, haciendo inalcanzable el nivel `exceeded` (>100%).
- **Solución:** eliminar `Math.min(..., 100)`, mantener lógica `exceeded` cuando `pct >= 101%`.

### P1-2: `expenses.category` tiene CHECK estático
- **US afectada:** US-021 (categorías custom)
- **Problema:** constraint `CHECK` en DB limita categorías a 5 valores fijos.
- **Solución:** migración SQL para crear tabla `categories`, FK `expenses.category_id`, eliminar CHECK.

### P1-3: Trigger `handle_new_user` asigna presupuesto fijo S/ 1000
- **US afectada:** US-019 (setup inicial)
- **Problema:** trigger crea `budgets` con `monthly_limit = 1000` y moneda fija.
- **Solución:** trigger solo crea `profiles` (`has_completed_onboarding = false`) + 5 categorías default. Moneda y presupuesto se definen en `/setup` (CU-021).

---

## 4. Historias propuestas sin release (3 US)

### US-019: Selección de moneda y presupuesto en primer ingreso (CU-021)
- **Qué:** pantalla `/setup` post-registro, selector S/,$,€ + monto presupuesto.
- **Flag:** `profiles.has_completed_onboarding` (boolean, default false).
- **Middleware:** redirige a `/setup` si flag=false.
- **Trigger:** deja de crear presupuesto default.
- **Archivos:** `src/app/setup/page.tsx` (nuevo), `src/middleware.ts`, `src/lib/store.tsx`, `supabase/migrations/`.

### US-020: Gestión de monedas a demanda (CU-022, CU-023)
- **Qué:** agregar/quitar monedas (S/,$,€) desde settings.
- **Agregar (CU-022):** botón "+ Agregar moneda" con selector de moneda no activa.
- **Quitar (CU-023):** acción destructiva, modal de confirmación con conteo de gastos afectados, purge transaccional de `budgets` + `expenses` de esa moneda.
- **Regla:** moneda principal no borrable.
- **Archivos:** `src/app/dashboard/settings/page.tsx`, `src/lib/store.tsx`.

### US-021: Categorías personalizables (CU-024, CU-025, CU-026)
- **Qué:** CRUD de categorías con nombre, icono (16 emojis), color (8 tokens Tailwind).
- **DB:** tabla `categories` (RLS, FK `expenses.category_id`, seed 5 default + "Otros" `is_protected=true`).
- **UI:** panel en settings + modal rápido "+ Nueva categoría" desde add-expense.
- **Eliminar (CU-026):** reasignar gastos a "Otros" con advertencia previa.
- **Catálogo cerrado:** 16 emojis (🍔🚗🏠🎬🛒💊✈️📚💼🐾🎁💡⚽☕📱📦), 8 colores Tailwind (red, orange, amber, emerald, teal, blue, indigo, purple).
- **Archivos:** `src/types/index.ts`, `src/lib/store.tsx`, `src/app/dashboard/settings/page.tsx`, `src/app/dashboard/add-expense/page.tsx`, `supabase/migrations/`.

---

## 5. Historias futuras v1.2 (out of scope inmediato)

- **US-016:** Google OAuth (botón renderizado, shortcut, requiere config Supabase Dashboard).
- **US-017:** Offline-first con cola de sync persistente (store mantiene estado optimista, pero no hay cola ni indicador "X cambios pendientes").
- **US-018:** Notificaciones push al cruzar umbral (alertas solo visuales hoy).

---

## 6. Fases de ejecución sugeridas

### Fase 1: Fix brechas críticas existentes (P0 & P1)
**Objetivo:** corregir bugs y flujos rotos sin tocar DB ni añadir features.
**Archivos:** `store.tsx`, `Sidebar.tsx`, `settings/page.tsx`, `middleware.ts`, `dashboard/page.tsx`, nuevo `session-closed/page.tsx`.
**Entregables:**
- Logout redirige a `/session-closed` con manejo de errores.
- Dashboard muestra nivel `exceeded` correctamente.

### Fase 2: Migraciones SQL (Supabase)
**Objetivo:** preparar DB para categorías dinámicas y onboarding.
**Archivos:** `supabase/migrations/`.
**Entregables:**
- Migración 1: crear tabla `categories` (RLS, seed 5 default + "Otros" protegida).
- Migración 2: `ALTER TABLE expenses ADD COLUMN category_id UUID FK categories.id`, migrar datos existentes, eliminar CHECK.
- Migración 3: `ALTER TABLE profiles ADD COLUMN primary_currency TEXT, has_completed_onboarding BOOLEAN DEFAULT false`.
- Migración 4: actualizar función trigger `handle_new_user` (eliminar presupuesto default S/ 1000, crear categorías default).

### Fase 3: Contratos TypeScript y estado global
**Objetivo:** extender store y tipos para soportar categorías y onboarding.
**Archivos:** `src/types/index.ts`, `src/lib/store.tsx`.
**Entregables:**
- Interface `Category` (id, user_id, name, icon, color, is_default, is_protected).
- Extender `Expense` con `category_id: string` (reemplaza `category: string`).
- Store: CRUD de categorías, flag `hasCompletedOnboarding`, método `completeOnboarding(currency, budget)`.

### Fase 4: Componentes UI y flujos funcionales
**Objetivo:** implementar pantallas y modales para US-019, US-020, US-021.
**Archivos:** `src/app/setup/page.tsx` (nuevo), `src/app/dashboard/settings/page.tsx`, `src/app/dashboard/add-expense/page.tsx`.
**Entregables:**
- Pantalla `/setup` (CU-021): selector moneda + monto presupuesto, redirige a `/dashboard` tras completar.
- Settings: gestión de monedas (CU-022, CU-023) con modal destructivo para quitar.
- Settings: panel CRUD categorías (CU-024, CU-025, CU-026).
- Add-expense: modal rápido "+ Nueva categoría" (CU-024), selector dinámico de categorías.
- Pruebas end-to-end de flujos críticos (registro → setup → gasto → eliminar categoría).

---

## 7. Criterios de "app al 100%"

La app se considera 100% del spec cuando:
- [ ] Todas las brechas P0 y P1 están resueltas (Fase 1).
- [ ] Migraciones SQL aplicadas en Supabase (Fase 2).
- [ ] Store y tipos soportan categorías y onboarding (Fase 3).
- [ ] Pantallas `/setup`, gestión monedas y CRUD categorías funcionan (Fase 4).
- [ ] 18/21 US implementadas (US-019, US-020, US-021 completadas).
- [ ] Documentación actualizada: `USER_STORY_MAP.md` marca US-019→021 como ✅, ARCHITECTURE_SPEC.md marca P0/P1 como resueltas.

**Excluido:** US-016 (Google OAuth), US-017 (offline-first), US-018 (push) quedan para v1.2.

---

## 8. Notas técnicas

- **Aislamiento por usuario:** todas las tablas (`profiles`, `budgets`, `categories`, `expenses`) tienen RLS con políticas `FOR ALL USING (auth.uid() = user_id)`.
- **Protección de "Otros":** política en `categories` bloquea `DELETE` y `UPDATE` cuando `is_protected = true`.
- **Eliminación en cascada:**
  - Quitar moneda (CU-023): transacción atómica borra `budgets` + `expenses` de esa moneda.
  - Eliminar categoría (CU-026): reasigna `expenses` a "Otros" antes de borrar.
- **Trigger `handle_new_user`:** tras Fase 2, solo crea `profiles` (flag=false) + 5 categorías default. No crea presupuesto.

---

## 9. Referencias cruzadas

- **Spec funcional:** `docs/use-case/USER_STORY_MAP.md` (21 US, 26 CU).
- **Spec técnico:** `docs/architecture/ARCHITECTURE_SPEC.md` (ERD, diagramas de secuencia, matriz de deuda).
- **Código actual:** `src/` (Next.js App Router + Supabase).
- **DB actual:** `supabase/migrations/` (ver histórico de migraciones aplicadas).
