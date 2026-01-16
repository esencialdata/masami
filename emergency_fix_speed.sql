-- EMERGENCY PERFORMANCE FIX (The "Nuclear" Option against Loops)
-- Run this to break the infinite loading loop immediately.

-- 1. Optimizar función de seguridad (SECURITY DEFINER = Ignora RLS adentro)
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS uuid AS $$
BEGIN
  -- Esta consulta corre como "Superusuario" internamente, evitando el bucle infinito
  RETURN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Simplificar Políticas de Perfiles (Romper el ciclo)
-- Borrar políticas viejas complejas
DROP POLICY IF EXISTS "Users can view tenant members" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenants manage their own supplies" ON public.supplies;
-- Borrar políticas nuevas por si ya se crearon (Idempotencia)
DROP POLICY IF EXISTS "See Self Only" ON public.profiles;
DROP POLICY IF EXISTS "View Own Tenant" ON public.tenants;

-- Política 100% segura y rápida para Perfiles: "Solo me veo a mí mismo"
-- Esto evita que 'get_my_tenant_id' active verificaciones complejas
CREATE POLICY "See Self Only" ON public.profiles
FOR SELECT USING (id = auth.uid());

-- Política para Tenants: "Veo mi tenant usando la función segura"
CREATE POLICY "View Own Tenant" ON public.tenants
FOR SELECT USING (id = public.get_my_tenant_id());

-- 3. Re-aplicar índices (por si acaso no se crearon)
CREATE INDEX IF NOT EXISTS idx_fast_supplies ON public.supplies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fast_profiles ON public.profiles(id, tenant_id);

-- 4. Política de Insumos (Usando la función rápida)
DROP POLICY IF EXISTS "Tenants manage their own supplies" ON public.supplies;
CREATE POLICY "Tenants manage their own supplies" ON public.supplies
USING (tenant_id = public.get_my_tenant_id());

-- NOTA: Esto debería desbloquear la carga inmediata.
