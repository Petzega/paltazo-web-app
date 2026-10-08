# Graph Report - paltazo-web-app  (2026-10-07)

## Corpus Check
- 43 files · ~19,984 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .example 1, (none) 1, .css 1)

## Summary
- 244 nodes · 343 edges · 24 communities (16 shown, 8 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fc6f2853`
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
- dependencies
- manifest.json
- store.tsx
- Paltazo Web App - Guía de Desarrollo
- next-env.d.ts
- dashboard/layout.tsx
- Paltazo Design System

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `useAppState()` - 15 edges
3. `react` - 13 edges
4. `Expense` - 11 edges
5. `Paltazo Web App - Guía de Desarrollo` - 11 edges
6. `Budget` - 9 edges
7. `Supabase (MVP Backend)` - 8 edges
8. `Paltazo Application` - 8 edges
9. `scripts` - 6 edges
10. `Backend Agent` - 6 edges

## Surprising Connections (you probably didn't know these)
- `budget_alerts table` --semantically_similar_to--> `budget_alerts table (DB schema)`  [INFERRED] [semantically similar]
  docs/design/agentes_paltazo.md → docs/stack_tecnologico_paltazo.md
- `check-budget Edge Function` --semantically_similar_to--> `check-budget Edge Function (impl)`  [INFERRED] [semantically similar]
  docs/design/agentes_paltazo.md → docs/stack_tecnologico_paltazo.md
- `expenses table` --semantically_similar_to--> `expenses table (DB schema)`  [INFERRED] [semantically similar]
  docs/design/agentes_paltazo.md → docs/stack_tecnologico_paltazo.md
- `profiles table` --semantically_similar_to--> `profiles table (DB schema)`  [INFERRED] [semantically similar]
  docs/design/agentes_paltazo.md → docs/stack_tecnologico_paltazo.md
- `push_subscriptions table` --semantically_similar_to--> `push_subscriptions table (DB schema)`  [INFERRED] [semantically similar]
  docs/design/agentes_paltazo.md → docs/stack_tecnologico_paltazo.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Paltazo Design Token System** — docs_design_agentes_paltazo_design_tokens, docs_stack_tecnologico_paltazo_visual_identity, docs_design_paltazo_web_design_layout_adaptation, docs_design_paltazo_web_desing_fix_design_correction [EXTRACTED 0.95]
- **Paltazo AI Agent Team** — docs_design_agentes_paltazo_wireframes_agent, docs_design_agentes_paltazo_frontend_agent, docs_design_agentes_paltazo_backend_agent, docs_necesidad_proyecto_paltazo_product_agent [EXTRACTED 1.00]
- **Paltazo Database Schema Tables** — docs_stack_tecnologico_paltazo_profiles_table, docs_stack_tecnologico_paltazo_expenses_table, docs_stack_tecnologico_paltazo_budget_alerts_table, docs_stack_tecnologico_paltazo_push_subscriptions_table [EXTRACTED 1.00]

## Communities (24 total, 8 thin omitted)

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
Cohesion: 0.07
Nodes (28): devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom, typescript (+20 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "repositories.ts"
Cohesion: 0.10
Nodes (17): db, PaltazoDB, budgetRepo, BudgetRepository, expenseRepo, ExpenseRepository, generateId(), AppState (+9 more)

### Community 15 - "auth.ts"
Cohesion: 0.27
Nodes (8): @supabase/ssr, LoginPage(), getSession(), getUser(), signIn(), signUp(), supabase, createClient()

### Community 16 - "dependencies"
Cohesion: 0.29
Nodes (7): dependencies, dexie, next, react, react-dom, @supabase/ssr, @supabase/supabase-js

### Community 18 - "manifest.json"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 19 - "store.tsx"
Cohesion: 0.11
Nodes (27): ref_next_navigation, react, BudgetPage(), AddExpensePage(), ExpensesPage(), DashboardPage(), SettingsPage(), OnboardingPage() (+19 more)

### Community 20 - "Paltazo Web App - Guía de Desarrollo"
Cohesion: 0.15
Nodes (12): Comandos, Desarrollo, Design System, Estado de datos, Estructura del proyecto, Instalación, Migración a Supabase (próximo paso), Paltazo Web App - Guía de Desarrollo (+4 more)

### Community 22 - "dashboard/layout.tsx"
Cohesion: 0.32
Nodes (4): BottomNav(), tabs, links, Sidebar()

### Community 24 - "Paltazo Design System"
Cohesion: 0.50
Nodes (3): Brand Identity & Aesthetic, Design Tokens, Paltazo Design System

## Knowledge Gaps
- **105 isolated node(s):** `$schema`, `plugin`, `nextConfig`, `name`, `version` (+100 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 132 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `store.tsx` to `app/layout.tsx`, `package.json`, `auth.ts`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `$schema`, `plugin`, `nextConfig` to the rest of the system?**
  _105 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Supabase (MVP Backend)` be split into smaller, more focused modules?**
  _Cohesion score 0.12318840579710146 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `repositories.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10037878787878787 - nodes in this community are weakly interconnected._