-- FIX REGISTRATION V2: ROBUST AUTOMATIC ONBOARDING
-- Run this script in the Supabase SQL Editor

-- 1. DROP old Triggers/Functions to ensure clean slate
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 2. CREATE Robust Trigger Function (Security Definer = Admin Privileges)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_tenant_id uuid;
  meta_business_name text;
  meta_full_name text;
begin
  -- Log start
  raise log 'Trigger V2 started for user_id: %', new.id;

  -- Extract Metadata
  meta_business_name := new.raw_user_meta_data->>'business_name';
  meta_full_name := new.raw_user_meta_data->>'full_name';

  -- Default business name if missing (Fallback)
  if meta_business_name is null or meta_business_name = '' then
      meta_business_name := 'Mi Panadería';
  end if;

  -- 1. Create Tenant
  insert into public.tenants (name)
  values (meta_business_name)
  returning id into new_tenant_id;

  raise log 'Tenant created: % (ID: %)', meta_business_name, new_tenant_id;

  -- 2. Create Profile (Linked to User & Tenant)
  -- Uses ON CONFLICT just in case, but shouldn't happen on new user
  insert into public.profiles (id, tenant_id, role, full_name)
  values (new.id, new_tenant_id, 'owner', meta_full_name)
  on conflict (id) do nothing;

  raise log 'Profile created for user: %', new.id;

  -- 3. Seed Data (Ingredients) - Reuse existing function
  -- Ensure seed_tenant_data is also security definer (it should be)
  perform public.seed_tenant_data(new_tenant_id);

  raise log 'Seeding completed for tenant: %', new_tenant_id;

  return new;
exception
  when others then
    -- LOG ERROR but DO NOT FAIL the transaction (allows user creation to succeed)
    -- If this fails, the user exists but has no profile.
    -- The "Failsafe" in App.jsx can still catch this remote edge case.
    raise log 'CRITICAL ERROR in handle_new_user: %', SQLERRM;
    return new;
end;
$$ language plpgsql security definer; -- CRITICAL: Bypass RLS

-- 3. RE-ATTACH Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. VERIFY Seed Function is also Secure
create or replace function public.seed_tenant_data(target_tenant_id uuid)
returns void as $$
begin
  -- Insert Standard Supplies
  insert into public.supplies (tenant_id, name, unit, cost, provider, last_updated)
  values 
    (target_tenant_id, 'Harina de Trigo', 'kg', 18.50, 'Proveedor Local', now()),
    (target_tenant_id, 'Azúcar Estándar', 'kg', 24.00, 'Central de Abastos', now()),
    (target_tenant_id, 'Huevo Blanco', 'kg', 38.00, 'Granja San Juan', now()),
    (target_tenant_id, 'Mantequilla sin Sal', 'kg', 180.00, 'Cremería Los Altos', now()),
    (target_tenant_id, 'Levadura Fresca', 'kg', 45.00, 'Proveedor Local', now()),
    (target_tenant_id, 'Sal Refinada', 'kg', 8.00, 'Supermercado', now()),
    (target_tenant_id, 'Leche Entera', 'l', 22.00, 'Lala', now()),
    (target_tenant_id, 'Aceite Vegetal', 'l', 35.00, '1-2-3', now()),
    (target_tenant_id, 'Vainilla', 'l', 150.00, 'Molina', now()),
    (target_tenant_id, 'Polvo para Hornear', 'kg', 60.00, 'Royal', now())
  on conflict do nothing;
end;
$$ language plpgsql security definer;
