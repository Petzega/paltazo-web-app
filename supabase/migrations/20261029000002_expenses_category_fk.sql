-- ============================================
-- PALTAZO - Migrar expenses.category → category_id FK
-- ============================================
-- Ref: ARCHITECTURE_SPEC.md (ERD), CU-024/025/026
-- Depende de: 20261029000001_create_categories.sql

-- 1. Añadir columna FK
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS category_id UUID;

-- 2. Mapear category TEXT → category_id (categorías default del usuario)
UPDATE expenses e
SET category_id = c.id
FROM categories c
WHERE c.user_id = e.user_id
  AND (
    (e.category = 'food'         AND c.name = 'Comida')         OR
    (e.category = 'transport'    AND c.name = 'Transporte')     OR
    (e.category = 'services'     AND c.name = 'Servicios')      OR
    (e.category = 'entertainment' AND c.name = 'Entretenimiento') OR
    (e.category = 'other'        AND c.name = 'Otros')
  )
  AND e.category_id IS NULL;

-- 3. Fallback: gastos aún sin mapeo → "Otros"
UPDATE expenses e
SET category_id = c.id
FROM categories c
WHERE c.user_id = e.user_id
  AND c.name = 'Otros'
  AND e.category_id IS NULL;

-- 4. Hacer NOT NULL
ALTER TABLE expenses ALTER COLUMN category_id SET NOT NULL;

-- 5. Añadir FK (ON DELETE RESTRICT: ningún gasto queda huérfano)
ALTER TABLE expenses ADD CONSTRAINT fk_expenses_category
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;

-- 6. Eliminar CHECK estático en category (buscar por columna, nombre auto-generado)
DO $$
DECLARE chk text;
BEGIN
  SELECT con.conname INTO chk
  FROM pg_constraint con
  JOIN pg_attribute attr ON attr.attnum = ANY(con.conkey) AND attr.attrelid = con.conrelid
  WHERE con.conrelid = 'expenses'::regclass
    AND con.contype = 'c'
    AND attr.attname = 'category';
  IF chk IS NOT NULL THEN
    EXECUTE format('ALTER TABLE expenses DROP CONSTRAINT %I', chk);
  END IF;
END $$;

-- 7. Eliminar columna category legacy
ALTER TABLE expenses DROP COLUMN IF EXISTS category;
