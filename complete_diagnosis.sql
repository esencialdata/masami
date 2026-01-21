-- ==========================================
-- DIAGNÓSTICO COMPLETO DE BASE DE DATOS
-- ==========================================
-- Ejecuta este script para entender QUÉ está bloqueando la DB

-- 1. Estado de RLS en TODAS las tablas
SELECT 
    schemaname,
    tablename, 
    rowsecurity as "RLS_ENABLED"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Políticas RLS activas (aunque RLS esté deshabilitado, pueden existir)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as "COMMAND"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Triggers activos (pueden ejecutar funciones que bloquean)
SELECT 
    event_object_table as "TABLE",
    trigger_name,
    event_manipulation as "EVENT",
    action_statement as "FUNCTION"
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- 4. Consultas activas/bloqueadas en este momento
SELECT 
    pid,
    usename,
    application_name,
    state,
    query_start,
    state_change,
    query
FROM pg_stat_activity
WHERE datname = current_database()
  AND state != 'idle'
ORDER BY query_start;

-- 5. Locks activos
SELECT 
    l.locktype,
    l.relation::regclass as "TABLE",
    l.mode,
    l.granted,
    a.usename,
    a.query_start,
    a.state
FROM pg_locks l
LEFT JOIN pg_stat_activity a ON l.pid = a.pid
WHERE a.datname = current_database()
ORDER BY l.granted, l.locktype;
