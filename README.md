# Paltazo Web App

Aplicación web para gestión de gastos personales con soporte multi-moneda.

## Stack

- **Next.js 15** con App Router
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL local en Docker)

## Prerrequisitos

- Node.js 20+ 
- Docker Desktop (o Docker Engine + Docker Compose)
- Supabase CLI (`npm install -g supabase` o [guía oficial](https://supabase.com/docs/guides/cli/getting-started))

## Instalación

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd paltazo-web-app

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp .env.local.example .env.local
```

## Configuración de Supabase Local

El proyecto usa Supabase CLI para levantar PostgreSQL local en Docker.

```bash
# 1. Iniciar Supabase Local
supabase start

# 2. La primera vez descarga las imágenes (~1.5 GB)
# 3. Al finalizar, muestra las credenciales locales (URL y anon key)
```

**Credenciales por defecto:**

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| API | `http://127.0.0.1:54321` | anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| DB | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | postgres/postgres |
| Studio | `http://127.0.0.1:54323` | admin visual |
| Inbucket | `http://127.0.0.1:54324` | Email testing |

**Importante:** Las credenciales de Supabase CLI son fijas y seguras para desarrollo local. No las cambies.

## Variables de Entorno

Edita `.env.local` con las credenciales que muestra `supabase start`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key-local>
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Next.js dev server (http://localhost:3000)

# Supabase
supabase start           # Inicia servicios locales
supabase stop            # Detiene servicios
supabase reset           # Resetea DB y re-aplica migraciones
supabase db push         # Aplica migraciones pendientes
supabase studio          # Abre Supabase Studio en navegador

# Utilidad
npm run typecheck        # TypeScript type checking
npm run lint             # ESLint
npm run build            # Build de producción
```

## Estructura del Proyecto

```
paltazo-web-app/
├── src/
│   ├── app/
│   │   ├── dashboard/           # Páginas del dashboard
│   │   │   ├── add-expense/     # Formulario de gastos
│   │   │   ├── expenses/        # Lista de gastos
│   │   │   └── settings/        # Configuración de presupuestos
│   │   ├── layout.tsx           # Layout raíz
│   │   └── page.tsx             # Landing page
│   ├── lib/
│   │   ├── store.tsx            # Zustand store + Dexie (IndexedDB)
│   │   ├── categories.ts        # Categorías de gastos
│   │   └── supabase/            # Cliente y repositorios Supabase
│   └── components/              # Componentes reutilizables
├── supabase/
│   ├── config.toml              # Configuración Supabase CLI
│   └── migrations/              # Migraciones SQL
├── tailwind.config.ts           # Configuración Tailwind + tokens de diseño
└── package.json
```

## Funcionalidades

- **Gastos con multi-moneda**: Soporte para Soles (S/) y Dólares ($)
- **Presupuestos independientes**: Límites mensuales separados por moneda
- **Dashboard interactivo**: Calendario visual + gráfico de barras de últimos 7 días
- **Filtrado por fecha**: Selecciona cualquier día para ver sus gastos
- **Almacenamiento local**: IndexedDB con Dexie para persistencia offline
- **Sync con Supabase**: Sincronización opcional con PostgreSQL

## Desarrollo

El flujo típico de desarrollo:

```bash
# Terminal 1: Supabase
supabase start

# Terminal 2: Next.js
npm run dev
```

Abre http://localhost:3000 en el navegador.

## Migraciones

Para agregar nuevas tablas o modificar el schema:

```bash
# 1. Crear migración vacía
supabase migration new nombre_descriptivo

# 2. Editar el archivo en supabase/migrations/YYYYMMDDHHMMSS_nombre.sql

# 3. Aplicar cambios
supabase db push
```

## Troubleshooting

**Puerto ocupado:**
```bash
# Ver qué proceso usa el puerto
lsof -i :54321  # API
lsof -i :54322  # DB

# Cambiar puertos en supabase/config.toml si es necesario
```

**Supabase no arranca:**
```bash
# Reiniciar Docker Desktop
# Limpiar contenedores de Supabase
docker compose -f ~/.supabase/start/docker-compose.yml down -v
supabase start
```

**Migraciones desincronizadas:**
```bash
supabase db reset  # Resetea DB y re-aplica todas las migraciones
```
