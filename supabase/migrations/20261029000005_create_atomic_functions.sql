-- Función atómica para eliminar categoría reasignando gastos a "Otros" (CU-026)
-- Garantiza que si falla el UPDATE, no se borre la categoría dejando gastos huérfanos
CREATE OR REPLACE FUNCTION delete_category_reassigning_expenses(
  p_category_id UUID,
  p_user_id UUID,
  p_otros_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Reasignar gastos a "Otros"
  UPDATE expenses
  SET category_id = p_otros_id
  WHERE category_id = p_category_id
    AND user_id = p_user_id;
  
  -- Eliminar categoría
  DELETE FROM categories
  WHERE id = p_category_id
    AND user_id = p_user_id;
END;
$$;

-- Función atómica para eliminar moneda con purga de datos (CU-023)
-- Garantiza que si falla DELETE de expenses, no se borre el budget
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
  
  -- Eliminar presupuesto de la moneda
  DELETE FROM budgets
  WHERE user_id = p_user_id
    AND currency = p_currency;
  
  RETURN v_deleted_count;
END;
$$;
