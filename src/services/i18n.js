const STORAGE_KEY = 'elite-chrono-lang';
const LANGUAGES = { fr: 'FR', en: 'ENG', ar: 'ع' };

const trans = {
  fr: {
    'nav-home': 'Accueil',
    'nav-about-us': 'À Propos',
    'nav-contact': 'Contact',
    'nav-menu': 'Menu',
    'nav-close': 'Fermer',
    'nav-all-watches': 'Toutes les Montres',
    'nav-new-models': 'Nouveaux Modèles',
    'nav-featured': 'En Vedette',

    'hero-badge': 'Haute Horlogerie',
    'hero-title': "L'Instant<br><span class=\"text-gold\">Devient Éternité</span>",
    'hero-desc': "Un atelier d'exception dédié aux plus belles montres du monde. Chaque mouvement raconte une histoire d'héritage, d'innovation et d'un savoir-faire inégalé.",
    'hero-cta': 'Explorer la Collection',
    'hero-scroll': 'Défiler',

    'section-new-arrivals': 'Nouveautés',
    'section-new-arrivals-title': 'Derniers <span class="text-gold">Modèles</span>',
    'section-new-arrivals-desc': 'Les derniers ajouts à notre collection.',
    'section-featured': 'En Vedette',
    'section-featured-title': 'Montres <span class="text-gold">Phare</span>',
    'section-featured-desc': 'Une sélection exclusive de garde-temps d\'exception.',
    'section-brands': 'Nos <span class="text-gold">Marques</span>',
    'section-all-watches': 'Toutes les Montres',
    'section-journal': 'Le Journal Prestige Boutique',
    'read-more': 'Lire Plus',
    'view-all': 'Tout Voir',
    'view-all-products': 'Toutes les Montres',
    'brands-view-all': 'Voir Toutes les Marques',
    'products': 'montres',
    'brands-subtitle': 'Marques',
    'brands-title': 'Nos <span class="text-gold">Marques</span>',
    'brands-desc': 'Découvrez les maisons horlogères les plus prestigieuses au monde, chacune avec un héritage de savoir-faire et d\'innovation.',
    'similar-subtitle': 'Même Collection',
    'page-contact-label': 'Entrer en Contact',

    'footer-desc': "Un atelier d'exception dédié aux plus belles montres depuis 2024.",
    'footer-brands': 'Marques',
    'footer-company': 'Société',
    'footer-about': 'À Propos',
    'footer-contact': 'Contact',
    'footer-policies': 'Informations',
    'footer-privacy': 'Confidentialité',
    'footer-terms': "Conditions d'Utilisation",
    'footer-shipping': 'Livraison & Retours',
    'footer-faq': 'FAQ',
    'footer-copyright': '&copy; 2026 Prestige Boutique. Tous droits réservés.',

    'cart-empty-title': 'Votre Panier est Vide',
    'cart-empty-desc': 'Découvrez notre collection de garde-temps d\'exception.',
    'cart-browse': 'Parcourir la Collection',
    'cart-title': 'Sac d\'Achats',
    'cart-proceed': 'Passer à la Caisse',
    'cart-subtotal': 'Sous-total',
    'cart-shipping': 'Livraison',
    'cart-free': 'Gratuite',
    'cart-total': 'Total',
    'cart-remove': 'Retirer',
    'cart-clear': 'Vider le Panier',
    'cart-shipping-free': 'Livraison Offerte !',

    'checkout-title': 'Commande',
    'checkout-shipping': 'Détails de Livraison',
    'checkout-name-placeholder': 'Votre nom complet',
    'checkout-phone': 'Numéro de Téléphone',
    'checkout-phone-placeholder': 'ex. 05XX XX XX XX',
    'checkout-wilaya': 'Wilaya',
    'checkout-commune': 'Commune',
    'checkout-address': 'Adresse de Livraison',
    'checkout-address-placeholder': 'Rue, ville, wilaya...',
    'checkout-order-summary': 'Récapitulatif',
    'checkout-total': 'Total',
    'checkout-place-order': 'Passer la Commande (Paiement à la Livraison)',
    'checkout-success-title': 'Commande Passée !',
    'checkout-success-thanks': 'Merci pour votre commande,',
    'checkout-success-id': 'Votre numéro de commande :',
    'checkout-failed': 'Échec de la commande.',
    'checkout-continue': 'Continuer vos Achats',
    'checkout-track': 'Suivre la Commande',
    'checkout-phone-invalid': 'Numéro de téléphone invalide (ex. 05 XX XX XX XX)',
    'checkout-whatsapp': 'Confirmer via WhatsApp',

    'delivery-method': 'Mode de Livraison',
    'delivery-carrier': 'Transporteur',
    'delivery-type': 'Type de Livraison',
    'delivery-home': 'À Domicile',
    'delivery-home-desc': 'Livré à votre adresse',
    'delivery-desk': 'Stop Desk',
    'delivery-desk-desc': 'À retirer au bureau du transporteur',
    'delivery-select-wilaya': 'Choisissez une wilaya',
    'delivery-unavailable': 'Non disponible',
    'delivery-unavailable-toast': 'Ce mode de livraison n\'est pas disponible dans votre wilaya.',
    'delivery-none-available': 'Aucune livraison n\'est disponible dans cette wilaya. Contactez-nous sur WhatsApp pour organiser votre commande.',

    'sort-default': 'Recommandé',
    'sort-price-asc': 'Prix : croissant',
    'sort-price-desc': 'Prix : décroissant',
    'sort-newest': 'Nouveautés d\'abord',
    'sort-name': 'Nom (A–Z)',

    'section-recent': 'Vus Récemment',
    'section-recent-title': 'Continuez votre <span class="text-gold">Exploration</span>',

    'product-order': 'Commander',
    'product-add-cart': '+ Panier',
    'product-oos': 'Épuisé',
    'product-view-cart': 'Voir le Panier',
    'product-specs': 'Caractéristiques Techniques',
    'badge-new': 'Nouveau',
    'badge-sale': 'Soldes',
    'brand-collection': 'Collection',

    'toast-added-cart': 'Ajouté au panier',
    'toast-wishlist-added': 'Ajouté aux favoris',
    'toast-wishlist-removed': 'Retiré des favoris',
    'confirm-remove-item': 'Retirer cet article du panier ?',
    'confirm-clear-cart': 'Vider tout le panier ?',

    'wishlist-title': 'Mes Favoris',
    'wishlist-empty-title': 'Votre liste de souhaits est vide',
    'wishlist-empty-desc': 'Ajoutez vos montres préférées à vos favoris.',

    'about-title': 'À Propos de <span class="text-gold">Prestige Boutique</span>',
    'contact-title': 'Contactez-Nous',

    'no-products': 'Aucun produit disponible pour le moment.',
  },

  en: {
    'nav-home': 'Home',
    'nav-about-us': 'About Us',
    'nav-contact': 'Contact',
    'nav-menu': 'Menu',
    'nav-close': 'Close',
    'nav-all-watches': 'All Watches',
    'nav-new-models': 'New Models',
    'nav-featured': 'Featured',

    'hero-badge': 'Haute Horlogerie',
    'hero-title': 'Where Time<br>Becomes <span class="text-gold">Art</span>',
    'hero-desc': 'An exclusive atelier of the world\'s finest timepieces. Each movement tells a story of heritage, innovation, and unparalleled craftsmanship.',
    'hero-cta': 'Explore the Collection',
    'hero-scroll': 'Scroll',

    'section-new-arrivals': 'New Arrivals',
    'section-new-arrivals-title': 'Latest <span class="text-gold">Models</span>',
    'section-new-arrivals-desc': 'The latest additions to our collection.',
    'section-featured': 'Featured',
    'section-featured-title': 'Featured <span class="text-gold">Timepieces</span>',
    'section-featured-desc': 'A hand-picked selection of exceptional watches.',
    'section-brands': 'Our <span class="text-gold">Brands</span>',
    'section-all-watches': 'All Watches',
    'section-journal': 'The Prestige Boutique Journal',
    'read-more': 'Read More',
    'view-all': 'View All',
    'view-all-products': 'All Watches',
    'brands-view-all': 'View All Brands',
    'products': 'watches',
    'brands-subtitle': 'Maisons',
    'brands-title': 'Our <span class="text-gold">Maisons</span>',
    'brands-desc': 'Discover the world\'s most prestigious watch maisons, each with a legacy of craftsmanship and innovation.',
    'similar-subtitle': 'Same Collection',
    'page-contact-label': 'Get in Touch',

    'footer-desc': 'Curating the world\'s finest timepieces since 2024.',
    'footer-brands': 'Brands',
    'footer-company': 'Company',
    'footer-about': 'About Us',
    'footer-contact': 'Contact',
    'footer-policies': 'Policies',
    'footer-privacy': 'Privacy',
    'footer-terms': 'Terms of Service',
    'footer-shipping': 'Shipping & Returns',
    'footer-faq': 'FAQ',
    'footer-copyright': '&copy; 2026 Prestige Boutique. All rights reserved.',

    'cart-empty-title': 'Your Cart is Empty',
    'cart-empty-desc': 'Discover our collection of exceptional timepieces.',
    'cart-browse': 'Browse Collection',
    'cart-title': 'Shopping Bag',
    'cart-proceed': 'Proceed to Checkout',
    'cart-subtotal': 'Subtotal',
    'cart-shipping': 'Shipping',
    'cart-free': 'Free',
    'cart-total': 'Total',
    'cart-remove': 'Remove',
    'cart-clear': 'Clear Cart',
    'cart-shipping-free': 'Free Shipping!',

    'checkout-title': 'Checkout',
    'checkout-shipping': 'Shipping Details',
    'checkout-name-placeholder': 'Your full name',
    'checkout-phone': 'Phone Number',
    'checkout-phone-placeholder': 'e.g. 05XX XX XX XX',
    'checkout-wilaya': 'Wilaya',
    'checkout-commune': 'Commune',
    'checkout-address': 'Shipping Address',
    'checkout-address-placeholder': 'Street, city, wilaya...',
    'checkout-order-summary': 'Order Summary',
    'checkout-total': 'Total',
    'checkout-place-order': 'Place Order (Cash on Delivery)',
    'checkout-success-title': 'Order Placed!',
    'checkout-success-thanks': 'Thank you for your order,',
    'checkout-success-id': 'Your order number:',
    'checkout-failed': 'Failed to place order.',
    'checkout-continue': 'Continue Shopping',
    'checkout-track': 'Track Order',
    'checkout-phone-invalid': 'Invalid phone number (e.g. 05 XX XX XX XX)',
    'checkout-whatsapp': 'Confirm via WhatsApp',

    'delivery-method': 'Delivery Method',
    'delivery-carrier': 'Carrier',
    'delivery-type': 'Delivery Type',
    'delivery-home': 'Home Delivery',
    'delivery-home-desc': 'Delivered to your address',
    'delivery-desk': 'Stop Desk',
    'delivery-desk-desc': 'Collect from the carrier office',
    'delivery-select-wilaya': 'Select a wilaya',
    'delivery-unavailable': 'Unavailable',
    'delivery-unavailable-toast': 'This delivery method is not available in your wilaya.',
    'delivery-none-available': 'No delivery is available in this wilaya. Contact us on WhatsApp to arrange your order.',

    'sort-default': 'Recommended',
    'sort-price-asc': 'Price: Low to High',
    'sort-price-desc': 'Price: High to Low',
    'sort-newest': 'New First',
    'sort-name': 'Name (A–Z)',

    'section-recent': 'Recently Viewed',
    'section-recent-title': 'Continue <span class="text-gold">Browsing</span>',

    'product-order': 'Order Now',
    'product-add-cart': '+ Cart',
    'product-oos': 'Out of Stock',
    'product-view-cart': 'View Cart',
    'product-specs': 'Technical Specifications',
    'badge-new': 'New',
    'badge-sale': 'Sale',
    'brand-collection': 'Collection',

    'toast-added-cart': 'Added to cart',
    'toast-wishlist-added': 'Added to wishlist',
    'toast-wishlist-removed': 'Removed from wishlist',
    'confirm-remove-item': 'Remove this item from your cart?',
    'confirm-clear-cart': 'Clear your entire cart?',

    'wishlist-title': 'My Wishlist',
    'wishlist-empty-title': 'Your Wishlist is Empty',
    'wishlist-empty-desc': 'Save your favourite timepieces here.',

    'about-title': 'About <span class="text-gold">Prestige Boutique</span>',
    'contact-title': 'Contact Us',

    'no-products': 'No products available yet.',
  },

  ar: {
    'nav-home': 'الرئيسية',
    'nav-about-us': 'من نحن',
    'nav-contact': 'اتصل بنا',
    'nav-menu': 'القائمة',
    'nav-close': 'إغلاق',
    'nav-all-watches': 'جميع الساعات',
    'nav-new-models': 'موديلات جديدة',
    'nav-featured': 'مميزة',

    'hero-badge': 'صناعة الساعات الفاخرة',
    'hero-title': 'حيث يصبح<br>الزمن <span class="text-gold">فناً</span>',
    'hero-desc': 'ورشة حصرية لأفخر الساعات في العالم. كل حركة تحكي قصة تراث وابتكار وحرفية لا تضاهى.',
    'hero-cta': 'استكشف المجموعة',
    'hero-scroll': 'تمرير',

    'section-new-arrivals': 'وصل حديثاً',
    'section-new-arrivals-title': 'أحدث <span class="text-gold">الموديلات</span>',
    'section-new-arrivals-desc': 'أحدث الإضافات إلى مجموعتنا.',
    'section-featured': 'مميزة',
    'section-featured-title': 'ساعات <span class="text-gold">مميزة</span>',
    'section-featured-desc': 'تشكيلة منتقاة بعناية من الساعات الاستثنائية.',
    'section-brands': '<span class="text-gold">ماركاتنا</span>',
    'section-all-watches': 'جميع الساعات',
    'section-journal': 'مجلة Prestige Boutique',
    'read-more': 'اقرأ المزيد',
    'view-all': 'عرض الكل',
    'view-all-products': 'جميع الساعات',
    'brands-view-all': 'عرض جميع الماركات',
    'products': 'ساعة',
    'brands-subtitle': 'الماركات',
    'brands-title': '<span class="text-gold">ماركاتنا</span>',
    'brands-desc': 'اكتشف أشهر ماركات الساعات في العالم، كل منها يحمل إرثاً من الحرفية والابتكار.',
    'similar-subtitle': 'نفس المجموعة',
    'page-contact-label': 'تواصل معنا',

    'footer-desc': 'نقدم أفخر الساعات منذ 2024.',
    'footer-brands': 'الماركات',
    'footer-company': 'الشركة',
    'footer-about': 'من نحن',
    'footer-contact': 'اتصل بنا',
    'footer-policies': 'السياسات',
    'footer-privacy': 'الخصوصية',
    'footer-terms': 'شروط الخدمة',
    'footer-shipping': 'الشحن والإرجاع',
    'footer-faq': 'الأسئلة الشائعة',
    'footer-copyright': '&copy; 2026 Prestige Boutique. جميع الحقوق محفوظة.',

    'cart-empty-title': 'سلتك فارغة',
    'cart-empty-desc': 'اكتشف مجموعتنا من الساعات الاستثنائية.',
    'cart-browse': 'تصفح المجموعة',
    'cart-title': 'حقيبة التسوق',
    'cart-proceed': 'متابعة الدفع',
    'cart-subtotal': 'المجموع الفرعي',
    'cart-shipping': 'الشحن',
    'cart-free': 'مجاني',
    'cart-total': 'الإجمالي',
    'cart-remove': 'إزالة',
    'cart-clear': 'تفريغ السلة',
    'cart-shipping-free': 'الشحن مجاني!',

    'checkout-title': 'الدفع',
    'checkout-shipping': 'تفاصيل التوصيل',
    'checkout-name-placeholder': 'اسمك الكامل',
    'checkout-phone': 'رقم الهاتف',
    'checkout-phone-placeholder': 'مثال 05XX XX XX XX',
    'checkout-wilaya': 'الولاية',
    'checkout-commune': 'البلدية',
    'checkout-address': 'عنوان التوصيل',
    'checkout-address-placeholder': 'الشارع، المدينة، الولاية...',
    'checkout-order-summary': 'ملخص الطلب',
    'checkout-total': 'المجموع',
    'checkout-place-order': 'تقديم الطلب (الدفع عند الاستلام)',
    'checkout-success-title': 'تم تقديم الطلب!',
    'checkout-success-thanks': 'شكراً لطلبك،',
    'checkout-success-id': 'رقم طلبك:',
    'checkout-failed': 'فشل تقديم الطلب.',
    'checkout-continue': 'متابعة التسوق',
    'checkout-track': 'تتبع الطلب',
    'checkout-phone-invalid': 'رقم الهاتف غير صالح (مثال 05 XX XX XX XX)',
    'checkout-whatsapp': 'التأكيد عبر واتساب',

    'delivery-method': 'طريقة التوصيل',
    'delivery-carrier': 'شركة التوصيل',
    'delivery-type': 'نوع التوصيل',
    'delivery-home': 'إلى المنزل',
    'delivery-home-desc': 'يُسلَّم إلى عنوانك',
    'delivery-desk': 'مكتب الاستلام',
    'delivery-desk-desc': 'الاستلام من مكتب الناقل',
    'delivery-select-wilaya': 'اختر الولاية',
    'delivery-unavailable': 'غير متوفر',
    'delivery-unavailable-toast': 'طريقة التوصيل هذه غير متوفرة في ولايتك.',
    'delivery-none-available': 'لا يتوفر التوصيل في هذه الولاية. تواصل معنا عبر واتساب لترتيب طلبك.',

    'sort-default': 'موصى به',
    'sort-price-asc': 'السعر: من الأدنى إلى الأعلى',
    'sort-price-desc': 'السعر: من الأعلى إلى الأدنى',
    'sort-newest': 'الجديد أولاً',
    'sort-name': 'الاسم (أ–ي)',

    'section-recent': 'شوهدت مؤخراً',
    'section-recent-title': 'واصل <span class="text-gold">التصفح</span>',

    'product-order': 'اطلب الآن',
    'product-add-cart': '+ السلة',
    'product-oos': 'نفد من المخزون',
    'product-view-cart': 'عرض السلة',
    'product-specs': 'المواصفات الفنية',
    'badge-new': 'جديد',
    'badge-sale': 'تخفيض',
    'brand-collection': 'المجموعة',

    'toast-added-cart': 'تمت الإضافة إلى السلة',
    'toast-wishlist-added': 'تمت الإضافة إلى المفضلة',
    'toast-wishlist-removed': 'تمت الإزالة من المفضلة',
    'confirm-remove-item': 'إزالة هذا المنتج من السلة؟',
    'confirm-clear-cart': 'تفريغ السلة بالكامل؟',

    'wishlist-title': 'قائمتي المفضلة',
    'wishlist-empty-title': 'قائمة أمنياتك فارغة',
    'wishlist-empty-desc': 'أضف ساعاتك المفضلة إلى قائمتك.',

    'about-title': 'عن <span class="text-gold">Prestige Boutique</span>',
    'contact-title': 'اتصل بنا',

    'no-products': 'لا توجد منتجات متاحة بعد.',
  }
};

let currentLang = localStorage.getItem(STORAGE_KEY);
if (!currentLang || !trans[currentLang]) currentLang = 'fr';

function t(key) {
  return (trans[currentLang] && trans[currentLang][key]) || (trans.en && trans.en[key]) || key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-html');
    el.innerHTML = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLang;
}

function switchLang(lang) {
  if (!trans[lang]) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  applyTranslations();
  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
  document.querySelectorAll('.lang-option').forEach(function (opt) {
    opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
  });
  var current = document.querySelector('.lang-current');
  if (current) current.textContent = LANGUAGES[lang];
}

function buildSwitcher() {
  var container = document.getElementById('langSwitcher');
  if (!container) return;
  container.innerHTML = '';
  var btn = document.createElement('button');
  btn.className = 'lang-btn lang-current-btn';
  btn.setAttribute('aria-label', 'Change language');
  btn.innerHTML = '<span class="lang-current">' + LANGUAGES[currentLang] + '</span> <span class="lang-arrow">▾</span>';
  container.appendChild(btn);

  var dropdown = document.createElement('div');
  dropdown.className = 'lang-dropdown';
  Object.keys(LANGUAGES).forEach(function (code) {
    var opt = document.createElement('button');
    opt.className = 'lang-option' + (code === currentLang ? ' active' : '');
    opt.setAttribute('data-lang', code);
    opt.textContent = LANGUAGES[code];
    opt.addEventListener('click', function () { switchLang(code); });
    dropdown.appendChild(opt);
  });
  container.appendChild(dropdown);

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    container.classList.toggle('open');
  });
  document.addEventListener('click', function () {
    container.classList.remove('open');
  });
}

window.__ = t;
window.switchLang = switchLang;
window.applyTranslations = applyTranslations;
window.buildSwitcher = buildSwitcher;
