# Paltazo Web App - Guía de Desarrollo

## Requisitos

- Node.js 20.x o superior
- npm 10.x o superior

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Rutas disponibles

- `/` — Redirect a `/onboarding` o `/dashboard` según sesión
- `/onboarding` — Pantalla de bienvenida
- `/login` — Autenticación (mock, sin backend)
- `/dashboard` — Resumen de gastos (Inicio)
- `/dashboard/add-expense` — Agregar gasto
- `/dashboard/expenses` — Historial de gastos (editar/eliminar)
- `/dashboard/settings` — Ajustes (presupuesto, about, borrar datos)
- `/budget` — Configurar presupuesto (legacy)

## Comandos

```bash
npm run build        # Build de producción
npm start            # Servidor de producción
npm run typecheck    # Verificar tipos TypeScript
npm run lint         # Ejecutar linter
```

## Estructura del proyecto

```
paltazo-web-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root: metadata + SW + AppProvider
│   │   ├── page.tsx                # Redirect según sesión
│   │   ├── onboarding/             # Bienvenida
│   │   ├── login/                  # Auth mock
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Bottom navigation
│   │   │   ├── page.tsx            # Resumen (Inicio)
│   │   │   ├── add-expense/        # Agregar gasto
│   │   │   ├── expenses/           # Historial + editar/eliminar
│   │   │   └── settings/           # Ajustes
│   │   └── budget/                 # Presupuesto (legacy)
│   ├── components/
│   │   ├── ui/                     # Button, Card, Input, BottomNav
│   │   └── providers/              # ServiceWorkerRegistrar
│   ├── lib/
│   │   ├── store.tsx               # Context + sesión + Dexie
│   │   ├── categories.ts           # Categorías MVP
│   │   ├── db.ts                   # Dexie.js (IndexedDB)
│   │   └── repositories/           # Repository pattern
│   └── types/
│       └── index.ts                # TypeScript interfaces
├── public/
│   ├── sw.js                       # Service worker
│   ├── manifest.json               # PWA manifest
│   └── icons/                      # PWA icons
├── docs/                           # Especificación y diseño
├── stitch/                         # Diseño de referencia (4 pantallas)
└── tailwind.config.ts              # Design tokens
```

## Estado de datos

- **BD local**: IndexedDB vía Dexie.js (`src/lib/db.ts`) — legacy, reemplazado por Supabase
- **BD cloud**: Supabase (PostgreSQL) — producción
- **Repository pattern**: `src/lib/supabase/repositories.ts` (getExpenses, addExpense, updateExpense, deleteExpense, getBudget, upsertBudget)
- **API pública**: React Context (`src/lib/store.tsx`)
- **Autenticación**: Supabase Auth (`src/lib/supabase/auth.ts`)
- **Sesión**: Supabase session (persistente)

## Bitácora

Ver `BITACORA.md` para:
- Errores encontrados y soluciones aplicadas
- Queries SQL para diagnosticar Supabase
- Instrucciones para continuar en otro equipo

## PWA

- Manifest: `public/manifest.json`
- Service worker: `public/sw.js` (cache-first con network fallback)
- Registro: `src/components/providers/ServiceWorkerRegistrar.tsx`

### Migración a Supabase (próximo paso)

1. Instalar `@supabase/supabase-js`
2. Crear `src/lib/supabase.ts` con cliente
3. Implementar `SupabaseExpenseRepository` con la misma interfaz
4. Cambiar el import en `store.tsx` de `expense-repository` a `supabase-repository`
5. Configurar `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Design System

Tokens en `tailwind.config.ts` + `src/app/globals.css`:
- Colores: primary (#42690e), primary-container (#8fbc5a), secondary, tertiary, surface
- Tipografía: Inter con variantes headline, body, label
- Espaciado: gutter, space-xs/sm/md/lg/xl
- Border radius: sm, DEFAULT, md, lg, xl, full
- Umbrales de alerta: 80% (warning), 100% (critical), 101% (exceeded)

## Pendientes

- [ ] **Resolver error 500 en signup** → Ver BITACORA.md (Error 2, trigger corregido)
- [ ] **Verificar que datos viajan correctamente** → Login → agregar gasto → revisar tabla `expenses`
- [ ] Edge Function `check-budget` con alertas 80/100/101%
- [ ] Notificaciones push
- [ ] Recuperación de contraseña funcional
