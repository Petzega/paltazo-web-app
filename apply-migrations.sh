#!/bin/bash

echo "🚀 Iniciando Supabase local..."
npx supabase start > /dev/null 2>&1 &
SUPABASE_PID=$!

echo "⏳ Esperando a que postgres esté listo..."
for i in {1..30}; do
  if docker ps | grep -q supabase_db; then
    echo "✅ Postgres disponible"
    break
  fi
  sleep 2
done

# Obtener el nombre del contenedor de postgres
DB_CONTAINER=$(docker ps --format "{{.Names}}" | grep supabase_db | head -1)

if [ -z "$DB_CONTAINER" ]; then
  echo "❌ No se encontró el contenedor de postgres"
  kill $SUPABASE_PID 2>/dev/null
  exit 1
fi

echo "📝 Aplicando migraciones..."
docker exec -i $DB_CONTAINER psql -U postgres -d postgres < supabase/migrations/apply_all.sql

if [ $? -eq 0 ]; then
  echo "✅ Migraciones aplicadas exitosamente"
else
  echo "❌ Error al aplicar migraciones"
  kill $SUPABASE_PID 2>/dev/null
  exit 1
fi

echo "🎉 Supabase listo en http://localhost:54323"
