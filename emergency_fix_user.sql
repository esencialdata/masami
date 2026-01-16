-- EMERGENCY MANUAL FIX FOR USER: aaronesmont@gmail.com
-- Run this in Supabase SQL Editor

DO $$
DECLARE
    target_user_id uuid := '9effa843-4d44-4d4e-9b9c-36ffb2b4c92b'; -- ID extracted from your token
    new_tenant_id uuid;
BEGIN
    -- 1. Create Tenant "Dalton Waffle"
    INSERT INTO public.tenants (name) 
    VALUES ('Dalton Waffle') 
    RETURNING id INTO new_tenant_id;

    -- 2. Create Profile linked to User and Tenant
    INSERT INTO public.profiles (id, tenant_id, role, full_name)
    VALUES (target_user_id, new_tenant_id, 'owner', 'Aaron Espinosa')
    ON CONFLICT (id) DO NOTHING; -- Safety check

    -- 3. Seed Ingredients
    PERFORM public.seed_tenant_data(new_tenant_id);

    RAISE NOTICE 'Manual Fix Completed for User %', target_user_id;
END $$;
