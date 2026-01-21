-- 🔓 DEBUG: ABRIR LECTURA DE INSUMOS
-- Desactivar temporalmente la política estricta de SELECT para ver si es un problema de permisos.

BEGIN;

-- 1. Eliminar políticas existentes de SELECT en supplies
DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.supplies;
DROP POLICY IF EXISTS "Users can view their own supplies" ON public.supplies;

-- 2. Crear una política "Permisiva" (Solo requiere estar logueado)
CREATE POLICY "Debug: Read All Supplies" ON public.supplies
FOR SELECT
USING (auth.role() = 'authenticated');

COMMIT;
