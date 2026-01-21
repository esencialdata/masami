-- ==========================================
-- PASO 1: VERIFICAR ESTRUCTURA DE TABLAS
-- ==========================================
-- Ejecuta esto primero para ver qué columnas tienes

SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('orders', 'customers', 'products', 'transactions', 'configuration')
ORDER BY table_name, ordinal_position;
