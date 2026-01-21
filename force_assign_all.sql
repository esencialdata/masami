-- ☢️ SCRIPT NUCLEAR: ASIGNAR TODO A MI USUARIO ACTUAL
-- Este script toma TODOS los ingredientes y clientes que existen en la base de datos
-- y los pone a tu nombre. Úsalo solo si eres el único usuario activo.

BEGIN;

DO $$
DECLARE
    v_my_tenant_id uuid;
BEGIN
    -- 1. Obtener mi Tenant ID real basado en el usuario que ejecuta esto
    SELECT tenant_id INTO v_my_tenant_id
    FROM public.profiles
    WHERE id = auth.uid() OR id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)
    LIMIT 1;

    IF v_my_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No se pudo encontrar tu negocio.';
    END IF;

    RAISE NOTICE '🫡 Asignando todo al Tenant: %', v_my_tenant_id;

    -- 2. Mover TODOS los ingredientes a este Tenant
    UPDATE public.supplies
    SET tenant_id = v_my_tenant_id;

    -- 3. Mover TODOS los clientes a este Tenant
    UPDATE public.customers
    SET tenant_id = v_my_tenant_id;

    RAISE NOTICE '✅ Éxito. Ahora todos los datos te pertenecen.';

END $$;

COMMIT;
