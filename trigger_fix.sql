-- Trigger-based User/Tenant Creation Script
-- Copy and Run this in Supabase SQL Editor

-- 1. Create a function to seed data (Optional but keeps the trigger clean)
create or replace function public.seed_tenant_data(target_tenant_id uuid)
returns void as $$
begin
    insert into public.supplies (tenant_id, name, current_cost, unit, min_alert) values 
    (target_tenant_id, 'Harina de Trigo', 16.50, 'kg', 50),
    (target_tenant_id, 'Azúcar Estándar', 28.00, 'kg', 20),
    (target_tenant_id, 'Huevo (Caja)', 850.00, 'pza', 2),
    (target_tenant_id, 'Leche Entera', 24.50, 'lt', 20),
    (target_tenant_id, 'Mantequilla s/sal', 185.00, 'kg', 10),
    (target_tenant_id, 'Levadura Fresca', 85.00, 'kg', 2),
    (target_tenant_id, 'Sal Refinada', 12.00, 'kg', 5),
    (target_tenant_id, 'Aceite Vegetal', 45.00, 'lt', 10),
    (target_tenant_id, 'Margarina Danés', 65.00, 'kg', 10),
    (target_tenant_id, 'Mejorante Pan', 120.00, 'kg', 1),
    (target_tenant_id, 'Polvo para Hornear', 95.00, 'kg', 2),
    (target_tenant_id, 'Chocolate Semi', 220.00, 'kg', 5),
    (target_tenant_id, 'Cocoa en Polvo', 180.00, 'kg', 2),
    (target_tenant_id, 'Canela Molida', 350.00, 'kg', 1),
    (target_tenant_id, 'Vainilla (Esencia)', 150.00, 'lt', 2),
    (target_tenant_id, 'Mermelada Fresa', 85.00, 'kg', 5),
    (target_tenant_id, 'Queso Crema', 140.00, 'kg', 5),
    (target_tenant_id, 'Jamón de Pavo', 160.00, 'kg', 5),
    (target_tenant_id, 'Queso Manchego', 210.00, 'kg', 5),
    (target_tenant_id, 'Ajonjolí', 110.00, 'kg', 2);
end;
$$ language plpgsql;


-- 2. Create the Trigger Function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_tenant_id uuid;
  meta_business_name text;
  meta_full_name text;
  meta_invite_tenant_id text;
  meta_invite_role text;
begin
  -- Extract values from raw_user_meta_data
  meta_business_name := new.raw_user_meta_data->>'business_name';
  meta_full_name := new.raw_user_meta_data->>'full_name';
  meta_invite_tenant_id := new.raw_user_meta_data->>'invite_tenant_id';
  meta_invite_role := new.raw_user_meta_data->>'invite_role';

  -- Case A: Invitation (Joining existing tenant)
  if meta_invite_tenant_id is not null then
      insert into public.profiles (id, tenant_id, role, full_name)
      values (new.id, meta_invite_tenant_id::uuid, coalesce(meta_invite_role, 'baker'), meta_full_name);
      
  -- Case B: New Owner (Creating new tenant)
  elsif meta_business_name is not null then
      -- 1. Create Tenant
      insert into public.tenants (name) values (meta_business_name) returning id into new_tenant_id;
      
      -- 2. Create Profile
      insert into public.profiles (id, tenant_id, role, full_name)
      values (new.id, new_tenant_id, 'owner', meta_full_name);
      
      -- 3. Seed Data
      perform public.seed_tenant_data(new_tenant_id);
  end if;

  return new;
end;
$$;


-- 3. Attach Trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
