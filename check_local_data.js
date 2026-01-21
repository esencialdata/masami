// ==========================================
// DIAGNÓSTICO DE DATOS LOCALES
// ==========================================
// Copia y pega esto en la consola (F12) para ver qué datos tienes guardados

console.log("=== DIAGNÓSTICO DE DATOS LOCALES ===\n");

// 1. Verificar modo offline
const forceOffline = localStorage.getItem('miga_force_offline');
console.log("🔌 Modo Offline Forzado:", forceOffline === 'true' ? 'SÍ' : 'NO');

// 2. Verificar perfil de usuario
const profile = localStorage.getItem('miga_user_profile');
if (profile) {
    const parsed = JSON.parse(profile);
    console.log("👤 Perfil:", parsed.full_name || parsed.email);
    console.log("🏢 Tenant:", parsed.tenant?.name || 'Sin tenant');
} else {
    console.log("👤 Perfil: NO ENCONTRADO");
}

// 3. Verificar pedidos
const orders = localStorage.getItem('miga_orders');
if (orders) {
    const parsed = JSON.parse(orders);
    console.log("\n📋 PEDIDOS GUARDADOS:", parsed.length);
    parsed.forEach((order, i) => {
        console.log(`  ${i + 1}. ${order.customers?.name || order.client_id} - ${order.items} - ${order.delivery_date}`);
    });
} else {
    console.log("\n📋 PEDIDOS: NO ENCONTRADOS");
}

// 4. Verificar clientes
const customers = localStorage.getItem('miga_customers');
if (customers) {
    const parsed = JSON.parse(customers);
    console.log("\n👥 CLIENTES:", parsed.length);
    parsed.forEach((c, i) => console.log(`  ${i + 1}. ${c.name}`));
} else {
    console.log("\n👥 CLIENTES: NO ENCONTRADOS");
}

// 5. Verificar productos
const products = localStorage.getItem('miga_products');
if (products) {
    const parsed = JSON.parse(products);
    console.log("\n🍞 PRODUCTOS:", parsed.length);
    parsed.forEach((p, i) => console.log(`  ${i + 1}. ${p.name}`));
} else {
    console.log("\n🍞 PRODUCTOS: NO ENCONTRADOS");
}

// 6. Verificar transacciones
const transactions = localStorage.getItem('miga_transactions');
if (transactions) {
    const parsed = JSON.parse(transactions);
    console.log("\n💰 TRANSACCIONES:", parsed.length);
} else {
    console.log("\n💰 TRANSACCIONES: NO ENCONTRADAS");
}

console.log("\n=== FIN DEL DIAGNÓSTICO ===");
console.log("\n💡 TIP: Si no ves tus datos, significa que:");
console.log("   - Están en la base de datos (bloqueada)");
console.log("   - O se perdieron al limpiar el caché");
