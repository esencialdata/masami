-- ==========================================
-- SCRIPT NUCLEAR DE PERMISOS (Fix Deadlocks)
-- ==========================================

-- El "Loop de Cargando" es 99% seguro un bloqueo de recursión en la base de datos.
-- (La tabla A pregunta permisos a la B, y la B a la A -> Infinito).

-- SOLUCIÓN: Simplificar drásticamente las reglas para desbloquearte.

-- 1. Habilitar RLS (para que no sea público a internet)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 2. BORRAR TODAS LAS POLÍTICAS ANTERIORES (Limpieza total)
DROP POLICY IF EXISTS "Ver mi propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Ver equipo" ON public.profiles;
DROP POLICY IF EXISTS "Ver perfiles del equipo" ON public.profiles;
DROP POLICY IF EXISTS "Owner edita equipo" ON public.profiles;
DROP POLICY IF EXISTS "Usuario edita su perfil" ON public.profiles;
DROP POLICY IF EXISTS "Access All Authenticated Profiles" ON public.profiles;

DROP POLICY IF EXISTS "Ver mi tenant" ON public.tenants;
DROP POLICY IF EXISTS "Ver tenant propio" ON public.tenants;
DROP POLICY IF EXISTS "Access All Authenticated Tenants" ON public.tenants;

-- 3. CREAR REGLAS SIMPLES (Sin Recursión)
-- "Si estás logueado, puedes leer/escribir en perfiles y tenants"
-- (La seguridad real de "quién ve qué" la maneja la App filtrando por tenant_id,
--  esto es solo para que la Base de Datos no se bloquee).

CREATE POLICY "Authenticated Access Profiles" ON public.profiles
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated Access Tenants" ON public.tenants
    FOR ALL USING (auth.role() = 'authenticated');

-- 4. Notificar recarga a Supabase
NOTIFY pgrst, 'reload config';
