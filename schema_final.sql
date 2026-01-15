-- Enable UUID extension
create extension if not exists "uuid-ossp";

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

-- 3. Data Tables (With tenant_id enforced)

-- Customers Table
create table public.customers (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) not null,
  name text not null,
  phone text,
  zone text,
  category text default 'Nuevo',
  favorite_product text,
  notes text,
  total_orders integer default 0,
  total_purchased numeric(10,2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.customers enable row level security;

-- Supplies (Raw Materials)
create table public.supplies (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) not null,
  name text not null,
  current_cost numeric(10,2) not null,
  unit text default 'kg',
  current_stock numeric(10,3) default 0,
  min_alert numeric(10,3) default 0,
  history jsonb default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.supplies enable row level security;

-- Products Table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) not null,
  name text not null,
  sale_price numeric not null,
  production_cost numeric not null,
  calculated_cost numeric(10,2),
  category text, 
  image_url text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.products enable row level security;

-- Orders Table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) not null,
  client_id uuid references customers(id),
  items jsonb not null default '[]'::jsonb,
  delivery_date timestamp with time zone not null,
  status text check (status in ('PENDIENTE', 'ENTREGADO', 'CANCELADO')) default 'PENDIENTE',
  total_amount numeric not null default 0,
  prepayment numeric default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.orders enable row level security;

-- Transactions (Movements) Table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  type text check (type in ('VENTA', 'GASTO')) not null,
  amount numeric not null,
  description text,
  client_id uuid references customers(id),
  supply_id uuid references supplies(id),
  pedido_id uuid references orders(id),
  payment_method text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.transactions enable row level security;

-- Configuration Table
create table public.configuration (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) not null,
  monthly_fixed_costs numeric default 0,
  monthly_goal numeric default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.configuration enable row level security;

-- Recipes (Engineering)
create table public.recipes (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) not null,
  product_id uuid references products(id),
  supply_id uuid references supplies(id),
  quantity numeric(10,4) not null,
  unit text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.recipes enable row level security;

-- Packaging Inventory Table
create table public.packaging_inventory (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) not null,
  type text not null,
  cost numeric(10,2) default 0,
  current_quantity integer default 0,
  min_alert integer default 10,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.packaging_inventory enable row level security;


-- 4. RLS Policies & Helpers

-- Helper function to get current user's tenant_id
create or replace function get_my_tenant_id()
returns uuid as $$
  select tenant_id from public.profiles where id = auth.uid() limit 1;
$$ language sql security definer;

-- Tenants Policy
create policy "Users can view own tenant" on public.tenants
  for select using (id = get_my_tenant_id());

-- Profiles Policy
create policy "Users can view tenant members" on public.profiles
  for select using (tenant_id = get_my_tenant_id());

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Generic Tenant Isolation Policies
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


-- 5. Role-Based Access (Specific Overrides)

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

-- 6. RPC Function for Onboarding
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
