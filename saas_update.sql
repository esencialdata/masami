CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS & TYPES
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_status_enum') THEN
        CREATE TYPE plan_status_enum AS ENUM ('trial', 'active', 'expired');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('owner', 'baker', 'sales');
    END IF;
END $$;

-- 2. TABLA TENANTS (Negocios)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    plan_status plan_status_enum DEFAULT 'trial',
    trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
    currency TEXT DEFAULT 'MXN',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABLA PROFILES (Usuarios vinculados a Negocios)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id),
    role user_role_enum DEFAULT 'owner',
    full_name TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS RLS (Seguridad)

-- Tenants: Solo ver tu propio tenant
DROP POLICY IF EXISTS "Ver mi tenant" ON public.tenants;
CREATE POLICY "Ver mi tenant" ON public.tenants
    FOR SELECT USING (
        id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    );

-- Profiles: Ver tu propio perfil y el de tus compañeros de equipo
DROP POLICY IF EXISTS "Ver perfiles del equipo" ON public.profiles;
CREATE POLICY "Ver perfiles del equipo" ON public.profiles
    FOR SELECT USING (
        -- Puedes ver tu propio perfil
        id = auth.uid() 
        OR 
        -- O puedes ver perfiles que tengan tu mismo tenant_id
        tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    );

-- Profiles: Solo el Owner puede editar otros perfiles (básico)
DROP POLICY IF EXISTS "Owner edita equipo" ON public.profiles;
CREATE POLICY "Owner edita equipo" ON public.profiles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner' AND tenant_id = public.profiles.tenant_id)
    );
CREATE POLICY "Usuario edita su perfil" ON public.profiles
    FOR UPDATE USING (id = auth.uid());


-- 5. FUNCTION: SEED DATA (Ingredientes Básicos)
CREATE OR REPLACE FUNCTION public.seed_tenant_data(target_tenant_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Insertar Ingredientes Básicos
    INSERT INTO public.supplies (name, current_cost, unit, current_stock, min_alert, tenant_id) VALUES
    ('Harina de Trigo', 18.50, 'kg', 0, 50, target_tenant_id),
    ('Azúcar Estándar', 22.00, 'kg', 0, 20, target_tenant_id),
    ('Sal Yodatada', 12.00, 'kg', 0, 5, target_tenant_id),
    ('Huevo Blanco', 45.00, 'kg', 0, 15, target_tenant_id),
    ('Leche Entera', 24.00, 'lt', 0, 20, target_tenant_id),
    ('Mantequilla s/sal', 180.00, 'kg', 0, 10, target_tenant_id),
    ('Levadura Fresca', 65.00, 'kg', 0, 2, target_tenant_id),
    ('Levadura Seca', 120.00, 'kg', 0, 2, target_tenant_id),
    ('Agua Purificada', 15.00, 'lt', 0, 100, target_tenant_id),
    ('Aceite Vegetal', 35.00, 'lt', 0, 20, target_tenant_id),
    ('Vainilla', 150.00, 'lt', 0, 1, target_tenant_id),
    ('Chocolate Semi-amargo', 140.00, 'kg', 0, 5, target_tenant_id),
    ('Cocoa en Polvo', 160.00, 'kg', 0, 3, target_tenant_id),
    ('Canela Molida', 250.00, 'kg', 0, 1, target_tenant_id),
    ('Polvo para Hornear', 80.00, 'kg', 0, 2, target_tenant_id),
    ('Mermelada de Fresa', 60.00, 'kg', 0, 5, target_tenant_id),
    ('Crema para Batir', 95.00, 'lt', 0, 5, target_tenant_id),
    ('Queso Crema', 110.00, 'kg', 0, 5, target_tenant_id),
    ('Ate de Membrillo', 70.00, 'kg', 0, 5, target_tenant_id),
    ('Nuez Pecana', 320.00, 'kg', 0, 2, target_tenant_id);

    -- Insertar Configuración Inicial
    INSERT INTO public.configuration (monthly_fixed_costs, monthly_goal, tenant_id)
    VALUES (15000, 50000, target_tenant_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. FUNCTION: CREATE TENANT WITH OWNER (Onboarding Wizard)
CREATE OR REPLACE FUNCTION public.create_tenant_with_owner(
    business_name TEXT
)
RETURNS JSON AS $$
DECLARE
    new_tenant_id UUID;
    new_profile_id UUID;
BEGIN
    -- 1. Crear Tenant
    INSERT INTO public.tenants (name, plan_status, trial_ends_at)
    VALUES (business_name, 'trial', now() + interval '7 days')
    RETURNING id INTO new_tenant_id;

    -- 2. Crear/Vincular Profile para el usuario actual
    -- Nota: auth.uid() devuelve el ID del usuario que llama la función
    INSERT INTO public.profiles (id, tenant_id, role, full_name, email)
    VALUES (
        auth.uid(),
        new_tenant_id,
        'owner',
        (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = auth.uid()),
        (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    ON CONFLICT (id) DO UPDATE 
    SET tenant_id = new_tenant_id, role = 'owner'; -- Si ya existía, lo movemos (edge case)

    -- 3. Seed Data
    PERFORM public.seed_tenant_data(new_tenant_id);

    RETURN json_build_object(
        'tenant_id', new_tenant_id,
        'business_name', business_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
