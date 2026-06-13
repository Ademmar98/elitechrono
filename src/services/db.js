import { supabase, isSupabaseReady } from '../lib/supabaseClient.js';
import { WATCHES, WILAYAS } from '../data.js';

const ORDERS_KEY = 'elitechrono_orders';
const PRODUCTS_KEY = 'elitechrono_products';

// --- Fallback localStorage helpers ---

function lsGet(key) {
  return JSON.parse(localStorage.getItem(key) || 'null');
}
function lsSet(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- Seed data (runs once on first load) ---

export function seedIfEmpty() {
  if (!localStorage.getItem(ORDERS_KEY)) {
    const sampleOrders = [
      { id: 'ORD-1001', date: '2026-06-10T14:23:00', firstName: 'James', lastName: 'Smith', phone: '+213 770 12 34 56', wilaya: 'Alger', wilayaCode: 16, commune: 'Alger Centre', address: '42 Rue Didouche Mourad', items: [{ id: 'rolex-submariner', qty: 1 }], status: 'delivered', total: 14500 },
      { id: 'ORD-1002', date: '2026-06-09T09:15:00', firstName: 'Sophie', lastName: 'Dubois', phone: '+213 661 98 76 54', wilaya: 'Oran', wilayaCode: 31, commune: 'Bir El Djir', address: '15 Rue Larbi Ben M\'hidi', items: [{ id: 'omega-speedmaster', qty: 1 }], status: 'shipped', total: 7200 },
      { id: 'ORD-1003', date: '2026-06-08T16:45:00', firstName: 'Mohamed', lastName: 'Khelifi', phone: '+213 550 33 44 55', wilaya: 'Constantine', wilayaCode: 25, commune: 'El Khroub', address: 'Cité Belle Vue, BT A N°12', items: [{ id: 'patek-nautilus', qty: 1 }], status: 'confirmed', total: 134000 },
      { id: 'ORD-1004', date: '2026-06-07T11:30:00', firstName: 'Hadjer', lastName: 'Benaissa', phone: '+213 558 71 82 93', wilaya: 'Blida', wilayaCode: 9, commune: 'Boufarik', address: 'Lotissement El Feth, Villa 7', items: [{ id: 'rolex-datejust', qty: 1 }, { id: 'boss-navigator', qty: 1 }], status: 'pending', total: 13095 },
      { id: 'ORD-1005', date: '2026-06-06T08:00:00', firstName: 'Yanis', lastName: 'Ouali', phone: '+213 773 44 55 66', wilaya: 'Sétif', wilayaCode: 19, commune: 'Sétif', address: '146 Rue de la Liberté', items: [{ id: 'ap-royal-oak', qty: 1 }], status: 'cancelled', total: 58500 },
      { id: 'ORD-1006', date: '2026-06-05T19:20:00', firstName: 'Ines', lastName: 'Mazari', phone: '+213 669 12 34 56', wilaya: 'Tizi Ouzou', wilayaCode: 15, commune: 'Azazga', address: 'Village Ath Smaïl, Route Nationale 12', items: [{ id: 'cartier-panthere', qty: 1 }, { id: 'hublot-bigbang', qty: 1 }], status: 'shipped', total: 33000 },
    ];
    lsSet(ORDERS_KEY, sampleOrders);
  }
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    const seedProducts = WATCHES.map(w => ({
      ...w, sections: w.new ? ['New Models'] : [], visible: true, images: [w.img],
    }));
    lsSet(PRODUCTS_KEY, seedProducts);
  }
}

// --- Orders ---

export async function getOrders() {
  if (isSupabaseReady()) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false });
    if (error) { console.error('[DB] getOrders:', error); return []; }
    return data;
  }
  return lsGet(ORDERS_KEY) || [];
}

export async function getOrderById(orderId) {
  if (isSupabaseReady()) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    if (error) return null;
    return data;
  }
  const orders = lsGet(ORDERS_KEY) || [];
  return orders.find(o => o.id === orderId) || null;
}

export async function saveOrder(order) {
  if (isSupabaseReady()) {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    if (error) { console.error('[DB] saveOrder:', error); return null; }
    return data;
  }
  const orders = lsGet(ORDERS_KEY) || [];
  orders.push(order);
  lsSet(ORDERS_KEY, orders);
  return order;
}

export async function updateOrderStatus(orderId, newStatus) {
  if (isSupabaseReady()) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select()
      .single();
    if (error) { console.error('[DB] updateOrderStatus:', error); return null; }
    return data;
  }
  const orders = lsGet(ORDERS_KEY) || [];
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    lsSet(ORDERS_KEY, orders);
  }
  return order || null;
}

// --- Products ---

export async function getProducts() {
  if (isSupabaseReady()) {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    if (error) { console.error('[DB] getProducts:', error); return []; }
    return data;
  }
  return lsGet(PRODUCTS_KEY) || [];
}

export async function saveProduct(product) {
  if (isSupabaseReady()) {
    const { data, error } = await supabase
      .from('products')
      .upsert(product, { onConflict: 'id' })
      .select()
      .single();
    if (error) { console.error('[DB] saveProduct:', error); return null; }
    return data;
  }
  const products = lsGet(PRODUCTS_KEY) || [];
  const idx = products.findIndex(p => p.id === product.id);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...product };
  } else {
    products.push(product);
  }
  lsSet(PRODUCTS_KEY, products);
  return product;
}

export async function deleteProduct(productId) {
  if (isSupabaseReady()) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    if (error) { console.error('[DB] deleteProduct:', error); return false; }
    return true;
  }
  const products = lsGet(PRODUCTS_KEY) || [];
  lsSet(PRODUCTS_KEY, products.filter(p => p.id !== productId));
  return true;
}

// --- Watch catalog (static, can be seeded to DB) ---

export function getLocalWatches() {
  return WATCHES;
}

export function getLocalNewWatches() {
  return WATCHES.filter(w => w.new);
}

export function getWilayas() {
  return WILAYAS;
}

// --- Realtime subscriptions ---

const activeSubscriptions = {};

export function subscribeOrders(callback) {
  if (!isSupabaseReady()) {
    // Poll localStorage every 2s as fallback
    const interval = setInterval(() => {
      const orders = lsGet(ORDERS_KEY) || [];
      callback(orders);
    }, 2000);
    return () => clearInterval(interval);
  }

  const sub = supabase
    .channel('orders-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
      callback(payload);
    })
    .subscribe();

  activeSubscriptions.orders = sub;
  return () => {
    supabase.removeChannel(sub);
    delete activeSubscriptions.orders;
  };
}

export function unsubscribeAll() {
  Object.values(activeSubscriptions).forEach(sub => {
    supabase.removeChannel(sub);
  });
}

// --- Table bootstrap (run once to create seed tables) ---

export async function bootstrapSupabaseTables() {
  if (!isSupabaseReady()) return;

  // Check if products table has data
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  if (count === 0) {
    // Seed products from static data
    const seedProducts = WATCHES.map(w => ({
      id: w.id,
      name: w.name,
      brand: w.brand,
      price: w.price,
      description: w.description,
      img: w.img,
      images: [w.img],
      new: w.new || false,
      originalPrice: w.originalPrice || null,
      specs: w.specs || {},
      sections: w.new ? ['New Models'] : [],
      in_stock: true,
      visible: true,
    }));

    const { error } = await supabase.from('products').insert(seedProducts);
    if (error) console.warn('[DB] Seed products failed:', error.message);
  }
}

// --- Image upload to Supabase Storage ---

export async function uploadImage(file) {
  if (!isSupabaseReady()) return { error: 'Supabase not connected' };
  const ext = file.name.split('.').pop().toLowerCase();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { contentType: file.type, upsert: false });
  if (error) return { error: error.message };
  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);
  return { url: urlData.publicUrl };
}
