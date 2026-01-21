-- ==========================================
-- SCRIPT DE DEBUGGING: DESACTIVAR RLS
-- ==========================================

-- CUIDADO: Esto hace que los datos sean públicos temporalmente.
-- Lo usamos SOLO para ver si el problema es de permisos.

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;

-- Si esto soluciona el problema, sabremos que el error estaba en las Políticas.
-- Después las volveremos a activar y corregir.
