# Paltazo Web App - Guía de Desarrollo

## Requisitos

- Node.js 20.x o superior
- npm 10.x o superior

## Instalación

```bash
# Instalar dependencias
npm install
```

## Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Rutas disponibles

- `/onboarding` - Pantalla de bienvenida
- `/login` - Autenticación
- `/dashboard` - Resumen de gastos

## Comandos

```bash
# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Verificar tipos TypeScript
npm run typecheck

# Ejecutar linter
npm run lint
```

## Estructura del proyecto

```
paltazo-web-app/
├── src/
│   ├── app/                # Rutas Next.js
│   │   ├── layout.tsx      # Root con AppProvider
│   │   ├── onboarding/     # Bienvenida
│   │   ├── login/          # Autenticación
│   │   ├── dashboard/      # Resumen + gastos
│   │   │   └── add-expense/  # Agregar gasto
│   │   └── budget/         # Configurar presupuesto
│   ├── lib/
│   │   ├── store.tsx       # Context + localStorage
│   │   └── categories.ts   # Categorías MVP
│   └── types/
│       └── index.ts        # TypeScript interfaces
├── tailwind.config.ts      # Design tokens
└── package.json
```

## Estado de datos

- **BD local**: IndexedDB vía Dexie.js (`src/lib/db.ts`)
- **Repository pattern**: `src/lib/repositories/expense-repository.ts`
- **API pública**: React Context (`src/lib/store.tsx`)
- **Usuario mock**: `userId: 'default'`

### Migración a Supabase (próximo paso)

1. Instalar `@supabase/supabase-js`
2. Crear `src/lib/supabase.ts` con cliente
3. Implementar `SupabaseExpenseRepository` con la misma interfaz
4. Cambiar el import en `store.tsx` de `expense-repository` a `supabase-repository`
5. Configurar `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`

La interfaz `Repository` permite migrar sin tocar el store ni las páginas.

## Design System

Tokens configurados en `tailwind.config.ts`:
- Colores: primary (#42690e), secondary, tertiary, surface
- Tipografía: Inter con variantes headline, body, label
- Espaciado: gutter, space-xs/sm/md/lg/xl
- Border radius: sm, DEFAULT, md, lg, xl, full

## Próximos pasos

- [ ] Migrar localStorage → Supabase + Dexie.js
- [ ] Autenticación real (Supabase Auth)
- [ ] Implementar PWA manifest + service worker
- [ ] Responsive desktop (dashboard web, modal add-expense)
- [ ] Edge Function `check-budget` con alertas 80/100/101%
