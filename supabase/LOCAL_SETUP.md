# Supabase Local — Guía de Desarrollo

> Configuración completa para levantar Supabase en local con Docker (Windows y Linux)

## Requisitos

### Windows
- **Docker Desktop** 4.0+ con WSL2
- **WSL2** habilitado (Windows 10/11)
- **Supabase CLI** (vía npm o scoop)

### Linux
- **Docker Engine** 20.10+
- **Docker Compose** v2 (incluido en Docker Engine moderno)
- **Supabase CLI** (vía npm o binario)

### Común
- **Node.js** 20.x+
- **npm** 10.x+

---

## Instalación

### 1. Supabase CLI

```bash
# Opción A: npm global
npm install -g supabase

# Opción B: Windows (Scoop)
scoop install supabase

# Opción C: Linux (binario)
curl -fsSL https://supabase.com/install.sh | sh

# Verificar
supabase --version
```

### 2. Docker

**Windows:**
- Descargar Docker Desktop desde https://www.docker.com/products/docker-desktop
- Instalar con WSL2 backend
- Verificar: `docker --version`

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose-plugin
sudo usermod -aG docker $USER
# Reiniciar sesión
docker --version
```

---

## Inicialización del proyecto

Si es un proyecto nuevo (ya está inicializado en este repo):

```bash
supabase init
```

Esto crea la carpeta `supabase/` con `config.toml` y estructura base.

---

## Variables de entorno

### Archivo `.env.development.local` (desarrollo local)

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

### Archivo `.env.local` (producción / Supabase cloud)

```env
NEXT_PUBLIC_SUPABASE_URL=https://pwosqcamfrepotaxrpbc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key real del dashboard>
```

> **Nota:** `npm run dev` usa `.env.development.local` automáticamente. Para usar cloud en desarrollo, renombra a `.env.local`.

---

## Levantar Supabase Local

### Iniciar todos los servicios

```bash
# Desde la raíz del proyecto
supabase start
```

**Salida esperada:**
```
╭──────────────────────────────────────
│ 🔧 Development Tools                 │
├─────────┬────────────────────────────┤
│ Studio  │ http://127.0.0.1:54323     │
│ Mailpit │ http://127.0.0.1:54324     │
│ MCP     │ http://127.0.0.1:54321/mcp │
╰─────────┴────────────────────────────┘

╭──────────────────────────────────────────────────────╮
│ 🌐 APIs                                              │
├────────────────┬─────────────────────────────────────┤
│ Project URL    │ http://127.0.0.1:54321              │
│ REST           │ http://127.0.0.1:54321/rest/v1      │
│ GraphQL        │ http://127.0.0.1:54321/graphql/v1   │
│ Edge Functions │ http://127.0.0.1:54321/functions/v1 │
╰────────────────┴─────────────────────────────────────┘

╭───────────────────────────────────────────────────────────────╮
│  Database                                                    │
├─────┬─────────────────────────────────────────────────────────┤
│ URL │ postgresql://postgres:postgres@127.0.0.1:54322/postgres │
╰─────┴─────────────────────────────────────────────────────────┘
```

### Detener servicios

```bash
supabase stop
```

Los datos persisten en volúmenes Docker.

### Reiniciar (reset completo)

```bash
# Detiene y limpia todo
supabase stop

# Vuelve a iniciar (aplica migraciones desde cero)
supabase start
```

---

## Acceso a la Base de Datos

### 1. Supabase Studio (Web)

**URL:** http://127.0.0.1:54323

- Table Editor
- SQL Editor
- Authentication
- Logs

### 2. Cliente PostgreSQL (CLI)

```bash
# Usando psql
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# Usando Supabase CLI (abre psql automáticamente)
supabase db psql
```

### 3. Clientes GUI

**Conexión:**
- Host: `127.0.0.1`
- Port: `54322`
- Database: `postgres`
- User: `postgres`
- Password: `postgres`

Clientes compatibles:
- pgAdmin
- DBeaver
- TablePlus
- DataGrip

---

## Migraciones

### Crear nueva migración

```bash
supabase migration new nombre_de_la_migracion
```

Crea archivo en `supabase/migrations/<timestamp>_nombre_de_la_migracion.sql`

### Aplicar migraciones manualmente

```bash
supabase migration up
```

### Resetear base de datos (aplica todas las migraciones desde cero)

```bash
supabase db reset
```

⚠️ **Esto borra todos los datos locales.** Los datos persisten solo entre `supabase stop` / `supabase start`.

---

## Autenticación Local

### Credenciales por defecto

```
URL:    http://127.0.0.1:54321
Anon:   sb_publishable_<TU_ANON_KEY_LOCAL>
Secret: sb_secret_<TU_SECRET_KEY_LOCAL>
```

> **Nota:** Estas credenciales son generadas automáticamente por `supabase start`. Copia los valores reales desde la terminal cuando inicies Supabase Local. **Nunca commitear las claves reales.**

### Rate Limits (configurables en `supabase/config.toml`)

```toml
[auth.rate_limit]
sign_in_sign_ups = 30        # cada 5 min
token_refresh = 150          # cada 5 min
token_verifications = 30     # cada 5 min
```

> Si ves error 429 durante pruebas intensas, sube estos límites.

---

## Troubleshooting

### Vector (analytics) no arranca en Windows

**Síntoma:** Contenedor `supabase_vector_*` en loop de restart.

**Causa:** Vector no puede conectarse al socket de Docker Desktop en Windows (`192.168.65.254:2375`).

**Solución:** Desactivar analytics en `supabase/config.toml`:

```toml
[analytics]
enabled = false
```

Luego:
```bash
supabase stop
supabase start
```

> Esto no afecta desarrollo. Solo desactiva la sección de Analytics del Studio local.

---

### Error: "Connection refused" en Docker

**Windows:**
- Verificar que Docker Desktop esté corriendo
- Reiniciar Docker Desktop
- Verificar WSL2: `wsl --status`

**Linux:**
```bash
sudo systemctl start docker
sudo systemctl enable docker
```

---

### Error: "port already in use" (54321, 54322, 54323)

Alguien está usando esos puertos. Cambia los puertos en `supabase/config.toml`:

```toml
[api]
port = 54331  # antes 54321

[db]
port = 54332  # antes 54322

[studio]
port = 54333  # antes 54323
```

---

### Error: "relation does not exist"

Las migraciones no se aplicaron:

```bash
supabase migration up
```

---

### Caché de Service Worker

Si ves errores de manifest.json corrupto o versiones antiguas:

1. DevTools → Application → Service Workers → **Unregister**
2. Application → Storage → **Clear site data**
3. Hard reload: `Ctrl + Shift + R` (Windows) / `Cmd + Shift + R` (Mac)

---

## Comandos útiles

```bash
# Ver estado de contenedores
docker ps -a --filter name=supabase

# Ver logs de un servicio
docker logs supabase_db_paltazo-web-app
docker logs supabase_auth_paltazo-web-app

# Ver logs de Supabase CLI (en vivo)
supabase status

# Backup de datos locales
docker volume ls --filter label=com.supabase.cli.project=paltazo-web-app

# Restaurar desde backup
# (los datos persisten automáticamente en volúmenes Docker)
```

---

## Diferencias entre Local y Cloud

| Característica | Local | Cloud |
|----------------|-------|-------|
| URL | `http://127.0.0.1:54321` | `https://<project>.supabase.co` |
| Auth | Sin email real (Mailpit) | Email real |
| Rate limits | Configurables | Fijos (plan) |
| Backups | Volúmenes Docker | Automáticos |
| Edge Functions | ✅ Soportadas | ✅ Soportadas |
| Realtime | ✅ | ✅ |
| Storage | ✅ | ✅ |
| Analytics | ⚠️ Desactivado en Windows | ✅ |

---

## Estructura de carpetas

```
supabase/
├── config.toml          # Configuración de servicios locales
├── migrations/          # Migraciones SQL versionadas
│   └── 20261008182458_create_schema.sql
├── seed.sql             # Datos seed (opcional)
└── snippets/            # Snippets SQL reutilizables
```

---

## Flujo de trabajo recomendado

1. **Desarrollo diario:**
   ```bash
   supabase start        # Una vez al inicio del día
   npm run dev           # Aplicación Next.js
   ```

2. **Cambios en esquema:**
   ```bash
   supabase migration new cambio_necesario
   # Editar el SQL generado
   supabase migration up  # Aplicar
   ```

3. **Testing:**
   - Usar `.env.development.local` para apuntar a local
   - Probar autenticación, CRUD de expenses, etc.
   - Verificar en http://127.0.0.1:54323 (Studio)

4. **Deploy a producción:**
   ```bash
   # Conectar al proyecto cloud
   supabase login
   supabase link --project-ref pwosqcamfrepotaxrpbc
   
   # Aplicar migraciones en cloud
   supabase db push
   ```

---

## Recursos

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Local Development](https://supabase.com/docs/guides/local-development)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Troubleshooting](https://supabase.com/docs/guides/troubleshooting)
