-- ==========================================
-- EXPORTAR DATOS A FORMATO JAVASCRIPT (CORREGIDO)
-- ==========================================

-- 1. PEDIDOS (orders)
SELECT 
    'const orders = ' || 
    json_agg(
        json_build_object(
            'id', o.id,
            'client_id', o.client_id,
            'delivery_date', o.delivery_date,
            'items', o.items,
            'total_amount', o.total_amount,
            'status', o.status,
            'prepayment', COALESCE(o.prepayment, 0),
            'notes', COALESCE(o.notes, ''),
            'customers', json_build_object(
                'name', c.name,
                'zone', COALESCE(c.zone, '')
            )
        )
    ) || ';' as export_orders
FROM orders o
LEFT JOIN customers c ON o.client_id = c.id
WHERE o.status = 'PENDIENTE';

-- 2. CLIENTES (customers)
SELECT 
    'const customers = ' || 
    json_agg(
        json_build_object(
            'id', id,
            'name', name,
            'phone', COALESCE(phone, ''),
            'zone', COALESCE(zone, ''),
            'notes', COALESCE(notes, ''),
            'category', COALESCE(category, '')
        )
    ) || ';' as export_customers
FROM customers;

-- 3. PRODUCTOS (products)
SELECT 
    'const products = ' || 
    json_agg(
        json_build_object(
            'id', id,
            'name', name,
            'price', sale_price,
            'category', COALESCE(category, 'General')
        )
    ) || ';' as export_products
FROM products;

-- 4. TRANSACCIONES (últimas 50)
SELECT 
    'const transactions = ' || 
    json_agg(
        json_build_object(
            'id', id,
            'date', date,
            'type', type,
            'amount', amount,
            'client_id', client_id,
            'description', COALESCE(description, ''),
            'pedido_id', pedido_id
        )
    ) || ';' as export_transactions
FROM (
    SELECT * FROM transactions
    ORDER BY date DESC
    LIMIT 50
) t;

-- 5. CONFIGURACIÓN
SELECT 
    'const config = ' || 
    row_to_json(t) || ';' as export_config
FROM (
    SELECT monthly_fixed_costs
    FROM configuration
    LIMIT 1
) t;
