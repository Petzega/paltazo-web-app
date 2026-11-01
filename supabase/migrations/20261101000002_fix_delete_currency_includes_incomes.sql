-- ============================================
-- Fix: deleteCurrencyPurgingData debe eliminar incomes (consistencia de datos)
-- ============================================
-- La función atómica solo eliminaba expenses y budgets, dejando incomes huérfanos
-- en Supabase. Cuando el usuario re-sincronizaba, los incomes reaparecían.
-- Esta migración reemplaza la función para incluir DELETE FROM incomes.

CREATE OR REPLACE FUNCTION delete_currency_purging_data(
  p_user_id UUID,
  p_currency TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Eliminar gastos de la moneda
  DELETE FROM expenses
  WHERE user_id = p_user_id
    AND currency = p_currency;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Eliminar ingresos de la moneda
  DELETE FROM incomes
  WHERE user_id = p_user_id
    AND currency = p_currency;
  
  -- Eliminar presupuesto de la moneda
  DELETE FROM budgets
  WHERE user_id = p_user_id
    AND currency = p_currency;
  
  RETURN v_deleted_count;
END;
$$;
