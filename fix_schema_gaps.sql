-- ==========================================
-- SCRIPT DE REPARACIÓN: COLUMNAS FALTANTES
-- ==========================================

-- Agrega columnas que pueden faltar en la tabla 'supplies'
-- para que la función de "Seeding" (Ingredientes iniciales) no falle.

DO $$
BEGIN
    -- 1. min_alert
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='supplies' AND column_name='min_alert') THEN
        ALTER TABLE public.supplies ADD COLUMN min_alert numeric(10,3) DEFAULT 0;
    END IF;

    -- 2. unit (por si acaso)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='supplies' AND column_name='unit') THEN
        ALTER TABLE public.supplies ADD COLUMN unit text DEFAULT 'kg';
    END IF;

    -- 3. current_stock (por si acaso se llama diferente)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='supplies' AND column_name='current_stock') THEN
        ALTER TABLE public.supplies ADD COLUMN current_stock numeric(10,3) DEFAULT 0;
    END IF;
END $$;
