# Graph Report - paltazo-web-app  (2026-10-08)

## Corpus Check
- 46 files · ~22,398 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .example 1, (none) 1, .css 1)

## Summary
- 278 nodes · 391 edges · 26 communities (18 shown, 8 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a7d6547f`
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
- dependencies

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `useAppState()` - 15 edges
3. `Paltazo Web App — Guía de Desarrollo` - 14 edges
4. `react` - 13 edges
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
Cohesion: 0.15
Nodes (10): nextConfig, next, ref_next_font_google, src_app_globals, inter, metadata, viewport, ServiceWorkerRegistrar() (+2 more)

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
Cohesion: 0.07
Nodes (28): devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom, typescript (+20 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "repositories.ts"
Cohesion: 0.10
Nodes (16): dexie, db, PaltazoDB, budgetRepo, BudgetRepository, expenseRepo, ExpenseRepository, generateId() (+8 more)

### Community 15 - "auth.ts"
Cohesion: 0.33
Nodes (9): Error 1: `login is not a function` en `src/app/login/page.tsx:14`, LoginPage(), getSession(), getUser(), resetPassword(), signIn(), signUp(), supabase (+1 more)

### Community 16 - "Paltazo — Bitácora de Avance"
Cohesion: 0.09
Nodes (21): Archivos clave, Bug 5: Middleware no redirige después de logout (2026-10-08), Comandos útiles, Completados ✅, Configuración de entorno (.env.local), Diagnóstico de Supabase (queries útiles), En progreso 🔄, Error 2: `Database error saving new user` (HTTP 500 en `/auth/v1/signup`) (+13 more)

### Community 18 - "manifest.json"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 19 - "store.tsx"
Cohesion: 0.12
Nodes (25): ref_next_navigation, react, BudgetPage(), AddExpensePage(), ExpensesPage(), DashboardPage(), OnboardingPage(), Home() (+17 more)

### Community 20 - "Paltazo Web App — Guía de Desarrollo"
Cohesion: 0.14
Nodes (13): Autenticación, Comandos, Credenciales, Design System, Estado de datos, Estructura del proyecto, Instalación y arranque, Paltazo Web App — Guía de Desarrollo (+5 more)

### Community 22 - "signOut"
Cohesion: 0.23
Nodes (7): Protección de rutas, SettingsPage(), BottomNav(), tabs, links, Sidebar(), signOut()

### Community 23 - "@supabase/ssr"
Cohesion: 0.25
Nodes (4): ref_next_headers, ref_next_server, @supabase/ssr, config

### Community 24 - "Paltazo Design System"
Cohesion: 0.50
Nodes (3): Brand Identity & Aesthetic, Design Tokens, Paltazo Design System

### Community 25 - "dependencies"
Cohesion: 0.29
Nodes (7): dependencies, dexie, next, react, react-dom, @supabase/ssr, @supabase/supabase-js

## Knowledge Gaps
- **125 isolated node(s):** `$schema`, `plugin`, `nextConfig`, `name`, `version` (+120 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 157 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `signOut()` connect `signOut` to `Paltazo — Bitácora de Avance`, `app/layout.tsx`, `store.tsx`, `auth.ts`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **Why does `react` connect `store.tsx` to `app/layout.tsx`, `package.json`, `signOut`, `auth.ts`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Why does `Errores y soluciones` connect `Paltazo — Bitácora de Avance` to `auth.ts`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `signOut()` (e.g. with `Bug 5: Middleware no redirige después de logout (2026-10-08)` and `Protección de rutas`) actually correct?**
  _`signOut()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `plugin`, `nextConfig` to the rest of the system?**
  _125 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Supabase (MVP Backend)` be split into smaller, more focused modules?**
  _Cohesion score 0.12318840579710146 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._