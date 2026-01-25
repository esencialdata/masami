import React, { useState, useEffect } from 'react';
import { api } from '../../services/api'; // Adjust path as needed
import { ChefHat, Flame, Minus, Plus, RefreshCw, ShoppingBag, CheckCircle2, AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal'; // Assuming generic Modal component exists

const ProductionView = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [productionQueue, setProductionQueue] = useState({}); // { productId: quantity }
    const [loading, setLoading] = useState(true);
    const [isConfirming, setIsConfirming] = useState(false);
    const [calculatedSupplies, setCalculatedSupplies] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [productsData, ordersData] = await Promise.all([
                api.products.list(),
                api.orders.list()
            ]);
            setProducts(productsData || []);
            setOrders(ordersData || []);
        } catch (e) {
            console.error("Error loading production data:", e);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fill production based on *PENDING* orders for TODAY
    const handleSmartFill = () => {
        const today = new Date().toISOString().split('T')[0];
        const pendingOrders = orders.filter(o =>
            (o.status === 'PENDIENTE' || o.status === 'CONFIRMADO') && // Assuming these statuses
            o.delivery_date &&
            o.delivery_date.startsWith(today)
        );

        const newQueue = {};

        // This assumes orders have a 'products' or 'items' array or some way to parse content.
        // Current api.orders.list returns flattened orders? 
        // Let's check how orders store content. 
        // If it's a JSON field or related table. 
        // Based on previous conversations, orders might have a 'content' text field or similar if not relational.
        // I will assume for now we need to parse the order content if it's not structured, 
        // OR better, since we don't have the order_items structure clear in this turn,
        // I will implement the logic generic + a placeholder for parsing.

        // Wait, looking at `api.js`, `orders` table doesn't seem to join `order_items`.
        // I might need to fetch order items if they exist.
        // Inspecting `api.js`: `supabase.from('orders').select('*, customers(name, zone)')...`
        // It doesn't join items. Let's see if there is a column for items.
        // I'll stick to manual entry primarily, and "Smart Fill" as a placeholder/basic implementation if possible.

        // Simple Manual Mode is safer for now.
        alert("Funcionalidad de Carga Inteligente en construcción. Por favor ingresa las cantidades manualmente.");
    };

    const updateQuantity = (productId, delta) => {
        setProductionQueue(prev => {
            const current = prev[productId] || 0;
            const newVal = Math.max(0, current + delta);
            if (newVal === 0) {
                const { [productId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [productId]: newVal };
        });
    };

    const handlePreConfirm = async () => {
        // Calculate supply usage
        // We need recipes for the products in queue.
        // This might be expensive to fetch one by one. 
        // Ideally we fetch recipes for selected products.
        const productIds = Object.keys(productionQueue);
        if (productIds.length === 0) return;

        setSaving(true);
        const supplyUsage = {}; // { supplyId: { name, unit, quantity } }

        try {
            // Fetch recipes for all queuing products
            // Parallel fetch (limit to reasonable number)
            const recipesPromises = productIds.map(pid => api.recipes.getByProduct(pid));
            const recipesResults = await Promise.all(recipesPromises);

            recipesResults.forEach((recipeList, index) => {
                const pid = productIds[index];
                const producedQty = productionQueue[pid];

                recipeList.forEach(ing => {
                    // ing: { supply: { id, name }, quantity: unit_qty }
                    const totalQty = Number(ing.quantity) * producedQty;

                    if (!supplyUsage[ing.supply.id]) {
                        supplyUsage[ing.supply.id] = {
                            id: ing.supply.id,
                            name: ing.supply.name,
                            unit: ing.unit || 'units',
                            totalQuantity: 0
                        };
                    }
                    supplyUsage[ing.supply.id].totalQuantity += totalQty;
                });
            });

            setCalculatedSupplies(Object.values(supplyUsage));
            setIsConfirming(true);
        } catch (e) {
            console.error(e);
            alert("Error calculando insumos");
        } finally {
            setSaving(false);
        }
    };

    const handleFinalizeProduction = async () => {
        setSaving(true);
        try {
            // 1. Deduct Supplies
            const updatePromises = calculatedSupplies.map(s =>
                api.supplies.updateStock(s.id, -s.totalQuantity) // Negative for deduction
            );
            await Promise.all(updatePromises);

            // 2. (Optional) Create a "Production Log" or update products stock if you track Finish Goods.
            // For now, just supply deduction.

            // 3. Clear Queue
            setProductionQueue({});
            setIsConfirming(false);
            setCalculatedSupplies([]);
            alert("Producción registrada e inventario actualizado.");
        } catch (e) {
            console.error(e);
            alert("Error al procesar producción");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto mb-24">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <ChefHat className="text-brand-gold" size={32} />
                        Centro de Producción
                    </h1>
                    <p className="text-gray-500">
                        Registra lo horneado hoy para descontar insumos automáticamente.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={handleSmartFill}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <ShoppingBag size={18} />
                        Cargar Pedidos
                    </button>
                    <button
                        onClick={() => setProductionQueue({})}
                        disabled={Object.keys(productionQueue).length === 0}
                        className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={18} />
                        Limpiar
                    </button>
                </div>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(product => {
                    const queueQty = productionQueue[product.id] || 0;
                    return (
                        <div
                            key={product.id}
                            className={`
                                relative p-4 rounded-2xl border transition-all duration-200
                                ${queueQty > 0
                                    ? 'bg-orange-50/50 border-orange-200 shadow-md ring-1 ring-orange-200'
                                    : 'bg-white border-gray-100 hover:border-orange-100 hover:shadow-sm'
                                }
                            `}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-900 truncate pr-2">{product.name}</h3>
                                    <p className="text-xs text-gray-400">Rinde: {product.calculated_cost ? `$${product.calculated_cost}` : '-'}</p>
                                </div>
                                <div className="bg-gray-100 p-2 rounded-full text-gray-400">
                                    <ChefHat size={16} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 mt-4">
                                <button
                                    onClick={() => updateQuantity(product.id, -1)}
                                    className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 transition-all font-bold text-xl active:scale-90"
                                    disabled={queueQty === 0}
                                >
                                    <Minus size={18} />
                                </button>

                                <div className="flex-1 px-2">
                                    <input
                                        type="number"
                                        min="0"
                                        className={`w-full text-center text-2xl font-black bg-transparent outline-none border-b-2 ${queueQty > 0 ? 'text-brand-coffee border-brand-gold' : 'text-gray-200 border-transparent'} focus:border-brand-gold transition-all`}
                                        value={queueQty || ''}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0;
                                            setProductionQueue(prev => {
                                                const newVal = Math.max(0, val);
                                                if (newVal === 0) {
                                                    const { [product.id]: _, ...rest } = prev;
                                                    return rest;
                                                }
                                                return { ...prev, [product.id]: newVal };
                                            });
                                        }}
                                        placeholder="0"
                                    />
                                </div>

                                <button
                                    onClick={() => updateQuantity(product.id, 1)}
                                    className="w-10 h-10 flex items-center justify-center bg-brand-gold text-brand-coffee rounded-xl shadow-lg shadow-brand-gold/20 hover:bg-yellow-500 active:scale-90 transition-all font-bold text-xl"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Floating Footer Action */}
            {Object.keys(productionQueue).length > 0 && (
                <div className="fixed bottom-20 md:bottom-8 right-4 left-4 md:left-auto md:right-8 z-40 animate-slideUp">
                    <button
                        onClick={handlePreConfirm}
                        className="w-full md:w-auto bg-gray-900 text-white pl-6 pr-8 py-4 rounded-2xl font-bold shadow-2xl flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all ring-4 ring-white/50"
                    >
                        <div className="flex items-center gap-2">
                            <Flame className="text-orange-500 animate-pulse" />
                            <span>Confirmar Producción</span>
                        </div>
                        <div className="bg-gray-700 px-3 py-1 rounded-lg text-sm text-gray-200">
                            {Object.values(productionQueue).reduce((a, b) => a + b, 0)} pzas
                        </div>
                    </button>
                </div>
            )}

            {/* Confirmation Modal */}
            <Modal
                isOpen={isConfirming}
                onClose={() => setIsConfirming(false)}
                title="Resumen de Insumos"
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-blue-900 text-sm">
                        <AlertTriangle size={20} className="shrink-0" />
                        <p>
                            Al confirmar, los siguientes insumos se descontarán inmediatamente de tu inventario.
                        </p>
                    </div>

                    <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2">
                        {calculatedSupplies.map(supply => (
                            <div key={supply.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="font-medium text-gray-700">{supply.name}</span>
                                <span className="font-bold text-red-600">
                                    - {supply.totalQuantity.toFixed(2)} <span className="text-xs text-gray-400 font-normal">{supply.unit}</span>
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex gap-3">
                        <button
                            onClick={() => setIsConfirming(false)}
                            className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleFinalizeProduction}
                            disabled={saving}
                            className="flex-1 py-3 bg-brand-gold text-brand-coffee font-bold rounded-xl hover:bg-yellow-500 transition-all shadow-lg shadow-brand-gold/20 flex justify-center items-center gap-2"
                        >
                            {saving ? 'Procesando...' : (
                                <>
                                    <CheckCircle2 size={18} /> Confirmar Todo
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ProductionView;
