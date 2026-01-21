-- ==========================================
-- SCRIPT DE REPARACIÓN RLS (Permisos de Lectura)
-- ==========================================

-- El problema "¡EXITO! -> Loop" sucede porque aunque se crean los datos,
-- la App no tiene permiso para LEERLOS inmediatamente después.
-- Este script simplifica las reglas de seguridad al mínimo funcional.

-- 1. Desbloquear Lectura de Perfiles
DROP POLICY IF EXISTS "Ver perfiles del equipo" ON public.profiles;
DROP POLICY IF EXISTS "Ver mi propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Owner edita equipo" ON public.profiles;
DROP POLICY IF EXISTS "Usuario edita su perfil" ON public.profiles;

-- Regla de Oro: Un usuario SIEMPRE puede ver su propio perfil
CREATE POLICY "Ver mi propio perfil" ON public.profiles
    FOR SELECT USING (id = auth.uid());

-- Regla de Plata: Un usuario puede ver a otros del mismo Tenant
CREATE POLICY "Ver equipo" ON public.profiles
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- 2. Desbloquear Lectura de Tenants (Negocios)
DROP POLICY IF EXISTS "Ver mi tenant" ON public.tenants;

CREATE POLICY "Ver mi tenant" ON public.tenants
    FOR SELECT USING (
        id IN (
            SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- 3. Forzar refresco de caché de esquemas (a veces Supabase se marea)
NOTIFY pgrst, 'reload config';
