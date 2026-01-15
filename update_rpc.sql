-- Run this script in Supabase SQL Editor to fix the registration error.
-- It only updates the function, it does NOT create tables.

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
  
  return new_tenant_id;
end;
$$ language plpgsql security definer;
