const CAROUSEL_RADIUS_X = 0.35;
const CAROUSEL_RADIUS_Y = 0.3;
const ROTATION_SPEED = 0.005;

let rotation = 0;
let animationId = null;
let ringEl = null;
let itemEls = [];

let listEl = null;
let totalEl = null;
let checkoutBtn = null;
const rowEls = new Map();
const prevQuantities = new Map();

const carouselState = {
    cx: 0,
    cy: 0,
    rx: 0,
    ry: 0,
    scale: 1,
};

function getStore() {
    return window.OrderStore;
}

function getProduct(id) {
    return getStore().PRODUCTS.find((p) => p.id === id);
}

function applyItemSize(el, product, scale) {
    const { SELECTION_WIDTH, SELECTION_HEIGHT } = getStore();
    const selection = el._selectionEl;

    const fruitW = product.width * scale;
    const fruitH = product.height * scale;

    el.style.width = `${fruitW}px`;
    el.style.height = `${fruitH}px`;

    if (selection) {
        selection.style.width = `${SELECTION_WIDTH * scale}px`;
        selection.style.height = `${SELECTION_HEIGHT * scale}px`;
    }
}

function updateCarouselGeometry() {
    if (!ringEl || !itemEls.length) return;

    const rect = ringEl.getBoundingClientRect();
    carouselState.cx = rect.width / 2;
    carouselState.cy = rect.height / 2;
    carouselState.rx = rect.width * CAROUSEL_RADIUS_X;
    carouselState.ry = rect.height * CAROUSEL_RADIUS_Y;
    carouselState.scale = rect.width / getStore().DESIGN_CAROUSEL_WIDTH;

    const store = getStore();
    itemEls.forEach((el, index) => {
        applyItemSize(el, store.PRODUCTS[index], carouselState.scale);
    });

    updateCarouselPositions();
}

function updateCarouselPositions() {
    if (!itemEls.length) return;

    const { cx, cy, rx, ry } = carouselState;
    const count = itemEls.length;

    itemEls.forEach((el, index) => {
        const angle = rotation + (index / count) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * rx;
        const y = cy + Math.sin(angle) * ry;

        const sinA = Math.sin(angle);
        let depth = sinA * 8000 + y * 4;
        if (Math.abs(sinA) < 0.45) {
            depth += Math.cos(angle) * angle * 80;
        }

        const z = Math.round(10000 + depth) + index;
        if (el._z !== z) {
            el._z = z;
            el.style.zIndex = String(z);
        }

        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    });
}

function createCarouselItem(product) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'order-item clickable';
    btn.dataset.productId = product.id;
    btn.setAttribute('aria-label', product.name);
    btn.setAttribute('aria-pressed', 'false');

    const selection = document.createElement('span');
    selection.className = 'order-item__selection';
    selection.setAttribute('aria-hidden', 'true');
    btn._selectionEl = selection;

    const img = document.createElement('img');
    img.className = 'order-item__image';
    img.src = product.image;
    img.alt = product.name;
    img.draggable = false;
    img.width = product.width;
    img.height = product.height;

    btn.append(selection, img);
    btn.addEventListener('click', () => getStore().toggleProduct(product.id));

    return btn;
}

function updateCarouselItemSelection(productId, selected) {
    const el = itemEls.find((item) => item.dataset.productId === productId);
    if (!el) return;

    el.classList.toggle('order-item--selected', selected);
    el.setAttribute('aria-pressed', String(selected));
}

function updateCarouselSelectionAll() {
    const { has } = getStore();
    itemEls.forEach((el) => {
        const selected = has(el.dataset.productId);
        el.classList.toggle('order-item--selected', selected);
        el.setAttribute('aria-pressed', String(selected));
    });
}

function animateCarousel() {
    rotation += ROTATION_SPEED;
    updateCarouselPositions();
    animationId = requestAnimationFrame(animateCarousel);
}

function startCarouselAnimation() {
    if (animationId !== null) return;
    animationId = requestAnimationFrame(animateCarousel);
}

function stopCarouselAnimation() {
    if (animationId === null) return;
    cancelAnimationFrame(animationId);
    animationId = null;
}

function initCarousel() {
    const viewport = document.querySelector('.order-carousel__viewport');
    const store = getStore();
    if (!viewport || !store) return;

    ringEl = document.createElement('div');
    ringEl.className = 'order-carousel__ring';

    itemEls = store.PRODUCTS.map((product) => {
        const el = createCarouselItem(product);
        ringEl.appendChild(el);
        return el;
    });

    viewport.appendChild(ringEl);

    const resizeObserver = new ResizeObserver(() => {
        updateCarouselGeometry();
    });
    resizeObserver.observe(ringEl);

    updateCarouselGeometry();
    updateCarouselSelectionAll();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
        startCarouselAnimation();
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopCarouselAnimation();
        } else if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            startCarouselAnimation();
        }
    });
}

function createQuantityControl(productId) {
    const wrap = document.createElement('div');
    wrap.className = 'order-row__quantity';

    const minus = document.createElement('button');
    minus.type = 'button';
    minus.className = 'order-row__quantity-btn clickable';
    minus.textContent = '−';
    minus.setAttribute('aria-label', 'Уменьшить количество');

    const count = document.createElement('span');
    count.className = 'order-row__quantity-count';

    const plus = document.createElement('button');
    plus.type = 'button';
    plus.className = 'order-row__quantity-btn clickable';
    plus.textContent = '+';
    plus.setAttribute('aria-label', 'Увеличить количество');

    minus.addEventListener('click', () => {
        const store = getStore();
        store.setQuantity(productId, store.getQuantity(productId) - 1);
    });

    plus.addEventListener('click', () => {
        const store = getStore();
        store.setQuantity(productId, store.getQuantity(productId) + 1);
    });

    wrap.append(minus, count, plus);
    wrap._countEl = count;
    return wrap;
}

function createOrderRow(product, quantity) {
    const row = document.createElement('div');
    row.className = 'order-row';
    row.dataset.productId = product.id;

    const name = document.createElement('p');
    name.className = 'order-row__name';
    name.textContent = product.name;

    const price = document.createElement('p');
    price.className = 'order-row__price';
    price.textContent = getStore().formatPrice(product.price);

    const quantityControl = createQuantityControl(product.id);
    quantityControl._countEl.textContent = String(quantity);

    const controls = document.createElement('div');
    controls.className = 'order-row__controls';
    controls.append(price, quantityControl);

    row.append(name, controls);
    row._quantityEl = quantityControl._countEl;
    return row;
}

function insertRowAtTop(row) {
    listEl.prepend(row);
}

function removeOrderRow(productId) {
    const row = rowEls.get(productId);
    if (!row) return;

    row.remove();
    rowEls.delete(productId);
}

function addOrderRow(productId, quantity, { toTop = true } = {}) {
    const product = getProduct(productId);
    if (!product || rowEls.has(productId)) return;

    const row = createOrderRow(product, quantity);
    rowEls.set(productId, row);

    if (toTop) insertRowAtTop(row);
    else listEl.appendChild(row);
}

function updateOrderRowQuantity(productId, quantity) {
    const row = rowEls.get(productId);
    if (!row || !row._quantityEl) return;

    row._quantityEl.textContent = String(quantity);
}

function updateCheckoutTotal() {
    const store = getStore();
    const items = store.getItems();

    totalEl.textContent = store.formatPrice(store.getTotalPrice());
    checkoutBtn.disabled = items.length === 0;
}

function buildQuantitySnapshot() {
    const store = getStore();
    const snapshot = new Map();

    store.PRODUCTS.forEach((product) => {
        const quantity = store.getQuantity(product.id);
        if (quantity > 0) {
            snapshot.set(product.id, quantity);
        }
    });

    return snapshot;
}

function syncOrderForm() {
    const next = buildQuantitySnapshot();

    for (const productId of rowEls.keys()) {
        if (!next.has(productId)) {
            removeOrderRow(productId);
            updateCarouselItemSelection(productId, false);
        }
    }

    for (const [productId, quantity] of next) {
        const prevQty = prevQuantities.get(productId) || 0;

        if (prevQty === 0) {
            addOrderRow(productId, quantity);
            updateCarouselItemSelection(productId, true);
        } else if (prevQty !== quantity) {
            updateOrderRowQuantity(productId, quantity);
        }
    }

    for (const [productId, quantity] of next) {
        prevQuantities.set(productId, quantity);
    }

    for (const productId of prevQuantities.keys()) {
        if (!next.has(productId)) {
            prevQuantities.delete(productId);
        }
    }

    updateCheckoutTotal();
}

function initOrderForm() {
    const store = getStore();
    listEl = document.querySelector('.order-form__list');
    totalEl = document.querySelector('.order-checkout__total');
    checkoutBtn = document.querySelector('.order-checkout__btn');

    if (!store || !listEl || !totalEl || !checkoutBtn) return;

    prevQuantities.clear();
    rowEls.clear();
    listEl.replaceChildren();

    store.getItems().forEach(({ product, quantity }) => {
        prevQuantities.set(product.id, quantity);
        addOrderRow(product.id, quantity, { toTop: false });
    });

    updateCheckoutTotal();

    checkoutBtn.addEventListener('click', () => {
        if (checkoutBtn.disabled) return;
        window.location.href = 'form.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (!window.OrderStore) return;

    initCarousel();
    initOrderForm();
    window.addEventListener('order:updated', syncOrderForm);
});