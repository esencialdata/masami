-- 🛠 FIX COMPLETO PARA INSERCIÓN DE DATOS Y NOMBRE DE NEGOCIO
-- Este script hace dos cosas:
-- 1. Automáticamente asigna tu 'Negocio' (Tenant ID) a todo lo que crees (Clientes, Productos, etc.)
-- 2. Asegura que tu usuario actual tenga un nombre de negocio asignado.

BEGIN;

-- ==============================================================================
-- PARTE 1: AUTOMATIZACIÓN DE TENANT ID (Para que no de error al guardar)
-- ==============================================================================

-- Función maestra: Busca a qué negocio perteneces y se lo pega al dato que estás creando
CREATE OR REPLACE FUNCTION public.auto_assign_tenant()
RETURNS TRIGGER AS $$
DECLARE
    v_tenant_id uuid;
BEGIN
    -- 1. Buscar mi tenant_id en mi perfil
    SELECT tenant_id INTO v_tenant_id
    FROM public.profiles
    WHERE id = auth.uid();

    -- 2. Si no tengo perfil/tenant, intentar fallback (o error)
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION '❌ Error Crítico: Tu usuario no tiene un Negocio asignado en su perfil.';
    END IF;

    -- 3. Asignar el ID al nuevo registro
    NEW.tenant_id := v_tenant_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear Triggers en TODAS las tablas (Se ejecutan ANTES de insertar)
DROP TRIGGER IF EXISTS trg_set_tenant_customers ON public.customers;
CREATE TRIGGER trg_set_tenant_customers
BEFORE INSERT ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_tenant();

DROP TRIGGER IF EXISTS trg_set_tenant_products ON public.products;
CREATE TRIGGER trg_set_tenant_products
BEFORE INSERT ON public.products
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_tenant();

DROP TRIGGER IF EXISTS trg_set_tenant_orders ON public.orders;
CREATE TRIGGER trg_set_tenant_orders
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_tenant();

DROP TRIGGER IF EXISTS trg_set_tenant_supplies ON public.supplies;
CREATE TRIGGER trg_set_tenant_supplies
BEFORE INSERT ON public.supplies
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_tenant();

DROP TRIGGER IF EXISTS trg_set_tenant_recipes ON public.recipes;
CREATE TRIGGER trg_set_tenant_recipes
BEFORE INSERT ON public.recipes
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_tenant();

DROP TRIGGER IF EXISTS trg_set_tenant_packaging ON public.packaging_inventory;
CREATE TRIGGER trg_set_tenant_packaging
BEFORE INSERT ON public.packaging_inventory
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_tenant();

DROP TRIGGER IF EXISTS trg_set_tenant_transactions ON public.transactions;
CREATE TRIGGER trg_set_tenant_transactions
BEFORE INSERT ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_tenant();


-- ==============================================================================
-- PARTE 2: REPARAR POLÍTICAS RLS (Para permitir INSERT)
-- ==============================================================================

-- Actualizar política de Customers para incluir INSERT explícitamente con WITH CHECK
DROP POLICY IF EXISTS "Tenant Isolation" ON public.customers;
CREATE POLICY "Tenant Isolation" ON public.customers
    FOR ALL
    USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
    WITH CHECK (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Repetir para las demás tablas críticas
DROP POLICY IF EXISTS "Tenant Isolation" ON public.products;
CREATE POLICY "Tenant Isolation" ON public.products
    FOR ALL
    USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
    WITH CHECK (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Tenant Isolation" ON public.orders;
CREATE POLICY "Tenant Isolation" ON public.orders
    FOR ALL
    USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
    WITH CHECK (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Tenant Isolation" ON public.supplies;
CREATE POLICY "Tenant Isolation" ON public.supplies
    FOR ALL
    USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
    WITH CHECK (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));


COMMIT;
