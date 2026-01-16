-- PERFORMANCE OPTIMIZATION SCRIPT
-- 1. Add Indexes on Foreign Keys (Crucial for RLS speed)
CREATE INDEX IF NOT EXISTS idx_supplies_tenant ON public.supplies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recipes_tenant ON public.recipes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON public.customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant ON public.transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_packaging_tenant ON public.packaging_inventory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON public.orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant ON public.products(tenant_id);

-- 2. Add Composite Index for Dashboard Transactions
-- Optimization for: WHERE tenant_id = ? ORDER BY date DESC
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_date ON public.transactions(tenant_id, date DESC);

-- 3. Optimize RLS Function
-- Mark as STABLE so Postgres knows it doesn't change within a single query
-- (Prevents calling it 1000 times for 1000 rows)
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. VACUUM ANALYZE to update statistics immediately
-- (Note: Cannot run inside a transaction block in some clients, but trying harmlessly)
-- VACUUM ANALYZE; 
