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
│   └── app/           # Rutas y páginas Next.js
│       ├── layout.tsx # Layout principal
│       ├── page.tsx   # Página inicial
│       ├── onboarding/
│       ├── login/
│       └── dashboard/
├── tailwind.config.ts # Configuración Tailwind + design tokens
└── package.json       # Dependencias
```

## Design System

Tokens configurados en `tailwind.config.ts`:
- Colores: primary (#42690e), secondary, tertiary, surface
- Tipografía: Inter con variantes headline, body, label
- Espaciado: gutter, space-xs/sm/md/lg/xl
- Border radius: sm, DEFAULT, md, lg, xl, full

## Próximos pasos

- [ ] Implementar pantalla agregar gasto
- [ ] Configurar Supabase para autenticación
- [ ] Configurar Dexie.js para storage offline
- [ ] Implementar TanStack Query para sincronización
- [ ] Agregar PWA manifest y service worker
