-- FIX CASCADE DELETE: Allow deleting tenants and cascading to all data
-- Run this script in Supabase SQL Editor

-- 1. Profiles
alter table public.profiles
drop constraint if exists profiles_tenant_id_fkey,
add constraint profiles_tenant_id_fkey
foreign key (tenant_id) references public.tenants(id)
on delete cascade;

-- 2. Customers
alter table public.customers
drop constraint if exists customers_tenant_id_fkey,
add constraint customers_tenant_id_fkey
foreign key (tenant_id) references public.tenants(id)
on delete cascade;

-- 3. Products
alter table public.products
drop constraint if exists products_tenant_id_fkey,
add constraint products_tenant_id_fkey
foreign key (tenant_id) references public.tenants(id)
on delete cascade;

-- 4. Supplies
alter table public.supplies
drop constraint if exists supplies_tenant_id_fkey,
add constraint supplies_tenant_id_fkey
foreign key (tenant_id) references public.tenants(id)
on delete cascade;

-- 5. Transactions
alter table public.transactions
drop constraint if exists transactions_tenant_id_fkey,
add constraint transactions_tenant_id_fkey
foreign key (tenant_id) references public.tenants(id)
on delete cascade;

-- 6. Configuration
alter table public.configuration
drop constraint if exists configuration_tenant_id_fkey,
add constraint configuration_tenant_id_fkey
foreign key (tenant_id) references public.tenants(id)
on delete cascade;

-- 7. Orders (if exists)
alter table public.orders
drop constraint if exists orders_tenant_id_fkey,
add constraint orders_tenant_id_fkey
foreign key (tenant_id) references public.tenants(id)
on delete cascade;

-- 8. Recipes (if exists)
alter table public.recipes
drop constraint if exists recipes_tenant_id_fkey,
add constraint recipes_tenant_id_fkey
foreign key (tenant_id) references public.tenants(id)
on delete cascade;

-- 9. Packaging Inventory (if exists)
alter table public.packaging_inventory
drop constraint if exists packaging_inventory_tenant_id_fkey,
add constraint packaging_inventory_tenant_id_fkey
foreign key (tenant_id) references public.tenants(id)
on delete cascade;
