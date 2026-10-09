# Graph Report - paltazo-web-app  (2026-10-08)

## Corpus Check
- 49 files · ~23,201 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 283 nodes · 406 edges · 27 communities (19 shown, 8 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0182dc6f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Supabase (MVP Backend)
- store.tsx
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
- dependencies
- manifest.json
- useAppState
- Paltazo Web App — Guía de Desarrollo
- next-env.d.ts
- ref_next_navigation
- @supabase/ssr
- Paltazo Design System
- react
- devDependencies

## God Nodes (most connected - your core abstractions)
1. `useAppState()` - 17 edges
2. `compilerOptions` - 16 edges
3. `react` - 14 edges
4. `Paltazo Web App — Guía de Desarrollo` - 14 edges
5. `signOut()` - 11 edges
6. `Expense` - 11 edges
7. `Paltazo — Bitácora de Avance` - 10 edges
8. `Budget` - 9 edges
9. `Supabase (MVP Backend)` - 8 edges
10. `Paltazo Application` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Bug 5: Middleware no redirige después de logout (2026-10-08)` --references--> `signOut()`  [INFERRED]
  BITACORA.md → src/lib/supabase/auth.ts
- `Protección de rutas` --references--> `signOut()`  [INFERRED]
  DEVELOPMENT.md → src/lib/supabase/auth.ts
- `Error 1: `login is not a function` en `src/app/login/page.tsx:14`` --references--> `signIn()`  [INFERRED]
  BITACORA.md → src/lib/supabase/auth.ts
- `Error 1: `login is not a function` en `src/app/login/page.tsx:14`` --references--> `signUp()`  [INFERRED]
  BITACORA.md → src/lib/supabase/auth.ts
- `OnboardingPage()` --calls--> `useAppState()`  [EXTRACTED]
  src/app/onboarding/page.tsx → src/lib/store.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Paltazo Design Token System** — docs_design_agentes_paltazo_design_tokens, docs_stack_tecnologico_paltazo_visual_identity, docs_design_paltazo_web_design_layout_adaptation, docs_design_paltazo_web_desing_fix_design_correction [EXTRACTED 0.95]
- **Paltazo AI Agent Team** — docs_design_agentes_paltazo_wireframes_agent, docs_design_agentes_paltazo_frontend_agent, docs_design_agentes_paltazo_backend_agent, docs_necesidad_proyecto_paltazo_product_agent [EXTRACTED 1.00]
- **Paltazo Database Schema Tables** — docs_stack_tecnologico_paltazo_profiles_table, docs_stack_tecnologico_paltazo_expenses_table, docs_stack_tecnologico_paltazo_budget_alerts_table, docs_stack_tecnologico_paltazo_push_subscriptions_table [EXTRACTED 1.00]

## Communities (27 total, 8 thin omitted)

### Community 0 - "Supabase (MVP Backend)"
Cohesion: 0.12
Nodes (24): Backend Agent, budget_alerts table, check-budget Edge Function, expenses table, Frontend Agent, profiles table, push_subscriptions table, Row Level Security (RLS) (+16 more)

### Community 1 - "store.tsx"
Cohesion: 0.17
Nodes (12): ref_next_font_google, src_app_globals, inter, metadata, viewport, ServiceWorkerRegistrar(), AppContext, AppProvider() (+4 more)

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
Cohesion: 0.06
Nodes (29): nextConfig, dependencies, dexie, next, react, react-dom, @supabase/ssr, @supabase/supabase-js (+21 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "repositories.ts"
Cohesion: 0.10
Nodes (16): dexie, db, PaltazoDB, budgetRepo, BudgetRepository, expenseRepo, ExpenseRepository, generateId() (+8 more)

### Community 15 - "auth.ts"
Cohesion: 0.38
Nodes (8): Error 1: `login is not a function` en `src/app/login/page.tsx:14`, LoginPage(), getUser(), resetPassword(), signIn(), signUp(), supabase, createClient()

### Community 16 - "dependencies"
Cohesion: 0.09
Nodes (21): Archivos clave, Bug 5: Middleware no redirige después de logout (2026-10-08), Comandos útiles, Completados ✅, Configuración de entorno (.env.local), Diagnóstico de Supabase (queries útiles), En progreso 🔄, Error 2: `Database error saving new user` (HTTP 500 en `/auth/v1/signup`) (+13 more)

### Community 18 - "manifest.json"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 19 - "useAppState"
Cohesion: 0.19
Nodes (14): BudgetPage(), AddExpensePage(), CURRENCY_OPTIONS, formatAmount(), ExpensesPage(), DashboardPage(), Home(), CategoryInfo (+6 more)

### Community 20 - "Paltazo Web App — Guía de Desarrollo"
Cohesion: 0.13
Nodes (14): Autenticación, Comandos, Credenciales, Design System, Estado de datos, Estructura del proyecto, Instalación y arranque, Paltazo Web App — Guía de Desarrollo (+6 more)

### Community 22 - "ref_next_navigation"
Cohesion: 0.23
Nodes (8): ref_next_navigation, SettingsPage(), AuthGuard(), BottomNav(), tabs, links, Sidebar(), signOut()

### Community 23 - "@supabase/ssr"
Cohesion: 0.25
Nodes (4): ref_next_headers, ref_next_server, @supabase/ssr, config

### Community 24 - "Paltazo Design System"
Cohesion: 0.50
Nodes (3): Brand Identity & Aesthetic, Design Tokens, Paltazo Design System

### Community 25 - "react"
Cohesion: 0.21
Nodes (10): react, OnboardingPage(), Button(), ButtonProps, Variant, variants, Card(), CardProps (+2 more)

### Community 26 - "devDependencies"
Cohesion: 0.25
Nodes (8): devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom, typescript

## Knowledge Gaps
- **126 isolated node(s):** `$schema`, `plugin`, `nextConfig`, `name`, `version` (+121 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 158 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `signOut()` connect `ref_next_navigation` to `dependencies`, `store.tsx`, `Paltazo Web App — Guía de Desarrollo`, `auth.ts`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `store.tsx`, `package.json`, `auth.ts`, `useAppState`, `ref_next_navigation`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Why does `Errores y soluciones` connect `dependencies` to `auth.ts`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `signOut()` (e.g. with `Bug 5: Middleware no redirige después de logout (2026-10-08)` and `Protección de rutas`) actually correct?**
  _`signOut()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `plugin`, `nextConfig` to the rest of the system?**
  _126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Supabase (MVP Backend)` be split into smaller, more focused modules?**
  _Cohesion score 0.12318840579710146 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._