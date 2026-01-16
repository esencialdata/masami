import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    })
    : null;

// Mock Data Store for LocalStorage fallback
const STORAGE_KEYS = {
    TRANSACTIONS: 'bakery_transactions',
    CUSTOMERS: 'bakery_customers',
    PRODUCTS: 'bakery_products',
    PACKAGING: 'bakery_packaging', // New key
    CONFIG: 'bakery_config',
};

// Helper to get local data
const getLocal = (key) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error(`Error parsing ${key}`, e);
        return [];
    }
};

const setLocal = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Initial Seed for LocalStorage
const seedLocal = () => {
    if (!localStorage.getItem(STORAGE_KEYS.PACKAGING)) {
        setLocal(STORAGE_KEYS.PACKAGING, [
            { id: '1', type: "Caja Rosca Grande", current_quantity: 50, min_alert: 15 },
            { id: '2', type: "Caja Pastel", current_quantity: 5, min_alert: 10 } // Low stock example
        ]);
    }

    if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
        setLocal(STORAGE_KEYS.CONFIG, { monthly_fixed_costs: 15000, monthly_goal: 0 });
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
        setLocal(STORAGE_KEYS.CUSTOMERS, [
            { id: '1', name: "Juan Pérez", phone: "524421234567", category: "VIP", total_purchased: 0 }
        ]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
        setLocal(STORAGE_KEYS.TRANSACTIONS, [
            { id: '1', type: "VENTA", amount: 550, description: "Rosca Grande", date: new Date().toISOString(), client_id: '1', payment_method: 'Efectivo' },
            { id: '2', type: "GASTO", amount: 200, description: "Harina Extra", date: new Date().toISOString(), payment_method: 'Efectivo' }
        ]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
        setLocal(STORAGE_KEYS.PRODUCTS, [
            { id: '1', name: "Rosca Grande", sale_price: 550, production_cost: 120, active: true }
        ]);
    }
};

// Run seed on load if local
if (!supabase) {
    seedLocal();
}

// Helper: Timeout Wrapper for Supabase Calls
const withTimeout = (promise, ms = 10000) => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('REQUEST_TIMEOUT'));
        }, ms);
        promise
            .then(res => {
                clearTimeout(timer);
                resolve(res);
            })
            .catch(err => {
                clearTimeout(timer);
                reject(err);
            });
    });
};

export const api = {
    transactions: {
        list: async (options = {}) => {
            if (supabase) {
                try {
                    let query = supabase.from('transactions').select('*').order('date', { ascending: false });

                    if (options.limit) query = query.limit(options.limit);
                    if (options.startDate) query = query.gte('date', options.startDate);
                    if (options.endDate) query = query.lte('date', options.endDate);

                    const { data, error } = await withTimeout(query);
                    if (error) throw error;

                    // Cache full list only if no filters applied (simple heuristic)
                    if (!options.startDate && !options.endDate && !options.limit) {
                        setLocal(STORAGE_KEYS.TRANSACTIONS, data);
                    }
                    return data;
                } catch (err) {
                    console.warn('⚠️ Network failed/timed out, falling back to cache (Transactions)', err);
                    // Fallback handled below
                }
            }
            // Local fallback
            let data = getLocal(STORAGE_KEYS.TRANSACTIONS) || [];
            if (options.startDate) data = data.filter(t => new Date(t.date) >= new Date(options.startDate));
            if (options.endDate) data = data.filter(t => new Date(t.date) <= new Date(options.endDate));
            data.sort((a, b) => new Date(b.date) - new Date(a.date));
            if (options.limit) data = data.slice(0, options.limit);
            return data;
        },
        create: async (transaction) => {
            if (supabase) {
                const { data, error } = await supabase.from('transactions').insert(transaction).select();
                if (error) throw error;
                // Optimistic Cache Update
                const cached = getLocal(STORAGE_KEYS.TRANSACTIONS) || [];
                setLocal(STORAGE_KEYS.TRANSACTIONS, [data[0], ...cached]);

                // Trigger: Update client stats if sale
                if (transaction.type === 'VENTA' && transaction.client_id) {
                    const { data: client } = await supabase.from('customers').select('total_orders, total_purchased').eq('id', transaction.client_id).single();
                    if (client) {
                        await supabase.from('customers').update({
                            total_orders: (client.total_orders || 0) + 1,
                            total_purchased: Number(client.total_purchased || 0) + Number(transaction.amount)
                        }).eq('id', transaction.client_id);
                    }
                }
                return data[0];
            }
            const current = getLocal(STORAGE_KEYS.TRANSACTIONS) || [];
            const newTx = { ...transaction, id: crypto.randomUUID(), date: new Date().toISOString() };
            setLocal(STORAGE_KEYS.TRANSACTIONS, [newTx, ...current]);

            if (transaction.type === 'VENTA' && transaction.client_id) {
                const clients = getLocal(STORAGE_KEYS.CUSTOMERS);
                const clientIndex = clients.findIndex(c => c.id === transaction.client_id);
                if (clientIndex !== -1) {
                    const client = clients[clientIndex];
                    client.total_orders = (client.total_orders || 0) + 1;
                    client.total_purchased = Number(client.total_purchased || 0) + Number(transaction.amount);
                    clients[clientIndex] = client;
                    setLocal(STORAGE_KEYS.CUSTOMERS, clients);
                }
            }
            return newTx;
        }
    },
    customers: {
        list: async () => {
            if (supabase) {
                try {
                    const { data, error } = await withTimeout(supabase.from('customers').select('*').order('name'));
                    if (error) throw error;
                    setLocal(STORAGE_KEYS.CUSTOMERS, data); // CACHE UPDATE
                    return data;
                } catch (err) {
                    console.warn('⚠️ Network failed/timed out, falling back to cache (Customers)', err);
                    return getLocal(STORAGE_KEYS.CUSTOMERS);
                }
            }
            return getLocal(STORAGE_KEYS.CUSTOMERS);
        },
        create: async (customer) => {
            const newCustomer = {
                ...customer,
                total_orders: 0,
                total_purchased: 0,
                zone: customer.zone || 'Sin Zona'
            };

            if (supabase) {
                try {
                    const { data, error } = await supabase.from('customers').insert(newCustomer).select();
                    if (error) throw error;
                    return data[0];
                } catch (err) {
                    if (err.message && err.message.includes('notes') && customer.notes) {
                        const { notes, ...fallbackCustomer } = newCustomer;
                        const { data, error } = await supabase.from('customers').insert(fallbackCustomer).select();
                        if (error) throw error;
                        console.warn('Saved without notes due to missing column');
                        return data[0];
                    }
                    throw err;
                }
            }
            const current = getLocal(STORAGE_KEYS.CUSTOMERS);
            const newCust = { ...newCustomer, id: crypto.randomUUID() };
            setLocal(STORAGE_KEYS.CUSTOMERS, [...current, newCust]);
            return newCust;
        },
        update: async (id, updates) => {
            if (supabase) {
                try {
                    const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select();
                    if (error) throw error;
                    return data[0];
                } catch (err) {
                    if (err.message && err.message.includes('notes') && updates.notes) {
                        const { notes, ...fallbackUpdates } = updates;
                        const { data, error } = await supabase.from('customers').update(fallbackUpdates).eq('id', id).select();
                        if (error) throw error;
                        console.warn('Updated without notes due to missing column');
                        return data[0];
                    }
                    throw err;
                }
            }
            const current = getLocal(STORAGE_KEYS.CUSTOMERS);
            const index = current.findIndex(c => c.id === id);
            if (index !== -1) {
                const updated = { ...current[index], ...updates };
                current[index] = updated;
                setLocal(STORAGE_KEYS.CUSTOMERS, current);
                return updated;
            }
            return null;
        }
    },
    config: {
        get: async () => {
            if (supabase) {
                try {
                    const { data, error } = await withTimeout(supabase.from('configuration').select('*').single());
                    if (error) throw error; // Go to catch
                    setLocal(STORAGE_KEYS.CONFIG, data); // CACHE UPDATE
                    return data;
                } catch (err) {
                    console.warn('⚠️ Network failed/timed out, falling back to cache (Config)', err);
                    return getLocal(STORAGE_KEYS.CONFIG) || { monthly_fixed_costs: 15000 };
                }
            }
            return getLocal(STORAGE_KEYS.CONFIG) || { monthly_fixed_costs: 15000 };
        },
        update: async (newConfig) => {
            if (supabase) {
                const { data, error } = await supabase.from('configuration').upsert(newConfig).select();
                if (error) throw error;
                return data[0];
            }
            setLocal(STORAGE_KEYS.CONFIG, newConfig);
            return newConfig;
        }
    },
    products: {
        list: async () => {
            if (supabase) {
                try {
                    const { data, error } = await withTimeout(supabase.from('products').select('*').order('name'));
                    if (error) throw error;
                    setLocal(STORAGE_KEYS.PRODUCTS, data); // CACHE UPDATE
                    return data;
                } catch (err) {
                    console.warn('⚠️ Network failed/timed out, falling back to cache (Products)', err);
                    return getLocal(STORAGE_KEYS.PRODUCTS);
                }
            }
            return getLocal(STORAGE_KEYS.PRODUCTS);
        },
        create: async (product) => {
            if (supabase) {
                const { data, error } = await supabase.from('products').insert(product).select();
                if (error) throw error;
                return data[0];
            }
            const current = getLocal(STORAGE_KEYS.PRODUCTS);
            const newProd = { ...product, id: crypto.randomUUID() };
            setLocal(STORAGE_KEYS.PRODUCTS, [...current, newProd]);
            return newProd;
        },
        update: async (id, updates) => {
            if (supabase) {
                const { data, error } = await supabase.from('products').update(updates).eq('id', id).select();
                if (error) throw error;
                return data[0];
            }
            const current = getLocal(STORAGE_KEYS.PRODUCTS);
            const index = current.findIndex(p => p.id === id);
            if (index !== -1) {
                const updated = { ...current[index], ...updates };
                current[index] = updated;
                setLocal(STORAGE_KEYS.PRODUCTS, current);
                return updated;
            }
            return null;
        }
    },
    supplies: {
        list: async () => {
            if (supabase) {
                try {
                    const { data, error } = await withTimeout(supabase.from('supplies').select('*').order('name'));
                    if (error) throw error;
                    setLocal('bakery_supplies', data); // CACHE UPDATE
                    return data;
                } catch (err) {
                    console.warn('⚠️ Network failed/timed out, falling back to cache (Supplies)', err);
                    return getLocal('bakery_supplies');
                }
            }
            return getLocal('bakery_supplies');
        },
        create: async (supply) => {
            if (supabase) {
                const { data, error } = await supabase.from('supplies').insert(supply).select();
                if (error) throw error;
                return data[0];
            }
            const current = getLocal('bakery_supplies');
            const newSupply = {
                ...supply,
                id: crypto.randomUUID(),
                current_stock: Number(supply.current_stock || 0),
                created_at: new Date().toISOString(),
                history: [{ price: supply.current_cost, date: new Date().toISOString() }]
            };
            setLocal('bakery_supplies', [...current, newSupply]);
            return newSupply;
        },
        updateStock: async (id, quantityDelta) => {
            if (supabase) {
                const { data: current } = await supabase.from('supplies').select('current_stock').eq('id', id).single();
                const newStock = Math.max(0, Number(current?.current_stock || 0) + Number(quantityDelta));

                const { data, error } = await supabase.from('supplies').update({ current_stock: newStock }).eq('id', id).select();
                if (error) throw error;
                return data[0];
            }
            const current = getLocal('bakery_supplies');
            const index = current.findIndex(s => s.id === id);
            if (index !== -1) {
                const supply = current[index];
                const newStock = Math.max(0, Number(supply.current_stock || 0) + Number(quantityDelta));
                supply.current_stock = newStock;
                current[index] = supply;
                setLocal('bakery_supplies', current);
                return supply;
            }
            return null;
        },
        updatePrice: async (id, newPrice) => {
            if (supabase) {
                const { data: current, error: fetchError } = await supabase
                    .from('supplies')
                    .select('current_cost, history')
                    .eq('id', id)
                    .single();

                if (fetchError) throw fetchError;

                const updates = { current_cost: newPrice };

                if (Number(current.current_cost) !== Number(newPrice)) {
                    const newHistoryItem = {
                        price: Number(newPrice),
                        date: new Date().toISOString()
                    };
                    const currentHistory = Array.isArray(current.history) ? current.history : [];
                    updates.history = [newHistoryItem, ...currentHistory];
                }

                const { data, error } = await supabase
                    .from('supplies')
                    .update(updates)
                    .eq('id', id)
                    .select();

                if (error) throw error;
                return data[0];
            }
            const current = getLocal('bakery_supplies');
            const index = current.findIndex(s => s.id === id);
            if (index !== -1) {
                const supply = current[index];
                if (Number(supply.current_cost) !== Number(newPrice)) {
                    supply.current_cost = Number(newPrice);
                    if (!supply.history) supply.history = [];
                    supply.history.push({ price: Number(newPrice), date: new Date().toISOString() });
                    current[index] = supply;
                    setLocal('bakery_supplies', current);
                }
                return supply;
            }
            return null;
        },
        update: async (id, upgrades) => {
            if (supabase) {
                let finalUpdates = { ...upgrades };

                if (upgrades.current_cost !== undefined) {
                    const { data: current, error: fetchError } = await supabase
                        .from('supplies')
                        .select('current_cost, history')
                        .eq('id', id)
                        .single();

                    if (!fetchError && current) {
                        if (Number(current.current_cost) !== Number(upgrades.current_cost)) {
                            const newHistoryItem = {
                                price: Number(upgrades.current_cost),
                                date: new Date().toISOString()
                            };
                            let currentHistory = Array.isArray(current.history) ? current.history : [];

                            if (currentHistory.length === 0 && current.current_cost) {
                                currentHistory = [{
                                    price: Number(current.current_cost),
                                    date: new Date(Date.now() - 1000).toISOString()
                                }];
                            }

                            finalUpdates.history = [newHistoryItem, ...currentHistory];
                        }
                    }
                }

                const { data, error } = await supabase.from('supplies').update(finalUpdates).eq('id', id).select();
                if (error) throw error;
                return data[0];
            }

            const current = getLocal('bakery_supplies');
            const index = current.findIndex(s => s.id === id);
            if (index !== -1) {
                const oldSupply = current[index];
                let updated = { ...oldSupply, ...upgrades };

                if (upgrades.current_cost !== undefined && Number(oldSupply.current_cost) !== Number(upgrades.current_cost)) {
                    const newHistoryItem = {
                        price: Number(upgrades.current_cost),
                        date: new Date().toISOString()
                    };
                    let history = Array.isArray(oldSupply.history) ? oldSupply.history : [];

                    if (history.length === 0 && oldSupply.current_cost) {
                        history = [{
                            price: Number(oldSupply.current_cost),
                            date: new Date(Date.now() - 1000).toISOString()
                        }];
                    }

                    updated.history = [newHistoryItem, ...history];
                }

                current[index] = updated;
                setLocal('bakery_supplies', current);
                return updated;
            }
            return null;
        },
        delete: async (id) => {
            if (supabase) {
                const { error } = await supabase.from('supplies').delete().eq('id', id);
                if (error) throw error;
                return true;
            }
            const current = getLocal('bakery_supplies');
            setLocal('bakery_supplies', current.filter(s => s.id !== id));
            return true;
        }
    },
    recipes: {
        getByProduct: async (productId) => {
            if (supabase) {
                const { data, error } = await supabase
                    .from('recipes')
                    .select(`
                        id, quantity, unit,
                        supply:supplies (id, name, current_cost, current_stock, unit)
                    `)
                    .eq('product_id', productId);

                if (error) throw error;

                return data.map(r => ({
                    ...r,
                    cost_contribution: (Number(r.quantity) * Number(r.supply.current_cost)).toFixed(2)
                }));
            }
            const allRecipes = getLocal('bakery_recipes') || [];
            const productRecipes = allRecipes.filter(r => r.product_id === productId);
            const supplies = getLocal('bakery_supplies');

            return productRecipes.map(r => {
                const s = supplies.find(sup => sup.id === r.supply_id);
                return {
                    ...r,
                    supply: s,
                    cost_contribution: s ? (Number(r.quantity) * Number(s.current_cost)).toFixed(2) : 0
                };
            }).filter(r => r.supply);
        },
        save: async (productId, ingredients) => {
            if (supabase) {
                await supabase.from('recipes').delete().eq('product_id', productId);

                const toInsert = ingredients.map(i => ({
                    product_id: productId,
                    supply_id: i.supply_id,
                    quantity: i.quantity,
                    unit: i.unit
                }));

                const { error } = await supabase.from('recipes').insert(toInsert);
                if (error) throw error;

                const supplyIds = ingredients.map(i => i.supply_id);
                const { data: supplies } = await supabase.from('supplies').select('id, current_cost').in('id', supplyIds);

                const totalCost = ingredients.reduce((sum, item) => {
                    const supply = supplies?.find(s => s.id === item.supply_id);
                    const cost = Number(supply?.current_cost || 0);
                    return sum + (Number(item.quantity) * cost);
                }, 0);

                await supabase.from('products').update({ calculated_cost: totalCost }).eq('id', productId);

                return true;
            }

            let all = getLocal('bakery_recipes') || [];
            all = all.filter(r => r.product_id !== productId);
            const newRecipes = ingredients.map(i => ({
                id: crypto.randomUUID(),
                product_id: productId,
                supply_id: i.supply_id,
                quantity: i.quantity,
                unit: i.unit
            }));
            setLocal('bakery_recipes', [...all, ...newRecipes]);

            const supplies = getLocal('bakery_supplies');
            const totalCost = newRecipes.reduce((sum, r) => {
                const s = supplies.find(sup => sup.id === r.supply_id);
                const cost = s ? s.current_cost : 0;
                return sum + (Number(r.quantity) * Number(cost));
            }, 0);

            const products = getLocal('bakery_products');
            const pIdx = products.findIndex(p => p.id === productId);
            if (pIdx !== -1) {
                products[pIdx].calculated_cost = totalCost;
                setLocal('bakery_products', products);
            }

            return true;
        }
    },
    packaging: {
        list: async () => {
            if (supabase) {
                try {
                    const { data, error } = await withTimeout(supabase.from('packaging_inventory').select('*').order('type'));
                    if (error) throw error;
                    setLocal(STORAGE_KEYS.PACKAGING, data); // CACHE UPDATE
                    return data;
                } catch (err) {
                    console.warn('⚠️ Network failed/timed out, falling back to cache (Packaging)', err);
                    return getLocal(STORAGE_KEYS.PACKAGING);
                }
            }
            return getLocal(STORAGE_KEYS.PACKAGING);
        },
        create: async (item) => {
            if (supabase) {
                const { data: existing } = await supabase
                    .from('packaging_inventory')
                    .select('id, current_quantity')
                    .eq('type', item.type)
                    .maybeSingle();

                if (existing) {
                    const newQty = Number(existing.current_quantity) + Number(item.current_quantity);
                    const { data, error } = await supabase
                        .from('packaging_inventory')
                        .update({ current_quantity: newQty })
                        .eq('id', existing.id)
                        .select();
                    if (error) throw error;
                    return data[0];
                }

                const { data, error } = await supabase.from('packaging_inventory').insert(item).select();
                if (error) throw error;
                return data[0];
            }
            const current = getLocal(STORAGE_KEYS.PACKAGING);

            const existingIndex = current.findIndex(i => i.type === item.type);
            if (existingIndex !== -1) {
                const existing = current[existingIndex];
                const updated = {
                    ...existing,
                    current_quantity: Number(existing.current_quantity) + Number(item.current_quantity),
                    updated_at: new Date().toISOString()
                };
                current[existingIndex] = updated;
                setLocal(STORAGE_KEYS.PACKAGING, current);
                return updated;
            }

            const newItem = { ...item, id: crypto.randomUUID(), updated_at: new Date().toISOString() };
            setLocal(STORAGE_KEYS.PACKAGING, [...current, newItem]);
            return newItem;
        },
        update: async (id, updates) => {
            if (supabase) {
                const { data, error } = await supabase.from('packaging_inventory').update(updates).eq('id', id).select();
                if (error) throw error;
                return data[0];
            }
            const current = getLocal(STORAGE_KEYS.PACKAGING);
            const index = current.findIndex(i => i.id === id);
            if (index !== -1) {
                const updated = { ...current[index], ...updates, updated_at: new Date().toISOString() };
                current[index] = updated;
                setLocal(STORAGE_KEYS.PACKAGING, current);
                return updated;
            }
            return null;
        },
        delete: async (id) => {
            if (supabase) {
                const { error } = await supabase.from('packaging_inventory').delete().eq('id', id);
                if (error) throw error;
                return true;
            }
            const current = getLocal(STORAGE_KEYS.PACKAGING);
            setLocal(STORAGE_KEYS.PACKAGING, current.filter(i => i.id !== id));
            return true;
        }
    },
    orders: {
        list: async () => {
            if (supabase) {
                try {
                    const { data, error } = await withTimeout(supabase.from('orders').select('*, customers(name, zone)').order('delivery_date', { ascending: true }));
                    if (error) throw error;
                    setLocal('bakery_orders', data); // CACHE UPDATE
                    return data;
                } catch (err) {
                    console.warn('⚠️ Network failed/timed out, falling back to cache (Orders)', err);
                    const orders = getLocal('bakery_orders');
                    const customers = getLocal(STORAGE_KEYS.CUSTOMERS);
                    // Hydrate manually since API fails
                    return orders.map(o => {
                        const c = customers.find(cust => cust.id === o.client_id);
                        return { ...o, customers: c ? { name: c.name, zone: c.zone } : { name: 'Cliente Eliminado', zone: '' } };
                    }).sort((a, b) => new Date(a.delivery_date) - new Date(b.delivery_date));
                }
            }
            const orders = getLocal('bakery_orders');
            const customers = getLocal(STORAGE_KEYS.CUSTOMERS);
            return orders.map(o => {
                const c = customers.find(cust => cust.id === o.client_id);
                return { ...o, customers: c ? { name: c.name, zone: c.zone } : { name: 'Cliente Eliminado', zone: '' } };
            }).sort((a, b) => new Date(a.delivery_date) - new Date(b.delivery_date));
        },
        create: async (order) => {
            const orderData = { ...order, status: 'PENDIENTE' };

            if (supabase) {
                const { data, error } = await supabase.from('orders').insert(orderData).select();
                if (error) throw error;
                const createdOrder = data[0];

                if (createdOrder.prepayment && Number(createdOrder.prepayment) > 0) {
                    await api.transactions.create({
                        date: new Date().toISOString(),
                        type: 'VENTA',
                        amount: Number(createdOrder.prepayment),
                        description: `Anticipo Pedido #${createdOrder.id.slice(0, 8)}`,
                        client_id: createdOrder.client_id,
                        payment_method: 'Efectivo',
                        pedido_id: createdOrder.id
                    });
                }
                return createdOrder;
            }

            const current = getLocal('bakery_orders');
            const newOrder = { ...orderData, id: crypto.randomUUID(), created_at: new Date().toISOString() };
            setLocal('bakery_orders', [...current, newOrder]);

            if (newOrder.prepayment && Number(newOrder.prepayment) > 0) {
                await api.transactions.create({
                    date: new Date().toISOString(),
                    type: 'VENTA',
                    amount: Number(newOrder.prepayment),
                    description: `Anticipo Pedido #${newOrder.id.slice(0, 8)}`,
                    client_id: newOrder.client_id,
                    payment_method: 'Efectivo',
                    pedido_id: newOrder.id
                });
            }

            return newOrder;
        },
        complete: async (orderId, totalCollected, transactionData) => {
            try {
                let items = [];
                if (supabase) {
                    const { data } = await supabase.from('orders').select('items').eq('id', orderId).single();
                    if (data) items = Array.isArray(data.items) ? data.items : JSON.parse(data.items || '[]');
                } else {
                    const orders = getLocal('bakery_orders');
                    const order = orders.find(o => o.id === orderId);
                    if (order) items = Array.isArray(order.items) ? order.items : (order.items || []);
                }

                const packagingList = await api.packaging.list();

                for (const item of items) {
                    const qty = Number(item.quantity);
                    let match = packagingList.find(p => p.type.toLowerCase().includes(item.product.toLowerCase()));
                    if (!match) match = packagingList.find(p => p.type.toLowerCase().includes('caja') && p.current_quantity > 0);
                    if (!match) match = packagingList.find(p => p.type.toLowerCase().includes('bolsa') && p.current_quantity > 0);

                    if (match) {
                        const newQty = Math.max(0, match.current_quantity - qty);
                        await api.packaging.update(match.id, { current_quantity: newQty });
                        match.current_quantity = newQty;
                    }
                }
            } catch (err) {
                console.error("Error deducting packaging", err);
            }

            if (supabase) {
                const { error: orderError } = await supabase.from('orders').update({ status: 'ENTREGADO' }).eq('id', orderId);
                if (orderError) throw orderError;
                return await api.transactions.create(transactionData);
            }

            const orders = getLocal('bakery_orders');
            const index = orders.findIndex(o => o.id === orderId);
            if (index !== -1) {
                orders[index].status = 'ENTREGADO';
                setLocal('bakery_orders', orders);
                return await api.transactions.create(transactionData);
            }
        },
        update: async (id, transaction) => {
            if (supabase) {
                const { data, error } = await supabase.from('orders').update(transaction).eq('id', id).select();
                if (error) throw error;
                return data[0];
            }
            const orders = getLocal('bakery_orders');
            const idx = orders.findIndex(o => o.id === id);
            if (idx !== -1) {
                orders[idx] = { ...orders[idx], ...transaction };
                setLocal('bakery_orders', orders);
                return orders[idx];
            }
            return null;
        },
        delete: async (id) => {
            if (supabase) {
                const { error } = await supabase.from('orders').delete().eq('id', id);
                if (error) throw error;
                return true;
            }
            const orders = getLocal('bakery_orders');
            setLocal('bakery_orders', orders.filter(o => o.id !== id));
            return true;
        }
    }
};
