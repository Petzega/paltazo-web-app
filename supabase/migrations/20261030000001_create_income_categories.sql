-- ============================================
-- PALTAZO - Crear tabla income_categories
-- ============================================
-- Ref: ARCHITECTURE_SPEC.md, CU-031/032/033
-- Categorías de ingreso personalizadas por usuario con 5 defaults + "Otros" protegida.
-- Tabla separada de categories (gastos) para mantener independencia conceptual.

CREATE TABLE IF NOT EXISTS income_categories (
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
ALTER TABLE income_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own income categories"
  ON income_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income categories"
  ON income_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_protected = false);

-- UPDATE/DELETE solo en categorías no protegidas ("Otros" is_protected=true queda inmutable)
CREATE POLICY "Users can update own non-protected income categories"
  ON income_categories FOR UPDATE
  USING (auth.uid() = user_id AND is_protected = false)
  WITH CHECK (auth.uid() = user_id AND is_protected = false);

CREATE POLICY "Users can delete own non-protected income categories"
  ON income_categories FOR DELETE
  USING (auth.uid() = user_id AND is_protected = false);

-- ============================================
-- Índices
-- ============================================
CREATE INDEX IF NOT EXISTS idx_income_categories_user ON income_categories(user_id);

-- ============================================
-- Seed: 5 categorías de ingreso default para usuarios existentes
-- ============================================
INSERT INTO income_categories (user_id, name, icon, color, is_default, is_protected)
SELECT u.id, v.name, v.icon, v.color, true, v.is_protected
FROM auth.users u
CROSS JOIN (VALUES
  ('Sueldo'::text,     '💼'::text, 'emerald'::text, false::boolean),
  ('Freelance'::text,  '💡'::text, 'amber'::text,   false::boolean),
  ('Devolución'::text, '🎁'::text, 'indigo'::text,  false::boolean),
  ('Venta'::text,      '🛒'::text, 'orange'::text,  false::boolean),
  ('Otros'::text,      '📦'::text, 'teal'::text,    true::boolean)
) AS v(name, icon, color, is_protected)
ON CONFLICT (user_id, name) DO NOTHING;
