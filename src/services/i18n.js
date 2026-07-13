const STORAGE_KEY = 'elite-chrono-lang';
const LANGUAGES = { fr: 'FR', en: 'ENG', ar: 'ع' };

const trans = {
  fr: {
    'nav-home': 'Accueil',
    'nav-new-arrivals': 'Nouveautés',
    'nav-all-products': 'Tous les Produits',
    'nav-search': 'Rechercher',
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
    'section-journal': 'Le Journal Elite Chrono',
    'section-journal-title': "L'Art de l'<span class=\"text-gold\">Horlogerie Fine</span>",
    'section-journal-desc': 'Explorez nos articles sur les chefs-d\'œuvre horlogers, le savoir-faire et les histoires derrière les montres les plus convoitées.',
    'read-more': 'Lire Plus',
    'view-all': 'Tout Voir',
    'view-all-products': 'Toutes les Montres',
    'brands-view-all': 'Voir Toutes les Marques',
    'products': 'montres',
    'brands-subtitle': 'Marques',
    'brands-title': 'Nos <span class="text-gold">Marques</span>',
    'brands-desc': 'Découvrez les maisons horlogères les plus prestigieuses au monde, chacune avec un héritage de savoir-faire et d\'innovation.',
    'similar-subtitle': 'Même Collection',
    'similar-title': 'Plus de <span class="text-gold">%s</span>',
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
    'footer-copyright': '&copy; 2026 Elite Chrono. Tous droits réservés.',

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
    'checkout-name': 'Nom Complet',
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
    'checkout-placing': 'Commande en cours...',
    'checkout-success-title': 'Commande Passée !',
    'checkout-success-thanks': 'Merci pour votre commande,',
    'checkout-success-id': 'Votre numéro de commande :',
    'checkout-success-contact': 'Vous serez contacté au',
    'checkout-failed': 'Échec de la commande.',
    'checkout-continue': 'Continuer vos Achats',
    'checkout-track': 'Suivre la Commande',
    'checkout-phone-invalid': 'Numéro de téléphone invalide (ex. 05 XX XX XX XX)',
    'checkout-whatsapp': 'Confirmer via WhatsApp',

    'sort-default': 'Recommandé',
    'sort-price-asc': 'Prix : croissant',
    'sort-price-desc': 'Prix : décroissant',
    'sort-newest': 'Nouveautés d\'abord',
    'sort-name': 'Nom (A–Z)',

    'section-recent': 'Vus Récemment',
    'section-recent-title': 'Continuez votre <span class="text-gold">Exploration</span>',

    'product-back': 'Retour à la Collection',
    'product-order': 'Commander',
    'product-add-cart': '+ Panier',
    'product-oos': 'Épuisé',
    'product-view-cart': 'Voir le Panier',
    'product-specs': 'Caractéristiques Techniques',
    'product-sold-out': 'Épuisé',
    'badge-new': 'Nouveau',
    'badge-sale': 'Soldes',
    'brand-collection': 'Collection',

    'toast-added-cart': 'Ajouté au panier',
    'toast-product-deleted': 'Montre supprimée',
    'toast-product-created': 'Montre créée',
    'toast-product-updated': 'Montre mise à jour',
    'toast-save-failed': 'Échec de l\'enregistrement',
    'toast-delete-failed': 'Échec de la suppression',
    'toast-order-failed': 'Échec de la commande',

    'admin-orders': 'Commandes',
    'admin-products': 'Montres',
    'admin-add-product': 'Ajouter une Montre',
    'admin-status': 'Statut',
    'admin-actions': 'Actions',
    'admin-edit': 'Modifier',
    'admin-delete': 'Supprimer',
    'admin-confirm-delete': 'Supprimer "%s" ? Cette action est irréversible.',
    'admin-total': 'Total',
    'admin-date': 'Date',
    'admin-customer': 'Client',
    'admin-no-orders': 'Aucune commande pour le moment.',
    'admin-no-products': 'Aucune montre pour le moment.',
    'admin-id': 'ID',
    'admin-name': 'Nom',
    'admin-brand': 'Marque',
    'admin-price': 'Prix',
    'admin-stock': 'Stock',
    'admin-visible': 'Visible',
    'admin-in-stock': 'En Stock',
    'admin-out-of-stock': 'Rupture',
    'admin-yes': 'Oui',
    'admin-no': 'Non',

    'search-placeholder': 'Rechercher une montre...',

    'about-title': 'À Propos d\'<span class="text-gold">Elite Chrono</span>',
    'about-desc': 'Une passion centenaire pour la précision et la perfection horlogère.',
    'contact-title': 'Contactez-Nous',
    'contact-desc': 'Nous sommes à votre disposition pour toute question.',

    'no-products': 'Aucun produit disponible pour le moment.',
    'loading': '',
  },

  en: {
    'nav-home': 'Home',
    'nav-new-arrivals': 'New Arrivals',
    'nav-all-products': 'All Watches',
    'nav-search': 'Search',
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
    'section-journal': 'The Elite Chrono Journal',
    'section-journal-title': 'The Art of Fine<br><span class="text-gold">Watchmaking</span>',
    'section-journal-desc': 'Explore our curated stories on horological masterpieces, craftsmanship, and the stories behind the world\'s most coveted timepieces.',
    'read-more': 'Read More',
    'view-all': 'View All',
    'view-all-products': 'All Watches',
    'brands-view-all': 'View All Brands',
    'products': 'watches',
    'brands-subtitle': 'Maisons',
    'brands-title': 'Our <span class="text-gold">Maisons</span>',
    'brands-desc': 'Discover the world\'s most prestigious watch maisons, each with a legacy of craftsmanship and innovation.',
    'similar-subtitle': 'Same Collection',
    'similar-title': 'More from <span class="text-gold">%s</span>',
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
    'footer-copyright': '&copy; 2026 Elite Chrono. All rights reserved.',

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
    'checkout-name': 'Full Name',
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
    'checkout-placing': 'Placing Order...',
    'checkout-success-title': 'Order Placed!',
    'checkout-success-thanks': 'Thank you for your order,',
    'checkout-success-id': 'Your order number:',
    'checkout-success-contact': 'You will be contacted at',
    'checkout-failed': 'Failed to place order.',
    'checkout-continue': 'Continue Shopping',
    'checkout-track': 'Track Order',
    'checkout-phone-invalid': 'Invalid phone number (e.g. 05 XX XX XX XX)',
    'checkout-whatsapp': 'Confirm via WhatsApp',

    'sort-default': 'Recommended',
    'sort-price-asc': 'Price: Low to High',
    'sort-price-desc': 'Price: High to Low',
    'sort-newest': 'New First',
    'sort-name': 'Name (A–Z)',

    'section-recent': 'Recently Viewed',
    'section-recent-title': 'Continue <span class="text-gold">Browsing</span>',

    'product-back': 'Back to Collection',
    'product-order': 'Order Now',
    'product-add-cart': '+ Cart',
    'product-oos': 'Out of Stock',
    'product-view-cart': 'View Cart',
    'product-specs': 'Technical Specifications',
    'product-sold-out': 'Sold Out',
    'badge-new': 'New',
    'badge-sale': 'Sale',
    'brand-collection': 'Collection',

    'toast-added-cart': 'Added to cart',
    'toast-product-deleted': 'Watch deleted',
    'toast-product-created': 'Watch created',
    'toast-product-updated': 'Watch updated',
    'toast-save-failed': 'Failed to save product',
    'toast-delete-failed': 'Failed to delete product',
    'toast-order-failed': 'Failed to place order',

    'admin-orders': 'Orders',
    'admin-products': 'Watches',
    'admin-add-product': 'Add Watch',
    'admin-status': 'Status',
    'admin-actions': 'Actions',
    'admin-edit': 'Edit',
    'admin-delete': 'Delete',
    'admin-confirm-delete': 'Delete "%s"? This cannot be undone.',
    'admin-total': 'Total',
    'admin-date': 'Date',
    'admin-customer': 'Customer',
    'admin-no-orders': 'No orders yet.',
    'admin-no-products': 'No watches yet.',
    'admin-id': 'ID',
    'admin-name': 'Name',
    'admin-brand': 'Brand',
    'admin-price': 'Price',
    'admin-stock': 'Stock',
    'admin-visible': 'Visible',
    'admin-in-stock': 'In Stock',
    'admin-out-of-stock': 'Out of Stock',
    'admin-yes': 'Yes',
    'admin-no': 'No',

    'search-placeholder': 'Search watches...',

    'about-title': 'About <span class="text-gold">Elite Chrono</span>',
    'about-desc': 'A century of passion, precision, and the pursuit of horological perfection.',
    'contact-title': 'Contact Us',
    'contact-desc': 'We\'re at your service for any inquiry.',

    'no-products': 'No products available yet.',
    'loading': '',
  },

  ar: {
    'nav-home': 'الرئيسية',
    'nav-new-arrivals': 'وصل حديثاً',
    'nav-all-products': 'جميع المنتجات',
    'nav-search': 'بحث',
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
    'section-journal': 'مجلة Elite Chrono',
    'section-journal-title': 'فن صناعة <span class="text-gold">الساعات الفاخرة</span>',
    'section-journal-desc': 'استكشف قصصنا عن روائع صناعة الساعات والحرفية والحكايات وراء أشهر الساعات في العالم.',
    'read-more': 'اقرأ المزيد',
    'view-all': 'عرض الكل',
    'view-all-products': 'جميع الساعات',
    'brands-view-all': 'عرض جميع الماركات',
    'products': 'ساعة',
    'brands-subtitle': 'الماركات',
    'brands-title': '<span class="text-gold">ماركاتنا</span>',
    'brands-desc': 'اكتشف أشهر ماركات الساعات في العالم، كل منها يحمل إرثاً من الحرفية والابتكار.',
    'similar-subtitle': 'نفس المجموعة',
    'similar-title': 'المزيد من <span class="text-gold">%s</span>',
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
    'footer-copyright': '&copy; 2026 Elite Chrono. جميع الحقوق محفوظة.',

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
    'checkout-name': 'الاسم الكامل',
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
    'checkout-placing': 'جاري تقديم الطلب...',
    'checkout-success-title': 'تم تقديم الطلب!',
    'checkout-success-thanks': 'شكراً لطلبك،',
    'checkout-success-id': 'رقم طلبك:',
    'checkout-success-contact': 'سيتم الاتصال بك على',
    'checkout-failed': 'فشل تقديم الطلب.',
    'checkout-continue': 'متابعة التسوق',
    'checkout-track': 'تتبع الطلب',
    'checkout-phone-invalid': 'رقم الهاتف غير صالح (مثال 05 XX XX XX XX)',
    'checkout-whatsapp': 'التأكيد عبر واتساب',

    'sort-default': 'موصى به',
    'sort-price-asc': 'السعر: من الأدنى إلى الأعلى',
    'sort-price-desc': 'السعر: من الأعلى إلى الأدنى',
    'sort-newest': 'الجديد أولاً',
    'sort-name': 'الاسم (أ–ي)',

    'section-recent': 'شوهدت مؤخراً',
    'section-recent-title': 'واصل <span class="text-gold">التصفح</span>',

    'product-back': 'العودة إلى المجموعة',
    'product-order': 'اطلب الآن',
    'product-add-cart': '+ السلة',
    'product-oos': 'نفد من المخزون',
    'product-view-cart': 'عرض السلة',
    'product-specs': 'المواصفات الفنية',
    'product-sold-out': 'نفد',
    'badge-new': 'جديد',
    'badge-sale': 'تخفيض',
    'brand-collection': 'المجموعة',

    'toast-added-cart': 'تمت الإضافة إلى السلة',
    'toast-product-deleted': 'تم حذف الساعة',
    'toast-product-created': 'تم إنشاء الساعة',
    'toast-product-updated': 'تم تحديث الساعة',
    'toast-save-failed': 'فشل حفظ المنتج',
    'toast-delete-failed': 'فشل حذف المنتج',
    'toast-order-failed': 'فشل تقديم الطلب',

    'admin-orders': 'الطلبات',
    'admin-products': 'الساعات',
    'admin-add-product': 'إضافة ساعة',
    'admin-status': 'الحالة',
    'admin-actions': 'إجراءات',
    'admin-edit': 'تعديل',
    'admin-delete': 'حذف',
    'admin-confirm-delete': 'حذف "%s"؟ لا يمكن التراجع عن هذا.',
    'admin-total': 'المجموع',
    'admin-date': 'التاريخ',
    'admin-customer': 'العميل',
    'admin-no-orders': 'لا توجد طلبات بعد.',
    'admin-no-products': 'لا توجد ساعات بعد.',
    'admin-id': 'المعرف',
    'admin-name': 'الاسم',
    'admin-brand': 'الماركة',
    'admin-price': 'السعر',
    'admin-stock': 'المخزون',
    'admin-visible': 'مرئي',
    'admin-in-stock': 'متوفر',
    'admin-out-of-stock': 'غير متوفر',
    'admin-yes': 'نعم',
    'admin-no': 'لا',

    'search-placeholder': 'ابحث عن ساعة...',

    'about-title': 'عن <span class="text-gold">Elite Chrono</span>',
    'about-desc': 'شغف يمتد لعقود بالدقة والسعي للكمال في قياس الزمن.',
    'contact-title': 'اتصل بنا',
    'contact-desc': 'نحن في خدمتك لأي استفسار.',

    'no-products': 'لا توجد منتجات متاحة بعد.',
    'loading': '',
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
