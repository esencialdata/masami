-- 🔗 FIX: RELACIÓN DE RECETAS
-- Agrega la Foreign Key faltante para que Supabase pueda hacer joins.

BEGIN;

-- 1. Asegurar que la columna sea del tipo correcto
ALTER TABLE public.recipes 
ALTER COLUMN supply_id TYPE uuid USING supply_id::uuid;

-- 2. Agregar la restricción de llave foránea explícita
ALTER TABLE public.recipes
DROP CONSTRAINT IF EXISTS fk_recipes_supplies;

ALTER TABLE public.recipes
ADD CONSTRAINT fk_recipes_supplies
FOREIGN KEY (supply_id)
REFERENCES public.supplies(id)
ON DELETE RESTRICT;

-- 3. Recargar el caché de esquema (esto se hace solo, pero por si acaso)
NOTIFY pgrst, 'reload schema';

COMMIT;
