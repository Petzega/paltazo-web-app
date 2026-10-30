-- ============================================
-- PALTAZO - Actualizar trigger handle_new_user
-- ============================================
-- Ref: ARCHITECTURE_SPEC.md (Flujo 1), CU-002, CU-021
-- Depende de: 20261029000001_create_categories.sql
--
-- Cambios vs versión anterior (20261018000000):
-- - Ya NO crea presupuesto default S/ 1000 (eso lo hace el usuario en /setup, CU-021)
-- - Crea 5 categorías default (incluyendo "Otros" protegida)
-- - Perfil se crea con has_completed_onboarding = false

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

  -- 2. Crear 5 categorías default
  INSERT INTO public.categories (user_id, name, icon, color, is_default, is_protected)
  VALUES
    (NEW.id, 'Comida',         '🍔', 'orange', true, false),
    (NEW.id, 'Transporte',     '🚗', 'blue',   true, false),
    (NEW.id, 'Servicios',      '💡', 'amber',  true, false),
    (NEW.id, 'Entretenimiento','🎬', 'purple', true, false),
    (NEW.id, 'Otros',          '📦', 'teal',   true, true);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error setting up new user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;
