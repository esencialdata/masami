-- 🌾 SCRIPT DE SIEMBRA: DATOS DE PRUEBA Y RESCATE DE CLIENTES 🌾
-- 1. Inserta ingredientes básicos (Harina, Azúcar, etc.) en tu negocio.
-- 2. Busca clientes "húerfanos" (sin negocio) y te los asigna.

BEGIN;

-- =================================================================
-- 1. IDENTIFICAR EL NEGOCIO (TENANT) DEL USUARIO ACTUAL
-- =================================================================
DO $$
DECLARE
    v_user_id uuid := auth.uid();
    v_tenant_id uuid;
    v_count_supplies int;
BEGIN
    -- Si corres esto en SQL Editor sin sesión, buscamos el último usuario creado
    IF v_user_id IS NULL THEN
        SELECT id INTO v_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;
    END IF;

    -- Obtener el tenant del perfil
    SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = v_user_id;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION '❌ No se encontró un negocio para el usuario %', v_user_id;
    END IF;

    RAISE NOTICE '✅ Sembrando datos para el Tenant ID: %', v_tenant_id;

    -- =================================================================
    -- 2. INSERTAR INGREDIENTES BÁSICOS (Si no existen)
    -- =================================================================
    
    -- Harina
    IF NOT EXISTS (SELECT 1 FROM public.supplies WHERE name = 'Harina de Trigo' AND tenant_id = v_tenant_id) THEN
        INSERT INTO public.supplies (name, unit, current_cost, category, tenant_id)
        VALUES ('Harina de Trigo', 'kg', 18.50, 'Secos', v_tenant_id);
    END IF;

    -- Azúcar
    IF NOT EXISTS (SELECT 1 FROM public.supplies WHERE name = 'Azúcar Estándar' AND tenant_id = v_tenant_id) THEN
        INSERT INTO public.supplies (name, unit, current_cost, category, tenant_id)
        VALUES ('Azúcar Estándar', 'kg', 24.00, 'Secos', v_tenant_id);
    END IF;

    -- Mantequilla
    IF NOT EXISTS (SELECT 1 FROM public.supplies WHERE name = 'Mantequilla s/Sal' AND tenant_id = v_tenant_id) THEN
        INSERT INTO public.supplies (name, unit, current_cost, category, tenant_id)
        VALUES ('Mantequilla s/Sal', 'kg', 180.00, 'Refrigerados', v_tenant_id);
    END IF;

    -- Huevo
    IF NOT EXISTS (SELECT 1 FROM public.supplies WHERE name = 'Huevo Blanco' AND tenant_id = v_tenant_id) THEN
        INSERT INTO public.supplies (name, unit, current_cost, category, tenant_id)
        VALUES ('Huevo Blanco', 'kg', 42.00, 'Refrigerados', v_tenant_id);
    END IF;

    -- Leche
    IF NOT EXISTS (SELECT 1 FROM public.supplies WHERE name = 'Leche Entera' AND tenant_id = v_tenant_id) THEN
        INSERT INTO public.supplies (name, unit, current_cost, category, tenant_id)
        VALUES ('Leche Entera', 'lt', 26.00, 'Líquidos', v_tenant_id);
    END IF;

    -- Levadura
    IF NOT EXISTS (SELECT 1 FROM public.supplies WHERE name = 'Levadura Seca' AND tenant_id = v_tenant_id) THEN
        INSERT INTO public.supplies (name, unit, current_cost, category, tenant_id)
        VALUES ('Levadura Seca', 'kg', 120.00, 'Secos', v_tenant_id);
    END IF;
    
    RAISE NOTICE '✅ Ingredientes sembrados correctamente.';

    -- =================================================================
    -- 3. RESCATAR CLIENTES HUÉRFANOS (IMPORTADOS SIN TENANT)
    -- =================================================================
    -- Si hay clientes creados recientemente (últimos 5 min) con tenant_id NULO,
    -- asumimos que son tuyos y los asignamos.
    
    UPDATE public.customers
    SET tenant_id = v_tenant_id
    WHERE tenant_id IS NULL
    AND created_at > (now() - interval '1 hour');
    
    GET DIAGNOSTICS v_count_supplies = ROW_COUNT;
    RAISE NOTICE '✅ Se rescataron % clientes huérfanos y se asignaron a tu negocio.', v_count_supplies;

END $$;

COMMIT;
