import { WATCHES, BRANDS, WILAYAS, slug } from './data.js';
import { Cart } from './cart.js';
import { seedIfEmpty, getOrders, saveOrder, getOrderById, updateOrderStatus, getProducts, saveProduct, deleteProduct, bootstrapSupabaseTables, subscribeOrders } from './services/db.js';
import { Auth } from './services/auth.js';
import { isSupabaseReady } from './lib/supabaseClient.js';
import './services/i18n.js';

function toggleMenu() {
  var l = document.getElementById('navLinks');
  if (l) {
    var open = l.classList.toggle('open');
    var btn = document.getElementById('menuToggle');
    if (btn) {
      if (window.__) {
        btn.textContent = open ? window.__('nav-close') : window.__('nav-menu');
      } else {
        btn.textContent = open ? 'Close' : 'Menu';
      }
    }
  }
}
window.toggleMenu = toggleMenu;

function esc(s) {
  var d = document.createElement('div');
  d.appendChild(document.createTextNode(s || ''));
  return d.innerHTML;
}

function track(eventName, params) {
  if (typeof fbq !== 'undefined') fbq('track', eventName, params || {});
  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          user_data: { client_user_agent: navigator.userAgent },
          custom_data: params || {},
        }],
      }),
    }).catch(function(){});
  } catch(e) {}
}

function updateMeta(title, desc, image) {
  var base = 'https://elitechrono.runsite.app';
  var t = title || 'Elite Chrono \u2014 Luxury Timepieces';
  var d = desc || 'Discover extraordinary timepieces from the world\u2019s finest watch maisons.';
  var img = image || base + '/og-image.png';
  document.title = t;
  setMeta('description', d);
  setMeta('og:title', t);
  setMeta('og:description', d);
  setMeta('og:url', base + (location.hash || '/'));
  setMeta('og:image', img);
  setMeta('twitter:title', t);
  setMeta('twitter:description', d);
  setMeta('twitter:image', img);
  var tc = document.querySelector('meta[name="theme-color"]');
  if (tc) tc.setAttribute('content', '#0C0A09');
}

function setMeta(prop, val) {
  var sel = prop === 'description' ? 'meta[name="description"]' : prop.indexOf(':') > -1 ? 'meta[property="' + prop + '"]' : 'meta[name="' + prop + '"]';
  var m = document.querySelector(sel);
  if (!m) { m = document.createElement('meta'); m.setAttribute(prop.indexOf(':') > -1 ? 'property' : 'name', prop); document.head.appendChild(m); }
  m.setAttribute('content', val);
}

const App = {
  currentRoute: 'home',
  whatsappNumber: '213775818412',
  watches: WATCHES,
  routes: {
    home: 'renderHome',
    products: 'renderProducts',
    'new-models': 'renderNewModels',
    featured: 'renderFeatured',
    cart: 'renderCart',
    checkout: 'renderCheckout',
    about: 'renderAbout',
    contact: 'renderContact',
    'elite-zone': 'renderAdmin',
    brands: 'renderAllBrands',
    track: 'renderTrack',
  },

  async init() {
    seedIfEmpty();
    if (isSupabaseReady()) {
      await bootstrapSupabaseTables();
    }
    await this.syncProducts();
    this.populateBrands();
    if (window.buildSwitcher) window.buildSwitcher();
    if (window.applyTranslations) window.applyTranslations();
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
    Cart.updateBadge();
    this.setupRealtime();
  },

  async syncProducts() {
    const dbProducts = await getProducts();
    if (dbProducts && dbProducts.length > 0 && dbProducts[0].id) {
      this.watches = dbProducts;
    } else {
      if (dbProducts && dbProducts.length > 0 && !dbProducts[0].id) {
        localStorage.removeItem('elitechrono_products');
      }
      this.watches = [...WATCHES];
    }
  },

  populateBrands() {
    const footerContainer = document.getElementById('footer-brands');
    if (footerContainer) {
      footerContainer.innerHTML = BRANDS.slice(0, 6).map(b =>
        `<a href="#brand-${slug(b)}" class="font-montserrat text-sm text-stone-400 hover:text-white transition-colors duration-200 cursor-pointer">${b}</a>`
      ).join('');
    }
  },

  setupRealtime() {
    subscribeOrders((payload) => {
      // Only re-render if actually logged into the admin dashboard
      if (this.currentRoute === 'elite-zone' && Auth.isAdmin()) {
        clearTimeout(this._realtimeDebounce);
        this._realtimeDebounce = setTimeout(() => this.renderAdmin(), 500);
      }
    });
  },

  handleRoute() {
    document.querySelectorAll('.product-overlay').forEach(el => el.remove());
    const hash = location.hash.slice(1) || 'home';
    let route = hash;
    let param = null;

    if (hash.startsWith('brand-')) {
      route = 'brand'; param = hash.slice(6);
    } else if (hash.startsWith('product-')) {
      route = 'product'; param = hash.slice(8);
    } else if (hash.startsWith('elite-zone-orders') || hash.startsWith('elite-zone-products')) {
      route = 'elite-zone';
    } else if (hash.startsWith('elite-zone')) {
      route = 'elite-zone';
    } else if (hash.startsWith('track/')) {
      route = 'track'; param = hash.slice(6);
    }

    this.currentRoute = route;

    var metaTitle, metaDesc, metaImg;
    var base = 'https://elitechrono.runsite.app';
    if (route === 'home') {
      metaTitle = 'Elite Chrono \u2014 Luxury Timepieces';
      metaDesc = 'Discover extraordinary timepieces from the world\u2019s finest watch maisons. Rolex, Patek Philippe, Audemars Piguet and more.';
    } else if (route === 'watches') {
      metaTitle = 'All Watches \u2014 Elite Chrono';
      metaDesc = 'Browse our curated collection of luxury timepieces from the world\u2019s finest brands.';
    } else if (route === 'brands') {
      metaTitle = 'All Brands \u2014 Elite Chrono';
      metaDesc = 'Explore the world\u2019s finest watch maisons. Rolex, Patek Philippe, Audemars Piguet, Cartier and more.';
    } else if (route === 'checkout') {
      metaTitle = 'Checkout \u2014 Elite Chrono';
      metaDesc = 'Complete your order for luxury timepieces.';
    } else if (route === 'contact') {
      metaTitle = 'Contact Us \u2014 Elite Chrono';
      metaDesc = 'Get in touch with Elite Chrono. We are here to help.';
    } else if (route === 'featured') {
      metaTitle = 'Featured Timepieces \u2014 Elite Chrono';
      metaDesc = 'Our curated selection of the most exceptional luxury watches.';
    } else if (route === 'elite-zone') {
      metaTitle = 'Admin Panel \u2014 Elite Chrono';
      metaDesc = 'Elite Chrono administration dashboard.';
    } else if (route === 'track') {
      metaTitle = 'Order Tracking \u2014 Elite Chrono';
      metaDesc = 'Track the status of your Elite Chrono order.';
    }
    updateMeta(metaTitle, metaDesc, metaImg);

    if (this.routes[route]) {
      this[this.routes[route]]();
    } else if (route === 'brand') {
      this.renderBrand(param);
    } else if (route === 'product') {
      this.renderProductDetail(param);
    } else {
      this.renderHome();
    }

    track('PageView');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  navigate(hash) { location.hash = hash; },

  showToast(msg) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<div class="flex items-center gap-2"><svg class="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span>${msg}</span></div>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2500);
  },

  render(html) {
    document.querySelectorAll('.admin-overlay').forEach(el => el.remove());
    document.getElementById('main-content').innerHTML = html;
    if (window.applyTranslations) window.applyTranslations();
  },

  showLoading(msg = 'Loading...') {
    this.render(`<div class="flex items-center justify-center min-h-screen pt-24"><div class="text-center"><div class="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p class="font-montserrat text-sm text-muted-c">${msg}</p></div></div>`);
  },

  showError(msg = 'Something went wrong. Please try again.') {
    this.render(`<div class="flex items-center justify-center min-h-screen pt-24"><div class="text-center max-w-md mx-auto px-6"><svg class="w-16 h-16 text-stone-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><h2 class="font-cormorant text-2xl text-primary mb-2">Oops</h2><p class="font-montserrat text-sm text-muted-c mb-6">${msg}</p><a href="#home" class="inline-flex items-center gap-2 bg-inverse text-white px-6 py-3 font-montserrat font-semibold text-xs tracking-wider uppercase cursor-pointer">Back Home</a></div></div>`);
  },

  // ─── HOME ────────────────────────────────────────────────────────────

  renderHome() {
    const featured = this.watches.filter(w => w.sections && w.sections.includes('Featured Timepieces')).slice(0, 8);
    const newModels = this.watches.filter(w => w.sections && w.sections.includes('New Models')).slice(0, 4);

    this.render(`
      <section class="hero" id="hero">
        <img class="hero-bg" src="https://upload.wikimedia.org/wikipedia/commons/2/25/Patek-Philippe_MG_2583.jpg" alt="" aria-hidden="true">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <p class="hero-badge" data-i18n="hero-badge">Haute Horlogerie</p>
          <h1 class="hero-title" data-i18n-html="hero-title">
            Where Time<br>Becomes <span class="text-gold">Art</span>
          </h1>
          <p class="hero-desc" data-i18n="hero-desc">
            An exclusive atelier of the world's finest timepieces. Each movement tells a story of heritage, innovation, and unparalleled craftsmanship.
          </p>
            <div class="hero-actions">
              <a href="#products" class="hero-cta">
                <span data-i18n="hero-cta">Explore the Collection</span>
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M10 1L15 6M15 6L10 11M15 6H1" stroke="currentColor" stroke-width="1.5"/></svg>
              </a>
            </div>
        </div>
        <div class="hero-scroll">
          <span data-i18n="hero-scroll">Scroll</span>
          <div class="scroll-line"></div>
        </div>
      </section>

      <section class="py-24 bg-page overflow-hidden">
        <div class="max-w-7xl mx-auto px-6 mb-16 text-center">
          <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-3" data-i18n="footer-brands">Maisons</p>
          <h2 class="font-cormorant text-4xl md:text-5xl text-primary" data-i18n-html="section-brands">Our <span class="text-gold">Brands</span></h2>
        </div>
        <div class="brand-ticker-wrap">
          <div class="brand-ticker" id="brandTicker">
            ${(() => {
              const svgs = {
                'Rolex': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="28" font-weight="700" letter-spacing="4" fill="currentColor">ROLEX</text><path d="M85 28a15 15 0 1 0 0 24" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.4"/><path d="M115 28a15 15 0 1 1 0 24" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.4"/></svg>',
                'Omega': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="24" font-weight="700" letter-spacing="3" fill="currentColor">OMEGA</text><ellipse cx="100" cy="28" rx="18" ry="8" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.35"/></svg>',
                'Cartier': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="26" font-weight="600" letter-spacing="5" fill="currentColor">CARTIER</text><rect x="70" y="24" width="60" height="1" fill="currentColor" opacity="0.3"/></svg>',
                'Hublot': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="47%" dominant-baseline="middle" text-anchor="middle" font-family="\'Montserrat\',Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="6" fill="currentColor">HUBLOT</text><text x="50%" y="64%" dominant-baseline="middle" text-anchor="middle" font-family="\'Montserrat\',Arial,sans-serif" font-size="9" font-weight="300" letter-spacing="4" fill="currentColor" opacity="0.5">SWISS MADE</text></svg>',
                'Audemars Piguet': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="44%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="22" font-weight="700" letter-spacing="3" fill="currentColor">AUDEMARS</text><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="16" font-weight="400" letter-spacing="4" fill="currentColor" opacity="0.65">PIGUET</text></svg>',
                'Patek Philippe': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="44%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="20" font-weight="700" letter-spacing="3" fill="currentColor">PATEK</text><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="17" font-weight="400" letter-spacing="4" fill="currentColor" opacity="0.65">PHILIPPE</text></svg>',
                'Richard Mille': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="\'Montserrat\',Arial,sans-serif" font-size="32" font-weight="800" letter-spacing="2" fill="currentColor">RM</text><text x="50%" y="68%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="10" font-weight="400" letter-spacing="3" fill="currentColor" opacity="0.5">RICHARD MILLE</text></svg>',
                'Hugo Boss': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="47%" dominant-baseline="middle" text-anchor="middle" font-family="\'Montserrat\',Arial,sans-serif" font-size="28" font-weight="700" letter-spacing="6" fill="currentColor">BOSS</text><text x="50%" y="64%" dominant-baseline="middle" text-anchor="middle" font-family="\'Montserrat\',Arial,sans-serif" font-size="8" font-weight="300" letter-spacing="3" fill="currentColor" opacity="0.4">HUGO BOSS</text></svg>',
                'Emporio Armani': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="44%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="20" font-weight="700" letter-spacing="4" fill="currentColor">EMPORIO</text><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="16" font-weight="400" letter-spacing="4" fill="currentColor" opacity="0.65">ARMANI</text></svg>',
                'Jacob & Co.': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="44%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="20" font-weight="700" letter-spacing="3" fill="currentColor">JACOB</text><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="16" font-weight="400" letter-spacing="3" fill="currentColor" opacity="0.65">&amp; CO.</text></svg>',
              };
              const items = BRANDS.map(b =>
                `<a href="#brand-${slug(b)}" class="brand-card"><div class="brand-card-inner text-white/30 hover:text-gold">${svgs[b] || b}</div></a>`
              ).join('');
              return items + items;
            })()}
          </div>
          <div class="text-center mt-12">
            <a href="#brands" class="inline-flex items-center gap-2 border border-gold text-gold px-8 py-3 font-montserrat text-xs tracking-widest uppercase hover-bg-gold hover:text-primary transition-all duration-300 cursor-pointer" data-i18n="brands-view-all">View All Brands</a>
          </div>
        </div>
      </section>

      <section id="new-arrivals-section" class="py-24 bg-page">
        <div class="max-w-7xl mx-auto px-6">
          <div class="flex items-end justify-between mb-16">
            <div>
              <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-3" data-i18n="section-new-arrivals">New Arrivals</p>
              <h2 class="font-cormorant text-4xl md:text-5xl text-primary" data-i18n-html="section-new-arrivals-title">Latest <span class="text-gold">Models</span></h2>
            </div>
            <a href="#" onclick="document.getElementById('new-arrivals-section').scrollIntoView({behavior:'smooth'});return false;" class="hidden md:flex items-center gap-2 font-montserrat text-sm text-primary hover-text-gold transition-colors duration-300 cursor-pointer border-b border-inverse hover-border-gold pb-0.5" data-i18n="view-all">View All</a>
          </div>
          <div class="product-grid">${newModels.map(w => this.productCard(w)).join('')}</div>
          <div class="mt-8 text-center md:hidden">
            <a href="#" onclick="document.getElementById('new-arrivals-section').scrollIntoView({behavior:'smooth'});return false;" class="inline-flex items-center gap-2 font-montserrat text-sm text-primary cursor-pointer border-b border-inverse pb-0.5" data-i18n="view-all">View All</a>
          </div>
        </div>
      </section>

      <section class="py-24 bg-card">
        <div class="max-w-7xl mx-auto px-6">
          <div class="flex items-end justify-between mb-16">
            <div>
              <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-3" data-i18n="section-featured">Featured</p>
              <h2 class="font-cormorant text-4xl md:text-5xl text-primary" data-i18n-html="section-featured-title">Featured <span class="text-gold">Timepieces</span></h2>
            </div>
            <a href="#featured" class="hidden md:flex items-center gap-2 font-montserrat text-sm text-primary hover-text-gold transition-colors duration-300 cursor-pointer border-b border-inverse hover-border-gold pb-0.5" data-i18n="view-all">View All</a>
          </div>
          <div class="product-grid">${featured.map(w => this.productCard(w)).join('')}</div>
          <div class="mt-12 text-center">
            <a href="#products" class="inline-flex items-center gap-2 border-2 border-inverse text-primary px-10 py-4 font-montserrat font-semibold text-sm tracking-wider uppercase hover-bg-inverse hover:text-white transition-all duration-300 cursor-pointer" data-i18n="view-all-products">All Watches</a>
          </div>
        </div>
      </section>

      <section class="relative py-32 overflow-hidden">
        <div class="absolute inset-0" style="background: linear-gradient(to right, var(--hero-from), var(--hero-via));"></div>
        <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle at 75% 50%, var(--gold) 2px, transparent 2px); background-size: 30px 30px;"></div>
        <div class="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-6" data-i18n="section-journal">The Elite Chrono Journal</p>
          <h2 class="font-cormorant text-4xl md:text-6xl text-white mb-8" data-i18n-html="section-journal-title">The Art of Fine<br><span class="text-gold">Watchmaking</span></h2>
          <p class="font-montserrat text-stone-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed" data-i18n="section-journal-desc">Explore our curated stories on horological masterpieces, craftsmanship, and the stories behind the world's most coveted timepieces.</p>
          <a href="#about" class="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-4 font-montserrat font-semibold text-sm tracking-wider uppercase hover:bg-white/10 transition-colors duration-300 cursor-pointer" data-i18n="read-more">Read More</a>
        </div>
      </section>
    `);
  },

  // ─── PRODUCTS ─────────────────────────────────────────────────────────

  onSearchInput(val) {
    this.applyProductFilters();
    this.showSuggestions(val);
  },

  showSuggestions(val) {
    var c = document.getElementById('search-suggestions');
    if (!c) return;
    var v = (val || '').trim().toLowerCase();
    if (!v || v.length < 1) { c.classList.add('hidden'); return; }
    var matches = this.watches.filter(function(w) { return w.name.toLowerCase().includes(v) || w.brand.toLowerCase().includes(v); }).slice(0, 6);
    if (!matches.length) { c.classList.add('hidden'); return; }
    c.innerHTML = matches.map(function(w) {
      return '<a href="#product-' + w.id + '" class="flex items-center gap-3 px-4 py-2.5 hover-bg-hover transition-colors duration-150 border-b border-subtle last:border-b-0" onclick="document.getElementById(\'search-suggestions\').classList.add(\'hidden\')"><img src="' + w.img + '" alt="" class="w-8 h-8 object-cover bg-stone-800 flex-shrink-0" onerror="this.style.display=\'none\'"><div class="min-w-0"><div class="font-montserrat text-xs text-primary truncate">' + esc(w.name) + '</div><div class="font-montserrat text-2xs text-muted-c">' + esc(w.brand) + ' &middot; DA' + w.price.toLocaleString() + '</div></div></a>';
    }).join('');
    c.classList.remove('hidden');
  },

  applyProductFilters() {
    const search = (document.getElementById('product-search')?.value || '').toLowerCase().trim();
    const brand = document.getElementById('product-brand-filter')?.value || '';
    const min = parseFloat(document.getElementById('product-price-min')?.value) || 0;
    const max = parseFloat(document.getElementById('product-price-max')?.value) || Infinity;
    if (search) track('Search', { search_string: search });
    const filtered = this.watches.filter(w => {
      if (search && !w.name.toLowerCase().includes(search) && !w.brand.toLowerCase().includes(search)) return false;
      if (brand && w.brand !== brand) return false;
      if (min > 0 && w.price < min) return false;
      if (max !== Infinity && w.price > max) return false;
      return true;
    });
    const grid = document.getElementById('product-grid');
    const count = document.getElementById('product-count');
    const noRes = document.getElementById('product-no-results');
    if (grid) grid.innerHTML = filtered.map(w => this.productCard(w)).join('');
    if (count) count.textContent = `${filtered.length} watch${filtered.length !== 1 ? 'es' : ''}`;
    if (noRes) noRes.classList.toggle('hidden', filtered.length > 0);
  },

  resetProductFilters() {
    const ids = ['product-search', 'product-brand-filter', 'product-price-min', 'product-price-max'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    this.applyProductFilters();
  },

  renderProducts() {
    this.render(`
      <div class="bg-page min-h-screen pt-32 pb-24">
        <div class="max-w-7xl mx-auto px-6">
          <div class="mb-12">
            <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-3" data-i18n="section-all-watches">All Watches</p>
            <h1 class="font-cormorant text-5xl md:text-6xl text-primary" data-i18n="view-all-products">All Watches</h1>
          </div>
          <div class="bg-card border border-subtle p-5 mb-10 flex flex-col md:flex-row gap-4">
            <div class="flex-1 relative">
              <input type="text" id="product-search" placeholder="Search by name or brand..." autocomplete="off" oninput="App.onSearchInput(this.value)" class="w-full bg-page border border-subtle px-4 py-2.5 font-montserrat text-sm text-primary placeholder:text-muted-c focus:border-gold outline-none transition-colors duration-200">
              <div id="search-suggestions" class="search-suggestions hidden"></div>
            </div>
            <div class="md:w-44">
              <select id="product-brand-filter" onchange="App.applyProductFilters()" class="w-full bg-page border border-subtle px-4 py-2.5 font-montserrat text-sm text-primary focus:border-gold outline-none transition-colors duration-200 cursor-pointer">
                <option value="">All Brands</option>
                ${BRANDS.map(b => `<option value="${b}">${b}</option>`).join('')}
              </select>
            </div>
            <div class="flex items-center gap-2">
              <input type="number" id="product-price-min" placeholder="Min DA" oninput="App.applyProductFilters()" class="w-28 bg-page border border-subtle px-3 py-2.5 font-montserrat text-sm text-primary placeholder:text-muted-c focus:border-gold outline-none transition-colors duration-200">
              <span class="text-muted-c text-sm select-none">&ndash;</span>
              <input type="number" id="product-price-max" placeholder="Max DA" oninput="App.applyProductFilters()" class="w-28 bg-page border border-subtle px-3 py-2.5 font-montserrat text-sm text-primary placeholder:text-muted-c focus:border-gold outline-none transition-colors duration-200">
            </div>
            <button onclick="App.resetProductFilters()" class="px-5 py-2.5 font-montserrat text-xs tracking-wider uppercase border border-subtle text-muted-c hover:text-primary hover-border-inverse transition-all duration-300 cursor-pointer">Reset</button>
          </div>
          <div class="flex items-center justify-between mb-8">
            <p class="font-montserrat text-muted-c text-sm" id="product-count">${this.watches.length} watches</p>
          </div>
          <div class="product-grid" id="product-grid">${this.watches.map(w => this.productCard(w)).join('')}</div>
          <div id="product-no-results" class="text-center py-20 hidden">
            <p class="font-cormorant text-2xl text-muted-c">No watches found matching your criteria.</p>
          </div>
        </div>
      </div>
    `);
  },

  renderNewModels() {
    this.render(`
      <div class="bg-page min-h-screen pt-32 pb-24">
        <div class="max-w-7xl mx-auto px-6">
          <div class="mb-12">
            <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-3" data-i18n="section-new-arrivals">Fresh Arrivals</p>
            <h1 class="font-cormorant text-5xl md:text-6xl text-primary" data-i18n="nav-new-models">New Models</h1>
            <p class="font-montserrat text-muted-c mt-4" data-i18n="section-new-arrivals-desc">The latest additions to our collection</p>
          </div>
          <div class="product-grid">${this.watches.filter(w => w.sections && w.sections.includes('New Models')).map(w => this.productCard(w)).join('')}</div>
        </div>
      </div>
    `);
  },

  renderFeatured() {
    const watches = this.watches.filter(w => w.sections && w.sections.includes('Featured Timepieces'));
    this.render(`
      <div class="bg-page min-h-screen pt-32 pb-24">
        <div class="max-w-7xl mx-auto px-6">
          ${this.bc(['Home', 'Featured'])}
          <div class="mb-12">
            <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-3" data-i18n="section-featured">Featured</p>
            <h1 class="font-cormorant text-5xl md:text-6xl text-primary" data-i18n-html="section-featured-title">Featured <span class="text-gold">Timepieces</span></h1>
            <p class="font-montserrat text-muted-c mt-4" data-i18n="section-featured-desc">A hand-picked selection of exceptional watches.</p>
          </div>
          <div class="product-grid">${watches.map(w => this.productCard(w)).join('')}</div>
          ${watches.length === 0 ? '<div class="text-center py-20"><p class="font-cormorant text-2xl text-muted-c">No featured watches yet.</p></div>' : ''}
        </div>
      </div>
    `);
  },

  renderBrand(brandSlug) {
    var brandName = brandSlug.replace(/-/g, ' ').replace(/\b\w/g, function(c){return c.toUpperCase();});
    updateMeta(brandName + ' Watches \u2014 Elite Chrono', 'Explore the collection of ' + brandName + ' luxury timepieces at Elite Chrono.');
    const brand = BRANDS.find(b => slug(b) === brandSlug) || brandSlug;
    const watches = this.watches.filter(w => slug(w.brand) === slug(brand));
    const actualBrand = watches.length > 0 ? watches[0].brand : brand;
    const filtered = watches.length > 0 ? watches : this.watches.filter(w => w.brand.toLowerCase().includes(brand.toLowerCase()));

    this.render(`
      <div class="bg-page min-h-screen pt-32 pb-24">
        <div class="max-w-7xl mx-auto px-6">
          ${this.bc(['Home', 'Watches', actualBrand])}
          <div class="mb-12">
            <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-3" data-i18n="brand-collection">Maison</p>
            <h1 class="font-cormorant text-5xl md:text-6xl text-primary">${actualBrand}</h1>
            <p class="font-montserrat text-muted-c mt-4">${filtered.length} <span data-i18n="products">timepieces</span></p>
          </div>
          <div class="product-grid">${filtered.map(w => this.productCard(w)).join('')}</div>
        </div>
      </div>
    `);
  },

  renderAllBrands() {
    const svgs = {
      'Rolex': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="28" font-weight="700" letter-spacing="4" fill="currentColor">ROLEX</text><path d="M85 28a15 15 0 1 0 0 24" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.4"/><path d="M115 28a15 15 0 1 1 0 24" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.4"/></svg>',
      'Omega': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="24" font-weight="700" letter-spacing="3" fill="currentColor">OMEGA</text><ellipse cx="100" cy="28" rx="18" ry="8" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.35"/></svg>',
      'Cartier': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="26" font-weight="600" letter-spacing="5" fill="currentColor">CARTIER</text><rect x="70" y="24" width="60" height="1" fill="currentColor" opacity="0.3"/></svg>',
      'Hublot': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="47%" dominant-baseline="middle" text-anchor="middle" font-family="\'Montserrat\',Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="6" fill="currentColor">HUBLOT</text><text x="50%" y="64%" dominant-baseline="middle" text-anchor="middle" font-family="\'Montserrat\',Arial,sans-serif" font-size="9" font-weight="300" letter-spacing="4" fill="currentColor" opacity="0.5">SWISS MADE</text></svg>',
      'Audemars Piguet': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="44%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="22" font-weight="700" letter-spacing="3" fill="currentColor">AUDEMARS</text><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="16" font-weight="400" letter-spacing="4" fill="currentColor" opacity="0.65">PIGUET</text></svg>',
      'Patek Philippe': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="44%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="20" font-weight="700" letter-spacing="3" fill="currentColor">PATEK</text><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="17" font-weight="400" letter-spacing="4" fill="currentColor" opacity="0.65">PHILIPPE</text></svg>',
      'Richard Mille': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="\'Montserrat\',Arial,sans-serif" font-size="32" font-weight="800" letter-spacing="2" fill="currentColor">RM</text><text x="50%" y="68%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="10" font-weight="400" letter-spacing="3" fill="currentColor" opacity="0.5">RICHARD MILLE</text></svg>',
      'Hugo Boss': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="47%" dominant-baseline="middle" text-anchor="middle" font-family="\'Montserrat\',Arial,sans-serif" font-size="28" font-weight="700" letter-spacing="6" fill="currentColor">BOSS</text><text x="50%" y="64%" dominant-baseline="middle" text-anchor="middle" font-family="\'Montserrat\',Arial,sans-serif" font-size="8" font-weight="300" letter-spacing="3" fill="currentColor" opacity="0.4">HUGO BOSS</text></svg>',
      'Emporio Armani': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="44%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="20" font-weight="700" letter-spacing="4" fill="currentColor">EMPORIO</text><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="16" font-weight="400" letter-spacing="4" fill="currentColor" opacity="0.65">ARMANI</text></svg>',
      'Jacob & Co.': '<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="44%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="20" font-weight="700" letter-spacing="3" fill="currentColor">JACOB</text><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-size="16" font-weight="400" letter-spacing="3" fill="currentColor" opacity="0.65">&amp; CO.</text></svg>',
    };
    this.render(`
      <div class="bg-page min-h-screen pt-32 pb-24">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16">
            <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-3" data-i18n="brands-subtitle">Maisons</p>
            <h1 class="font-cormorant text-5xl md:text-7xl text-primary mb-4" data-i18n-html="brands-title">Our <span class="text-gold">Maisons</span></h1>
            <p class="font-montserrat text-muted-c max-w-xl mx-auto" data-i18n="brands-desc">Discover the world's most prestigious watch maisons, each with a legacy of craftsmanship and innovation.</p>
          </div>
          <div class="max-w-md mx-auto mb-14">
            <input type="text" id="brand-search" placeholder="Search brands..." oninput="App.filterBrands()" class="w-full bg-card border border-subtle px-5 py-3.5 font-montserrat text-sm text-primary placeholder:text-muted-c focus:border-gold outline-none transition-colors duration-200">
          </div>
          <div class="brands-grid" id="brands-grid">
            ${BRANDS.map(b => {
              const count = this.watches.filter(w => w.brand === b).length;
              return `
              <a href="#brand-${slug(b)}" class="brand-showcase-card" data-brand="${b.toLowerCase()}">
                <div class="brand-showcase-logo">${svgs[b] || `<span class="font-cormorant text-2xl text-primary">${b}</span>`}</div>
                <div class="brand-showcase-info">
                  <span class="brand-showcase-name">${b}</span>
                  <span class="brand-showcase-count">${count} timepiece${count !== 1 ? 's' : ''}</span>
                </div>
                <div class="brand-showcase-hover">
                  <span class="brand-showcase-cta">Explore Collection &rarr;</span>
                </div>
              </a>`;
            }).join('')}
          </div>
          <div id="brands-no-results" class="text-center py-20 hidden">
            <p class="font-cormorant text-2xl text-muted-c">No brands found matching your search.</p>
          </div>
        </div>
      </div>
    `);
  },

  filterBrands() {
    const q = document.getElementById('brand-search')?.value.toLowerCase().trim() || '';
    const cards = document.querySelectorAll('.brand-showcase-card');
    let visible = 0;
    cards.forEach(c => {
      const match = !q || c.dataset.brand.includes(q);
      c.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    const noRes = document.getElementById('brands-no-results');
    if (noRes) noRes.classList.toggle('hidden', visible > 0);
  },

  async renderProductDetail(id) {
    const norm = s => s.replace(/[\s-]+/g, ' ');
    const nid = norm(id);
    const findWatch = arr => arr.find(w => w.id === id || norm(w.id) === nid || w.id === id.replace(/ /g,'-'));
    let watch = findWatch(this.watches);
    if (!watch) {
      const fresh = await getProducts();
      watch = findWatch(fresh);
      if (watch) this.watches = fresh;
    }
    if (!watch) { this.showError('Watch not found'); return; }
    updateMeta(watch.name + ' \u2014 Elite Chrono', watch.brand + ' luxury watch. ' + (watch.description || ''), watch.image);
    track('ViewContent', { content_name: watch.name, content_category: watch.brand, content_ids: [watch.id], content_type: 'product', currency: 'DZD', value: watch.price });
    const watchId = watch.id;
    const similar = this.watches.filter(w => w.brand === watch.brand && w.id !== watch.id);
    try {
      this.render(`
      <div class="bg-page min-h-screen pt-28 pb-24">
        <div class="max-w-7xl mx-auto px-6">
          ${this.bc(['Home', 'Watches', watch.brand, watch.name])}
          <div class="grid md:grid-cols-2 gap-12 items-start">
            <div class="relative">
              <div class="bg-card border border-subtle overflow-hidden flex items-center justify-center" style="min-height:300px">
                <img id="detail-main-img" src="${watch.img}" alt="${esc(watch.brand)} ${esc(watch.name)}" class="w-full object-contain bg-card max-h-[80vh]" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 500%22%3E%3Crect fill=%22%231C1917%22 width=%22400%22 height=%22500%22/%3E%3Ctext x=%22200%22 y=%22250%22 text-anchor=%22middle%22 fill=%22%23CA8A04%22 font-family=%22serif%22 font-size=%2222%22%3E' + encodeURIComponent((this.alt || 'Watch').split(' ').slice(0,2).join(' ')) + '%3C/text%3E%3C/svg%3E'">
                ${(watch.images && watch.images.length > 1) ? `
                <button class="gallery-arrow gallery-arrow-left" onclick="App.galleryNav('${watchId}', -1)" type="button">&lsaquo;</button>
                <button class="gallery-arrow gallery-arrow-right" onclick="App.galleryNav('${watchId}', 1)" type="button">&rsaquo;</button>
                <div class="gallery-dots">${watch.images.map((_, i) => `<span class="gallery-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}</div>
                ` : ''}
              </div>
              ${watch.new ? '<span class="absolute top-4 left-4 bg-gold text-primary px-4 py-1.5 font-montserrat text-xs tracking-wider uppercase font-semibold">New</span>' : ''}
              ${(watch.images && watch.images.length > 1) ? `
              <div class="flex gap-2 mt-3 overflow-x-auto pb-1 thumb-gallery" id="thumb-gallery">
                ${watch.images.map((url, i) => `
                  <img src="${url}" class="thumb-img ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="App.gallerySelect(${i})" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%231C1917%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'">
                `).join('')}
              </div>` : ''}
            </div>
            <div class="sticky top-32">
              <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-3">${esc(watch.brand)}</p>
              <h1 class="font-cormorant text-4xl md:text-5xl text-primary mb-4">${esc(watch.name)}</h1>
              <div class="flex items-baseline gap-3 mb-8">
                <span class="font-cormorant text-3xl text-primary">DA${watch.price.toLocaleString()}</span>
                ${watch.originalPrice ? `<span class="font-montserrat text-lg text-stone-400 line-through">DA${watch.originalPrice.toLocaleString()}</span><span class="font-montserrat text-sm text-red-500">Save ${Math.round((1 - watch.price/watch.originalPrice)*100)}%</span>` : ''}
              </div>
              <p class="font-montserrat text-stone-600 leading-relaxed mb-8">${esc(watch.description)}</p>
              <div class="flex gap-3 mb-6">
                ${watch.in_stock === false ? '<div class="flex-1 text-center py-4 border border-stone-700 font-montserrat text-sm text-stone-500 tracking-wider uppercase" data-i18n="product-oos">Out of Stock</div>' : '<button onclick="App.addToCartAndGo(\'' + watchId + '\')" class="flex-[7] bg-gold text-primary py-4 font-montserrat font-semibold text-sm tracking-wider uppercase hover-bg-gold-hover transition-all duration-300 cursor-pointer" data-i18n="product-order">Order Now</button>\n                <button onclick="App.addToCart(\'' + watchId + '\')" class="flex-[3] border border-inverse text-primary py-4 font-montserrat text-xs tracking-wider uppercase hover-bg-inverse hover:text-white transition-all duration-300 cursor-pointer" data-i18n="product-add-cart">+ Cart</button>'}
              </div>
              ${watch.in_stock !== false ? '<button onclick="App.whatsappOrder([{id:\'' + watchId + '\',qty:1}])" class="w-full border border-[#25D366]/40 text-[#25D366] py-3 font-montserrat text-xs tracking-wider uppercase hover-bg-[#25D366] hover:text-white transition-all duration-300 cursor-pointer mb-2 flex items-center justify-center gap-2"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Order via WhatsApp</button>' : ''}
              <div class="border-t border-subtle pt-8">
                <h3 class="font-cormorant text-xl text-primary mb-4" data-i18n="product-specs">Technical Specifications</h3>
                <div class="space-y-3">
                  ${(watch.specs ? Object.entries(watch.specs) : []).map(([key, val]) =>
                    `<div class="flex justify-between font-montserrat text-sm border-b border-stone-100 pb-2"><span class="text-stone-500">${key}</span><span class="text-primary font-medium">${val}</span></div>`
                  ).join('')}
                </div>
              </div>
              <div class="mt-8 flex gap-3">
                <a href="#cart" class="flex-1 border border-inverse text-primary py-3 text-center font-montserrat text-sm tracking-wider uppercase hover-bg-inverse hover:text-white transition-all duration-300 cursor-pointer" data-i18n="product-view-cart">View Cart (${Cart.getCount()})</a>
              </div>
            </div>
          </div>
        </div>
        ${similar.length > 0 ? `
        <div class="border-t border-subtle mt-20 pt-16 max-w-7xl mx-auto px-6">
          <div class="text-center mb-12">
            <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-3" data-i18n="similar-subtitle">Same Collection</p>
            <h2 class="font-cormorant text-4xl md:text-5xl text-primary">More from <span class="text-gold">${watch.brand}</span></h2>
          </div>
          <div class="similar-grid" id="similar-grid">
            ${similar.map((w, i) => `
              <div class="${i >= 8 ? 'similar-hidden' : ''}">${this.productCard(w)}</div>
            `).join('')}
          </div>
          ${similar.length > 8 ? `
          <div class="text-center mt-10">
            <button onclick="App.loadMoreSimilar()" id="load-more-similar" class="border border-gold text-gold px-10 py-3 font-montserrat text-xs tracking-widest uppercase hover-bg-gold hover:text-primary transition-all duration-300 cursor-pointer">Load More</button>
          </div>` : ''}
        </div>` : ''}
      </div>
    `);
    } catch (e) {
      console.error('Error rendering product detail:', e);
      this.showError('Failed to load product details.');
      return;
    }
    const mainImg = document.getElementById('detail-main-img');
    if (mainImg && watch.images && watch.images.length > 1) {
      let startX = 0, touchFired = false;
      const onStart = e => { startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX; if (e.type === 'touchstart') touchFired = false; };
      const onEnd = e => {
        if (e.type === 'mouseup' && touchFired) return;
        const endX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
        const diff = startX - endX;
        if (Math.abs(diff) > 40) { this.galleryNav(watchId, diff > 0 ? 1 : -1); if (e.type === 'touchend') touchFired = true; }
      };
      mainImg.addEventListener('touchstart', onStart, { passive: true });
      mainImg.addEventListener('touchend', onEnd, { passive: true });
      mainImg.addEventListener('mousedown', onStart);
      mainImg.addEventListener('mouseup', onEnd);
    }
  },

  loadMoreSimilar() {
    const hidden = document.querySelectorAll('#similar-grid .similar-hidden');
    let shown = 0;
    hidden.forEach(el => { if (shown < 8) { el.classList.remove('similar-hidden'); shown++; } });
    if (document.querySelectorAll('#similar-grid .similar-hidden').length === 0) {
      const btn = document.getElementById('load-more-similar');
      if (btn) btn.style.display = 'none';
    }
  },

  addToCart(id) {
    Cart.add(id);
    this.showToast(window.__('toast-added-cart'));
    const w = this.watches.find(w => w.id === id);
    track('AddToCart', { content_ids: [id], content_name: w ? w.name : id, content_type: 'product', value: w ? w.price : 0, currency: 'DZD' });
  },

  addToCartAndGo(id) {
    Cart.add(id);
    const w = this.watches.find(w => w.id === id);
    track('AddToCart', { content_ids: [id], content_name: w ? w.name : id, content_type: 'product', value: w ? w.price : 0, currency: 'DZD' });
    this.navigate('checkout');
  },

  // ─── CART ─────────────────────────────────────────────────────────────

  renderCart() {
    if (Cart.items.length === 0) {
      this.render(`
        <div class="bg-page min-h-screen pt-32 pb-24">
          <div class="max-w-3xl mx-auto px-6 text-center">
            <div class="mb-8"><svg class="w-24 h-24 mx-auto text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg></div>
            <h1 class="font-cormorant text-4xl text-primary mb-4" data-i18n="cart-empty-title">Your Cart is Empty</h1>
            <p class="font-montserrat text-muted-c mb-8" data-i18n="cart-empty-desc">Discover our collection of exceptional timepieces.</p>
            <a href="#products" class="inline-flex items-center gap-2 bg-inverse text-white px-8 py-4 font-montserrat font-semibold text-sm tracking-wider uppercase hover-bg-gold hover-text-primary transition-all duration-300 cursor-pointer" data-i18n="cart-browse">Browse Collection</a>
          </div>
        </div>
      `);
      return;
    }

    const total = Cart.getTotal(this.watches);

    this.render(`
      <div class="bg-page min-h-screen pt-32 pb-24">
        <div class="max-w-7xl mx-auto px-6">
          ${this.bc(['Home', 'Watches'])}
          <div class="mb-12">
            <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-3" data-i18n="cart-title">Shopping Bag</p>
            <h1 class="font-cormorant text-5xl md:text-6xl text-primary" data-i18n-html="cart-title">Your Cart</h1>
            <p class="font-montserrat text-muted-c mt-2">${Cart.getCount()} item${Cart.getCount() !== 1 ? 's' : ''}</p>
          </div>
          <div class="space-y-6">
            ${Cart.items.map(item => {
              const w = this.watches.find(w => w.id === item.id);
              if (!w) return '';
              return `
                <div class="bg-card border border-subtle p-6 flex flex-col sm:flex-row gap-6 items-start">
                  <div class="w-full sm:w-24 h-24 bg-stone-100 flex-shrink-0 overflow-hidden"><img src="${w.img}" alt="${w.name}" class="w-full h-full object-cover"></div>
                  <div class="flex-1 min-w-0">
                    <p class="font-montserrat text-xs text-gold tracking-wider uppercase mb-1">${w.brand}</p>
                    <h3 class="font-cormorant text-xl text-primary">${w.name}</h3>
                    <p class="font-montserrat text-sm text-muted-c mt-1">DA${w.price.toLocaleString()} each</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <button onclick="App.updateCartQty('${w.id}', ${item.qty - 1})" class="w-8 h-8 border border-medium flex items-center justify-center hover-bg-hover transition-colors duration-200 cursor-pointer font-montserrat">&minus;</button>
                    <span class="w-8 text-center font-montserrat">${item.qty}</span>
                    <button onclick="App.updateCartQty('${w.id}', ${item.qty + 1})" class="w-8 h-8 border border-medium flex items-center justify-center hover-bg-hover transition-colors duration-200 cursor-pointer font-montserrat">+</button>
                  </div>
                    <div class="text-right">
                    <p class="font-cormorant text-xl text-primary">DA${(w.price * item.qty).toLocaleString()}</p>
                    <button onclick="App.removeCartItem('${w.id}')" class="font-montserrat text-xs text-stone-400 hover:text-red-500 transition-colors duration-200 cursor-pointer mt-2 flex items-center gap-1 ml-auto"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg> <span data-i18n="cart-remove">Remove</span></button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <div class="mt-6 bg-card border border-subtle p-6 ml-auto max-w-md">
            ${function() {
              var threshold = 30000;
              var pct = Math.min(100, Math.round(total / threshold * 100));
              var remaining = threshold - total;
              if (total >= threshold) return '<div class="flex items-center gap-3"><div class="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden"><div class="h-full bg-green-600 rounded-full" style="width:100%"></div></div><span class="font-montserrat text-xs text-green-600 whitespace-nowrap" data-i18n="cart-shipping-free">Free Shipping!</span></div>';
              return '<div class="mb-2"><div class="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden"><div class="h-full bg-gold rounded-full transition-all duration-500" style="width:' + pct + '%"></div></div></div><p class="font-montserrat text-xs text-muted-c">Add <span class="text-gold font-semibold">DA' + remaining.toLocaleString() + '</span> more for free shipping</p>';
            }.call(this)}
          </div>
          <div class="mt-6 bg-card border border-subtle p-8 ml-auto max-w-md">
            <div class="flex justify-between font-montserrat text-muted-c mb-2"><span data-i18n="cart-subtotal">Subtotal</span><span>DA${total.toLocaleString()}</span></div>
            <div class="flex justify-between font-montserrat text-muted-c mb-2"><span data-i18n="cart-shipping">Shipping</span><span class="text-green-600" data-i18n="cart-free">Free</span></div>
            <div class="border-t border-subtle mt-4 pt-4 flex justify-between font-cormorant text-2xl text-primary"><span data-i18n="cart-total">Total</span><span>DA${total.toLocaleString()}</span></div>
            <a href="#checkout" class="block w-full bg-gold text-primary text-center py-4 mt-6 font-montserrat font-semibold text-sm tracking-wider uppercase hover-bg-gold-hover transition-colors duration-300 cursor-pointer" data-i18n="cart-proceed">Proceed to Checkout</a>
            <a href="#products" class="block w-full text-center py-3 font-montserrat text-sm text-muted-c hover-text-primary transition-colors duration-300 cursor-pointer mt-2" data-i18n="checkout-continue">Continue Shopping</a>
            <button onclick="App.clearCart()" class="block w-full text-center py-2 font-montserrat text-xs text-stone-500 hover:text-red-500 transition-colors duration-200 cursor-pointer mt-1" data-i18n="cart-clear">Clear Cart</button>
          </div>
        </div>
      </div>
    `);
  },

  async renderTrack(param) {
    if (param) {
      const o = await getOrderById(param);
      if (!o) {
        this.render(`
          <div class="bg-page min-h-screen pt-32 pb-24">
            <div class="max-w-xl mx-auto px-6 text-center">
              <svg class="w-16 h-16 text-stone-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <h1 class="font-cormorant text-3xl text-primary mb-4">Order Not Found</h1>
              <p class="font-montserrat text-muted-c mb-8">No order found with ID "${esc(param)}".</p>
              <a href="#track" class="inline-flex items-center gap-2 bg-gold text-primary px-8 py-4 font-montserrat font-semibold text-sm tracking-wider uppercase cursor-pointer">Try Again</a>
            </div>
          </div>
        `);
        return;
      }
      var statusLabels = { pending: 'Pending', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };
      var statusBadge = { pending: 'admin-badge-pending', confirmed: 'admin-badge-confirmed', shipped: 'admin-badge-shipped', delivered: 'admin-badge-delivered', cancelled: 'admin-badge-cancelled' };
      this.render(`
        <div class="bg-page min-h-screen pt-32 pb-24">
          <div class="max-w-2xl mx-auto px-6">
            ${this.bc(['Home', 'Track Order'])}
            <div class="bg-card border border-subtle p-8 md:p-10">
              <div class="flex items-center justify-between mb-6">
                <h1 class="font-cormorant text-3xl text-primary">Order ${o.id}</h1>
                <span class="admin-badge ${statusBadge[o.status] || 'admin-badge-pending'}">${statusLabels[o.status] || o.status}</span>
              </div>
              <p class="font-montserrat text-sm text-muted-c mb-8">Placed on ${new Date(o.date).toLocaleString()}</p>
              <div class="border-t border-subtle pt-6 mb-8">
                <h4 class="text-xs uppercase tracking-wider text-muted-c mb-4 font-montserrat">Status Timeline</h4>
                <div class="flex items-start gap-0">
                  ${['pending','confirmed','shipped','delivered'].map(function(s, i) {
                    var idx = ['pending','confirmed','shipped','delivered'].indexOf(o.status);
                    var done = idx >= i;
                    var cancelled = o.status === 'cancelled';
                    return '<div class="flex-1 text-center"><div class="w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs font-semibold ' + (cancelled ? 'bg-stone-700 text-stone-400' : done ? 'bg-gold text-primary' : 'bg-stone-800 text-stone-500') + '">' + (done && !cancelled ? '\u2713' : '\u2022') + '</div><div class="text-2xs mt-1 ' + (cancelled ? 'text-stone-500' : done ? 'text-gold' : 'text-stone-600') + '">' + statusLabels[s] + '</div></div>' + (i < 3 ? '<div class="flex-1 h-px bg-stone-700 self-center mt-3"></div>' : '');
                  }).join('')}
                </div>
                ${o.status === 'cancelled' ? '<p class="text-center text-2xs text-red-400 mt-3">This order was cancelled.</p>' : ''}
              </div>
              <div class="border-t border-subtle pt-6">
                <h4 class="text-xs uppercase tracking-wider text-muted-c mb-4 font-montserrat">Shipping Details</h4>
                <p class="font-montserrat text-sm text-primary">${o.firstName || ''} ${o.lastName || ''}</p>
                <p class="font-montserrat text-xs text-muted-c">${o.address || ''}</p>
                <p class="font-montserrat text-xs text-muted-c">${o.wilaya || ''}${o.commune ? ', ' + o.commune : ''}</p>
              </div>
              <div class="border-t border-subtle pt-6 mt-6">
                <h4 class="text-xs uppercase tracking-wider text-muted-c mb-4 font-montserrat">Items</h4>
                ${o.items.map(function(item) {
                  var p = this.watches.find(function(w) { return w.id === item.id; });
                  return '<div class="flex justify-between py-1"><span class="font-montserrat text-sm text-primary">' + (p ? esc(p.name) : item.id) + ' x' + item.qty + '</span><span class="font-cormorant">DA' + ((p ? p.price : 0) * item.qty).toLocaleString() + '</span></div>';
                }.call(this)).join('')}
                <div class="flex justify-between border-t border-subtle pt-3 mt-3 font-cormorant text-xl text-primary"><span>Total</span><span>DA${o.total.toLocaleString()}</span></div>
              </div>
            </div>
            <div class="text-center mt-8">
              <a href="#track" class="font-montserrat text-sm text-muted-c hover-text-primary transition-colors cursor-pointer">Track another order</a>
            </div>
          </div>
        </div>
      `);
      return;
    }
    this.render(`
      <div class="bg-page min-h-screen pt-32 pb-24">
        <div class="max-w-lg mx-auto px-6">
          ${this.bc(['Home', 'Track Order'])}
          <div class="bg-card border border-subtle p-8 md:p-10">
            <div class="text-center mb-8">
              <svg class="w-12 h-12 text-gold mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <h1 class="font-cormorant text-3xl text-primary mb-2">Track Your Order</h1>
              <p class="font-montserrat text-sm text-muted-c">Enter your order ID to see the current status.</p>
            </div>
            <div class="flex gap-3">
              <input type="text" id="track-input" class="admin-input flex-1" placeholder="e.g. ORD-1001" onkeydown="if(event.key==='Enter')App.trackOrder()">
              <button onclick="App.trackOrder()" class="admin-btn admin-btn-primary px-6 whitespace-nowrap">Search</button>
            </div>
          </div>
        </div>
      </div>
    `);
  },

  trackOrder() {
    var val = document.getElementById('track-input')?.value?.trim();
    if (val) this.navigate('track/' + val);
  },

  whatsappOrder(items) {
    var lines = [];
    var total = 0;
    (items || Cart.items).forEach(function(item) {
      var w = this.watches.find(function(p) { return p.id === item.id; });
      if (w) {
        lines.push('- ' + w.name + ' x' + item.qty + ' = DA' + (w.price * item.qty).toLocaleString());
        total += w.price * item.qty;
      }
    }.bind(this));
    var msg = 'Hello Elite Chrono! I would like to order:%0A%0A';
    msg += lines.join('%0A');
    msg += '%0A%0ATotal: DA' + total.toLocaleString();
    msg += '%0A%0APlease contact me to confirm delivery details.';
    window.open('https://wa.me/' + this.whatsappNumber + '?text=' + msg, '_blank');
  },

  updateCartQty(id, qty) {
    Cart.updateQty(id, qty);
    this.renderCart();
  },

  removeCartItem(id) {
    if (confirm('Remove this item from your cart?')) {
      Cart.remove(id);
      this.renderCart();
    }
  },

  clearCart() {
    if (confirm('Clear your entire cart?')) {
      Cart.clear();
      this.renderCart();
    }
  },

  // ─── CHECKOUT ─────────────────────────────────────────────────────────

  renderCheckout() {
    if (Cart.items.length === 0) { this.navigate('cart'); return; }

    const total = Cart.getTotal(this.watches);
    const wilayaOptions = WILAYAS.map(w => `<option value="${w.code}">${w.name}</option>`).join('');

    this.render(`
      <div class="bg-page min-h-screen pt-32 pb-24">
        <div class="max-w-4xl mx-auto px-6">
          <div class="mb-12">
            <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-3" data-i18n="checkout-title">Checkout</p>
            <h1 class="font-cormorant text-5xl md:text-6xl text-primary" data-i18n="checkout-title">Complete Your Order</h1>
            <p class="font-montserrat text-muted-c mt-3" data-i18n="checkout-place-order">Pay on delivery — cash payment</p>
          </div>
          <div class="grid md:grid-cols-5 gap-10">
            <div class="md:col-span-3 space-y-6">
              <div class="bg-card border border-subtle p-8">
                <h2 class="font-cormorant text-2xl text-primary mb-6" data-i18n="checkout-shipping">Personal Details</h2>
                <div class="grid grid-cols-2 gap-4">
                  <input type="text" id="checkout-firstname" placeholder="First name *" class="col-span-2 sm:col-span-1 border border-medium px-4 py-3 font-montserrat text-sm bg-transparent focus:outline-none focus:border-gold transition-colors duration-200" data-i18n-placeholder="checkout-name-placeholder">
                  <input type="text" id="checkout-lastname" placeholder="Last name *" class="col-span-2 sm:col-span-1 border border-medium px-4 py-3 font-montserrat text-sm bg-transparent focus:outline-none focus:border-gold transition-colors duration-200" data-i18n-placeholder="checkout-name-placeholder">
                  <input type="tel" id="checkout-phone" placeholder="Phone number *" class="col-span-2 border border-medium px-4 py-3 font-montserrat text-sm bg-transparent focus:outline-none focus:border-gold transition-colors duration-200" data-i18n-placeholder="checkout-phone-placeholder">
                </div>
              </div>
              <div class="bg-card border border-subtle p-8">
                <h2 class="font-cormorant text-2xl text-primary mb-6" data-i18n="checkout-shipping">Delivery Address</h2>
                <div class="grid grid-cols-2 gap-4">
                  <select id="checkout-wilaya" onchange="App.updateCommunes()" class="col-span-2 sm:col-span-1 border border-medium px-4 py-3 font-montserrat text-sm bg-card focus:outline-none focus:border-gold transition-colors duration-200">
                    <option value="" data-i18n="checkout-wilaya">Select Wilaya</option>
                    ${wilayaOptions}
                  </select>
                  <select id="checkout-commune" class="col-span-2 sm:col-span-1 border border-medium px-4 py-3 font-montserrat text-sm bg-card focus:outline-none focus:border-gold transition-colors duration-200">
                    <option value="" data-i18n="checkout-commune">Select Commune</option>
                  </select>
                  <textarea id="checkout-address" placeholder="Street address / Building *" rows="3" class="col-span-2 border border-medium px-4 py-3 font-montserrat text-sm bg-transparent focus:outline-none focus:border-gold transition-colors duration-200 resize-none" data-i18n-placeholder="checkout-address-placeholder"></textarea>
                </div>
              </div>
              <div class="bg-card border border-subtle p-8">
                <h2 class="font-cormorant text-2xl text-primary mb-6" data-i18n="checkout-title">Payment Method</h2>
                <div class="flex items-center gap-4 p-4 border border-gold bg-gold-bg">
                  <svg class="w-6 h-6 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  <div>
                    <p class="font-montserrat text-sm text-primary font-semibold" data-i18n="checkout-place-order">Cash on Delivery</p>
                    <p class="font-montserrat text-xs text-muted-c" data-i18n="checkout-place-order">Pay in cash when your order arrives</p>
                  </div>
                </div>
              </div>
              <button onclick="App.placeOrder()" class="w-full bg-gold text-primary py-5 font-montserrat font-semibold text-sm tracking-wider uppercase hover-bg-gold-hover transition-colors duration-300 cursor-pointer" data-i18n="checkout-place-order">Confirm Order &mdash; DA${total.toLocaleString()}</button>
            </div>
            <div class="md:col-span-2">
              <div class="bg-card border border-subtle p-8 sticky top-32">
                <h2 class="font-cormorant text-2xl text-primary mb-6" data-i18n="checkout-order-summary">Order Summary</h2>
                <div class="space-y-4">
                  ${Cart.items.map(item => {
                    const w = this.watches.find(w => w.id === item.id);
                    if (!w) return '';
                    return `
                      <div class="flex gap-4">
                        <div class="w-16 h-16 bg-stone-100 flex-shrink-0 overflow-hidden"><img src="${w.img}" alt="${w.name}" class="w-full h-full object-cover"></div>
                        <div class="flex-1 min-w-0">
                          <p class="font-montserrat text-xs text-muted-c">${w.brand}</p>
                          <p class="font-cormorant text-sm text-primary">${w.name}</p>
                          <p class="font-montserrat text-xs text-muted-c">Qty: ${item.qty}</p>
                        </div>
                        <p class="font-cormorant text-sm text-primary">DA${(w.price * item.qty).toLocaleString()}</p>
                      </div>
                    `;
                  }).join('')}
                </div>
                <div class="border-t border-subtle mt-6 pt-6 space-y-2">
                  <div class="flex justify-between font-montserrat text-sm text-muted-c"><span data-i18n="checkout-order-summary">Subtotal</span><span>DA${total.toLocaleString()}</span></div>
                  <div class="flex justify-between font-montserrat text-sm text-muted-c"><span data-i18n="checkout-shipping">Shipping</span><span class="text-green-600" data-i18n="checkout-place-order">Free</span></div>
                  <div class="flex justify-between font-cormorant text-xl text-primary border-t border-subtle pt-4 mt-4"><span data-i18n="checkout-total">Total</span><span>DA${total.toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
  },

  updateCommunes() {
    const wilayaCode = parseInt(document.getElementById('checkout-wilaya')?.value, 10);
    const communeSelect = document.getElementById('checkout-commune');
    if (!communeSelect) return;
    communeSelect.innerHTML = '<option value="">Select Commune</option>';
    if (!wilayaCode) return;
    const wilaya = WILAYAS.find(w => w.code === wilayaCode);
    if (wilaya) {
      wilaya.communes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        communeSelect.appendChild(opt);
      });
    }
  },

  async placeOrder() {
    const firstName = document.getElementById('checkout-firstname')?.value?.trim();
    const lastName = document.getElementById('checkout-lastname')?.value?.trim();
    const phone = document.getElementById('checkout-phone')?.value?.trim();
    const wilayaCode = parseInt(document.getElementById('checkout-wilaya')?.value, 10);
    const commune = document.getElementById('checkout-commune')?.value;
    const address = document.getElementById('checkout-address')?.value?.trim();

    if (!firstName || !lastName || !phone || !wilayaCode || !commune || !address) {
      this.showToast('Please fill in all required fields');
      return;
    }

    const wilaya = WILAYAS.find(w => w.code === wilayaCode);
    const existingOrders = await getOrders();
    const orderId = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    const order = {
      id: orderId,
      date: new Date().toISOString(),
      firstName,
      lastName,
      phone,
      wilaya: wilaya ? wilaya.name : '',
      wilayaCode,
      commune,
      address,
      items: Cart.items.map(i => ({ id: i.id, qty: i.qty })),
      status: 'pending',
      total: Cart.getTotal(this.watches),
    };

    const saved = await saveOrder(order);
    if (!saved) {
      this.showToast(window.__('checkout-failed'));
      return;
    }

    Cart.clear();
    track('Purchase', { value: order.total, currency: 'DZD', content_ids: order.items.map(i => i.id), content_type: 'product' });
    var itemsHtml = order.items.map(function(item) {
      var w = this.watches.find(function(p) { return p.id === item.id; });
      return '<div class="flex justify-between py-2"><span class="font-montserrat text-sm text-primary">' + (w ? esc(w.name) : item.id) + ' <span class="text-muted-c">x' + item.qty + '</span></span><span class="font-cormorant">DA' + ((w ? w.price : 0) * item.qty).toLocaleString() + '</span></div>';
    }.bind(this)).join('');
    this.render(`
      <div class="bg-page min-h-screen pt-32 pb-24">
        <div class="max-w-2xl mx-auto px-6">
          ${this.bc(['Home', 'Order Confirmed'])}
          <div class="text-center mb-10">
            <div class="w-16 h-16 bg-green-100/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h1 class="font-cormorant text-4xl text-primary mb-2" data-i18n="checkout-success-title">Order Confirmed</h1>
            <p class="font-montserrat text-sm text-muted-c mb-1" data-i18n="checkout-success-thanks">Thank you for your purchase.</p>
            <p class="font-montserrat text-xs text-stone-500">You will receive a confirmation call at <strong class="text-primary">${esc(phone)}</strong></p>
          </div>
          <div class="bg-card border border-subtle p-6 md:p-8 mb-6">
            <div class="flex items-center justify-between mb-6 pb-4 border-b border-subtle">
              <div>
                <p class="font-montserrat text-2xs text-muted-c uppercase tracking-wider mb-1" data-i18n="checkout-success-id">Order</p>
                <p class="font-cormorant text-xl text-gold">${orderId}</p>
              </div>
              <span class="admin-badge admin-badge-pending">Pending</span>
            </div>
            <div class="mb-6">
              <h4 class="font-montserrat text-2xs text-muted-c uppercase tracking-wider mb-3">Items</h4>
              ${itemsHtml}
              <div class="flex justify-between border-t border-subtle pt-3 mt-2 font-cormorant text-lg text-primary"><span data-i18n="checkout-total">Total</span><span>DA${order.total.toLocaleString()}</span></div>
            </div>
            <div class="border-t border-subtle pt-4">
              <h4 class="font-montserrat text-2xs text-muted-c uppercase tracking-wider mb-2" data-i18n="checkout-shipping">Shipping Details</h4>
              <p class="font-montserrat text-sm text-primary">${esc(firstName)} ${esc(lastName)}</p>
              <p class="font-montserrat text-xs text-muted-c">${esc(address)}</p>
              <p class="font-montserrat text-xs text-muted-c">${wilaya ? esc(wilaya.name) : ''}${commune ? ', ' + esc(commune) : ''}</p>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#track/${orderId}" class="flex items-center justify-center gap-2 bg-gold text-primary px-8 py-4 font-montserrat font-semibold text-sm tracking-wider uppercase hover-bg-gold-hover transition-colors duration-300 cursor-pointer" data-i18n="checkout-track">Track Order</a>
            <a href="#home" class="flex items-center justify-center gap-2 border border-inverse text-primary px-8 py-4 font-montserrat text-sm tracking-wider uppercase hover-bg-inverse transition-colors duration-300 cursor-pointer" data-i18n="checkout-continue">Return Home</a>
          </div>
        </div>
      </div>
    `);
  },

  // ─── ABOUT / CONTACT ──────────────────────────────────────────────────

  renderAbout() {
    this.render(`
      <div class="bg-page min-h-screen pt-32 pb-24">
        <div class="max-w-4xl mx-auto px-6">
          <div class="mb-16 text-center">
            <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-3" data-i18n="section-journal">Our Story</p>
            <h1 class="font-cormorant text-5xl md:text-7xl text-primary" data-i18n-html="about-title">About Elite Chrono</h1>
          </div>
          <div class="prose max-w-none">
            <div class="aspect-[21/9] mb-16 flex items-center justify-center" style="background: linear-gradient(135deg, #000, var(--hero-via));">
              <svg viewBox="0 0 400 160" class="w-full max-w-3xl h-auto px-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logoGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#CA8A04"/>
                    <stop offset="50%" stop-color="#EBB93E"/>
                    <stop offset="100%" stop-color="#CA8A04"/>
                  </linearGradient>
                  <linearGradient id="logoGoldDim" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#CA8A04" stop-opacity="0.15"/>
                    <stop offset="50%" stop-color="#EBB93E" stop-opacity="0.1"/>
                    <stop offset="100%" stop-color="#CA8A04" stop-opacity="0.15"/>
                  </linearGradient>
                </defs>
                <!-- Outer gear ring -->
                <g opacity="0.12">
                  <circle cx="80" cy="80" r="64" stroke="url(#logoGold)" stroke-width="0.5"/>
                  <circle cx="80" cy="80" r="54" stroke="url(#logoGold)" stroke-width="0.3" stroke-dasharray="2 4"/>
                  <circle cx="80" cy="80" r="16" stroke="url(#logoGold)" stroke-width="0.5"/>
                  <circle cx="80" cy="80" r="6" fill="url(#logoGold)" opacity="0.3"/>
                  <g stroke="url(#logoGold)" stroke-width="0.8">
                    <line x1="80" y1="16" x2="80" y2="144"/>
                    <line x1="16" y1="80" x2="144" y2="80"/>
                    <line x1="35" y1="35" x2="125" y2="125"/>
                    <line x1="125" y1="35" x2="35" y2="125"/>
                  </g>
                  <g stroke="url(#logoGold)" stroke-width="0.6" stroke-linecap="round">
                    <line x1="80" y1="10" x2="80" y2="4"/>
                    <line x1="120" y1="18" x2="125" y2="12"/>
                    <line x1="148" y1="40" x2="154" y2="36"/>
                    <line x1="150" y1="80" x2="156" y2="80"/>
                    <line x1="148" y1="120" x2="154" y2="124"/>
                    <line x1="120" y1="142" x2="125" y2="148"/>
                    <line x1="80" y1="150" x2="80" y2="156"/>
                    <line x1="40" y1="142" x2="35" y2="148"/>
                    <line x1="12" y1="120" x2="6" y2="124"/>
                    <line x1="10" y1="80" x2="4" y2="80"/>
                    <line x1="12" y1="40" x2="6" y2="36"/>
                    <line x1="40" y1="18" x2="35" y2="12"/>
                  </g>
                </g>
                <!-- EC Monogram -->
                <text x="80" y="94" font-family="'Cormorant',Georgia,serif" font-size="58" font-weight="600" fill="url(#logoGold)" text-anchor="middle" letter-spacing="2">EC</text>
                <!-- Decorative line -->
                <rect x="155" y="78" width="90" height="0.5" fill="url(#logoGold)" opacity="0.3"/>
                <!-- Brand name -->
                <text x="290" y="78" font-family="'Cormorant',Georgia,serif" font-size="26" font-weight="500" fill="#FAFAF9" text-anchor="middle" letter-spacing="4">ELITE</text>
                <text x="290" y="102" font-family="'Cormorant',Georgia,serif" font-size="26" font-weight="500" fill="url(#logoGold)" text-anchor="middle" letter-spacing="4">CHRONO</text>
                <!-- Decorative line -->
                <rect x="155" y="98" width="90" height="0.5" fill="url(#logoGold)" opacity="0.3"/>
                <!-- Tagline -->
                <text x="290" y="120" font-family="'Montserrat',sans-serif" font-size="7" font-weight="300" fill="#A8A29E" text-anchor="middle" letter-spacing="3">LUXURY TIMEPIECES</text>
                <!-- Right gear -->
                <g opacity="0.08">
                  <circle cx="320" cy="80" r="40" stroke="url(#logoGold)" stroke-width="0.4"/>
                  <circle cx="320" cy="80" r="10" stroke="url(#logoGold)" stroke-width="0.3"/>
                  <g stroke="url(#logoGold)" stroke-width="0.4">
                    <line x1="320" y1="40" x2="320" y2="120"/>
                    <line x1="280" y1="80" x2="360" y2="80"/>
                    <line x1="292" y1="52" x2="348" y2="108"/>
                    <line x1="348" y1="52" x2="292" y2="108"/>
                  </g>
                </g>
              </svg>
            </div>
            <div class="grid md:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 class="font-cormorant text-3xl text-primary mb-6">Founded in Passion</h2>
                <p class="font-montserrat text-stone-600 leading-relaxed mb-4">Elite Chrono was born from a singular vision: to curate the world's finest timepieces for discerning collectors and enthusiasts. What began as a private collection has grown into a destination for horological excellence.</p>
                <p class="font-montserrat text-stone-600 leading-relaxed">We collaborate directly with the most prestigious maisons — Rolex, Patek Philippe, Audemars Piguet, and more — to bring you an unparalleled selection of new and iconic watches.</p>
              </div>
              <div>
                <h2 class="font-cormorant text-3xl text-primary mb-6">Crafted Curation</h2>
                <p class="font-montserrat text-stone-600 leading-relaxed mb-4">Every watch in our collection is hand-selected for its craftsmanship, heritage, and cultural significance. We believe a watch is more than a timekeeping instrument — it is a statement of identity.</p>
                <p class="font-montserrat text-stone-600 leading-relaxed">Our team of horological experts ensures that every piece meets rigorous standards of authenticity, condition, and provenance.</p>
              </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-t border-subtle text-center">
              <div><div class="font-cormorant text-4xl text-gold mb-2">10+</div><div class="font-montserrat text-sm text-muted-c">Brands</div></div>
              <div><div class="font-cormorant text-4xl text-gold mb-2">100+</div><div class="font-montserrat text-sm text-muted-c">Timepieces</div></div>
              <div><div class="font-cormorant text-4xl text-gold mb-2">50+</div><div class="font-montserrat text-sm text-muted-c">Years Combined Expertise</div></div>
              <div><div class="font-cormorant text-4xl text-gold mb-2">100%</div><div class="font-montserrat text-sm text-muted-c">Authenticity Guaranteed</div></div>
            </div>
            <div class="mt-16 p-10 bg-card border border-subtle">
              <h2 class="font-cormorant text-3xl text-primary mb-4">Our Commitment</h2>
              <p class="font-montserrat text-stone-600 leading-relaxed">Every timepiece purchased from Elite Chrono includes a comprehensive authenticity certificate, international warranty, and complimentary insured shipping. Our concierge team is available 24/7 to assist with any inquiry.</p>
            </div>
          </div>
        </div>
      </div>
    `);
  },

  renderContact() {
    this.render(`
      <div class="bg-page min-h-screen pt-32 pb-24">
        <div class="max-w-4xl mx-auto px-6">
          <div class="mb-16 text-center">
            <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-3" data-i18n="page-contact-label">Get in Touch</p>
            <h1 class="font-cormorant text-5xl md:text-7xl text-primary" data-i18n="contact-title">Contact Us</h1>
          </div>
          <div class="grid md:grid-cols-2 gap-12">
            <div>
              <div class="space-y-8">
                <div>
                  <h3 class="font-cormorant text-2xl text-primary mb-2">Boutique</h3>
                  <p class="font-montserrat text-stone-600">Coming soon</p>
                </div>
                <div>
                  <h3 class="font-cormorant text-2xl text-primary mb-2">Hours</h3>
                  <p class="font-montserrat text-stone-600">Coming soon</p>
                </div>
                <div>
                  <h3 class="font-cormorant text-2xl text-primary mb-2">Concierge</h3>
                  <p class="font-montserrat text-stone-600">Coming soon</p>
                </div>
              </div>
            </div>
            <div class="bg-card border border-subtle p-8">
              <h2 class="font-cormorant text-2xl text-primary mb-6">Send a Message</h2>
              <div class="space-y-4">
                <input type="text" placeholder="Full Name" class="w-full border border-medium px-4 py-3 font-montserrat text-sm bg-transparent focus:outline-none focus:border-gold transition-colors duration-200">
                <input type="text" placeholder="Phone Number" class="w-full border border-medium px-4 py-3 font-montserrat text-sm bg-transparent focus:outline-none focus:border-gold transition-colors duration-200">
                <input type="text" placeholder="Subject" class="w-full border border-medium px-4 py-3 font-montserrat text-sm bg-transparent focus:outline-none focus:border-gold transition-colors duration-200">
                <textarea rows="5" placeholder="Message" class="w-full border border-medium px-4 py-3 font-montserrat text-sm bg-transparent focus:outline-none focus:border-gold transition-colors duration-200 resize-none"></textarea>
                <button onclick="App.showToast('Message sent — we will respond within 24 hours.')" class="w-full bg-inverse text-white py-4 font-montserrat font-semibold text-sm tracking-wider uppercase hover-bg-gold hover-text-primary transition-all duration-300 cursor-pointer">Send Message</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
  },

  // ─── ADMIN ────────────────────────────────────────────────────────────

  async adminLogin() {
    const email = document.getElementById('admin-email')?.value.trim();
    const pass = document.getElementById('admin-password')?.value.trim();
    const result = await Auth.signIn(email, pass);
    if (result.success) {
      this.showToast('Welcome, Admin');
      this.renderAdmin();
    } else {
      this.showToast(result.error || 'Invalid credentials');
    }
  },

  async renderAdmin() {
    if (!Auth.isAdmin()) {
      this.render(`
        <div class="bg-page min-h-screen pt-32 pb-24 flex items-center justify-center">
          <div class="max-w-sm w-full mx-auto px-6">
            <div class="bg-card border border-subtle p-8 space-y-5">
              <div>
                <label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-2 block">Email</label>
                <input type="email" id="admin-email" class="admin-input" placeholder="admin@elitechrono.com">
              </div>
              <div>
                <label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-2 block">Password</label>
                <input type="password" id="admin-password" class="admin-input" placeholder="••••••••">
              </div>
              <button onclick="App.adminLogin()" class="admin-btn admin-btn-primary w-full text-center">Sign In</button>
            </div>
          </div>
        </div>
      `);
      return;
    }
    // Pre-fetch data for admin tables
    if (!this._cachedOrders || this._cachedOrders.length === 0) this._cachedOrders = await getOrders();
    if (!this._cachedAdminProducts || this._cachedAdminProducts.length === 0) this._cachedAdminProducts = await getProducts();
    const hash = location.hash.slice(1);
    const tab = hash === 'elite-zone-products' ? 'products' : 'orders';
    this.render(`
      <div class="bg-page min-h-screen pt-24">
        <div class="max-w-7xl mx-auto px-6 py-8">
          <div class="flex items-center justify-between mb-8">
            <div>
              <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-1">Dashboard</p>
              <h1 class="font-cormorant text-3xl md:text-4xl text-primary">Administration</h1>
            </div>
            <button onclick="App.adminLogout()" class="admin-btn admin-btn-ghost text-xs">Logout</button>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            ${function(){
              const all = this._cachedOrders || [];
              const active = all.filter(o => o.status !== 'cancelled');
              const revenue = active.reduce((s, o) => s + (o.total || 0), 0);
              const pending = all.filter(o => o.status === 'pending').length;
              const brandCounts = {};
              all.forEach(o => (o.items || []).forEach(item => {
                const p = [...this.watches, ...this._cachedAdminProducts || []].find(pr => pr.id === item.id);
                if (p) { brandCounts[p.brand] = (brandCounts[p.brand] || 0) + item.qty; }
              }));
              const topBrand = Object.keys(brandCounts).sort((a,b) => brandCounts[b] - brandCounts[a])[0] || '—';
              return `
              <div class="bg-card border border-subtle p-5"><p class="font-montserrat text-2xs text-muted-c uppercase tracking-wider mb-1">Total Orders</p><p class="font-cormorant text-2xl text-primary">${all.length}</p></div>
              <div class="bg-card border border-subtle p-5"><p class="font-montserrat text-2xs text-muted-c uppercase tracking-wider mb-1">Revenue (Active)</p><p class="font-cormorant text-2xl text-gold">DA${revenue.toLocaleString()}</p></div>
              <div class="bg-card border border-subtle p-5"><p class="font-montserrat text-2xs text-muted-c uppercase tracking-wider mb-1">Pending</p><p class="font-cormorant text-2xl text-primary">${pending}</p></div>
              <div class="bg-card border border-subtle p-5"><p class="font-montserrat text-2xs text-muted-c uppercase tracking-wider mb-1">Top Brand</p><p class="font-cormorant text-2xl text-primary">${esc(topBrand)}</p></div>
              `;
            }.call(this)}
          </div>
          <div class="flex flex-col md:flex-row gap-8">
            <div class="admin-sidebar w-full md:w-56 flex-shrink-0">
              <a href="#elite-zone" class="admin-tab block px-5 py-3 font-montserrat text-sm border border-subtle mb-2 cursor-pointer ${tab === 'orders' ? 'active' : ''}">
                <span class="flex items-center gap-3"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> Orders</span>
              </a>
              <a href="#elite-zone-products" class="admin-tab block px-5 py-3 font-montserrat text-sm border border-subtle mb-2 cursor-pointer ${tab === 'products' ? 'active' : ''}">
                <span class="flex items-center gap-3"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg> Watches</span>
              </a>
              <a href="#home" class="admin-tab block px-5 py-3 font-montserrat text-sm border border-subtle cursor-pointer hover-bg-hover transition-colors">
                <span class="flex items-center gap-3 text-muted-c"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg> Back to Site</span>
              </a>
            </div>
            <div class="flex-1 min-w-0">
              ${tab === 'orders' ? this.renderAdminOrders() : this.renderAdminProducts()}
            </div>
          </div>
        </div>
      </div>
    `);
  },

  async adminLogout() {
    await Auth.signOut();
    this.showToast('Logged out');
    this.navigate('home');
  },

  renderAdminOrders() {
    const orders = this._cachedOrders || [];
    const statusFilter = new URLSearchParams(location.hash.slice(location.hash.indexOf('?'))).get('status') || '';
    const filtered = statusFilter ? orders.filter(o => o.status === statusFilter) : orders;
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    const statusLabels = { pending: 'Pending', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };
    const statusBadge = { pending: 'admin-badge-pending', confirmed: 'admin-badge-confirmed', shipped: 'admin-badge-shipped', delivered: 'admin-badge-delivered', cancelled: 'admin-badge-cancelled' };

    return `
      <div>
          <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 class="font-cormorant text-2xl text-primary">Order Management</h2>
            <div class="flex flex-wrap items-center gap-2">
              <button onclick="App.exportOrdersCSV()" class="admin-btn admin-btn-ghost text-xs flex items-center gap-1.5"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> CSV</button>
              <a href="#elite-zone" class="admin-btn admin-btn-ghost text-xs ${!statusFilter ? 'border-gold' : ''}">All</a>
            ${statuses.map(s => `<a href="#elite-zone?status=${s}" class="admin-btn admin-btn-ghost text-xs ${statusFilter === s ? 'border-gold' : ''}">${statusLabels[s]}</a>`).join('')}
          </div>
        </div>
        <div class="overflow-x-auto border border-subtle">
          <table class="admin-table w-full">
            <thead>
              <tr><th>Order</th><th>Date</th><th>Client</th><th>Items</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? '<tr><td colspan="6" class="text-center py-12 text-muted-c font-montserrat text-sm">No orders found</td></tr>' : ''}
              ${filtered.sort((a,b) => new Date(b.date) - new Date(a.date)).map(o => {
                const items = o.items.map(item => {
                  const p = [...this.watches, ...this._cachedAdminProducts || []].find(pr => pr.id === item.id);
                  return p ? `${p.name} x${item.qty}` : `${item.id} x${item.qty}`;
                }).join(', ');
                const total = o.total || o.items.reduce((sum, item) => {
                  const p = [...this.watches, ...this._cachedAdminProducts || []].find(pr => pr.id === item.id);
                  return sum + (p ? p.price * item.qty : 0);
                }, 0);
                return `
                  <tr class="cursor-pointer" onclick="App.showOrderDetail('${o.id}')">
                    <td class="font-montserrat font-semibold text-xs">${o.id}</td>
                    <td class="font-montserrat text-xs text-muted-c">${new Date(o.date).toLocaleDateString()}</td>
                    <td><div class="font-montserrat text-sm">${o.firstName || ''} ${o.lastName || ''}</div><div class="font-montserrat text-xs text-muted-c">${o.phone}</div></td>
                    <td class="font-montserrat text-xs text-muted-c max-w-[200px] truncate">${items}</td>
                    <td class="font-cormorant text-sm">DA${total.toLocaleString()}</td>
                    <td><select onchange="event.stopPropagation(); App.updateOrderStatus('${o.id}', this.value)" class="admin-select text-xs py-1 px-2 w-auto">${statuses.map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${statusLabels[s]}</option>`).join('')}</select></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async updateOrderStatus(orderId, newStatus) {
    if (newStatus === 'cancelled' && !confirm('Cancel this order? This cannot be undone.')) return;
    const result = await updateOrderStatus(orderId, newStatus);
    if (result) {
      this.showToast(`Order ${orderId} → ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`);
    }
    this._cachedOrders = null;
    this.renderAdmin();
  },

  async showOrderDetail(orderId) {
    const orders = this._cachedOrders || [];
    let o = orders.find(ord => ord.id === orderId);
    if (!o) {
      o = await getOrderById(orderId);
    }
    if (!o) return;
    const statusLabels = { pending: 'Pending', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };
    const statusBadge = { pending: 'admin-badge-pending', confirmed: 'admin-badge-confirmed', shipped: 'admin-badge-shipped', delivered: 'admin-badge-delivered', cancelled: 'admin-badge-cancelled' };
    const overlay = document.createElement('div');
    overlay.className = 'admin-overlay';
    overlay.innerHTML = `
      <div class="admin-modal">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-cormorant text-2xl text-primary">${o.id}</h3>
          <button onclick="this.closest('.admin-overlay').remove()" class="text-muted-c hover:text-primary cursor-pointer"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <div class="space-y-5 text-sm font-montserrat">
          <div class="flex items-center justify-between">
            <div><span class="text-muted-c text-xs uppercase tracking-wider">Date</span><p class="text-primary">${new Date(o.date).toLocaleString()}</p></div>
            <div><span class="text-muted-c text-xs uppercase tracking-wider">Status</span><p><span class="admin-badge ${statusBadge[o.status] || 'admin-badge-pending'}">${statusLabels[o.status] || o.status}</span></p></div>
          </div>
          <div class="border-t border-subtle pt-4">
            <h4 class="text-xs uppercase tracking-wider text-muted-c mb-3">Order Timeline</h4>
            <div class="flex items-start gap-0">
              ${['pending','confirmed','shipped','delivered'].map((s, i) => {
                var idx = ['pending','confirmed','shipped','delivered'].indexOf(o.status);
                var done = idx >= i;
                var cancelled = o.status === 'cancelled';
                return `
                <div class="flex-1 text-center">
                  <div class="w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs font-semibold ${cancelled ? 'bg-stone-700 text-stone-400' : done ? 'bg-gold text-primary' : 'bg-stone-800 text-stone-500'}">${done && !cancelled ? '✓' : '•'}</div>
                  <div class="text-2xs mt-1 ${cancelled ? 'text-stone-500' : done ? 'text-gold' : 'text-stone-600'}">${statusLabels[s]}</div>
                  ${o.status === s ? '<div class="text-2xs text-gold mt-0.5">← Current</div>' : ''}
                </div>
                ${i < 3 ? '<div class="flex-1 h-px bg-stone-700 self-center mt-3"></div>' : ''}
                `;
              }).join('')}
            </div>
            ${o.status === 'cancelled' ? '<div class="text-center mt-2"><span class="text-2xs text-red-400">This order was cancelled</span></div>' : ''}
          </div>
          <div class="border-t border-subtle pt-4">
            <h4 class="text-xs uppercase tracking-wider text-muted-c mb-2">Client</h4>
            <p class="text-primary">${o.firstName || ''} ${o.lastName || ''}</p>
            <p class="text-muted-c text-xs">${o.phone}</p>
          </div>
          <div class="border-t border-subtle pt-4">
            <h4 class="text-xs uppercase tracking-wider text-muted-c mb-2">Shipping</h4>
            <p class="text-primary">${o.address || ''}</p>
            <p class="text-muted-c text-xs">${o.wilaya || ''}${o.commune ? ', ' + o.commune : ''}</p>
          </div>
          <div class="border-t border-subtle pt-4">
            <h4 class="text-xs uppercase tracking-wider text-muted-c mb-2">Watches</h4>
            ${o.items.map(item => {
              const p = this.watches.find(pr => pr.id === item.id);
              return `<div class="flex justify-between py-1"><span class="text-primary">${p ? p.name : item.id} x${item.qty}</span><span class="font-cormorant">DA${((p ? p.price : 0) * item.qty).toLocaleString()}</span></div>`;
            }).join('')}
            <div class="flex justify-between border-t border-subtle pt-2 mt-2 font-cormorant text-lg text-primary"><span>Total</span><span>DA${o.total.toLocaleString()}</span></div>
          </div>
          <div class="border-t border-subtle pt-4 flex gap-2">
            ${o.status !== 'cancelled' && o.status !== 'delivered' ? `
              ${o.status === 'pending' ? '<button onclick="App.updateOrderStatus(\'' + o.id + '\',\'confirmed\');this.closest(\'.admin-overlay\').remove()" class="admin-btn admin-btn-primary text-xs flex-1">Confirm Order</button>' : ''}
              ${o.status === 'confirmed' ? '<button onclick="App.updateOrderStatus(\'' + o.id + '\',\'shipped\');this.closest(\'.admin-overlay\').remove()" class="admin-btn admin-btn-primary text-xs flex-1">Mark as Shipped</button>' : ''}
              ${o.status === 'shipped' ? '<button onclick="App.updateOrderStatus(\'' + o.id + '\',\'delivered\');this.closest(\'.admin-overlay\').remove()" class="admin-btn admin-btn-primary text-xs flex-1">Mark as Delivered</button>' : ''}
              <button onclick="App.updateOrderStatus(\'' + o.id + '\',\'cancelled\');this.closest(\'.admin-overlay\').remove()" class="admin-btn admin-btn-danger text-xs">Cancel</button>
            ` : o.status === 'delivered' ? '<span class="text-xs text-green-600 flex-1 text-center py-2">Order completed</span>' : '<span class="text-xs text-red-400 flex-1 text-center py-2">Order cancelled</span>'}
          </div>
        </div>
      </div>
    `;
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  },

  renderAdminProducts() {
    const products = this._cachedAdminProducts || [];
    const brands = [...new Set(products.map(p => p.brand))];
    const sections = ['New Models', 'Featured Timepieces'];

    return `
      <div class="flex items-center justify-between gap-4 mb-6">
        <h2 class="font-cormorant text-2xl text-primary">Watch Management</h2>
        <button onclick="App.showProductForm()" class="admin-btn admin-btn-primary text-xs"><span class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Add Watch</span></button>
      </div>
      <div class="overflow-x-auto border border-subtle">
        <table class="admin-table w-full">
          <thead>
            <tr><th>Watch</th><th>Brand</th><th>Price</th><th>Sections</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${products.map(p => `
              <tr>
                <td><div class="flex items-center gap-3"><div class="w-10 h-10 bg-stone-100 flex-shrink-0 overflow-hidden"><img src="${esc(p.img)}" alt="${esc(p.name)}" class="w-full h-full object-cover"></div><div><div class="font-montserrat text-sm text-primary">${esc(p.name)}</div><div class="font-montserrat text-xs text-muted-c">${esc(p.id)}</div></div></div></td>
                <td class="font-montserrat text-sm">${esc(p.brand)}</td>
                <td class="font-cormorant text-sm">DA${p.price.toLocaleString()}</td>
                <td><div class="flex flex-wrap gap-1">${(p.sections || []).length === 0 ? '<span class="text-muted-c text-xs font-montserrat">—</span>' : ''}${(p.sections || []).map(s => `<span class="admin-section-tag">${s}</span>`).join('')}</div></td>
                <td class="font-montserrat text-xs"><span class="${p.in_stock === false ? 'text-red-500' : 'text-green-600'}">${p.in_stock === false ? 'Out of Stock' : 'In Stock'}</span></td>
                <td class="font-montserrat text-xs"><span class="${p.visible === false ? 'text-muted-c' : 'text-green-600'}">${p.visible === false ? 'Private' : 'Public'}</span></td>
                <td><div class="flex gap-2"><button onclick="App.showProductForm('${p.id}')" class="admin-btn admin-btn-ghost text-xs px-3 py-1">Edit</button><button onclick="App.deleteProduct('${p.id}')" class="admin-btn admin-btn-danger text-xs px-3 py-1">Delete</button></div></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  showProductForm(productId) {
    const products = this._cachedAdminProducts || [];
    const existing = productId ? products.find(p => p.id === productId) : null;
    const brands = [...new Set([...BRANDS, ...products.map(p => p.brand)])].sort();
    const sections = ['New Models', 'Featured Timepieces'];

    const overlay = document.createElement('div');
    overlay.className = 'product-overlay';
    overlay.innerHTML = `
      <div class="admin-modal">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-cormorant text-2xl text-primary">${existing ? 'Edit Watch' : 'Add Watch'}</h3>
          <button onclick="this.closest('.product-overlay').remove()" class="text-muted-c hover:text-primary cursor-pointer"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <div class="space-y-4">
          <div><label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-1 block">Watch ID</label><input id="pf-id" class="admin-input" value="${existing ? existing.id : ''}" placeholder="e.g. rolex-daytona-2026"></div>
          <div><label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-1 block">Watch Name</label><input id="pf-name" class="admin-input" value="${existing ? existing.name : ''}" placeholder="e.g. Daytona 40mm"></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-1 block">Brand</label><select id="pf-brand" class="admin-select">${brands.map(b => `<option value="${b}" ${existing && existing.brand === b ? 'selected' : ''}>${b}</option>`).join('')}</select></div>
            <div><label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-1 block">Price (DZD)</label><input id="pf-price" class="admin-input" type="number" value="${existing ? existing.price : ''}" placeholder="e.g. 14500"></div>
          </div>
          <div><label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-1 block">Description</label><textarea id="pf-desc" class="admin-input" rows="3" placeholder="Watch description...">${existing ? existing.description : ''}</textarea></div>
          <div><label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-1 block">Main Image URL</label><input id="pf-img" class="admin-input" value="${existing ? existing.img : ''}" placeholder="https://..."></div>
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-montserrat text-xs text-muted-c tracking-wider uppercase">Additional Images</label>
              <button type="button" onclick="addImageField()" class="text-gold hover:text-gold-hover font-montserrat text-xs flex items-center gap-1 cursor-pointer">+ Add image</button>
            </div>
            <div id="pf-images-container">
              ${(existing && existing.images && existing.images.length) ? existing.images.map(url => `
              <div class="flex gap-2 mb-2">
                <input class="admin-input pf-image-input flex-1" value="${url}" placeholder="https://...">
                <button type="button" onclick="this.parentElement.remove()" class="admin-img-remove">&times;</button>
              </div>`).join('') : `
              <div class="flex gap-2 mb-2">
                <input class="admin-input pf-image-input flex-1" placeholder="https://...">
                <button type="button" onclick="this.parentElement.remove()" class="admin-img-remove">&times;</button>
              </div>`}
            </div>
          </div>
          <div>
            <label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-2 block">Sections</label>
            <div class="flex flex-wrap gap-2">${sections.map(s => `<button type="button" class="section-toggle ${existing && (existing.sections || []).includes(s) ? 'active' : ''}" data-section="${s}" onclick="this.classList.toggle('active')">${s}</button>`).join('')}</div>
          </div>
          <div>
            <label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-2 block">Specifications</label>
            <div class="grid grid-cols-2 gap-3">
              <div><input id="pf-spec-movement" class="admin-input" placeholder="Movement" value="${existing && existing.specs ? existing.specs.Movement || '' : ''}"></div>
              <div><input id="pf-spec-case" class="admin-input" placeholder="Case" value="${existing && existing.specs ? existing.specs.Case || '' : ''}"></div>
              <div><input id="pf-spec-glass" class="admin-input" placeholder="Glass" value="${existing && existing.specs ? existing.specs.Glass || '' : ''}"></div>
              <div><input id="pf-spec-dial" class="admin-input" placeholder="Dial" value="${existing && existing.specs ? existing.specs.Dial || '' : ''}"></div>
              <div><input id="pf-spec-strap" class="admin-input" placeholder="Strap" value="${existing && existing.specs ? existing.specs.Strap || '' : ''}"></div>
              <div><input id="pf-spec-water" class="admin-input" placeholder="Water Resistance" value="${existing && existing.specs ? existing.specs['Water Resistance'] || '' : ''}"></div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-1 block">Availability</label><select id="pf-stock" class="admin-select"><option value="in" ${existing && existing.in_stock !== false ? 'selected' : ''}>In Stock</option><option value="out" ${existing && existing.in_stock === false ? 'selected' : ''}>Out of Stock</option></select></div>
            <div><label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-1 block">Visibility</label><select id="pf-visible" class="admin-select"><option value="1" ${existing && existing.visible !== false ? 'selected' : ''}>Public</option><option value="0" ${existing && existing.visible === false ? 'selected' : ''}>Private</option></select></div>
          </div>
          <div class="flex gap-3 pt-2">
            <button onclick="App.saveProduct('${existing ? existing.id : ''}')" class="admin-btn admin-btn-primary flex-1">${existing ? 'Update Watch' : 'Create Watch'}</button>
            <button onclick="this.closest('.product-overlay').remove()" class="admin-btn admin-btn-ghost">Cancel</button>
          </div>
        </div>
      </div>
    `;
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  },

  async saveProduct(existingId) {
    let id = document.getElementById('pf-id')?.value?.trim();
    const name = document.getElementById('pf-name')?.value?.trim();
    const brand = document.getElementById('pf-brand')?.value;
    const price = parseFloat(document.getElementById('pf-price')?.value);
    const desc = document.getElementById('pf-desc')?.value?.trim();
    const img = document.getElementById('pf-img')?.value?.trim();
    const sections = [];
    document.querySelectorAll('.section-toggle.active').forEach(btn => sections.push(btn.dataset.section));
    const stock = document.getElementById('pf-stock')?.value;
    const visible = document.getElementById('pf-visible')?.value;

    if (!id || !name || !brand || isNaN(price) || !desc || !img) {
      this.showToast('Please fill all required fields');
      return;
    }

    if (!existingId) {
      const existingIds = new Set((this._cachedAdminProducts || []).map(p => p.id));
      if (existingIds.has(id)) {
        let suffix = 2;
        while (existingIds.has(`${id}/${suffix}`)) suffix++;
        id = `${id}/${suffix}`;
      }
    }

    const existing = existingId ? (this._cachedAdminProducts || []).find(p => p.id === existingId) : null;
    const imageInputs = document.querySelectorAll('.pf-image-input');
    const images = Array.from(imageInputs).map(inp => inp.value.trim()).filter(u => u.startsWith('http'));
    if (!images.length) images.push(img);

    const productData = { id, name, brand, price, description: desc, img, images, sections, in_stock: stock === 'in', visible: visible !== '0', new: sections.includes('New Models'), originalPrice: existing ? existing.originalPrice || null : null };

    var specs = {};
    var specFields = ['Movement','Case','Glass','Dial','Strap','Water Resistance'];
    specFields.forEach(function(f) {
      var el = document.getElementById('pf-spec-' + f.toLowerCase().replace(/ /g, ''));
      if (el && el.value.trim()) specs[f] = el.value.trim();
    });
    if (Object.keys(specs).length) productData.specs = specs;

    const result = await saveProduct(productData);
    if (result) {
      this.showToast(existingId ? 'Watch updated' : `Watch created (${id})`);
      document.querySelector('.product-overlay')?.remove();
      this._cachedAdminProducts = await getProducts();
      await this.syncProducts();
      this.renderAdmin();
    } else {
      this.showToast('Failed to save watch');
    }
  },

  async deleteProduct(productId) {
    if (!confirm(`Delete "${productId}"? This cannot be undone.`)) return;
    const success = await deleteProduct(productId);
    if (success) {
      this.showToast('Product deleted');
      this._cachedAdminProducts = await getProducts();
      await this.syncProducts();
      this.renderAdmin();
    } else {
      this.showToast('Failed to delete product');
    }
  },

  exportOrdersCSV() {
    var orders = this._cachedOrders || [];
    if (!orders.length) { this.showToast('No orders to export'); return; }
    var rows = [['Order ID','Date','Client','Phone','Wilaya','Commune','Address','Items','Total (DZD)','Status']];
    orders.forEach(function(o) {
      var items = (o.items || []).map(function(item) {
        var p = this.watches.find(function(w) { return w.id === item.id; });
        return (p ? p.name : item.id) + ' x' + item.qty;
      }.bind(this)).join('; ');
      rows.push([o.id, new Date(o.date).toISOString(), (o.firstName||'') + ' ' + (o.lastName||''), o.phone||'', o.wilaya||'', o.commune||'', (o.address||'').replace(/,/g,' '), '"' + items + '"', (o.total||0).toString(), o.status||'']);
    }.bind(this));
    var csv = rows.map(function(r) { return r.join(','); }).join('\n');
    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = 'elitechrono-orders-' + new Date().toISOString().slice(0,10) + '.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  },

  // ─── GALLERY ──────────────────────────────────────────────────────────

  galleryNav(id, dir) {
    const imgs = this.watches.find(w => w.id === id)?.images;
    if (!imgs || imgs.length < 2) return;
    const main = document.getElementById('detail-main-img');
    const currentSrc = main.getAttribute('src');
    let idx = imgs.indexOf(currentSrc);
    if (idx === -1) idx = 0;
    idx = (idx + dir + imgs.length) % imgs.length;
    main.setAttribute('src', imgs[idx]);
    document.querySelectorAll('.thumb-img').forEach(t => t.classList.toggle('active', parseInt(t.dataset.index, 10) === idx));
    document.querySelectorAll('.gallery-dot').forEach(d => d.classList.toggle('active', parseInt(d.dataset.index) === idx));
    document.getElementById('thumb-gallery')?.querySelector(`.thumb-img[data-index="${idx}"]`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  },

  gallerySelect(idx) {
    const main = document.getElementById('detail-main-img');
    const imgs = document.querySelectorAll('.thumb-img');
    if (!main || !imgs.length) return;
    const src = imgs[idx]?.getAttribute('src');
    if (src) main.setAttribute('src', src);
    imgs.forEach(t => t.classList.toggle('active', parseInt(t.dataset.index, 10) === idx));
    document.querySelectorAll('.gallery-dot').forEach(d => d.classList.toggle('active', parseInt(d.dataset.index) === idx));
  },

  // ─── SHARED ───────────────────────────────────────────────────────────

  bc(items) {
    var html = '<div class="flex items-center gap-2 text-xs font-montserrat text-muted-c mb-8 flex-wrap">';
    if (items[0] !== 'Home') {
      html += '<a href="#home" class="hover-text-gold transition-colors">Home</a><span class="text-gold">/</span>';
    }
    for (var i = 0; i < items.length; i++) {
      var label = items[i];
      var link = i < items.length - 1;
      if (i === 0 && label === 'Home') {
        html += '<a href="#home" class="hover-text-gold transition-colors">Home</a><span class="text-gold mx-1">/</span>';
      } else if (link) {
        var href = label === 'Watches' ? '#products' : label === 'Featured' ? '#featured' : label === 'Brands' ? '#brands' : '';
        if (href) html += '<a href="' + href + '" class="hover-text-gold transition-colors">' + label + '</a><span class="text-gold mx-1">/</span>';
        else html += '<span class="text-primary">' + label + '</span><span class="text-gold mx-1">/</span>';
      } else {
        html += '<span class="text-primary">' + label + '</span>';
      }
    }
    html += '</div>';
    return html;
  },

  productCard(w) {
    return `
      <a href="#product-${esc(w.id)}" class="product-card ${w.in_stock === false ? 'opacity-dimmed' : ''}">
        <div class="relative overflow-hidden product-card-img-wrap">
          <img src="${esc(w.img)}" alt="${esc(w.brand)} ${esc(w.name)}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 500%22%3E%3Crect fill=%22%231C1917%22 width=%22400%22 height=%22500%22/%3E%3Ctext x=%22200%22 y=%22250%22 text-anchor=%22middle%22 fill=%22%23CA8A04%22 font-family=%22serif%22 font-size=%2222%22%3E' + encodeURIComponent((this.alt || 'Watch').split(' ').slice(0,2).join(' ')) + '%3C/text%3E%3C/svg%3E'">
          ${w.new ? '<span class="badge-new">New</span>' : ''}
          ${w.originalPrice ? '<span class="badge-sale">Sale</span>' : ''}
          ${w.in_stock === false ? '<span class="badge-oos">Out of Stock</span>' : ''}
        </div>
        <div class="product-info">
          <div class="brand-tag">${esc(w.brand)}</div>
          <h3>${esc(w.name)}</h3>
          <div class="flex items-center mt-auto">
            <span class="price">DA${w.price.toLocaleString()}</span>
            ${w.originalPrice ? `<span class="original-price">DA${w.originalPrice.toLocaleString()}</span>` : ''}
          </div>
        </div>
      </a>
    `;
  },
};

function addImageField() {
  const c = document.getElementById('pf-images-container');
  if (!c) return;
  const d = document.createElement('div');
  d.className = 'flex gap-2 mb-2';
  d.innerHTML = '<input class="admin-input pf-image-input flex-1" placeholder="https://..."> <button type="button" onclick="this.parentElement.remove()" class="admin-img-remove">&times;</button>';
  c.appendChild(d);
  d.querySelector('input').focus();
}

// Expose on window for onclick handlers
window.App = App;
window.Cart = Cart;
window.addImageField = addImageField;

// Entry point
document.addEventListener('DOMContentLoaded', () => App.init());
