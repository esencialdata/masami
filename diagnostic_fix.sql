-- ==========================================
-- SCRIPT DE DIAGNÓSTICO Y LIMPIEZA (V2)
-- ==========================================

-- 1. Intentar matar solo MIS propias conexiones (esto debería estar permitido)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
  AND usename = current_user;

-- 2. Verificar Estado de RLS (Debe salir 'false' en enable_row_security)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'tenants');

-- 3. PRUEBA DE FUEGO: Leer un perfil
-- Si esto corre rápido, la base de datos ESTÁ BIEN.
-- Si esto se queda cargando, la base de datos TIENE UN BLOQUEO.
SELECT * FROM profiles LIMIT 1;
