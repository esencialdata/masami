-- Enable RLS on all tables
-- 1. Tenants Table (The "Organization")
create table public.tenants (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  plan_status text check (plan_status in ('trial', 'active', 'expired')) default 'trial',
  trial_ends_at timestamp with time zone default (now() + interval '7 days'),
  currency text default 'MXN',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tenants enable row level security;

-- 2. Profiles Table (The "User" inside a Tenant)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  role text check (role in ('owner', 'baker', 'sales')) default 'owner',
  full_name text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- 3. Add tenant_id to ALL existing tables
-- Customers
alter table public.customers add column tenant_id uuid references public.tenants(id);
alter table public.customers enable row level security;

-- Products
alter table public.products add column tenant_id uuid references public.tenants(id);
alter table public.products enable row level security;

-- Supplies
alter table public.supplies add column tenant_id uuid references public.tenants(id);
alter table public.supplies enable row level security;

-- Transactions
alter table public.transactions add column tenant_id uuid references public.tenants(id);
alter table public.transactions enable row level security;

-- Configuration
alter table public.configuration add column tenant_id uuid references public.tenants(id);
alter table public.configuration enable row level security;

-- Orders
alter table public.orders add column tenant_id uuid references public.tenants(id);
alter table public.orders enable row level security;

-- Recipes (Indirectly linked via products/supplies, but safer to have tenant_id)
alter table public.recipes add column tenant_id uuid references public.tenants(id);
alter table public.recipes enable row level security;

-- Packaging Inventory
alter table public.packaging_inventory add column tenant_id uuid references public.tenants(id);
alter table public.packaging_inventory enable row level security;


-- 4. RLS Policies

-- Helper function to get current user's tenant_id
create or replace function get_my_tenant_id()
returns uuid as $$
  select tenant_id from public.profiles where id = auth.uid() limit 1;
$$ language sql security definer;

-- Tenants Policy
-- Users can see their own tenant
create policy "Users can view own tenant" on public.tenants
  for select using (id = get_my_tenant_id());

-- Profiles Policy
-- Users can view profiles in their same tenant
create policy "Users can view tenant members" on public.profiles
  for select using (tenant_id = get_my_tenant_id());

-- Allow users to insert their *own* profile during signup (if not exists)
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- 5. Generic Tenant Isolation Policies for Data Tables

-- Customers
create policy "Tenant Isolation Customers" on public.customers
  for all using (tenant_id = get_my_tenant_id())
  with check (tenant_id = get_my_tenant_id());

-- Products
create policy "Tenant Isolation Products" on public.products
  for all using (tenant_id = get_my_tenant_id())
  with check (tenant_id = get_my_tenant_id());

-- Supplies
create policy "Tenant Isolation Supplies" on public.supplies
  for all using (tenant_id = get_my_tenant_id())
  with check (tenant_id = get_my_tenant_id());

-- Transactions
create policy "Tenant Isolation Transactions" on public.transactions
  for all using (tenant_id = get_my_tenant_id())
  with check (tenant_id = get_my_tenant_id());

-- Configuration
create policy "Tenant Isolation Configuration" on public.configuration
  for all using (tenant_id = get_my_tenant_id())
  with check (tenant_id = get_my_tenant_id());

-- Orders
create policy "Tenant Isolation Orders" on public.orders
  for all using (tenant_id = get_my_tenant_id())
  with check (tenant_id = get_my_tenant_id());

-- Recipes
create policy "Tenant Isolation Recipes" on public.recipes
  for all using (tenant_id = get_my_tenant_id())
  with check (tenant_id = get_my_tenant_id());

-- Packaging
create policy "Tenant Isolation Packaging" on public.packaging_inventory
  for all using (tenant_id = get_my_tenant_id())
  with check (tenant_id = get_my_tenant_id());


-- 6. Role-Based Access (Specific Overrides)

-- 'Baker' cannot see Transactions or Configuration (Financials)
create policy "Baker RESTRICT Transactions" on public.transactions
  for select using (
    tenant_id = get_my_tenant_id() 
    AND 
    exists (select 1 from public.profiles where id = auth.uid() and role != 'baker')
  );

create policy "Baker RESTRICT Config" on public.configuration
  for select using (
    tenant_id = get_my_tenant_id() 
    AND 
    exists (select 1 from public.profiles where id = auth.uid() and role != 'baker')
  );

-- 'Sales' cannot see Recipes
create policy "Sales RESTRICT Recipes" on public.recipes
  for select using (
    tenant_id = get_my_tenant_id() 
    AND 
    exists (select 1 from public.profiles where id = auth.uid() and role != 'sales')
  );

-- 7. Onboarding Triggers (Optional but recommended)
-- Function to handle new tenant creation: The user creates a tenant via API, and we might need to link them.
-- But standard flow is: Frontend calls RPC 'create_tenant(name)' -> Function creates tenant + link profile.

create or replace function create_tenant_and_owner(tenant_name text)
returns uuid as $$
declare
  new_tenant_id uuid;
begin
  -- 1. Create Tenant
  insert into public.tenants (name) values (tenant_name) returning id into new_tenant_id;
  
  -- 2. Create Profile for calling user
  insert into public.profiles (id, tenant_id, role)
  values (auth.uid(), new_tenant_id, 'owner');
  
  return new_tenant_id;
end;
$$ language plpgsql security definer;
