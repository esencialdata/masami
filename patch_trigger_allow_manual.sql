-- 🔧 PATCH TRIGGER: PERMITIR INSERCIONES MANUALES (ADMIN/SEED)
-- Modifica el trigger para que NO bloquee si ya se está enviando un tenant_id válido.

BEGIN;

CREATE OR REPLACE FUNCTION public.auto_assign_tenant()
RETURNS TRIGGER AS $$
DECLARE
    v_tenant_id uuid;
BEGIN
    -- 1. SI YA VIENE UN TENANT_ID (Ej. Script de admin o seed), LO RESPETAMOS Y SALIMOS
    IF NEW.tenant_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    -- 2. Buscar mi tenant_id en mi perfil (Flujo normal de App)
    SELECT tenant_id INTO v_tenant_id
    FROM public.profiles
    WHERE id = auth.uid();

    -- 3. Si no tengo perfil/tenant, intentar fallback (o error)
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION '❌ Error Crítico: Tu usuario no tiene un Negocio asignado en su perfil.';
    END IF;

    -- 4. Asignar el ID al nuevo registro
    NEW.tenant_id := v_tenant_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
