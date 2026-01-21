-- 🚨 SCRIPT DE SEGURIDAD Y AISLAMIENTO DE DATOS 🚨
-- 1. Asignar un Tenant (Negocio) al usuario actual si no tiene.
-- 2. Activar RLS (Seguridad) en todas las tablas clave.
-- 3. Crear políticas para que SOLO veas tus datos.

BEGIN;

-- =========================================================================
-- PASO 1: ASIGNAR TENANT AL USUARIO ACTUAL (Si es "homeless")
-- =========================================================================
DO $$
DECLARE
    v_user_id uuid := auth.uid();
    v_tenant_id uuid;
BEGIN
    -- Si no hay usuario logueado en la sesión SQL, intentamos agarrar el más reciente creado
    IF v_user_id IS NULL THEN
        SELECT id INTO v_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;
    END IF;

    -- Verificar si ya tiene tenant
    SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = v_user_id;

    -- Si no tiene tenant, creamos uno y se lo asignamos
    IF v_tenant_id IS NULL THEN
        INSERT INTO public.tenants (name, plan_status)
        VALUES ('Mi Nueva Panadería', 'trial')
        RETURNING id INTO v_tenant_id;

        UPDATE public.profiles 
        SET tenant_id = v_tenant_id, role = 'owner'
        WHERE id = v_user_id;
        
        RAISE NOTICE '✅ Tenant creado y asignado al usuario: %', v_user_id;
    ELSE
        RAISE NOTICE 'ℹ️ El usuario ya tiene un Tenant asignado.';
    END IF;
END $$;

-- =========================================================================
-- PASO 2: HABILITAR RLS EN TODAS LAS TABLAS DEL SISTEMA
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packaging_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- PASO 3: LIMPIAR POLÍTICAS VIEJAS/ROTAS
-- =========================================================================
DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Tenant Isolation" ON public.products;
DROP POLICY IF EXISTS "Tenant Isolation" ON public.customers;
DROP POLICY IF EXISTS "Tenant Isolation" ON public.orders;
DROP POLICY IF EXISTS "Tenant Isolation" ON public.supplies;
DROP POLICY IF EXISTS "Tenant Isolation" ON public.recipes;
DROP POLICY IF EXISTS "Tenant Isolation" ON public.packaging_inventory;
DROP POLICY IF EXISTS "Tenant Isolation" ON public.transactions;

-- =========================================================================
-- PASO 4: CREAR POLÍTICAS SEGURAS (SIN RECURSIÓN INFINITA)
-- =========================================================================

-- A. PERFILES: Cada quien ve lo suyo
CREATE POLICY "Users can see own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- B. DATOS DEL TENANT: Usamos una función auxiliar para evitar joins complejos si es posible,
-- pero lo más seguro aquí es hacer el check directo contra profiles.
-- Nota: Para evitar recursión infinita, leemos el tenant_id directamente.

-- Esta política se repite para todas las tablas de datos
-- "Permitir si el tenant_id de la fila coincide con el tenant_id del usuario actual"

-- Products
CREATE POLICY "Tenant Isolation" ON public.products
    USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Customers
CREATE POLICY "Tenant Isolation" ON public.customers
    USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Orders
CREATE POLICY "Tenant Isolation" ON public.orders
    USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Supplies
CREATE POLICY "Tenant Isolation" ON public.supplies
    USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Recipes
CREATE POLICY "Tenant Isolation" ON public.recipes
    USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Packaging
CREATE POLICY "Tenant Isolation" ON public.packaging_inventory
    USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Transactions
CREATE POLICY "Tenant Isolation" ON public.transactions
    USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));


COMMIT;
