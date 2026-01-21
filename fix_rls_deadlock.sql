-- ==========================================
-- SCRIPT ANTI-BLOQUEO (RLS Deadlock Fix)
-- ==========================================

-- El "Cargando..." infinito suele ser porque la base de datos entró en un bucle
-- verificando permisos (Permiso A pide B, B pide A...).
-- Solución: Usar una "Función de Sistema" para romper el bucle.

-- 1. Función Helper que se salta las reglas (SECURITY DEFINER)
--    Solo busca el ID del tenant del usuario actual.
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Aplicar la Regla usando la Función
DROP POLICY IF EXISTS "Ver mi tenant" ON public.tenants;

CREATE POLICY "Ver mi tenant" ON public.tenants
    FOR SELECT USING (
        id = public.get_my_tenant_id()
    );

-- 3. Asegurar acceso a perfiles
DROP POLICY IF EXISTS "Ver mi propio perfil" ON public.profiles;
CREATE POLICY "Ver mi propio perfil" ON public.profiles
    FOR SELECT USING (id = auth.uid());

-- 4. Refrescar esquema
NOTIFY pgrst, 'reload config';
