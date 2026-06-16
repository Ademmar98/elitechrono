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
    if (btn) btn.textContent = open ? 'Close' : 'Menu';
  }
}
window.toggleMenu = toggleMenu;



const App = {
  currentRoute: 'home',
  watches: WATCHES,
  pendingOrders: [],
  cachedProducts: [],

  routes: {
    home: 'renderHome',
    products: 'renderProducts',
    'new-models': 'renderNewModels',
    cart: 'renderCart',
    checkout: 'renderCheckout',
    about: 'renderAbout',
    contact: 'renderContact',
    'elite-zone': 'renderAdmin',
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
      localStorage.removeItem('elitechrono_products');
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
    }

    this.currentRoute = route;

    if (this.routes[route]) {
      this[this.routes[route]]();
    } else if (route === 'brand') {
      this.renderBrand(param);
    } else if (route === 'product') {
      this.renderProductDetail(param);
    } else {
      this.renderHome();
    }

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
    const featured = this.watches.slice(0, 8);
    const newModels = this.watches.filter(w => w.new).slice(0, 4);

    this.render(`
      <section class="relative w-full min-h-[80vh] flex items-center overflow-hidden bg-black">
        <div class="absolute inset-0 z-0 flex items-center justify-center opacity-[0.22] pointer-events-none select-none overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-[1]"></div>
          <svg class="w-full h-full min-w-[1200px] min-h-[1200px] object-cover text-white/70" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style="transform: scale(1.1); filter: drop-shadow(0 0 12px rgba(255,255,255,0.08));">
            <g class="hero-gear" transform="translate(300, 80)" style="animation: escapeTick 0.8s ease-in-out infinite; transform-origin: 300px 80px;"><circle cx="300" cy="80" r="28" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="300" cy="80" r="22" fill="none" stroke="currentColor" stroke-width="0.6" stroke-dasharray="2 3"/><circle cx="300" cy="80" r="6" fill="none" stroke="currentColor" stroke-width="0.8"/><g fill="none" stroke="currentColor" stroke-width="1.2"><polygon points="300,54 306,62 320,64 310,74 312,88 300,80 288,88 290,74 280,64 294,62"/></g></g>
            <g class="hero-gear" transform="translate(120, 200)" style="animation: gearSpinCW 60s linear infinite; transform-origin: 120px 200px;"><circle cx="120" cy="200" r="70" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="120" cy="200" r="64" fill="none" stroke="currentColor" stroke-width="0.4" stroke-dasharray="1 3"/><circle cx="120" cy="200" r="20" fill="none" stroke="currentColor" stroke-width="0.8"/><circle cx="120" cy="200" r="8" fill="none" stroke="currentColor" stroke-width="0.6"/><g fill="none" stroke="currentColor" stroke-width="0.8"><line x1="120" y1="130" x2="120" y2="270"/><line x1="50" y1="200" x2="190" y2="200"/><line x1="71" y1="151" x2="169" y2="249"/><line x1="169" y1="151" x2="71" y2="249"/></g><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="120" y1="124" x2="120" y2="116"/><line x1="155" y1="132" x2="160" y2="125"/><line x1="181" y1="159" x2="188" y2="155"/><line x1="190" y1="200" x2="198" y2="200"/><line x1="181" y1="241" x2="188" y2="245"/><line x1="155" y1="268" x2="160" y2="275"/><line x1="120" y1="276" x2="120" y2="284"/><line x1="85" y1="268" x2="80" y2="275"/><line x1="59" y1="241" x2="52" y2="245"/><line x1="50" y1="200" x2="42" y2="200"/><line x1="59" y1="159" x2="52" y2="155"/><line x1="85" y1="132" x2="80" y2="125"/></g><circle cx="120" cy="200" r="40" fill="none" stroke="currentColor" stroke-width="0.3" stroke-dasharray="3 4"/><circle cx="120" cy="200" r="32" fill="none" stroke="currentColor" stroke-width="0.3"/></g>
            <g class="hero-gear" transform="translate(260, 280)" style="animation: gearSpinCCW 40s linear infinite; transform-origin: 260px 280px;"><circle cx="260" cy="280" r="45" fill="none" stroke="currentColor" stroke-width="0.8"/><circle cx="260" cy="280" r="40" fill="none" stroke="currentColor" stroke-width="0.3" stroke-dasharray="1 3"/><circle cx="260" cy="280" r="12" fill="none" stroke="currentColor" stroke-width="0.6"/><circle cx="260" cy="280" r="5" fill="none" stroke="currentColor" stroke-width="0.5"/><g fill="none" stroke="currentColor" stroke-width="0.6"><line x1="260" y1="235" x2="260" y2="325"/><line x1="215" y1="280" x2="305" y2="280"/><line x1="228" y1="248" x2="292" y2="312"/><line x1="292" y1="248" x2="228" y2="312"/></g><g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><line x1="260" y1="230" x2="260" y2="224"/><line x1="284" y1="236" x2="289" y2="231"/><line x1="302" y1="254" x2="308" y2="251"/><line x1="308" y1="280" x2="314" y2="280"/><line x1="302" y1="306" x2="308" y2="309"/><line x1="284" y1="324" x2="289" y2="329"/><line x1="260" y1="330" x2="260" y2="336"/><line x1="236" y1="324" x2="231" y2="329"/><line x1="218" y1="306" x2="212" y2="309"/><line x1="212" y1="280" x2="206" y2="280"/><line x1="218" y1="254" x2="212" y2="251"/><line x1="236" y1="236" x2="231" y2="231"/></g><circle cx="260" cy="280" r="28" fill="none" stroke="currentColor" stroke-width="0.3" stroke-dasharray="2 3"/></g>
            <g class="hero-gear" transform="translate(200, 130)" style="animation: balanceOsc 2s ease-in-out infinite; transform-origin: 200px 130px;"><circle cx="200" cy="130" r="35" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="200" cy="130" r="30" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="200" cy="130" r="26" fill="none" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 4"/><circle cx="200" cy="130" r="5" fill="none" stroke="currentColor" stroke-width="1"/><g fill="none" stroke="currentColor" stroke-width="1.5"><line x1="200" y1="95" x2="200" y2="165"/><line x1="165" y1="130" x2="235" y2="130"/></g><circle cx="200" cy="93" r="4" fill="currentColor" opacity="0.3"/><circle cx="200" cy="167" r="4" fill="currentColor" opacity="0.3"/><circle cx="163" cy="130" r="4" fill="currentColor" opacity="0.3"/><circle cx="237" cy="130" r="4" fill="currentColor" opacity="0.3"/><g fill="none" stroke="currentColor" stroke-width="0.4" opacity="0.5"><circle cx="200" cy="130" r="18"/><circle cx="200" cy="130" r="16"/><circle cx="200" cy="130" r="14"/><circle cx="200" cy="130" r="12"/><circle cx="200" cy="130" r="10"/><circle cx="200" cy="130" r="8"/></g></g>
            <g class="hero-gear hero-gear-complex" transform="translate(60, 60)" style="animation: gearSpinCW 25s linear infinite; transform-origin: 60px 60px;"><circle cx="60" cy="60" r="22" fill="none" stroke="currentColor" stroke-width="0.8"/><circle cx="60" cy="60" r="6" fill="none" stroke="currentColor" stroke-width="0.5"/><g fill="none" stroke="currentColor" stroke-width="0.5"><line x1="60" y1="38" x2="60" y2="82"/><line x1="38" y1="60" x2="82" y2="60"/></g><g fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"><line x1="60" y1="36" x2="60" y2="31"/><line x1="75" y1="41" x2="78" y2="37"/><line x1="82" y1="60" x2="87" y2="60"/><line x1="75" y1="79" x2="78" y2="83"/><line x1="60" y1="84" x2="60" y2="89"/><line x1="45" y1="79" x2="42" y2="83"/><line x1="38" y1="60" x2="33" y2="60"/><line x1="45" y1="41" x2="42" y2="37"/></g></g>
            <g class="hero-gear hero-gear-complex" transform="translate(350, 350)" style="animation: gearSpinCCW 50s linear infinite; transform-origin: 350px 350px;"><circle cx="350" cy="350" r="35" fill="none" stroke="currentColor" stroke-width="0.6"/><circle cx="350" cy="350" r="28" fill="none" stroke="currentColor" stroke-width="0.3" stroke-dasharray="2 4"/><circle cx="350" cy="350" r="8" fill="none" stroke="currentColor" stroke-width="0.5"/><g fill="none" stroke="currentColor" stroke-width="0.4"><line x1="350" y1="315" x2="350" y2="385"/><line x1="315" y1="350" x2="385" y2="350"/><line x1="325" y1="325" x2="375" y2="375"/><line x1="375" y1="325" x2="325" y2="375"/></g></g>
            <g fill="none" stroke="currentColor" stroke-width="0.4" opacity="0.15"><line x1="190" y1="150" x2="120" y2="190"/><line x1="210" y1="110" x2="270" y2="90"/><line x1="230" y1="150" x2="240" y2="250"/><path d="M 60 82 Q 80 120 100 130"/><path d="M 260 240 Q 240 200 220 170"/></g>
          </svg>
        </div>
        <div class="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full">
          <div class="max-w-3xl">
            <p class="text-gold font-montserrat text-sm tracking-[0.3em] uppercase mb-6" data-i18n="hero-badge">Since 2024</p>
            <h1 class="font-cormorant text-6xl md:text-8xl text-white leading-tight mb-6" data-i18n-html="hero-title">Time is the<br><span class="text-gold">Ultimate Luxury</span></h1>
            <p class="font-montserrat text-stone-300 text-lg max-w-xl mb-10 leading-relaxed" data-i18n="hero-desc">Discover an extraordinary collection of the world's finest timepieces. From heritage classics to avant-garde masterpieces.</p>
            <div class="flex flex-wrap gap-4">
              <a href="#" onclick="document.getElementById('new-arrivals-section').scrollIntoView({behavior:'smooth'});return false;" class="inline-flex items-center gap-2 bg-gold text-primary px-8 py-4 font-montserrat font-semibold text-sm tracking-wider uppercase hover-bg-gold-hover transition-colors duration-300 cursor-pointer" data-i18n="hero-cta">Discover Our New Arrivals</a>
            </div>
          </div>
        </div>
        <div class="absolute bottom-0 left-0 right-0 h-32 z-10" style="background: linear-gradient(to top, var(--bg-page), transparent);"></div>
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
              <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-3" data-i18n="section-featured">Curated Selection</p>
              <h2 class="font-cormorant text-4xl md:text-5xl text-primary" data-i18n-html="section-featured-title">Featured <span class="text-gold">Timepieces</span></h2>
            </div>
            <a href="#products" class="hidden md:flex items-center gap-2 font-montserrat text-sm text-primary hover-text-gold transition-colors duration-300 cursor-pointer border-b border-inverse hover-border-gold pb-0.5" data-i18n="view-all-products">All Products</a>
          </div>
          <div class="product-grid">${featured.map(w => this.productCard(w)).join('')}</div>
          <div class="mt-12 text-center">
            <a href="#products" class="inline-flex items-center gap-2 border-2 border-inverse text-primary px-10 py-4 font-montserrat font-semibold text-sm tracking-wider uppercase hover-bg-inverse hover:text-white transition-all duration-300 cursor-pointer" data-i18n="view-all-products">View All Timepieces</a>
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

  renderProducts() {
    const qs = location.hash.indexOf('?');
    const filterBrand = qs !== -1 ? new URLSearchParams(location.hash.slice(qs)).get('brand') : null;
    let filtered = this.watches;
    if (filterBrand) filtered = filtered.filter(w => w.brand === filterBrand);

    const activeClasses = 'bg-inverse text-white border-inverse';
    const inactiveClasses = 'bg-card text-secondary border-medium hover-border-inverse';

    this.render(`
      <div class="bg-page min-h-screen pt-32 pb-24">
        <div class="max-w-7xl mx-auto px-6">
          <div class="mb-12">
            <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-3" data-i18n="section-featured">Our Collection</p>
            <h1 class="font-cormorant text-5xl md:text-6xl text-primary" data-i18n="view-all-products">All Timepieces</h1>
            <p class="font-montserrat text-muted-c mt-4">${filtered.length} <span data-i18n="products">watches</span></p>
          </div>
          <div class="flex flex-wrap gap-3 mb-12">
            <a href="#products" class="px-5 py-2 font-montserrat text-xs tracking-wider uppercase border transition-all duration-300 cursor-pointer ${!filterBrand ? activeClasses : inactiveClasses}" data-i18n="view-all">All</a>
            ${BRANDS.map(b => `
              <a href="#products?brand=${encodeURIComponent(b)}" class="px-5 py-2 font-montserrat text-xs tracking-wider uppercase border transition-all duration-300 cursor-pointer ${filterBrand === b ? activeClasses : inactiveClasses}">${b}</a>
            `).join('')}
          </div>
          <div class="product-grid">${filtered.map(w => this.productCard(w)).join('')}</div>
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
          <div class="product-grid">${this.watches.filter(w => w.new).map(w => this.productCard(w)).join('')}</div>
        </div>
      </div>
    `);
  },

  renderBrand(brandSlug) {
    const brand = BRANDS.find(b => slug(b) === brandSlug) || brandSlug;
    const watches = this.watches.filter(w => slug(w.brand) === slug(brand));
    const actualBrand = watches.length > 0 ? watches[0].brand : brand;
    const filtered = watches.length > 0 ? watches : this.watches.filter(w => w.brand.toLowerCase().includes(brand.toLowerCase()));

    this.render(`
      <div class="bg-page min-h-screen pt-32 pb-24">
        <div class="max-w-7xl mx-auto px-6">
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

  renderProductDetail(id) {
    let watch = this.watches.find(w => w.id === id);
    if (!watch) watch = [...WATCHES].find(w => w.id === id);
    if (!watch) { this.showError('Watch not found'); return; }
    const inCart = Cart.items.find(i => i.id === watch.id);

    this.render(`
      <div class="bg-page min-h-screen pt-28 pb-24">
        <div class="max-w-7xl mx-auto px-6">
          <a href="#products" class="inline-flex items-center gap-2 font-montserrat text-sm text-muted-c hover-text-primary transition-colors duration-300 cursor-pointer mb-10" data-i18n="product-back">&larr; Back to Collection</a>
          <div class="grid md:grid-cols-2 gap-12 items-start">
            <div class="relative">
              <div class="aspect-[4/5] bg-card border border-subtle overflow-hidden">
                <img src="${watch.img}" alt="${watch.brand} ${watch.name}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700" onerror="this.parentElement.innerHTML='<div class=\\'flex items-center justify-center w-full h-full bg-card\\'><svg class=\\'w-16 h-16 text-stone-600\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'1\\' d=\\'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z\\'/></svg></div>'">
              </div>
              ${watch.new ? '<span class="absolute top-4 left-4 bg-gold text-primary px-4 py-1.5 font-montserrat text-xs tracking-wider uppercase font-semibold">New</span>' : ''}
            </div>
            <div class="sticky top-32">
              <p class="font-montserrat text-gold text-sm tracking-[0.3em] uppercase mb-3">${watch.brand}</p>
              <h1 class="font-cormorant text-4xl md:text-5xl text-primary mb-4">${watch.name}</h1>
              <div class="flex items-baseline gap-3 mb-8">
                <span class="font-cormorant text-3xl text-primary">$${watch.price.toLocaleString()}</span>
                ${watch.originalPrice ? `<span class="font-montserrat text-lg text-stone-400 line-through">$${watch.originalPrice.toLocaleString()}</span><span class="font-montserrat text-sm text-red-500">Save ${Math.round((1 - watch.price/watch.originalPrice)*100)}%</span>` : ''}
              </div>
              <p class="font-montserrat text-stone-600 leading-relaxed mb-8">${watch.description}</p>
              <div class="flex gap-3 mb-6">
                <button onclick="App.addToCartAndGo('${watch.id}')" class="flex-[7] bg-gold text-primary py-4 font-montserrat font-semibold text-sm tracking-wider uppercase hover-bg-gold-hover transition-all duration-300 cursor-pointer" data-i18n="product-order">Order Now</button>
                <button onclick="App.addToCart('${watch.id}')" class="flex-[3] border border-inverse text-primary py-4 font-montserrat text-xs tracking-wider uppercase hover-bg-inverse hover:text-white transition-all duration-300 cursor-pointer" data-i18n="product-add-cart">+ Cart</button>
              </div>
              <div class="border-t border-subtle pt-8">
                <h3 class="font-cormorant text-xl text-primary mb-4" data-i18n="product-specs">Technical Specifications</h3>
                <div class="space-y-3">
                  ${Object.entries(watch.specs).map(([key, val]) =>
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
      </div>
    `);
  },

  addToCart(id) {
    Cart.add(id);
    this.showToast(window.__('toast-added-cart'));
  },

  addToCartAndGo(id) {
    Cart.add(id);
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
        <div class="max-w-5xl mx-auto px-6">
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
                    <p class="font-montserrat text-sm text-muted-c mt-1">$${w.price.toLocaleString()} each</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <button onclick="App.updateCartQty('${w.id}', ${item.qty - 1})" class="w-8 h-8 border border-medium flex items-center justify-center hover-bg-hover transition-colors duration-200 cursor-pointer font-montserrat">&minus;</button>
                    <span class="w-8 text-center font-montserrat">${item.qty}</span>
                    <button onclick="App.updateCartQty('${w.id}', ${item.qty + 1})" class="w-8 h-8 border border-medium flex items-center justify-center hover-bg-hover transition-colors duration-200 cursor-pointer font-montserrat">+</button>
                  </div>
                  <div class="text-right">
                    <p class="font-cormorant text-xl text-primary">$${(w.price * item.qty).toLocaleString()}</p>
                    <button onclick="Cart.remove('${w.id}'); App.renderCart();" class="font-montserrat text-xs text-stone-400 hover:text-red-500 transition-colors duration-200 cursor-pointer mt-2">Remove</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <div class="mt-10 bg-card border border-subtle p-8 ml-auto max-w-md">
            <div class="flex justify-between font-montserrat text-muted-c mb-2"><span>Subtotal</span><span>$${total.toLocaleString()}</span></div>
            <div class="flex justify-between font-montserrat text-muted-c mb-2"><span>Shipping</span><span class="text-green-600">Free</span></div>
            <div class="border-t border-subtle mt-4 pt-4 flex justify-between font-cormorant text-2xl text-primary"><span>Total</span><span>$${total.toLocaleString()}</span></div>
            <a href="#checkout" class="block w-full bg-gold text-primary text-center py-4 mt-6 font-montserrat font-semibold text-sm tracking-wider uppercase hover-bg-gold-hover transition-colors duration-300 cursor-pointer" data-i18n="cart-proceed">Proceed to Checkout</a>
            <a href="#products" class="block w-full text-center py-3 font-montserrat text-sm text-muted-c hover-text-primary transition-colors duration-300 cursor-pointer mt-2" data-i18n="checkout-continue">Continue Shopping</a>
          </div>
        </div>
      </div>
    `);
  },

  updateCartQty(id, qty) {
    Cart.updateQty(id, qty);
    this.renderCart();
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
              <button onclick="App.placeOrder()" class="w-full bg-gold text-primary py-5 font-montserrat font-semibold text-sm tracking-wider uppercase hover-bg-gold-hover transition-colors duration-300 cursor-pointer" data-i18n="checkout-place-order">Confirm Order &mdash; $${total.toLocaleString()}</button>
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
                        <p class="font-cormorant text-sm text-primary">$${(w.price * item.qty).toLocaleString()}</p>
                      </div>
                    `;
                  }).join('')}
                </div>
                <div class="border-t border-subtle mt-6 pt-6 space-y-2">
                  <div class="flex justify-between font-montserrat text-sm text-muted-c"><span data-i18n="checkout-order-summary">Subtotal</span><span>$${total.toLocaleString()}</span></div>
                  <div class="flex justify-between font-montserrat text-sm text-muted-c"><span data-i18n="checkout-shipping">Shipping</span><span class="text-green-600" data-i18n="checkout-place-order">Free</span></div>
                  <div class="flex justify-between font-cormorant text-xl text-primary border-t border-subtle pt-4 mt-4"><span data-i18n="checkout-total">Total</span><span>$${total.toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
  },

  updateCommunes() {
    const wilayaCode = parseInt(document.getElementById('checkout-wilaya')?.value);
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
    const wilayaCode = parseInt(document.getElementById('checkout-wilaya')?.value);
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
    this.render(`
      <div class="bg-page min-h-screen pt-32 pb-24">
        <div class="max-w-2xl mx-auto px-6 text-center">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          </div>
          <h1 class="font-cormorant text-5xl text-primary mb-4" data-i18n="checkout-success-title">Order Confirmed</h1>
          <p class="font-montserrat text-muted-c mb-2" data-i18n="checkout-success-thanks">Thank you for your purchase.</p>
          <p class="font-montserrat text-muted-c mb-8"><span data-i18n="checkout-success-id">Order</span> <strong class="text-primary">${orderId}</strong> — <span data-i18n="checkout-success-contact">You will be contacted at</span> <strong class="text-primary">${phone}</strong></p>
          <a href="#home" class="inline-flex items-center gap-2 bg-inverse text-white px-8 py-4 font-montserrat font-semibold text-sm tracking-wider uppercase hover-bg-gold hover-text-primary transition-all duration-300 cursor-pointer" data-i18n="checkout-continue">Return Home</a>
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
          <div class="flex flex-col md:flex-row gap-8">
            <div class="admin-sidebar w-full md:w-56 flex-shrink-0">
              <a href="#elite-zone" class="admin-tab block px-5 py-3 font-montserrat text-sm border border-subtle mb-2 cursor-pointer ${tab === 'orders' ? 'active' : ''}">
                <span class="flex items-center gap-3"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> Orders</span>
              </a>
              <a href="#elite-zone-products" class="admin-tab block px-5 py-3 font-montserrat text-sm border border-subtle mb-2 cursor-pointer ${tab === 'products' ? 'active' : ''}">
                <span class="flex items-center gap-3"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg> Products</span>
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
          <div class="flex flex-wrap gap-2">
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
                    <td class="font-cormorant text-sm">$${total.toLocaleString()}</td>
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
    const result = await updateOrderStatus(orderId, newStatus);
    if (result) {
      this.showToast(`Order ${orderId} → ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`);
    }
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
          <div class="grid grid-cols-2 gap-4">
            <div><span class="text-muted-c text-xs uppercase tracking-wider">Date</span><p class="text-primary">${new Date(o.date).toLocaleString()}</p></div>
            <div><span class="text-muted-c text-xs uppercase tracking-wider">Status</span><p><span class="admin-badge ${statusBadge[o.status] || 'admin-badge-pending'}">${statusLabels[o.status] || o.status}</span></p></div>
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
            <h4 class="text-xs uppercase tracking-wider text-muted-c mb-2">Products</h4>
            ${o.items.map(item => {
              const p = this.watches.find(pr => pr.id === item.id);
              return `<div class="flex justify-between py-1"><span class="text-primary">${p ? p.name : item.id} x${item.qty}</span><span class="font-cormorant">$${((p ? p.price : 0) * item.qty).toLocaleString()}</span></div>`;
            }).join('')}
            <div class="flex justify-between border-t border-subtle pt-2 mt-2 font-cormorant text-lg text-primary"><span>Total</span><span>$${o.total.toLocaleString()}</span></div>
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
    const sections = ['New Models', 'Curated Selection', 'Featured Timepieces'];

    return `
      <div class="flex items-center justify-between gap-4 mb-6">
        <h2 class="font-cormorant text-2xl text-primary">Product Management</h2>
        <button onclick="App.showProductForm()" class="admin-btn admin-btn-primary text-xs"><span class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Add Product</span></button>
      </div>
      <div class="overflow-x-auto border border-subtle">
        <table class="admin-table w-full">
          <thead>
            <tr><th>Product</th><th>Brand</th><th>Price</th><th>Sections</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${products.map(p => `
              <tr>
                <td><div class="flex items-center gap-3"><div class="w-10 h-10 bg-stone-100 flex-shrink-0 overflow-hidden"><img src="${p.img}" alt="${p.name}" class="w-full h-full object-cover"></div><div><div class="font-montserrat text-sm text-primary">${p.name}</div><div class="font-montserrat text-xs text-muted-c">${p.id}</div></div></div></td>
                <td class="font-montserrat text-sm">${p.brand}</td>
                <td class="font-cormorant text-sm">$${p.price.toLocaleString()}</td>
                <td><div class="flex flex-wrap gap-1">${(p.sections || []).length === 0 ? '<span class="text-muted-c text-xs font-montserrat">—</span>' : ''}${(p.sections || []).map(s => `<span class="admin-section-tag">${s}</span>`).join('')}</div></td>
                <td class="font-montserrat text-xs"><span class="${p.inStock === false ? 'text-red-500' : 'text-green-600'}">${p.inStock === false ? 'Out of Stock' : 'In Stock'}</span></td>
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
    const sections = ['New Models', 'Curated Selection', 'Featured Timepieces'];

    const overlay = document.createElement('div');
    overlay.className = 'product-overlay';
    overlay.innerHTML = `
      <div class="admin-modal">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-cormorant text-2xl text-primary">${existing ? 'Edit Product' : 'Add Product'}</h3>
          <button onclick="this.closest('.product-overlay').remove()" class="text-muted-c hover:text-primary cursor-pointer"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <div class="space-y-4">
          <div><label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-1 block">Product ID</label><input id="pf-id" class="admin-input" value="${existing ? existing.id : ''}" placeholder="e.g. rolex-daytona-2026" ${existing ? 'readonly style="opacity:0.6"' : ''}></div>
          <div><label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-1 block">Product Name</label><input id="pf-name" class="admin-input" value="${existing ? existing.name : ''}" placeholder="e.g. Daytona 40mm"></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-1 block">Brand</label><select id="pf-brand" class="admin-select">${brands.map(b => `<option value="${b}" ${existing && existing.brand === b ? 'selected' : ''}>${b}</option>`).join('')}</select></div>
            <div><label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-1 block">Price (DZD)</label><input id="pf-price" class="admin-input" type="number" value="${existing ? existing.price : ''}" placeholder="e.g. 14500"></div>
          </div>
          <div><label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-1 block">Description</label><textarea id="pf-desc" class="admin-input" rows="3" placeholder="Product description...">${existing ? existing.description : ''}</textarea></div>
          <div><label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-1 block">Main Image URL</label><input id="pf-img" class="admin-input" value="${existing ? existing.img : ''}" placeholder="https://..."></div>
          <div><label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-1 block">Additional Images (JSON array)</label><input id="pf-images" class="admin-input" value="${existing && existing.images ? JSON.stringify(existing.images) : ''}" placeholder='["https://..."]'></div>
          <div>
            <label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-2 block">Sections</label>
            <div class="flex flex-wrap gap-2">${sections.map(s => `<button type="button" class="section-toggle ${existing && (existing.sections || []).includes(s) ? 'active' : ''}" data-section="${s}" onclick="this.classList.toggle('active')">${s}</button>`).join('')}</div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-1 block">Availability</label><select id="pf-stock" class="admin-select"><option value="in" ${existing && existing.inStock !== false ? 'selected' : ''}>In Stock</option><option value="out" ${existing && existing.inStock === false ? 'selected' : ''}>Out of Stock</option></select></div>
            <div><label class="font-montserrat text-xs text-muted-c tracking-wider uppercase mb-1 block">Visibility</label><select id="pf-visible" class="admin-select"><option value="1" ${existing && existing.visible !== false ? 'selected' : ''}>Public</option><option value="0" ${existing && existing.visible === false ? 'selected' : ''}>Private</option></select></div>
          </div>
          <div class="flex gap-3 pt-2">
            <button onclick="App.saveProduct('${existing ? existing.id : ''}')" class="admin-btn admin-btn-primary flex-1">${existing ? 'Update Product' : 'Create Product'}</button>
            <button onclick="this.closest('.product-overlay').remove()" class="admin-btn admin-btn-ghost">Cancel</button>
          </div>
        </div>
      </div>
    `;
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  },

  async saveProduct(existingId) {
    const id = document.getElementById('pf-id')?.value?.trim();
    const name = document.getElementById('pf-name')?.value?.trim();
    const brand = document.getElementById('pf-brand')?.value;
    const price = parseFloat(document.getElementById('pf-price')?.value);
    const desc = document.getElementById('pf-desc')?.value?.trim();
    const img = document.getElementById('pf-img')?.value?.trim();
    const imagesRaw = document.getElementById('pf-images')?.value?.trim();
    const sections = [];
    document.querySelectorAll('.section-toggle.active').forEach(btn => sections.push(btn.dataset.section));
    const stock = document.getElementById('pf-stock')?.value;
    const visible = document.getElementById('pf-visible')?.value;

    if (!id || !name || !brand || !price || !desc || !img) {
      this.showToast('Please fill all required fields');
      return;
    }

    let images = [img];
    try { if (imagesRaw) { const parsed = JSON.parse(imagesRaw); if (Array.isArray(parsed)) images = parsed; } } catch(e) {}

    const productData = { id, name, brand, price, description: desc, img, images, sections, inStock: stock === 'in', visible: visible !== '0' };

    const result = await saveProduct(productData);
    if (result) {
      this.showToast(existingId ? 'Product updated' : 'Product created');
      document.querySelector('.product-overlay')?.remove();
      this._cachedAdminProducts = await getProducts();
      await this.syncProducts();
      this.renderAdmin();
    } else {
      this.showToast('Failed to save product');
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

  // ─── SHARED ───────────────────────────────────────────────────────────

  productCard(w) {
    return `
      <a href="#product-${w.id}" class="product-card">
        <div class="relative overflow-hidden">
          <img src="${w.img}" alt="${w.brand} ${w.name}" loading="lazy" onerror="this.parentElement.innerHTML+='<div class=\\'flex items-center justify-center h-[280px] bg-card\\'><svg class=\\'w-12 h-12 text-stone-600\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'1\\' d=\\'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z\\'/></svg></div>';this.style.display='none'">
          ${w.new ? '<span class="badge-new">New</span>' : ''}
          ${w.originalPrice ? '<span class="badge-sale">Sale</span>' : ''}
        </div>
        <div class="product-info">
          <div class="brand-tag">${w.brand}</div>
          <h3>${w.name}</h3>
          <div class="flex items-center mt-auto">
            <span class="price">$${w.price.toLocaleString()}</span>
            ${w.originalPrice ? `<span class="original-price">$${w.originalPrice.toLocaleString()}</span>` : ''}
          </div>
        </div>
      </a>
    `;
  },
};

// Expose on window for onclick handlers
window.App = App;
window.Cart = Cart;

// Entry point
document.addEventListener('DOMContentLoaded', () => App.init());
