# Graph Report - paltazo-web-app  (2026-10-07)

## Corpus Check
- 18 files · ~5,059 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: .css 1, .tsbuildinfo 1)

## Summary
- 125 nodes · 124 edges · 19 communities (11 shown, 8 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `70fbf55c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Supabase (MVP Backend)
- Frontend Agent
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
- layout.tsx
- devDependencies
- scripts
- ref_next_navigation

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `Supabase (MVP Backend)` - 8 edges
3. `Paltazo Application` - 8 edges
4. `scripts` - 6 edges
5. `Backend Agent` - 6 edges
6. `check-budget Edge Function (impl)` - 5 edges
7. `Frontend Agent` - 5 edges
8. `budget_alerts table (DB schema)` - 4 edges
9. `Offline-First Synchronization Strategy` - 4 edges
10. `Paltazo Design Tokens` - 4 edges

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

## Communities (19 total, 8 thin omitted)

### Community 0 - "Supabase (MVP Backend)"
Cohesion: 0.18
Nodes (17): Backend Agent, budget_alerts table, check-budget Edge Function, expenses table, profiles table, push_subscriptions table, Row Level Security (RLS), Zero Cost MVP Constraint (+9 more)

### Community 1 - "Frontend Agent"
Cohesion: 0.33
Nodes (7): Frontend Agent, Dexie.js (IndexedDB Wrapper), Next.js 15 (App Router), Offline-First Synchronization Strategy, TanStack Query, Vercel (Frontend Hosting), Zustand

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
Cohesion: 0.11
Nodes (17): dependencies, next, react, react-dom, name, private, version, autoprefixer (+9 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "layout.tsx"
Cohesion: 0.20
Nodes (7): nextConfig, next, ref_next_font_google, src_app_globals, inter, metadata, viewport

### Community 14 - "devDependencies"
Cohesion: 0.25
Nodes (8): devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom, typescript

### Community 15 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, start, typecheck

## Knowledge Gaps
- **64 isolated node(s):** `$schema`, `plugin`, `nextConfig`, `name`, `version` (+59 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 82 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Supabase (MVP Backend)` connect `Supabase (MVP Backend)` to `Frontend Agent`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `next` connect `layout.tsx` to `package.json`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `$schema`, `plugin`, `nextConfig` to the rest of the system?**
  _64 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._