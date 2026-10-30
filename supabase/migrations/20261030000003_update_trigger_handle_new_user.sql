-- ============================================
-- PALTAZO - Actualizar trigger handle_new_user (v2)
-- ============================================
-- Ref: ARCHITECTURE_SPEC.md (Flujo 1), CU-002, CU-021, CU-031
-- Depende de: 20261030000001_create_income_categories.sql
--
-- Cambios vs versión anterior (20261029000004):
-- - Ahora también crea 5 categorías de ingreso default (incluyendo "Otros" protegida)
-- - Mantiene comportamiento existente: perfil + 5 categorías de gasto

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Crear perfil básico (sin moneda ni presupuesto)
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

  -- 2. Crear 5 categorías de gasto default
  INSERT INTO public.categories (user_id, name, icon, color, is_default, is_protected)
  VALUES
    (NEW.id, 'Comida',         '🍔', 'orange', true, false),
    (NEW.id, 'Transporte',     '🚗', 'blue',   true, false),
    (NEW.id, 'Servicios',      '💡', 'amber',  true, false),
    (NEW.id, 'Entretenimiento','🎬', 'purple', true, false),
    (NEW.id, 'Otros',          '📦', 'teal',   true, true);

  -- 3. Crear 5 categorías de ingreso default
  INSERT INTO public.income_categories (user_id, name, icon, color, is_default, is_protected)
  VALUES
    (NEW.id, 'Sueldo',      '💼', 'emerald', true, false),
    (NEW.id, 'Freelance',   '💡', 'amber',   true, false),
    (NEW.id, 'Devolución',  '🎁', 'indigo',  true, false),
    (NEW.id, 'Venta',       '🛒', 'orange',  true, false),
    (NEW.id, 'Otros',       '📦', 'teal',    true, true);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error setting up new user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;
