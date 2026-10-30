-- ============================================
-- MIGRACIÓN CONSOLIDADA: Módulo de Ingresos
-- ============================================
-- Ejecuta este bloque completo en Supabase SQL Editor
-- Crea tablas income_categories e incomes, actualiza trigger

-- 1. Crear tabla income_categories
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

ALTER TABLE income_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own income categories"
  ON income_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income categories"
  ON income_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_protected = false);

CREATE POLICY "Users can update own non-protected income categories"
  ON income_categories FOR UPDATE
  USING (auth.uid() = user_id AND is_protected = false)
  WITH CHECK (auth.uid() = user_id AND is_protected = false);

CREATE POLICY "Users can delete own non-protected income categories"
  ON income_categories FOR DELETE
  USING (auth.uid() = user_id AND is_protected = false);

CREATE INDEX IF NOT EXISTS idx_income_categories_user ON income_categories(user_id);

-- 2. Crear tabla incomes
CREATE TABLE IF NOT EXISTS incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES income_categories(id) ON DELETE RESTRICT,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own incomes"
  ON incomes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own incomes"
  ON incomes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incomes"
  ON incomes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own incomes"
  ON incomes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_incomes_user ON incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_incomes_category ON incomes(category_id);
CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(date DESC);

-- 3. Seed categorías de ingreso para usuarios existentes
INSERT INTO income_categories (user_id, name, icon, color, is_default, is_protected)
SELECT u.id, v.name, v.icon, v.color, true, v.is_protected
FROM auth.users u
CROSS JOIN (VALUES
  ('Sueldo'::text, '💼'::text, 'emerald'::text, false::boolean),
  ('Freelance'::text, '💡'::text, 'amber'::text, false::boolean),
  ('Devolución'::text, '🎁'::text, 'indigo'::text, false::boolean),
  ('Venta'::text, '🛒'::text, 'orange'::text, false::boolean),
  ('Otros'::text, '📦'::text, 'teal'::text, true::boolean)
) AS v(name, icon, color, is_protected)
ON CONFLICT (user_id, name) DO NOTHING;

-- 4. Actualizar trigger handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, has_completed_onboarding)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    false
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.categories (user_id, name, icon, color, is_default, is_protected)
  VALUES
    (NEW.id, 'Comida', '🍔', 'orange', true, false),
    (NEW.id, 'Transporte', '🚗', 'blue', true, false),
    (NEW.id, 'Servicios', '💡', 'amber', true, false),
    (NEW.id, 'Entretenimiento', '🎬', 'purple', true, false),
    (NEW.id, 'Otros', '📦', 'teal', true, true);

  INSERT INTO public.income_categories (user_id, name, icon, color, is_default, is_protected)
  VALUES
    (NEW.id, 'Sueldo', '💼', 'emerald', true, false),
    (NEW.id, 'Freelance', '💡', 'amber', true, false),
    (NEW.id, 'Devolución', '🎁', 'indigo', true, false),
    (NEW.id, 'Venta', '🛒', 'orange', true, false),
    (NEW.id, 'Otros', '📦', 'teal', true, true);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error setting up new user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;
