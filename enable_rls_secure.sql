-- ==========================================
-- SCRIPT FINAL DE SEGURIDAD (RLS Fixed)
-- ==========================================

-- Ahora que sabemos que el problema era RLS recursivo, 
-- usamos este script para reactivar la seguridad SIN romper el acceso.

-- 1. Reactivar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 2. Limpiar Políticas Viejas
DROP POLICY IF EXISTS "Ver perfiles del equipo" ON public.profiles;
DROP POLICY IF EXISTS "Ver mi propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Ver equipo" ON public.profiles;
DROP POLICY IF EXISTS "Ver mi tenant" ON public.tenants;

-- 3. SOLUCIÓN: Políticas simples "No Recursivas" para evitar bloqueos
--    Usamos funciones SECURITY DEFINER o lógica simplificada.

-- A) Profiles: Ver tu propia fila es gratis.
CREATE POLICY "Ver mi propio perfil" ON public.profiles
    FOR SELECT USING (id = auth.uid());

-- B) Profiles: Ver compañeros (Sin recursión infinita)
--    En lugar de consultar profiles -> tenant -> profiles,
--    confiamos en que si tienes el mismo tenant_id, puedes verlo.
--    (Para simplificar por ahora y no bloquear, permitimos ver propio profile. 
--     La vista de equipo se refinará después).

-- C) Tenants: Ver tu tenant
--    Buscamos el tenant_id directamete en tu perfil.
CREATE POLICY "Ver mi tenant" ON public.tenants
    FOR SELECT USING (
        id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    );

-- 4. Permisos de Escritura básicos
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
