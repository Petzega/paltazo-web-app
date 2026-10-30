-- Índices compuestos para optimizar queries agregadas en expenses
CREATE INDEX IF NOT EXISTS idx_expenses_user_currency
  ON expenses (user_id, currency);

CREATE INDEX IF NOT EXISTS idx_expenses_user_category
  ON expenses (user_id, category_id);
