# Graph Report - paltazo-web-app  (2026-10-07)

## Corpus Check
- 38 files · ~17,957 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 1, .css 1)

## Summary
- 216 nodes · 295 edges · 22 communities (13 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `df55fc0e`
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
- index.ts
- manifest.json
- store.tsx
- Paltazo Web App - Guía de Desarrollo
- next-env.d.ts
- BottomNav.tsx
- Paltazo Design System

## God Nodes (most connected - your core abstractions)
1. `useAppState()` - 17 edges
2. `compilerOptions` - 16 edges
3. `react` - 13 edges
4. `Expense` - 10 edges
5. `Paltazo Web App - Guía de Desarrollo` - 10 edges
6. `Budget` - 8 edges
7. `Supabase (MVP Backend)` - 8 edges
8. `Paltazo Application` - 8 edges
9. `scripts` - 6 edges
10. `Backend Agent` - 6 edges

## Surprising Connections (you probably didn't know these)
- `AddExpensePage()` --calls--> `useAppState()`  [EXTRACTED]
  src/app/dashboard/add-expense/page.tsx → src/lib/store.tsx
- `budget_alerts table` --semantically_similar_to--> `budget_alerts table (DB schema)`  [INFERRED] [semantically similar]
  docs/design/agentes_paltazo.md → docs/stack_tecnologico_paltazo.md
- `check-budget Edge Function` --semantically_similar_to--> `check-budget Edge Function (impl)`  [INFERRED] [semantically similar]
  docs/design/agentes_paltazo.md → docs/stack_tecnologico_paltazo.md
- `expenses table` --semantically_similar_to--> `expenses table (DB schema)`  [INFERRED] [semantically similar]
  docs/design/agentes_paltazo.md → docs/stack_tecnologico_paltazo.md
- `profiles table` --semantically_similar_to--> `profiles table (DB schema)`  [INFERRED] [semantically similar]
  docs/design/agentes_paltazo.md → docs/stack_tecnologico_paltazo.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Paltazo Design Token System** — docs_design_agentes_paltazo_design_tokens, docs_stack_tecnologico_paltazo_visual_identity, docs_design_paltazo_web_design_layout_adaptation, docs_design_paltazo_web_desing_fix_design_correction [EXTRACTED 0.95]
- **Paltazo AI Agent Team** — docs_design_agentes_paltazo_wireframes_agent, docs_design_agentes_paltazo_frontend_agent, docs_design_agentes_paltazo_backend_agent, docs_necesidad_proyecto_paltazo_product_agent [EXTRACTED 1.00]
- **Paltazo Database Schema Tables** — docs_stack_tecnologico_paltazo_profiles_table, docs_stack_tecnologico_paltazo_expenses_table, docs_stack_tecnologico_paltazo_budget_alerts_table, docs_stack_tecnologico_paltazo_push_subscriptions_table [EXTRACTED 1.00]

## Communities (22 total, 9 thin omitted)

### Community 0 - "Supabase (MVP Backend)"
Cohesion: 0.12
Nodes (24): Backend Agent, budget_alerts table, check-budget Edge Function, expenses table, Frontend Agent, profiles table, push_subscriptions table, Row Level Security (RLS) (+16 more)

### Community 1 - "app/layout.tsx"
Cohesion: 0.17
Nodes (9): nextConfig, next, ref_next_font_google, src_app_globals, inter, metadata, viewport, ServiceWorkerRegistrar() (+1 more)

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
Nodes (31): dependencies, dexie, next, react, react-dom, devDependencies, autoprefixer, postcss (+23 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "index.ts"
Cohesion: 0.11
Nodes (17): dexie, AddExpensePage(), CategoryInfo, EXPENSE_CATEGORIES, db, PaltazoDB, budgetRepo, BudgetRepository (+9 more)

### Community 18 - "manifest.json"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 19 - "store.tsx"
Cohesion: 0.14
Nodes (21): ref_next_navigation, react, BudgetPage(), ExpensesPage(), DashboardPage(), SettingsPage(), LoginPage(), OnboardingPage() (+13 more)

### Community 20 - "Paltazo Web App - Guía de Desarrollo"
Cohesion: 0.17
Nodes (11): Comandos, Desarrollo, Design System, Estado de datos, Estructura del proyecto, Instalación, Migración a Supabase (próximo paso), Paltazo Web App - Guía de Desarrollo (+3 more)

### Community 24 - "Paltazo Design System"
Cohesion: 0.50
Nodes (3): Brand Identity & Aesthetic, Design Tokens, Paltazo Design System

## Knowledge Gaps
- **94 isolated node(s):** `$schema`, `plugin`, `nextConfig`, `name`, `version` (+89 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 117 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `store.tsx` to `app/layout.tsx`, `package.json`, `index.ts`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **What connects `$schema`, `plugin`, `nextConfig` to the rest of the system?**
  _94 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Supabase (MVP Backend)` be split into smaller, more focused modules?**
  _Cohesion score 0.12318840579710146 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11494252873563218 - nodes in this community are weakly interconnected._
- **Should `store.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14112903225806453 - nodes in this community are weakly interconnected._