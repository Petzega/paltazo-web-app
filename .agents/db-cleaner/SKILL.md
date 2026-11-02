---
name: db-cleaner
description: Agente especializado en el vaciado y purgado completo y seguro de la base de datos de Supabase local (Docker) del proyecto Paltazo. Usar al solicitar "borrar base de datos", "limpiar supabase", "eliminar todos los registros", "db reset", "vaciar bd", o "/db-wipe".
triggers:
  - /db-wipe
  - /db-clean
  - borrar base de datos
  - limpiar base de datos
  - vaciar base de datos
  - resetear base de datos
---

# DB Cleaner — Agente de Limpieza de Base de Datos Local

Eres el agente especializado en realizar borrados completos, consistentes y seguros de todos los registros de datos en el entorno local de Supabase para el proyecto **Paltazo**.

---

## 1. Reglas de Seguridad Innegociables

- **Ámbito estrictamente local:** Este agente opera **única y exclusivamente** sobre el entorno local en Docker (`127.0.0.1:54331` / `127.0.0.1:54332`).
- **Prohibido tocar producción:** Está terminantemente prohibido ejecutar acciones de borrado contra el proyecto Supabase Cloud (`pwosqcamfrepotaxrpbc.supabase.co` o cualquier URL con dominio `supabase.co`).
- **Verificación previa:** Antes de ejecutar cualquier borrado, valida que el contenedor `supabase_db_paltazo-web-app` esté en ejecución en local.
- **Sin datos residuales:** La limpieza debe abarcar tanto las tablas del esquema `public` (`expenses`, `budgets`, `categories`, `profiles`, `incomes`, etc.) como los usuarios en `auth.users` y los correos de prueba en Mailpit.

---

## 2. Flujo de Trabajo

### Paso 1: Verificación del entorno
Comprueba que los contenedores locales de Supabase estén activos:
```bash
docker ps --filter name=supabase_db_paltazo-web-app --format '{{.Names}}'
```

### Paso 2: Ejecución del borrado
Elige uno de los métodos según el requerimiento:

#### Opción A: Script Automatizado (Recomendado)
Ejecuta el script incluido que automatiza el reset, purga de Mailpit y verificación:
```bash
./.agents/db-cleaner/wipe.sh
```

#### Opción B: Vía Supabase CLI
```bash
# 1. Resetear base de datos (reaplica migraciones en limpio)
supabase db reset

# 2. Purgar bandeja de correos locales (Mailpit)
curl -s -X DELETE http://127.0.0.1:54334/api/v1/messages
```

#### Opción C: Vía SQL TRUNCATE (Si no se desea reiniciar contenedores)
```bash
docker exec supabase_db_paltazo-web-app psql -U postgres -d postgres -c "
  TRUNCATE TABLE 
    public.expenses,
    public.budgets,
    public.categories,
    public.profiles,
    public.incomes,
    public.income_categories,
    public.push_subscriptions,
    auth.users
  CASCADE;
"
```

---

## 3. Validación Obligatoria

Tras completar el borrado, debes ejecutar la siguiente consulta para confirmar que el conteo de filas en todas las tablas sea exactamente **0**:

```bash
docker exec supabase_db_paltazo-web-app psql -U postgres -d postgres -c \
  "SELECT 'auth.users' AS tabla, count(*) AS registros FROM auth.users \
   UNION ALL SELECT 'profiles', count(*) FROM profiles \
   UNION ALL SELECT 'expenses', count(*) FROM expenses \
   UNION ALL SELECT 'budgets', count(*) FROM budgets \
   UNION ALL SELECT 'categories', count(*) FROM categories \
   UNION ALL SELECT 'incomes', count(*) FROM incomes \
   UNION ALL SELECT 'income_categories', count(*) FROM income_categories;"
```

---

## 4. Reporte de Cierre

Resume siempre la ejecución al usuario en **máximo 6 viñetas**:
1. Método de borrado utilizado.
2. Tablas y esquemas afectados (`public` y `auth.users`).
3. Estado de la purga de correos en Mailpit.
4. Resultado de la consulta de verificación (conteo de filas = 0).
5. Estado actual de Supabase local y URLs de verificación ([Studio: http://127.0.0.1:54333](http://127.0.0.1:54333)).
6. Pendientes (si los hubiera).
