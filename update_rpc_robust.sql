-- Helper to update RPC to include seeding
-- Run this if you plan to use use the Manual Setup button in the App

create or replace function create_tenant_and_owner(tenant_name text, owner_id uuid default auth.uid())
returns uuid as $$
declare
  new_tenant_id uuid;
begin
  -- Validation
  if owner_id is null then
    raise exception 'User ID is required';
  end if;

  -- 1. Create Tenant
  insert into public.tenants (name) values (tenant_name) returning id into new_tenant_id;
  
  -- 2. Create Profile for calling user
  insert into public.profiles (id, tenant_id, role)
  values (owner_id, new_tenant_id, 'owner');
  
  -- 3. Seed Data (Reusing the function from trigger_fix.sql)
  --    If seed_tenant_data doesn't exist, this will fail. Run trigger_fix.sql first!
  perform public.seed_tenant_data(new_tenant_id);

  return new_tenant_id;
end;
$$ language plpgsql security definer;
