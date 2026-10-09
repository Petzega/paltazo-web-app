# Graph Report - paltazo-web-app  (2026-10-08)

## Corpus Check
- 51 files · ~25,429 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: .example 2, (none) 2, .css 1)

## Summary
- 341 nodes · 464 edges · 26 communities (18 shown, 8 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c9eddbb3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Supabase (MVP Backend)
- app/layout.tsx
- Paltazo Application
- Paltazo Design Tokens
- Graphify Knowledge Graph
- opencode.json
- graphify.js
- Paltazo Folder Structure
- shadcn/ui / Radix UI
- Tailwind CSS
- TypeScript (Strict Mode)
- package.json
- compilerOptions
- repositories.ts
- auth.ts
- Paltazo — Bitácora de Avance
- manifest.json
- store.tsx
- Paltazo Web App — Guía de Desarrollo
- next-env.d.ts
- signOut
- @supabase/ssr
- Paltazo Design System
- Supabase Local — Guía de Desarrollo

## God Nodes (most connected - your core abstractions)
1. `useAppState()` - 17 edges
2. `compilerOptions` - 16 edges
3. `react` - 15 edges
4. `Supabase Local — Guía de Desarrollo` - 15 edges
5. `Paltazo Web App — Guía de Desarrollo` - 14 edges
6. `signOut()` - 11 edges
7. `Expense` - 11 edges
8. `Paltazo — Bitácora de Avance` - 11 edges
9. `Budget` - 9 edges
10. `Supabase (MVP Backend)` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Bug 5: Middleware no redirige después de logout (2026-10-08)` --references--> `signOut()`  [INFERRED]
  BITACORA.md → src/lib/supabase/auth.ts
- `Protección de rutas` --references--> `signOut()`  [INFERRED]
  DEVELOPMENT.md → src/lib/supabase/auth.ts
- `Error 1: `login is not a function` en `src/app/login/page.tsx:14`` --references--> `signIn()`  [INFERRED]
  BITACORA.md → src/lib/supabase/auth.ts
- `Error 1: `login is not a function` en `src/app/login/page.tsx:14`` --references--> `signUp()`  [INFERRED]
  BITACORA.md → src/lib/supabase/auth.ts
- `budget_alerts table` --semantically_similar_to--> `budget_alerts table (DB schema)`  [INFERRED] [semantically similar]
  docs/design/agentes_paltazo.md → docs/stack_tecnologico_paltazo.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Paltazo Design Token System** — docs_design_agentes_paltazo_design_tokens, docs_stack_tecnologico_paltazo_visual_identity, docs_design_paltazo_web_design_layout_adaptation, docs_design_paltazo_web_desing_fix_design_correction [EXTRACTED 0.95]
- **Paltazo AI Agent Team** — docs_design_agentes_paltazo_wireframes_agent, docs_design_agentes_paltazo_frontend_agent, docs_design_agentes_paltazo_backend_agent, docs_necesidad_proyecto_paltazo_product_agent [EXTRACTED 1.00]
- **Paltazo Database Schema Tables** — docs_stack_tecnologico_paltazo_profiles_table, docs_stack_tecnologico_paltazo_expenses_table, docs_stack_tecnologico_paltazo_budget_alerts_table, docs_stack_tecnologico_paltazo_push_subscriptions_table [EXTRACTED 1.00]

## Communities (26 total, 8 thin omitted)

### Community 0 - "Supabase (MVP Backend)"
Cohesion: 0.12
Nodes (24): Backend Agent, budget_alerts table, check-budget Edge Function, expenses table, Frontend Agent, profiles table, push_subscriptions table, Row Level Security (RLS) (+16 more)

### Community 1 - "app/layout.tsx"
Cohesion: 0.18
Nodes (8): nextConfig, next, ref_next_font_google, src_app_globals, inter, metadata, viewport, ServiceWorkerRegistrar()

### Community 2 - "Paltazo Application"
Cohesion: 0.25
Nodes (9): Expense Categories (food, transport, services, entertainment, other), MVP Scope, Paltazo Application, Problem Definition — Late Expense Tracking, Product Agent, MVP Success Criteria, Target User — Personal Expense Manager, Value Proposition — Detect Paltazo Early (+1 more)

### Community 3 - "Paltazo Design Tokens"
Cohesion: 0.50
Nodes (5): Paltazo Design Tokens, Wireframes Agent, Mobile-to-Desktop Layout Adaptation, Wireframe Design Correction Rules, Paltazo Visual Identity Tokens

### Community 4 - "Graphify Knowledge Graph"
Cohesion: 0.67
Nodes (3): Efficient Context Principle, Graphify Knowledge Graph, Minimalism & Safe Change Principle

### Community 6 - "graphify.js"
Cohesion: 0.40
Nodes (3): IMPORTANT: keep the reminder string free of backticks and $(...) constructs., ref_fs, ref_path

### Community 11 - "package.json"
Cohesion: 0.05
Nodes (35): dependencies, dexie, next, react, react-dom, @supabase/ssr, @supabase/supabase-js, devDependencies (+27 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "repositories.ts"
Cohesion: 0.09
Nodes (17): dexie, db, PaltazoDB, budgetRepo, BudgetRepository, expenseRepo, ExpenseRepository, generateId() (+9 more)

### Community 15 - "auth.ts"
Cohesion: 0.38
Nodes (8): Error 1: `login is not a function` en `src/app/login/page.tsx:14`, LoginPage(), getUser(), resetPassword(), signIn(), signUp(), supabase, createClient()

### Community 16 - "Paltazo — Bitácora de Avance"
Cohesion: 0.08
Nodes (24): 20261008182458_create_schema.sql, 20261008190000_add_currency_to_expenses.sql, Archivos clave, Cloud (Supabase producción), Comandos útiles, Completados ✅, Configuración de entorno, Desarrollo (+16 more)

### Community 18 - "manifest.json"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 19 - "store.tsx"
Cohesion: 0.09
Nodes (35): ref_next_navigation, react, BudgetPage(), AddExpensePage(), CURRENCY_OPTIONS, formatAmount(), ExpensesPage(), CurrencySummary (+27 more)

### Community 20 - "Paltazo Web App — Guía de Desarrollo"
Cohesion: 0.10
Nodes (19): 1. Instalación básica, 2. Desarrollo con Supabase Local, Autenticación, Comandos, Credenciales, Desarrollo, Design System, Estado de datos (+11 more)

### Community 22 - "signOut"
Cohesion: 0.15
Nodes (12): Bug 5: Middleware no redirige después de logout (2026-10-08), Bug 6: Vector (analytics) no arranca en Windows (2026-10-08), Error 2: `Database error saving new user` (HTTP 500 en `/auth/v1/signup`), Error 3: `Uncaught SyntaxError: Invalid or unexpected token (at layout.js:728:29)`, Error 4: `relation "pg_log" does not exist` en Supabase, Errores y soluciones, Protección de rutas, BottomNav() (+4 more)

### Community 23 - "@supabase/ssr"
Cohesion: 0.25
Nodes (4): ref_next_headers, ref_next_server, @supabase/ssr, config

### Community 24 - "Paltazo Design System"
Cohesion: 0.50
Nodes (3): Brand Identity & Aesthetic, Design Tokens, Paltazo Design System

### Community 25 - "Supabase Local — Guía de Desarrollo"
Cohesion: 0.05
Nodes (38): 1. Supabase CLI, 1. Supabase Studio (Web), 2. Cliente PostgreSQL (CLI), 2. Docker, 3. Clientes GUI, Acceso a la Base de Datos, Aplicar migraciones manualmente, Archivo `.env.development.local` (desarrollo local) (+30 more)

## Knowledge Gaps
- **167 isolated node(s):** `$schema`, `plugin`, `nextConfig`, `name`, `version` (+162 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 201 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `signOut()` connect `signOut` to `store.tsx`, `auth.ts`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Why does `react` connect `store.tsx` to `app/layout.tsx`, `package.json`, `auth.ts`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Why does `Errores y soluciones` connect `signOut` to `Paltazo — Bitácora de Avance`, `auth.ts`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **What connects `$schema`, `plugin`, `nextConfig` to the rest of the system?**
  _167 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Supabase (MVP Backend)` be split into smaller, more focused modules?**
  _Cohesion score 0.12318840579710146 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._