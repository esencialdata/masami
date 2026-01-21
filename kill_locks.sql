-- ==========================================
-- SCRIPT DE DESBLOQUEO TOTAL (KILL LOCKS)
-- ==========================================

-- Este script forzará el cierre de todas las conexiones abiertas
-- para eliminar cualquier consulta "zombie" que esté bloqueando la tabla.

-- 1. Matar todas las conexiones excepto la mía propia
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
  AND datname = current_database();

-- 2. Asegurar (de nuevo) que la seguridad está APAGADA
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;

-- 3. Confirmación
SELECT 'Base de datos desbloqueada y conexiones reiniciadas' as status;
