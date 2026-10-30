-- ============================================
-- PALTAZO - Añadir columnas de onboarding a profiles
-- ============================================
-- Ref: ARCHITECTURE_SPEC.md (ERD), CU-021
-- Depende de: ninguna (independiente)

-- 1. Moneda principal elegida por el usuario en setup inicial
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_currency TEXT;

-- 2. Flag de onboarding completado (default: false)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN NOT NULL DEFAULT false;

-- 3. Migrar datos existentes: copiar currency legacy → primary_currency
UPDATE profiles SET primary_currency = currency WHERE primary_currency IS NULL;

-- 4. Usuarios existentes ya tienen config → marcar onboarding completado
UPDATE profiles SET has_completed_onboarding = true;
