const ORDER_PRODUCTS = [
    { id: 'mandarin', name: 'Мандарин', price: 130, image: 'assets/img/order/avocado.svg', width: 164, height: 173 },
    { id: 'avokado', name: 'Авокадо', price: 90, image: 'assets/img/order/raspberry.svg', width: 98, height: 152 },
    { id: 'brokkoli', name: 'Брокколи', price: 115, image: 'assets/img/order/blueberry.svg', width: 106, height: 140 },
    { id: 'chernika', name: 'Черника', price: 110, image: 'assets/img/order/cabbage.svg', width: 153, height: 142 },
    { id: 'malina', name: 'Малина', price: 105, image: 'assets/img/order/garlic.svg', width: 150, height: 146 },
    { id: 'klubnika', name: 'Клубника', price: 100, image: 'assets/img/order/onion.svg', width: 119, height: 173 },
    { id: 'kapusta', name: 'Капуста', price: 80, image: 'assets/img/order/strawberry.svg', width: 123, height: 173 },
    { id: 'perets', name: 'Перец', price: 70, image: 'assets/img/order/pepper.svg', width: 174, height: 172 },
    { id: 'chesnok', name: 'Чеснок', price: 35, image: 'assets/img/order/broccoli.svg', width: 156, height: 150 },
    { id: 'tomat', name: 'Томат', price: 50, image: 'assets/img/order/tomato.svg', width: 160, height: 173 },
    { id: 'limon', name: 'Лимон', price: 45, image: 'assets/img/order/lemon.svg', width: 116, height: 172 },
    { id: 'tykva', name: 'Тыква', price: 55, image: 'assets/img/order/orange.svg', width: 124, height: 168 },
];

const SELECTION_WIDTH = 219;
const SELECTION_HEIGHT = 202;
const DESIGN_CAROUSEL_WIDTH = 1500;

const orderState = new Map();
const orderSequence = [];

function getProduct(id) {
    return ORDER_PRODUCTS.find((p) => p.id === id);
}

function formatPrice(price) {
    return `${price} ₽`;
}

function getQuantity(id) {
    return orderState.get(id) || 0;
}

function removeFromSequence(id) {
    const idx = orderSequence.indexOf(id);
    if (idx !== -1) orderSequence.splice(idx, 1);
}

function setQuantity(id, quantity) {
    const product = getProduct(id);
    if (!product) return;

    const prev = getQuantity(id);
    const next = Math.max(0, Math.min(quantity, 99));

    if (next === 0) {
        orderState.delete(id);
        removeFromSequence(id);
    } else {
        orderState.set(id, next);

        if (prev === 0) {
            removeFromSequence(id);
            orderSequence.unshift(id);
        }
    }

    window.dispatchEvent(new CustomEvent('order:updated'));
}

function toggleProduct(id) {
    if (getQuantity(id) > 0) setQuantity(id, 0);
    else setQuantity(id, 1);
}

function has(id) {
    return getQuantity(id) > 0;
}

function getItems() {
    return orderSequence
        .filter((id) => getQuantity(id) > 0)
        .map((id) => ({
            product: getProduct(id),
            quantity: getQuantity(id),
        }));
}

function getTotalPrice() {
    return getItems().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

window.OrderStore = {
    PRODUCTS: ORDER_PRODUCTS,
    SELECTION_WIDTH,
    SELECTION_HEIGHT,
    DESIGN_CAROUSEL_WIDTH,
    getQuantity,
    setQuantity,
    toggleProduct,
    has,
    getItems,
    getTotalPrice,
    formatPrice,
};