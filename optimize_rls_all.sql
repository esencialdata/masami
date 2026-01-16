-- OPTIMIZE RLS: Use get_my_tenant_id() everywhere
-- This replaces slow subqueries with the fast, secure function.

-- 1. Supplies
DROP POLICY IF EXISTS "Tenants manage their own supplies" ON public.supplies;
CREATE POLICY "Tenants manage their own supplies" ON public.supplies
USING (tenant_id = public.get_my_tenant_id());

-- 2. Recipes
DROP POLICY IF EXISTS "Tenants manage their own recipes" ON public.recipes;
CREATE POLICY "Tenants manage their own recipes" ON public.recipes
USING (tenant_id = public.get_my_tenant_id());

-- 3. Tenants (View Own)
DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;
CREATE POLICY "Users can view own tenant" ON public.tenants
FOR SELECT USING (id = public.get_my_tenant_id());

-- 4. Transactions (If table exists and has RLS)
-- (We assume transactions table exists based on api.js usage)
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenants manage their own transactions" ON public.transactions;
CREATE POLICY "Tenants manage their own transactions" ON public.transactions
USING (tenant_id = public.get_my_tenant_id());

-- 5. Customers
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenants manage their own customers" ON public.customers;
CREATE POLICY "Tenants manage their own customers" ON public.customers
USING (tenant_id = public.get_my_tenant_id());

-- 6. Packaging Inventory
ALTER TABLE IF EXISTS public.packaging_inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenants manage their own packaging" ON public.packaging_inventory;
CREATE POLICY "Tenants manage their own packaging" ON public.packaging_inventory
USING (tenant_id = public.get_my_tenant_id());

-- 7. Orders
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenants manage their own orders" ON public.orders;
CREATE POLICY "Tenants manage their own orders" ON public.orders
USING (tenant_id = public.get_my_tenant_id());
