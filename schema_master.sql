-- MASTER SCHEMA FOR MASAMI SAAS (Replaces all previous migrations)
-- Run this in Supabase SQL Editor to reset and configure architecture.

-- 1. CLEANUP (Careful: Deletes Data)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.seed_tenant_data(uuid);
drop table if exists public.profiles cascade;
drop table if exists public.tenants cascade;
-- Drop other SaaS tables if they exist to ensure clean slate
drop table if exists public.supplies cascade; 
drop table if exists public.recipes cascade;
-- (Assuming we keep core tables like supplies/recipes but add RLS to them)

-- 2. CREATE TENANTS TABLE
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan_status text check (plan_status in ('trial', 'active', 'expired')) default 'trial',
  trial_ends_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now(),
  currency text default 'MXN'
);

-- 3. CREATE PROFILES TABLE
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  role text check (role in ('owner', 'baker', 'sales')) default 'owner',
  full_name text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 4. ENABLE RLS
alter table public.tenants enable row level security;
alter table public.profiles enable row level security;

-- 4.1 CREATE CORE APP TABLES (Needed for Seeding)
-- Supplies (Inventory)
create table public.supplies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  name text not null,
  unit text not null, -- kg, lt, pza
  current_cost numeric default 0,
  current_stock numeric default 0,
  min_stock_alert numeric default 5,
  category text, -- Secos, Lácteos, etc.
  created_at timestamptz default now()
);

-- Recipes (Products)
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  name text not null,
  sale_price numeric default 0,
  created_at timestamptz default now()
);

-- Enable RLS on new tables
alter table public.supplies enable row level security;
alter table public.recipes enable row level security;

-- 5. RLS POLICIES (Simple & Robust)

-- Supplies: Access Logic
create policy "Tenants manage their own supplies" on public.supplies
  using (tenant_id in (select tenant_id from public.profiles where profiles.id = auth.uid()));

-- Recipes: Access Logic
create policy "Tenants manage their own recipes" on public.recipes
  using (tenant_id in (select tenant_id from public.profiles where profiles.id = auth.uid()));

-- Tenants: Users can view their own tenant
create policy "Users can view own tenant" on public.tenants
  for select using (id in (select tenant_id from public.profiles where profiles.id = auth.uid()));

-- Profiles: Users can view profiles in their same tenant
create policy "Users can view tenant members" on public.profiles
  for select using (tenant_id in (select tenant_id from public.profiles where id = auth.uid()));

-- Profiles: Users can always see themselves (Bootstrap policy)
create policy "Users can see self" on public.profiles
  for select using (id = auth.uid());

-- 6. RPC: SEED DATA (The "Magic" Step)
create or replace function public.seed_tenant_data(target_tenant_id uuid)
returns void as $$
begin
  -- Insert 20 Basic Ingredients
  insert into public.supplies (tenant_id, name, unit, current_cost, current_stock, min_stock_alert, category)
  values
    (target_tenant_id, 'Harina de Trigo', 'kg', 18.50, 50, 10, 'Secos'),
    (target_tenant_id, 'Azúcar Estándar', 'kg', 24.00, 20, 5, 'Secos'),
    (target_tenant_id, 'Sal Refinada', 'kg', 10.00, 5, 1, 'Secos'),
    (target_tenant_id, 'Levadura Fresca', 'kg', 85.00, 2, 0.5, 'Refrigerados'),
    (target_tenant_id, 'Huevo Blanco', 'kg', 42.00, 15, 3, 'Frescos'),
    (target_tenant_id, 'Leche Entera', 'lt', 22.00, 20, 5, 'Lácteos'),
    (target_tenant_id, 'Mantequilla s/sal', 'kg', 120.00, 10, 2, 'Lácteos'),
    (target_tenant_id, 'Aceite Vegetal', 'lt', 35.00, 20, 5, 'Grasas'),
    (target_tenant_id, 'Vainilla (Esencia)', 'lt', 150.00, 1, 0.2, 'Esencias'),
    (target_tenant_id, 'Polvo para Hornear', 'kg', 60.00, 2, 0.5, 'Secos'),
    (target_tenant_id, 'Cocoa en Polvo', 'kg', 180.00, 3, 1, 'Secos'),
    (target_tenant_id, 'Chocolate Semiamargo', 'kg', 220.00, 5, 2, 'Secos'),
    (target_tenant_id, 'Canela Molida', 'kg', 350.00, 0.5, 0.1, 'Especias'),
    (target_tenant_id, 'Azúcar Glass', 'kg', 38.00, 5, 1, 'Secos'),
    (target_tenant_id, 'Mermelada de Fresa', 'kg', 65.00, 4, 1, 'Rellenos'),
    (target_tenant_id, 'Crema para Batir', 'lt', 75.00, 10, 2, 'Lácteos'),
    (target_tenant_id, 'Nuez Pecana', 'kg', 320.00, 2, 0.5, 'Frutos Secos'),
    (target_tenant_id, 'Almendra Fileteada', 'kg', 290.00, 2, 0.5, 'Frutos Secos'),
    (target_tenant_id, 'Harina Integral', 'kg', 22.00, 10, 2, 'Secos'),
    (target_tenant_id, 'Salvado de Trigo', 'kg', 15.00, 5, 1, 'Secos');

    -- Optional: Insert Packaging or other defaults here
end;
$$ language plpgsql security definer;

-- 7. TRIGGER: HANDLE NEW USER (Onboarding Flow)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_tenant_id uuid;
  invited_tenant_id uuid;
begin
  -- A. Check if user was invited (invited_tenant_id in metadata)
  invited_tenant_id := (new.raw_user_meta_data->>'tenant_id')::uuid;

  if invited_tenant_id is not null then
    -- FLOW 1: INVITED USER (Join existing team)
    insert into public.profiles (id, tenant_id, role, full_name)
    values (
      new.id, 
      invited_tenant_id, 
      coalesce((new.raw_user_meta_data->>'role')::text, 'baker'), -- Default to baker if not specified
      new.raw_user_meta_data->>'full_name'
    );
  else
    -- FLOW 2: NEW OWNER (Wizard Logic)
    -- Create Tenant
    insert into public.tenants (name, plan_status)
    values (
      coalesce(new.raw_user_meta_data->>'business_name', 'Mi Panadería'),
      'trial'
    ) returning id into new_tenant_id;

    -- Create Profile (Owner)
    insert into public.profiles (id, tenant_id, role, full_name)
    values (
      new.id, 
      new_tenant_id, 
      'owner', 
      new.raw_user_meta_data->>'full_name'
    );

    -- Seed Data
    perform public.seed_tenant_data(new_tenant_id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Attach Trigger to Auth
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- FINAL: Grant Permissions (Ensure Authenticated users can use sequences etc)
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
