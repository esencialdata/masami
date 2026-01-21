-- ==========================================
-- SCRIPT DE REPARACIÓN: COLUMNA EMAIL
-- ==========================================

-- Parece que la tabla 'profiles' ya existía de antes y le faltaba la columna 'email'.
-- Este script se asegura de agregarla.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
END $$;
