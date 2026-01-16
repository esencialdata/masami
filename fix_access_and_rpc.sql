-- FIX ACCESS AND RPC: Ensure Profile Visibility and Update RPC Signature
-- Run this script in Supabase SQL Editor

-- 1. FIX RLS VISIBILITY
-- Add a simple policy so users can ALWAYS see their own profile row
drop policy if exists "Users can see own profile" on public.profiles;
create policy "Users can see own profile" on public.profiles
  for select using (auth.uid() = id);

-- 2. UPDATE RPC FUNCTION TO MATCH APP.JSX
-- The frontend sends { tenant_name, owner_id }, so we must accept owner_id (even if we ignore it or use auth.uid)
create or replace function public.create_tenant_and_owner(tenant_name text, owner_id uuid default null)
returns uuid as $$
declare
  new_tenant_id uuid;
  target_user_id uuid;
begin
  -- Use provided owner_id or default to auth.uid()
  target_user_id := coalesce(owner_id, auth.uid());

  -- 1. Create Tenant
  insert into public.tenants (name) values (tenant_name) returning id into new_tenant_id;
  
  -- 2. Create Profile
  insert into public.profiles (id, tenant_id, role, full_name)
  values (target_user_id, new_tenant_id, 'owner', 'Dueño del Negocio') -- Default name if unknown
  on conflict (id) do nothing; -- Idempotency
  
  -- 3. Seed Data
  perform public.seed_tenant_data(new_tenant_id);
  
  return new_tenant_id;
end;
$$ language plpgsql security definer;
