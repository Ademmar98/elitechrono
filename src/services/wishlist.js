const WISHLIST_KEY = 'elitechrono_wishlist';

export const Wishlist = {
  items: (function () {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); } catch (e) { return []; }
  })(),

  save() {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(this.items));
    this.updateBadge();
  },

  add(productId) {
    if (!this.items.includes(productId)) {
      this.items.push(productId);
      this.save();
    }
  },

  remove(productId) {
    this.items = this.items.filter(i => i !== productId);
    this.save();
  },

  toggle(productId) {
    if (this.items.includes(productId)) {
      this.remove(productId);
      return false;
    } else {
      this.add(productId);
      return true;
    }
  },

  has(productId) {
    return this.items.includes(productId);
  },

  getCount() {
    return this.items.length;
  },

  updateBadge() {
    const badge = document.getElementById('wishlist-badge');
    if (badge) {
      const count = this.getCount();
      badge.textContent = count;
      badge.classList.toggle('hidden', count === 0);
    }
  },

  getWatches(allWatches) {
    return allWatches.filter(w => this.items.includes(w.id));
  },

  clear() {
    this.items = [];
    this.save();
  },
};
