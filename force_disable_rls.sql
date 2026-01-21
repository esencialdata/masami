-- ==========================================
-- SCRIPT: APAGADO TOTAL DE SEGURIDAD (RLS)
-- ==========================================
-- Instrucciones:
-- 1. Dale "Run".
-- 2. Si ves "SUCCESS" en los resultados, la base de datos ya es pública.

BEGIN;

-- 1. Desactivar RLS en TODAS las tablas críticas
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.packaging_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- 2. Verificar estado (Debería salir todo en 'false')
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

COMMIT;
