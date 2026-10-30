-- Migración completa: transacciones atómicas, índices y push subscriptions
-- Aplicar en una sola transacción

BEGIN;

-- Función atómica para eliminar categoría reasignando gastos a "Otros" (CU-026)
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
  UPDATE expenses
  SET category_id = p_otros_id
  WHERE category_id = p_category_id
    AND user_id = p_user_id;
  
  DELETE FROM categories
  WHERE id = p_category_id
    AND user_id = p_user_id;
END;
$$;

-- Función atómica para eliminar moneda con purga de datos (CU-023)
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
  DELETE FROM expenses
  WHERE user_id = p_user_id
    AND currency = p_currency;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  DELETE FROM budgets
  WHERE user_id = p_user_id
    AND currency = p_currency;
  
  RETURN v_deleted_count;
END;
$$;

-- Índices compuestos para optimizar queries
CREATE INDEX IF NOT EXISTS idx_expenses_user_currency
  ON expenses (user_id, currency);

CREATE INDEX IF NOT EXISTS idx_expenses_user_category
  ON expenses (user_id, category_id);

-- Tabla de suscripciones push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON push_subscriptions (user_id);

COMMIT;
