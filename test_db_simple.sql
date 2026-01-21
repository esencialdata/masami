-- ==========================================
-- TEST SIMPLE DE CONECTIVIDAD
-- ==========================================
-- Este script intenta la consulta MÁS SIMPLE posible
-- Si esto falla, la base de datos está definitivamente bloqueada

-- 1. Contar pedidos (sin joins, sin RLS)
SELECT COUNT(*) as total_orders FROM orders;

-- 2. Ver los últimos 5 pedidos (sin joins)
SELECT 
    id,
    client_id,
    delivery_date,
    status,
    total_amount
FROM orders
ORDER BY created_at DESC
LIMIT 5;

-- Si esto funciona, los datos ESTÁN en la DB
-- Si se queda cargando, sigue bloqueada
