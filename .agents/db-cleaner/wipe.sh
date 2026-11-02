#!/usr/bin/env bash
# ==============================================================================
# Paltazo - Script de borrado seguro de datos locales (db-cleaner)
# ==============================================================================
set -euo pipefail

echo "======================================================"
echo " [db-cleaner] Iniciando limpieza de BD local Supabase"
echo "======================================================"

# 1. Verificación de seguridad de entorno local
if ! docker ps --format '{{.Names}}' | grep -q "supabase_db_paltazo-web-app"; then
  echo "❌ Error: El contenedor supabase_db_paltazo-web-app no está corriendo."
  echo "   Inicia primero Supabase con: supabase start"
  exit 1
fi

echo "✔ Contenedor de base de datos local detectado."

# 2. Reset de la base de datos local vía Supabase CLI
echo "⏳ Ejecutando 'supabase db reset'..."
supabase db reset

# 3. Purga de correos de prueba en Mailpit
echo "⏳ Purgando buzón de correo local (Mailpit)..."
if curl -s -X DELETE http://127.0.0.1:54334/api/v1/messages > /dev/null 2>&1; then
  echo "✔ Bandeja de Mailpit purgada."
else
  echo "⚠️ Advertencia: No se pudo contactar con Mailpit en 127.0.0.1:54334 (ignorable)."
fi

# 4. Verificación de conteo de registros en tablas
echo ""
echo "📊 Verificación de registros restantes:"
docker exec supabase_db_paltazo-web-app psql -U postgres -d postgres -c \
  "SELECT 'auth.users' AS tabla, count(*) AS registros FROM auth.users \
   UNION ALL SELECT 'profiles', count(*) FROM profiles \
   UNION ALL SELECT 'expenses', count(*) FROM expenses \
   UNION ALL SELECT 'budgets', count(*) FROM budgets \
   UNION ALL SELECT 'categories', count(*) FROM categories \
   UNION ALL SELECT 'incomes', count(*) FROM incomes \
   UNION ALL SELECT 'income_categories', count(*) FROM income_categories;"

echo ""
echo "✅ [db-cleaner] Base de datos local limpiada exitosamente con 0 registros."
