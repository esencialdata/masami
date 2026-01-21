-- 🚑 SCRIPT DE RESCATE: CREAR PERFILES FALTANTES Y LIMPIAR TENANTS
-- Ejecuta esto para reparar tu usuario actual que "no aparece" en la tabla profiles.

BEGIN;

-- 1. Insertar Perfiles para TODOS los usuarios que existen en Auth pero no en la tabla Profiles
INSERT INTO public.profiles (id, full_name, role)
SELECT 
    au.id, 
    COALESCE(au.raw_user_meta_data->>'full_name', 'Usuario Recuperado'),
    'owner'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 2. Asegurar que TODOS los perfiles tengan un Tenant asignado
-- Si encuentran un perfil sin tenant, crea un tenant nuevo y se lo asigna.
DO $$
DECLARE
    rec RECORD;
    v_new_tenant_id uuid;
BEGIN
    FOR rec IN SELECT * FROM public.profiles WHERE tenant_id IS NULL LOOP
        -- Crear un tenant para este usuario huérfano
        INSERT INTO public.tenants (name, plan_status)
        VALUES ('Panadería de ' || SPLIT_PART(rec.full_name, ' ', 1), 'active')
        RETURNING id INTO v_new_tenant_id;

        -- Asignar el tenant al perfil
        UPDATE public.profiles 
        SET tenant_id = v_new_tenant_id 
        WHERE id = rec.id;
        
        RAISE NOTICE '✅ Perfil reparado para usuario: %. Se le asignó el tenant: %', rec.Full_name, v_new_tenant_id;
    END LOOP;
END $$;

-- 3. REPARAR EL TRIGGER DE CREACIÓN DE USUARIOS (Para el futuro)
-- Esto asegura que el próximo usuario que registres SÍ tenga perfil automáticamente.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_tenant_id uuid;
BEGIN
    -- 1. Crear un Tenant nuevo para el usuario
    INSERT INTO public.tenants (name, plan_status)
    VALUES (
        COALESCE(NEW.raw_user_meta_data->>'business_name', 'Mi Panadería'),
        'trial'
    )
    RETURNING id INTO v_tenant_id;

    -- 2. Crear el Perfil vinculado al Tenant
    INSERT INTO public.profiles (id, full_name, role, tenant_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nuevo Usuario'),
        'owner',
        v_tenant_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-vincular el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;
