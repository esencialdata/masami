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

// KEYS - RESTORED TO 'miga_' TO RECOVER USER DATA
const STORAGE_KEYS = {
    TRANSACTIONS: 'miga_transactions',
    CUSTOMERS: 'miga_customers',
    PRODUCTS: 'miga_products',
    PACKAGING: 'miga_packaging',
    CONFIG: 'miga_config',
    SUPPLIES: 'miga_supplies',
    RECIPES: 'miga_recipes',
    ORDERS: 'miga_orders'
};

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

// Seed
const seedLocal = () => {
    if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
        setLocal(STORAGE_KEYS.CONFIG, { monthly_fixed_costs: 15000, monthly_goal: 0 });
    }
};
if (!supabase) seedLocal();

export const api = {
    transactions: {
        list: async (options = {}) => {
            // ALWAYS Return Cache First Pattern? 
            // Standard approach: Try Net -> Catch -> Local
            // "Paranoia" Fix: Try Net -> Check Data -> If Empty & Cache Exists -> Return Cache -> Else Return Net

            if (supabase) {
                try {
                    // Check session explicitly to avoid RLS empty return
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw new Error("No active session");

                    let query = supabase.from('transactions').select('*').order('date', { ascending: false });
                    if (options.limit) query = query.limit(options.limit);
                    if (options.startDate) query = query.gte('date', options.startDate);
                    if (options.endDate) query = query.lte('date', options.endDate);

                    const { data, error } = await query;
                    if (error) throw error;

                    // STRICT: If Server says 0, but Cache says 100, Server is lying (RLS fail).
                    if ((!data || data.length === 0) && !options.startDate && !options.endDate && !options.limit) {
                        const cached = getLocal(STORAGE_KEYS.TRANSACTIONS);
                        if (cached.length > 0) {
                            console.warn("🛡️ Firewall: Server returned 0 transactions, keeping cache.");
                            return cached;
                        }
                    }

                    if (!options.startDate && !options.endDate && !options.limit) {
                        setLocal(STORAGE_KEYS.TRANSACTIONS, data);
                    }
                    return data;
                } catch (err) {
                    console.warn('⚠️ Network failed, falling back to cache:', err);
                }
            }

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
                const cached = getLocal(STORAGE_KEYS.TRANSACTIONS) || [];
                setLocal(STORAGE_KEYS.TRANSACTIONS, [data[0], ...cached]);
                // Client side stat update
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
            return newTx;
        }
    },
    customers: {
        list: async () => {
            if (supabase) {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw new Error("No session");

                    const { data, error } = await supabase.from('customers').select('*').order('name');
                    if (error) throw error;

                    if (!data || data.length === 0) {
                        const cached = getLocal(STORAGE_KEYS.CUSTOMERS);
                        if (cached.length > 0) return cached;
                    }

                    setLocal(STORAGE_KEYS.CUSTOMERS, data);
                    return data;
                } catch (err) {
                    console.warn('⚠️ using cache (customers)');
                    return getLocal(STORAGE_KEYS.CUSTOMERS);
                }
            }
            return getLocal(STORAGE_KEYS.CUSTOMERS);
        },
        create: async (customer) => {
            const newCustomer = { ...customer, total_orders: 0, total_purchased: 0, zone: customer.zone || 'Sin Zona' };
            if (supabase) {
                try {
                    const { data, error } = await supabase.from('customers').insert(newCustomer).select();
                    if (error) throw error;
                    return data[0];
                } catch (err) {
                    if (err.message && err.message.includes('notes')) {
                        const { notes, ...fallback } = newCustomer;
                        const { data, error } = await supabase.from('customers').insert(fallback).select();
                        if (error) throw error; return data[0];
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
                    if (err.message && err.message.includes('notes')) {
                        const { notes, ...fallback } = updates;
                        const { data, error } = await supabase.from('customers').update(fallback).eq('id', id).select();
                        if (error) throw error; return data[0];
                    }
                    throw err;
                }
            }
            const current = getLocal(STORAGE_KEYS.CUSTOMERS);
            const index = current.findIndex(c => c.id === id);
            if (index !== -1) {
                const updated = { ...current[index], ...updates };
                current[index] = updated; setLocal(STORAGE_KEYS.CUSTOMERS, current); return updated;
            }
            return null;
        }
    },
    config: {
        get: async () => {
            if (supabase) {
                try {
                    const { data, error } = await supabase.from('configuration').select('*').single();
                    if (error) return getLocal(STORAGE_KEYS.CONFIG) || { monthly_fixed_costs: 15000 };
                    setLocal(STORAGE_KEYS.CONFIG, data);
                    return data;
                } catch (err) {
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
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw new Error("No session");

                    const { data, error } = await supabase.from('products').select('*').order('name');
                    if (error) throw error;

                    if (!data || data.length === 0) {
                        const cached = getLocal(STORAGE_KEYS.PRODUCTS);
                        if (cached.length > 0) return cached;
                    }

                    setLocal(STORAGE_KEYS.PRODUCTS, data);
                    return data;
                } catch (err) {
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
                current[index] = updated; setLocal(STORAGE_KEYS.PRODUCTS, current); return updated;
            }
            return null;
        }
    },
    supplies: {
        list: async () => {
            if (supabase) {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw new Error("No session");

                    const { data, error } = await supabase.from('supplies').select('*').order('name');
                    if (error) throw error;

                    if (!data || data.length === 0) {
                        const cached = getLocal(STORAGE_KEYS.SUPPLIES);
                        if (cached.length > 0) return cached;
                    }

                    setLocal(STORAGE_KEYS.SUPPLIES, data);
                    return data;
                } catch (err) {
                    return getLocal(STORAGE_KEYS.SUPPLIES);
                }
            }
            return getLocal(STORAGE_KEYS.SUPPLIES);
        },
        create: async (supply) => {
            if (supabase) {
                const { data, error } = await supabase.from('supplies').insert(supply).select();
                if (error) throw error;
                return data[0];
            }
            const current = getLocal(STORAGE_KEYS.SUPPLIES);
            const newSupply = { ...supply, id: crypto.randomUUID(), current_stock: Number(supply.current_stock || 0), created_at: new Date().toISOString(), history: [{ price: supply.current_cost, date: new Date().toISOString() }] };
            setLocal(STORAGE_KEYS.SUPPLIES, [...current, newSupply]);
            return newSupply;
        },
        updateStock: async (id, quantityDelta) => {
            if (supabase) {
                const { data: current } = await supabase.from('supplies').select('current_stock').eq('id', id).single();
                const newStock = Math.max(0, Number(current?.current_stock || 0) + Number(quantityDelta));
                const { data, error } = await supabase.from('supplies').update({ current_stock: newStock }).eq('id', id).select();
                if (error) throw error; return data[0];
            }
            const current = getLocal(STORAGE_KEYS.SUPPLIES);
            const index = current.findIndex(s => s.id === id);
            if (index !== -1) {
                const supply = current[index];
                const newStock = Math.max(0, Number(supply.current_stock || 0) + Number(quantityDelta));
                supply.current_stock = newStock;
                current[index] = supply;
                setLocal(STORAGE_KEYS.SUPPLIES, current);
                return supply;
            }
            return null;
        },
        updatePrice: async (id, newPrice) => {
            if (supabase) {
                const { data: current, error: fetchError } = await supabase.from('supplies').select('current_cost, history').eq('id', id).single();
                if (fetchError) throw fetchError;
                const updates = { current_cost: newPrice };
                if (Number(current.current_cost) !== Number(newPrice)) {
                    updates.history = [{ price: Number(newPrice), date: new Date().toISOString() }, ...(current.history || [])];
                }
                const { data, error } = await supabase.from('supplies').update(updates).eq('id', id).select();
                if (error) throw error; return data[0];
            }
            const current = getLocal(STORAGE_KEYS.SUPPLIES);
            const index = current.findIndex(s => s.id === id);
            if (index !== -1) {
                const supply = current[index];
                if (Number(supply.current_cost) !== Number(newPrice)) {
                    supply.current_cost = Number(newPrice);
                    if (!supply.history) supply.history = [];
                    supply.history.push({ price: Number(newPrice), date: new Date().toISOString() });
                    current[index] = supply;
                    setLocal(STORAGE_KEYS.SUPPLIES, current);
                }
                return supply;
            }
            return null;
        },
        update: async (id, upgrades) => {
            if (supabase) {
                let finalUpdates = { ...upgrades };
                if (upgrades.current_cost !== undefined) {
                    const { data: current } = await supabase.from('supplies').select('current_cost, history').eq('id', id).single();
                    if (current && Number(current.current_cost) !== Number(upgrades.current_cost)) {
                        finalUpdates.history = [{ price: Number(upgrades.current_cost), date: new Date().toISOString() }, ...(current.history || [])];
                    }
                }
                const { data, error } = await supabase.from('supplies').update(finalUpdates).eq('id', id).select();
                if (error) throw error; return data[0];
            }
            const current = getLocal(STORAGE_KEYS.SUPPLIES);
            const index = current.findIndex(s => s.id === id);
            if (index !== -1) {
                const updated = { ...current[index], ...upgrades };
                current[index] = updated; setLocal(STORAGE_KEYS.SUPPLIES, current); return updated;
            }
            return null;
        },
        delete: async (id) => {
            if (supabase) {
                const { error } = await supabase.from('supplies').delete().eq('id', id);
                if (error) throw error; return true;
            }
            const current = getLocal(STORAGE_KEYS.SUPPLIES);
            setLocal(STORAGE_KEYS.SUPPLIES, current.filter(s => s.id !== id));
            return true;
        }
    },
    recipes: {
        getByProduct: async (productId) => {
            if (supabase) {
                const { data, error } = await supabase.from('recipes').select('id, quantity, unit, supply:supplies (id, name, current_cost, current_stock, unit)').eq('product_id', productId);
                if (error) throw error;
                return data.map(r => ({ ...r, cost_contribution: (Number(r.quantity) * Number(r.supply.current_cost)).toFixed(2) }));
            }
            const allRecipes = getLocal(STORAGE_KEYS.RECIPES) || [];
            const supplies = getLocal(STORAGE_KEYS.SUPPLIES);
            return allRecipes.filter(r => r.product_id === productId).map(r => {
                const s = supplies.find(sup => sup.id === r.supply_id);
                return { ...r, supply: s, cost_contribution: s ? (Number(r.quantity) * Number(s.current_cost)).toFixed(2) : 0 };
            }).filter(r => r.supply);
        },
        save: async (productId, ingredients) => {
            if (supabase) {
                await supabase.from('recipes').delete().eq('product_id', productId);
                const toInsert = ingredients.map(i => ({ product_id: productId, supply_id: i.supply_id, quantity: i.quantity, unit: i.unit }));
                await supabase.from('recipes').insert(toInsert);
                return true;
            }
            let all = getLocal(STORAGE_KEYS.RECIPES) || [];
            all = all.filter(r => r.product_id !== productId);
            const newRecipes = ingredients.map(i => ({ id: crypto.randomUUID(), product_id: productId, supply_id: i.supply_id, quantity: i.quantity, unit: i.unit }));
            setLocal(STORAGE_KEYS.RECIPES, [...all, ...newRecipes]);
            return true;
        }
    },
    packaging: {
        list: async () => {
            if (supabase) {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw new Error("No session");

                    const { data, error } = await supabase.from('packaging_inventory').select('*').order('type');
                    if (error) throw error;

                    if (!data || data.length === 0) {
                        const cached = getLocal(STORAGE_KEYS.PACKAGING);
                        if (cached.length > 0) return cached;
                    }

                    setLocal(STORAGE_KEYS.PACKAGING, data);
                    return data;
                } catch (err) {
                    return getLocal(STORAGE_KEYS.PACKAGING);
                }
            }
            return getLocal(STORAGE_KEYS.PACKAGING);
        },
        create: async (item) => {
            if (supabase) {
                const { data: existing } = await supabase.from('packaging_inventory').select('id, current_quantity').eq('type', item.type).maybeSingle();
                if (existing) {
                    const newQty = Number(existing.current_quantity) + Number(item.current_quantity);
                    const { data, error } = await supabase.from('packaging_inventory').update({ current_quantity: newQty }).eq('id', existing.id).select();
                    if (error) throw error; return data[0];
                }
                const { data, error } = await supabase.from('packaging_inventory').insert(item).select();
                if (error) throw error; return data[0];
            }
            const current = getLocal(STORAGE_KEYS.PACKAGING);
            const newItem = { ...item, id: crypto.randomUUID(), updated_at: new Date().toISOString() };
            setLocal(STORAGE_KEYS.PACKAGING, [...current, newItem]);
            return newItem;
        },
        update: async (id, updates) => {
            if (supabase) {
                const { data, error } = await supabase.from('packaging_inventory').update(updates).eq('id', id).select();
                if (error) throw error; return data[0];
            }
            const current = getLocal(STORAGE_KEYS.PACKAGING);
            const index = current.findIndex(i => i.id === id);
            if (index !== -1) {
                const updated = { ...current[index], ...updates };
                current[index] = updated; setLocal(STORAGE_KEYS.PACKAGING, current); return updated;
            }
            return null;
        },
        delete: async (id) => {
            if (supabase) {
                const { error } = await supabase.from('packaging_inventory').delete().eq('id', id);
                if (error) throw error; return true;
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
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw new Error("No session");

                    const { data, error } = await supabase.from('orders').select('*, customers(name, zone)').order('delivery_date', { ascending: true });
                    if (error) throw error;

                    if (!data || data.length === 0) {
                        const cached = getLocal(STORAGE_KEYS.ORDERS);
                        if (cached.length > 0) return mapOrders(cached);
                    }

                    setLocal(STORAGE_KEYS.ORDERS, data);
                    return data;
                } catch (err) {
                    return mapOrders(getLocal(STORAGE_KEYS.ORDERS));
                }
            }
            return mapOrders(getLocal(STORAGE_KEYS.ORDERS));
        },
        create: async (order) => {
            const orderData = { ...order, status: 'PENDIENTE' };
            if (supabase) {
                const { data, error } = await supabase.from('orders').insert(orderData).select();
                if (error) throw error;
                return data[0];
            }
            const current = getLocal(STORAGE_KEYS.ORDERS);
            const newOrder = { ...orderData, id: crypto.randomUUID(), created_at: new Date().toISOString() };
            setLocal(STORAGE_KEYS.ORDERS, [...current, newOrder]);
            return newOrder;
        },
        complete: async (orderId, totalCollected, transactionData) => {
            if (supabase) {
                const { error } = await supabase.from('orders').update({ status: 'ENTREGADO' }).eq('id', orderId);
                if (error) throw error;
                return await api.transactions.create(transactionData);
            }
            const orders = getLocal(STORAGE_KEYS.ORDERS);
            const index = orders.findIndex(o => o.id === orderId);
            if (index !== -1) {
                orders[index].status = 'ENTREGADO';
                setLocal(STORAGE_KEYS.ORDERS, orders);
                return await api.transactions.create(transactionData);
            }
        },
        update: async (id, transaction) => {
            if (supabase) {
                const { data, error } = await supabase.from('orders').update(transaction).eq('id', id).select();
                if (error) throw error; return data[0];
            }
            const orders = getLocal(STORAGE_KEYS.ORDERS);
            const idx = orders.findIndex(o => o.id === id);
            if (idx !== -1) { orders[idx] = { ...orders[idx], ...transaction }; setLocal(STORAGE_KEYS.ORDERS, orders); return orders[idx]; }
            return null;
        },
        delete: async (id) => {
            if (supabase) {
                const { error } = await supabase.from('orders').delete().eq('id', id);
                if (error) throw error; return true;
            }
            const orders = getLocal(STORAGE_KEYS.ORDERS);
            setLocal(STORAGE_KEYS.ORDERS, orders.filter(o => o.id !== id));
            return true;
        }
    }
};

const mapOrders = (orders) => {
    const customers = getLocal(STORAGE_KEYS.CUSTOMERS);
    return orders.map(o => {
        const c = customers.find(cust => cust.id === o.client_id);
        return { ...o, customers: c ? { name: c.name, zone: c.zone } : { name: 'Cliente Eliminado', zone: '' } };
    }).sort((a, b) => new Date(a.delivery_date) - new Date(b.delivery_date));
};
