-- Fix: trigger handle_new_user ahora también inserta en budgets
-- y migra presupuestos pendientes para usuarios existentes

-- Reemplazar trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, monthly_budget, currency)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    1000.00,
    'S/'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.budgets (user_id, currency, monthly_limit)
  VALUES (
    NEW.id,
    'S/',
    1000.00
  )
  ON CONFLICT (user_id, currency) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile/budget for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Migrar presupuestos para usuarios existentes sin budgets
INSERT INTO public.budgets (user_id, currency, monthly_limit)
SELECT id, 'S/', 1000.00
FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.budgets)
ON CONFLICT (user_id, currency) DO NOTHING;
