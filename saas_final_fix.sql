-- ==========================================
-- SCRIPT DE REPARACIÓN FINAL (SaaS Wizard Fix)
-- ==========================================

-- Este script corrige TODOS los puntos posibles que hacen fallar el Wizard.
-- Corre esto y el problema de "se regresa al inicio" debería desaparecer.

-- 1. ASEGURAR COLUMNA TENANT_ID EN CONFIGURACIÓN (Causa muy probable de error)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='configuration' AND column_name='tenant_id') THEN
        ALTER TABLE public.configuration ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
    END IF;
END $$;

-- 2. ASEGURAR COLUMNAS EN SUPPLIES (Por si acaso falló el script anterior)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='supplies' AND column_name='min_alert') THEN
        ALTER TABLE public.supplies ADD COLUMN min_alert numeric(10,3) DEFAULT 0;
    END IF;
END $$;

-- 3. ACTUALIZAR FUNCIÓN DE SEEDING (Hacerla a prueba de balas)
CREATE OR REPLACE FUNCTION public.seed_tenant_data(target_tenant_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Insertar Ingredientes Básicos (Solo si no existen)
    INSERT INTO public.supplies (name, current_cost, unit, current_stock, min_alert, tenant_id) 
    SELECT * FROM (VALUES 
        ('Harina de Trigo', 18.50, 'kg', 0::numeric, 50::numeric, target_tenant_id),
        ('Azúcar Estándar', 22.00, 'kg', 0::numeric, 20::numeric, target_tenant_id),
        ('Sal Yodatada', 12.00, 'kg', 0::numeric, 5::numeric, target_tenant_id),
        ('Huevo Blanco', 45.00, 'kg', 0::numeric, 15::numeric, target_tenant_id),
        ('Leche Entera', 24.00, 'lt', 0::numeric, 20::numeric, target_tenant_id),
        ('Mantequilla s/sal', 180.00, 'kg', 0::numeric, 10::numeric, target_tenant_id),
        ('Levadura Fresca', 65.00, 'kg', 0::numeric, 2::numeric, target_tenant_id),
        ('Levadura Seca', 120.00, 'kg', 0::numeric, 2::numeric, target_tenant_id),
        ('Agua Purificada', 15.00, 'lt', 0::numeric, 100::numeric, target_tenant_id),
        ('Aceite Vegetal', 35.00, 'lt', 0::numeric, 20::numeric, target_tenant_id)
    ) AS t(name, cost, unit, stock, min_alert, tid)
    WHERE NOT EXISTS (SELECT 1 FROM public.supplies WHERE tenant_id = target_tenant_id);

    -- Insertar Configuración Inicial (Manejando conflicto)
    INSERT INTO public.configuration (monthly_fixed_costs, monthly_goal, tenant_id)
    VALUES (15000, 50000, target_tenant_id)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. ACTUALIZAR FUNCIÓN DE CREACIÓN DEL WIZARD (Más robusta con metadata)
CREATE OR REPLACE FUNCTION public.create_tenant_with_owner(
    business_name TEXT
)
RETURNS JSON AS $$
DECLARE
    new_tenant_id UUID;
    new_profile_id UUID;
    v_full_name TEXT;
    v_email TEXT;
BEGIN
    -- Obtener datos del usuario de forma segura con valores por defecto
    SELECT 
        COALESCE(raw_user_meta_data->>'full_name', 'Chef'),
        email 
    INTO v_full_name, v_email
    FROM auth.users 
    WHERE id = auth.uid();

    -- 1. Crear Tenant
    INSERT INTO public.tenants (name, plan_status, trial_ends_at)
    VALUES (business_name, 'trial', now() + interval '7 days')
    RETURNING id INTO new_tenant_id;

    -- 2. Crear/Vincular Profile
    INSERT INTO public.profiles (id, tenant_id, role, full_name, email)
    VALUES (
        auth.uid(),
        new_tenant_id,
        'owner',
        v_full_name,
        v_email
    )
    ON CONFLICT (id) DO UPDATE 
    SET tenant_id = new_tenant_id, role = 'owner';

    -- 3. Seed Data (Envuelto en bloque para que no tire error si falla, por seguridad)
    BEGIN
        PERFORM public.seed_tenant_data(new_tenant_id);
    EXCEPTION WHEN OTHERS THEN
        -- Si falla el seeding, logueamos pero NO abortamos la creación del usuario
        RAISE WARNING 'Error durante el seeding: %', SQLERRM;
    END;

    RETURN json_build_object(
        'tenant_id', new_tenant_id,
        'business_name', business_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. REFRESCAR PERMISOS
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
