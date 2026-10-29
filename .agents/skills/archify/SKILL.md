---
name: archify
description: Genera arquitectura técnica, diagramas Mermaid (ERD, secuencia, componentes) y especificaciones técnicas a partir de casos de uso e historias de usuario. Usar al pedir "diseñar arquitectura", "generar diagramas", "archify" o "especificar base de datos".
---

# Archify — Arquitectura Técnica y Diagramación

Actúa como Arquitecto de Software Principal. Transforma los requisitos funcionales de Paltazo en especificaciones técnicas y diagramas Mermaid antes de la programación.

## 1. Fuentes de verdad funcional (lectura obligatoria)
1. Índice y estado: `docs/use-case/README.md`
2. Mapa de historias y trazabilidad: `docs/use-case/USER_STORY_MAP.md`
3. Módulos funcionales:
   - Autenticación: `docs/use-case/auth/auth.md`
   - Gastos: `docs/use-case/expenses/expenses.md`
   - Dashboard: `docs/use-case/dashboard/dashboard.md`
   - Configuración: `docs/use-case/settings/settings.md`
   - Onboarding: `docs/use-case/onboarding/onboarding.md`
   - Categorías: `docs/use-case/categories/categories.md`
   - Futuras v1.2: `docs/use-case/future/future.md`
4. Red de dependencias: `docs/use-case/RED_CASOS_DE_USO.canvas`
5. Estado y brechas técnicas: `HANDOFF_AUTH_REVIEW.md`

## 2. Entregables requeridos (Markdown con diagramas Mermaid)
1. **Diagrama de Entidad-Relación (`erDiagram`):**
   - Modelar tablas Supabase PostgreSQL: `profiles`, `budgets`, `expenses` y `categories`.
   - Considerar relaciones, tipos de datos PostgreSQL, constraints, eliminación de CHECK estático en `expenses.category`, y RLS por `user_id`.
   - Incluir flag de configuración inicial en `profiles`.
2. **Diagrama de Arquitectura de Componentes (`flowchart`):**
   - Rutas Next.js App Router (`/`, `/login`, `/onboarding`, `/session-closed`, `/dashboard/*`, `/settings/*`).
   - Flujo entre Client Components, Server Components, `middleware.ts`, Supabase Client y Store global (`src/lib/store.tsx`).
3. **Diagramas de Secuencia (`sequenceDiagram`) para flujos críticos:**
   - Flujo 1: Registro + Onboarding inicial (CU-002 -> CU-021).
   - Flujo 2: Registro de gasto rápido con categoría dinámica (CU-008, CU-024).
   - Flujo 3: Eliminación de moneda secundaria con purga de gastos (CU-023).
   - Flujo 4: Eliminación de categoría con reasignación a "Otros" (CU-026).
   - Flujo 5: Logout global con pantalla `/session-closed` (CU-005).
4. **Matriz de Deuda Técnica y Plan de Fases:**
   - Brechas P0/P1 (Logout, BUG-001).
   - Secuencia ordenada de migraciones SQL y refactor frontend.
