-- ============================================
-- PALTAZO - Agregar currency a expenses
-- ============================================

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'S/';
