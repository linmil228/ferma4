const CART_STORAGE_KEY = 'ferma-cart';
const DEFAULT_MAX_QUANTITY = 99;

const MERCH_PRODUCTS = [    {
        id: 'socks',
        name: 'Носки',
        price: 555,
        maxQuantity: 7,
        image: 'assets/img/merch/socks.jpg',
        imageFit: 'cover',
        description: 'Уютные базовые носки из плотного «дышащего» хлопка с высокой посадкой. Отлично держат форму, подходят для спорта, прогулок и дома.',
        size: 'ONE SIZE',
        composition: '100% хлопок',
    },
    {
        id: 'mug',
        name: 'Кружка',
        price: 310,
        maxQuantity: 10,
        image: 'assets/img/merch/mug.jpg',
        imageFit: 'cover',
        galleryBg: 'white',
        description: 'Керамическая матовая кружка для ваших идеальных утренних ритуалов. Клёвый дизайн, который приятно держать в руках.',
        size: '350 мл',
        composition: '100% керамика',
    },
    {
        id: 'cap',
        name: 'Кепка',
        price: 795,
        maxQuantity: 5,
        image: 'assets/img/merch/cap.jpg',
        imageFit: 'cover',
        imageBg: true,
        description: 'Кепка из коллекции ferma с регулируемой застёжкой. Лаконичный дизайн и плотная ткань — для города, прогулок и поездок.',
        size: 'ONE SIZE',
        composition: '100% хлопок',
    },
    {
        id: 'stickers',
        name: 'Наклейки',
        price: 230,
        maxQuantity: 8,
        image: 'assets/img/merch/stickers.jpg',
        imageFit: 'stickers',
        imageBg: true,
        cartBtn: 'assets/img/merch/cart-btn-alt.svg',
        description: 'Набор фирменных наклеек ferma. Можно клеить на ноутбук, бутылку, блокнот или телефон — собирайте свою композицию.',
        size: '12 штук',
        composition: 'винил',
    },
    {
        id: 'tshirt',
        name: 'Футболка',
        price: 930,
        maxQuantity: 4,
        image: 'assets/img/merch/tshirt.jpg',
        imageFit: 'tshirt',
        imageBg: true,
        description: 'Футболка с принтом ferma из мягкого хлопка. Свободный крой и базовый дизайн — удобно носить каждый день.',
        size: 'XS',
        composition: '100% хлопок',
    },
    {
        id: 'keychain',
        name: 'Брелок',
        price: 345,
        maxQuantity: 6,
        image: 'assets/img/merch/keychain.jpg',
        imageFit: 'cover',
        imageBg: true,
        description: 'Металлический брелок с логотипом ferma. Компактный аксессуар для ключей или сумки — всегда под рукой.',
        size: 'ONE SIZE',
        composition: 'металл',
    },
];

function loadCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
        return {};
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cart:updated'));
}

function getProduct(id) {
    return MERCH_PRODUCTS.find((p) => p.id === id);
}

function getProductImage(product) {
    if (!product?.image) return '';
    if (window.matchMedia('(max-width: 768px)').matches) {
        return product.image.replace(/(\.[^./]+)$/, '-768$1');
    }
    return product.image;
}

function getMaxQuantity(product) {
    return product?.maxQuantity ?? DEFAULT_MAX_QUANTITY;
}

function formatPrice(price) {
    return `${price} ₽`;
}

function getQuantity(id) {
    return loadCart()[id] || 0;
}

function setQuantity(id, quantity) {
    const product = getProduct(id);
    if (!product) return;

    const cart = loadCart();
    const max = getMaxQuantity(product);
    const next = Math.max(0, Math.min(quantity, max));

    if (next === 0) delete cart[id];
    else cart[id] = next;

    saveCart(cart);
}

function has(id) {
    return getQuantity(id) > 0;
}

function getItems() {
    const cart = loadCart();
    return MERCH_PRODUCTS
        .filter((p) => (cart[p.id] || 0) > 0)
        .map((p) => ({ product: p, quantity: cart[p.id] }));
}

function getTotalPrice() {
    return getItems().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}
function isEmpty() {
    return getItems().length === 0;
}
window.CartStore = {
    PRODUCTS: MERCH_PRODUCTS,
    getProduct,
    getProductImage,
    getQuantity,
    setQuantity,
    has,
    getItems,
    getTotalPrice,
    getMaxQuantity,
    formatPrice,
    isEmpty,
};
