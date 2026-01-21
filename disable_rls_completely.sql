-- ==========================================
-- SCRIPT DE EMERGENCIA: DESACTIVAR RLS TOTALMENTE
-- ==========================================

-- Si el script anterior no funcionó, vamos a apagar la seguridad por completo
-- temporalmente para ver si la app responde.

-- 1. Desactivar RLS en perfiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Desactivar RLS en tenants
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;

-- 3. Notificar recarga
NOTIFY pgrst, 'reload config';
