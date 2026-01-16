-- ☢️ NUCLEAR RESET: ELIMINACIÓN TOTAL DE POLÍTICAS ☢️
-- Este script BORRA todas las reglas de seguridad y las vuelve a crear desde cero.
-- No borra tus datos (clientes, ventas), solo las "reglas" que estorban.

-- 1. DESACTIVAR RLS MOMENTÁNEAMENTE (Para que no estorbe al borrar)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.packaging_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes DISABLE ROW LEVEL SECURITY;

-- 2. BORRAR TODAS LAS POLÍTICAS CONOCIDAS (Limpieza total)
DROP POLICY IF EXISTS "Users can view tenant members" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenants manage their own supplies" ON public.supplies;
DROP POLICY IF EXISTS "See Self Only" ON public.profiles;
DROP POLICY IF EXISTS "View Own Tenant" ON public.tenants;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Users can see their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public access to tenants" ON public.tenants;

-- 3. BORRAR FUNCIONES VIEJAS
DROP FUNCTION IF EXISTS public.get_my_tenant_id();

-- 4. RE-CREAR LA BASE MÍNIMA (Estilo Chelito pero Multitenant)
-- Función Segura (Rompe-ciclos)
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 5. RE-ACTIVAR RLS (Solo lo necesario)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packaging_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS SIMPLES Y RÁPIDAS (Sin recursión)
-- Perfiles: Solo yo me veo
CREATE POLICY "Simple Profile View" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Simple Profile Update" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Simple Profile Insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Tenants: Solo veo el mío
CREATE POLICY "Simple Tenant View" ON public.tenants FOR SELECT USING (id = public.get_my_tenant_id());

-- Tablas de Datos: Solo veo lo de mi Tenant (Usando la función rápida)
CREATE POLICY "Tenant Data Transactions" ON public.transactions USING (tenant_id = public.get_my_tenant_id());
CREATE POLICY "Tenant Data Customers" ON public.customers USING (tenant_id = public.get_my_tenant_id());
CREATE POLICY "Tenant Data Products" ON public.products USING (tenant_id = public.get_my_tenant_id());
CREATE POLICY "Tenant Data Supplies" ON public.supplies USING (tenant_id = public.get_my_tenant_id());
CREATE POLICY "Tenant Data Packaging" ON public.packaging_inventory USING (tenant_id = public.get_my_tenant_id());
CREATE POLICY "Tenant Data Orders" ON public.orders USING (tenant_id = public.get_my_tenant_id());
CREATE POLICY "Tenant Data Recipes" ON public.recipes USING (tenant_id = public.get_my_tenant_id());

-- 7. ÍNDICES (Velocidad pura)
CREATE INDEX IF NOT EXISTS idx_nuke_supplies_tenant ON public.supplies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_nuke_profiles_tid ON public.profiles(tenant_id);
