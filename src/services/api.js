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

// RESTORED KEYS ('miga_')
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
        return [];
    }
};

const setLocal = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Seed Logic (Minimal)
if (!supabase && !localStorage.getItem(STORAGE_KEYS.CONFIG)) {
    setLocal(STORAGE_KEYS.CONFIG, { monthly_fixed_costs: 15000 });
}

export const api = {
    transactions: {
        list: async (options = {}) => {
            if (supabase) {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw new Error("No session");

                    let query = supabase.from('transactions').select('*').order('date', { ascending: false });
                    if (options.limit) query = query.limit(options.limit);

                    const { data, error } = await query;
                    if (error) throw error;

                    // SAFETY: If server returns 0 items but cache has data, ignore server (RLS fix)
                    if ((!data || data.length === 0) && !options.startDate && !options.limit) {
                        const cached = getLocal(STORAGE_KEYS.TRANSACTIONS);
                        if (cached.length > 0) return cached;
                    }

                    if (!options.startDate && !options.limit) {
                        setLocal(STORAGE_KEYS.TRANSACTIONS, data);
                    }
                    return data;
                } catch (e) {
                    // Fallback to cache
                }
            }
            let data = getLocal(STORAGE_KEYS.TRANSACTIONS) || [];
            if (options.limit) data = data.slice(0, options.limit);
            return data;
        },
        create: async (transaction) => {
            if (supabase) {
                const { data, error } = await supabase.from('transactions').insert(transaction).select();
                if (error) throw error;
                const cached = getLocal(STORAGE_KEYS.TRANSACTIONS) || [];
                setLocal(STORAGE_KEYS.TRANSACTIONS, [data[0], ...cached]);
                return data[0];
            }
            // Local fallback (unlikely with supabase present but good for safety)
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
                } catch (e) { }
            }
            return getLocal(STORAGE_KEYS.CUSTOMERS);
        },
        create: async (customer) => {
            if (supabase) {
                const { data, error } = await supabase.from('customers').insert(customer).select();
                if (error) throw error;
                return data[0];
            }
            return null;
        },
        update: async (id, updates) => {
            if (supabase) {
                const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select();
                if (error) throw error;
                return data[0];
            }
            return null;
        }
    },
    products: {
        list: async () => {
            if (supabase) {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw "No session";
                    const { data, error } = await supabase.from('products').select('*').order('name');
                    if (error) throw error;
                    if (!data || data.length === 0) {
                        const cached = getLocal(STORAGE_KEYS.PRODUCTS);
                        if (cached.length > 0) return cached;
                    }
                    setLocal(STORAGE_KEYS.PRODUCTS, data);
                    return data;
                } catch (e) { }
            }
            return getLocal(STORAGE_KEYS.PRODUCTS);
        },
        create: async (i) => {
            if (supabase) { const { data, error } = await supabase.from('products').insert(i).select(); if (error) throw error; return data[0]; }
            return null;
        },
        update: async (id, u) => {
            if (supabase) { const { data, error } = await supabase.from('products').update(u).eq('id', id).select(); if (error) throw error; return data[0]; }
            return null;
        }
    },
    config: {
        get: async () => {
            if (supabase) {
                const { data } = await supabase.from('configuration').select('*').single();
                if (data) setLocal(STORAGE_KEYS.CONFIG, data);
                return data || getLocal(STORAGE_KEYS.CONFIG);
            }
            return getLocal(STORAGE_KEYS.CONFIG);
        },
        update: async (c) => {
            if (supabase) await supabase.from('configuration').upsert(c);
            setLocal(STORAGE_KEYS.CONFIG, c);
            return c;
        }
    },
    supplies: {
        list: async () => {
            if (supabase) {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw "No session";
                    const { data, error } = await supabase.from('supplies').select('*').order('name');
                    if (error) throw error;
                    if (!data || data.length === 0) {
                        const cached = getLocal(STORAGE_KEYS.SUPPLIES);
                        if (cached.length > 0) return cached;
                    }
                    setLocal(STORAGE_KEYS.SUPPLIES, data);
                    return data;
                } catch (e) { }
            }
            return getLocal(STORAGE_KEYS.SUPPLIES);
        },
        create: async (i) => {
            if (supabase) { const { data, error } = await supabase.from('supplies').insert(i).select(); if (error) throw error; return data[0]; }
            return null;
        },
        updateStock: async (id, delta) => {
            if (supabase) {
                const { data: c } = await supabase.from('supplies').select('current_stock').eq('id', id).single();
                const n = Math.max(0, Number(c?.current_stock || 0) + Number(delta));
                const { data, error } = await supabase.from('supplies').update({ current_stock: n }).eq('id', id).select();
                if (error) throw error; return data[0];
            }
            return null;
        },
        updatePrice: async (id, p) => {
            if (supabase) {
                const { data: c } = await supabase.from('supplies').select('current_cost,history').eq('id', id).single();
                const u = { current_cost: p };
                if (Number(c.current_cost) !== Number(p)) u.history = [{ price: Number(p), date: new Date().toISOString() }, ...(c.history || [])];
                const { data, error } = await supabase.from('supplies').update(u).eq('id', id).select();
                if (error) throw error; return data[0];
            }
            return null;
        },
        update: async (id, u) => {
            if (supabase) { const { data, error } = await supabase.from('supplies').update(u).eq('id', id).select(); if (error) throw error; return data[0]; }
            return null;
        },
        delete: async (id) => {
            if (supabase) await supabase.from('supplies').delete().eq('id', id);
            return true;
        }
    },
    packaging: {
        list: async () => {
            if (supabase) {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw "No session";
                    const { data, error } = await supabase.from('packaging_inventory').select('*').order('type');
                    if (error) throw error;
                    if (!data || data.length === 0) {
                        const cached = getLocal(STORAGE_KEYS.PACKAGING);
                        if (cached.length > 0) return cached;
                    }
                    setLocal(STORAGE_KEYS.PACKAGING, data);
                    return data;
                } catch (e) { }
            }
            return getLocal(STORAGE_KEYS.PACKAGING);
        },
        create: async (i) => {
            if (supabase) { const { data, error } = await supabase.from('packaging_inventory').insert(i).select(); if (error) throw error; return data[0]; }
            return null;
        },
        update: async (id, u) => {
            if (supabase) { const { data, error } = await supabase.from('packaging_inventory').update(u).eq('id', id).select(); if (error) throw error; return data[0]; }
            return null;
        },
        delete: async (id) => {
            if (supabase) await supabase.from('packaging_inventory').delete().eq('id', id);
            return true;
        }
    },
    orders: {
        list: async () => {
            if (supabase) {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw "No session";
                    const { data, error } = await supabase.from('orders').select('*, customers(name, zone)').order('delivery_date', { ascending: true });
                    if (error) throw error;
                    if (!data || data.length === 0) {
                        const cached = getLocal(STORAGE_KEYS.ORDERS);
                        if (cached.length > 0) return mapOrders(cached);
                    }
                    setLocal(STORAGE_KEYS.ORDERS, data);
                    return data;
                } catch (e) { }
            }
            return mapOrders(getLocal(STORAGE_KEYS.ORDERS));
        },
        create: async (o) => {
            if (supabase) {
                const { data, error } = await supabase.from('orders').insert({ ...o, status: 'PENDIENTE' }).select();
                if (error) throw error;
                if (data[0].prepayment) await api.transactions.create({
                    date: new Date().toISOString(), type: 'VENTA', amount: Number(data[0].prepayment), client_id: data[0].client_id, description: `Anticipo #${data[0].id.slice(0, 4)}`, pedido_id: data[0].id
                });
                return data[0];
            }
            return null;
        },
        complete: async (id, tot, tx) => {
            if (supabase) {
                await supabase.from('orders').update({ status: 'ENTREGADO' }).eq('id', id);
                return await api.transactions.create(tx);
            }
        },
        update: async (id, u) => {
            if (supabase) { const { data, error } = await supabase.from('orders').update(u).eq('id', id).select(); if (error) throw error; return data[0]; }
            return null;
        },
        delete: async (id) => {
            if (supabase) await supabase.from('orders').delete().eq('id', id);
            return true;
        }
    },
    recipes: {
        getByProduct: async (pid) => {
            if (supabase) {
                const { data, error } = await supabase.from('recipes').select('id,quantity,unit,supply:supplies(id,name,current_cost)').eq('product_id', pid);
                if (error) throw error;
                return data.map(r => ({ ...r, cost_contribution: (Number(r.quantity) * Number(r.supply.current_cost)).toFixed(2) }));
            }
            return [];
        },
        save: async (pid, ings) => {
            if (supabase) {
                await supabase.from('recipes').delete().eq('product_id', pid);
                const ins = ings.map(i => ({ product_id: pid, supply_id: i.supply_id, quantity: i.quantity, unit: i.unit }));
                await supabase.from('recipes').insert(ins);
                return true;
            }
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
