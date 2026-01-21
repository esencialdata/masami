// ==========================================
// SCRIPT PARA CREAR DATOS DE PRUEBA
// ==========================================
// Copia y pega esto en la consola del navegador (F12)
// para llenar la app con datos de demostración

// 1. Configuración básica
localStorage.setItem('miga_config', JSON.stringify({
    monthly_fixed_costs: 15000
}));

// 2. Clientes de ejemplo
const customers = [
    { id: 'cust-1', name: 'Huma Hotel Boutique', phone: '555-0101', zone: 'Centro', email: 'huma@hotel.com', notes: 'Cliente VIP' },
    { id: 'cust-2', name: 'Señora Cárdenas', phone: '555-0102', zone: 'Norte', email: 'cardenas@email.com', notes: '' },
    { id: 'cust-3', name: 'Café Moderno', phone: '555-0103', zone: 'Sur', email: 'moderno@cafe.com', notes: 'Entrega temprano' }
];
localStorage.setItem('miga_customers', JSON.stringify(customers));

// 3. Productos
const products = [
    { id: 'prod-1', name: 'Baguette', price: 35, category: 'Pan' },
    { id: 'prod-2', name: 'Cheesecake Grande', price: 450, category: 'Postres' },
    { id: 'prod-3', name: 'Croissant', price: 25, category: 'Pan' },
    { id: 'prod-4', name: 'Pan de Muerto', price: 80, category: 'Pan' }
];
localStorage.setItem('miga_products', JSON.stringify(products));

// 4. Pedidos (Órdenes)
const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const orders = [
    {
        id: 'order-1',
        client_id: 'cust-1',
        delivery_date: today,
        items: '20 Baguettes',
        total: 700,
        status: 'PENDIENTE',
        prepayment: 0,
        customers: { name: 'Huma Hotel Boutique', zone: 'Centro' }
    },
    {
        id: 'order-2',
        client_id: 'cust-2',
        delivery_date: today,
        items: '1 Cheesecake grande',
        total: 450,
        status: 'PENDIENTE',
        prepayment: 200,
        customers: { name: 'Señora Cárdenas', zone: 'Norte' }
    },
    {
        id: 'order-3',
        client_id: 'cust-3',
        delivery_date: tomorrow,
        items: '50 Croissants',
        total: 1250,
        status: 'PENDIENTE',
        prepayment: 0,
        customers: { name: 'Café Moderno', zone: 'Sur' }
    }
];
localStorage.setItem('miga_orders', JSON.stringify(orders));

// 5. Transacciones
const transactions = [
    {
        id: 'tx-1',
        date: new Date().toISOString(),
        type: 'VENTA',
        amount: 200,
        client_id: 'cust-2',
        description: 'Anticipo Cheesecake',
        pedido_id: 'order-2'
    },
    {
        id: 'tx-2',
        date: new Date(Date.now() - 86400000).toISOString(),
        type: 'VENTA',
        amount: 1500,
        client_id: 'cust-1',
        description: 'Pedido Hotel',
        pedido_id: null
    }
];
localStorage.setItem('miga_transactions', JSON.stringify(transactions));

// 6. Inventario de empaquetado
const packaging = [
    { id: 'pack-1', type: 'Bolsa Papel', current_quantity: 150, min_alert: 50, cost: 2 },
    { id: 'pack-2', type: 'Caja Pastel', current_quantity: 25, min_alert: 20, cost: 15 }
];
localStorage.setItem('miga_packaging', JSON.stringify(packaging));

// 7. Insumos
const supplies = [
    { id: 'sup-1', name: 'Harina', current_stock: 50, current_cost: 25, min_stock: 10, unit: 'kg', history: [] },
    { id: 'sup-2', name: 'Azúcar', current_stock: 30, current_cost: 18, min_stock: 15, unit: 'kg', history: [] },
    { id: 'sup-3', name: 'Mantequilla', current_stock: 20, current_cost: 45, min_stock: 10, unit: 'kg', history: [] }
];
localStorage.setItem('miga_supplies', JSON.stringify(supplies));

console.log('✅ Datos de prueba creados exitosamente!');
console.log('📦 Clientes:', customers.length);
console.log('🍞 Productos:', products.length);
console.log('📋 Pedidos:', orders.length);
console.log('💰 Transacciones:', transactions.length);
console.log('\n🔄 Recarga la página para ver los datos.');
