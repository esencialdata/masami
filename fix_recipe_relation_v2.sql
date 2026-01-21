-- 🔗 FIX: RELACIÓN DE RECETAS (CORREGIDO)
-- Si la columna "supply_id" no existe, es posible que se llame "ingredient_id" o similar,
-- o simplemente no se ha creado. Vamos a verificar y corregir.

BEGIN;

-- 1. Intentar renombrar ingredient_id a supply_id si existe (caso común de migración)
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='recipes' AND column_name='ingredient_id')
  THEN
      ALTER TABLE public.recipes RENAME COLUMN ingredient_id TO supply_id;
  END IF;
END $$;

-- 2. Si definitivamente no existe, la creamos.
DO $$
BEGIN
  IF NOT EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='recipes' AND column_name='supply_id')
  THEN
      ALTER TABLE public.recipes ADD COLUMN supply_id uuid;
  END IF;
END $$;

-- 3. Ahora sí, aseguramos el tipo y la restricción
ALTER TABLE public.recipes 
ALTER COLUMN supply_id TYPE uuid USING supply_id::uuid;

-- 4. Agregar la restricción de llave foránea explícita
ALTER TABLE public.recipes
DROP CONSTRAINT IF EXISTS fk_recipes_supplies;

ALTER TABLE public.recipes
ADD CONSTRAINT fk_recipes_supplies
FOREIGN KEY (supply_id)
REFERENCES public.supplies(id)
ON DELETE RESTRICT;

-- 5. Recargar caché
NOTIFY pgrst, 'reload schema';

COMMIT;
