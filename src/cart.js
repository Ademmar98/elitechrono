const CART_KEY = 'elitechrono_cart';

export const Cart = {
  items: (function() { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch (e) { return []; } })(),

  save() {
    localStorage.setItem(CART_KEY, JSON.stringify(this.items));
    this.updateBadge();
  },

  add(productId) {
    const existing = this.items.find(i => i.id === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ id: productId, qty: 1 });
    }
    this.save();
  },

  remove(productId) {
    this.items = this.items.filter(i => i.id !== productId);
    this.save();
  },

  updateQty(productId, qty) {
    qty = parseInt(qty, 10);
    if (isNaN(qty) || qty < 1) return this.remove(productId);
    const item = this.items.find(i => i.id === productId);
    if (item) { item.qty = qty; this.save(); }
  },

  getTotal(watches) {
    return this.items.reduce((sum, item) => {
      const watch = watches.find(w => w.id === item.id);
      return sum + (watch ? watch.price * item.qty : 0);
    }, 0);
  },

  getCount() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  updateBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      const count = this.getCount();
      badge.textContent = count;
      badge.classList.toggle('hidden', count === 0);
    }
  },

  clear() {
    this.items = [];
    this.save();
  },
};
