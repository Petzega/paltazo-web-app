-- ============================================
-- PALTAZO - Crear tabla categories
-- ============================================
-- Ref: ARCHITECTURE_SPEC.md, CU-024/025/026
-- Categorías personalizadas por usuario con 5 defaults + "Otros" protegida.

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_protected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_protected = false);

-- UPDATE/DELETE solo en categorías no protegidas ("Otros" is_protected=true queda inmutable)
CREATE POLICY "Users can update own non-protected categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id AND is_protected = false)
  WITH CHECK (auth.uid() = user_id AND is_protected = false);

CREATE POLICY "Users can delete own non-protected categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id AND is_protected = false);

-- ============================================
-- Índices
-- ============================================
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);

-- ============================================
-- Seed: 5 categorías default para usuarios existentes
-- ============================================
INSERT INTO categories (user_id, name, icon, color, is_default, is_protected)
SELECT u.id, v.name, v.icon, v.color, true, v.is_protected
FROM auth.users u
CROSS JOIN (VALUES
  ('Comida'::text,        '🍔'::text, 'orange'::text,  false::boolean),
  ('Transporte'::text,    '🚗'::text, 'blue'::text,    false::boolean),
  ('Servicios'::text,     '💡'::text, 'amber'::text,   false::boolean),
  ('Entretenimiento'::text,'🎬'::text, 'purple'::text,  false::boolean),
  ('Otros'::text,         '📦'::text, 'teal'::text,    true::boolean)
) AS v(name, icon, color, is_protected)
ON CONFLICT (user_id, name) DO NOTHING;
