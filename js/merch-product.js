function getStore() {
    return window.CartStore;
}

let pendingQty = 1;
let currentProduct = null;

const LONG_TITLE_IDS = new Set(['tshirt', 'stickers']);

function getDisplayQty(product) {
    const store = getStore();
    const cartQty = store.getQuantity(product.id);
    return cartQty > 0 ? cartQty : pendingQty;
}

function createBuyButton(product) {
    const store = getStore();
    const buyBtn = document.createElement('button');
    buyBtn.type = 'button';
    buyBtn.className = 'merch-product__buy-btn clickable';
    buyBtn.textContent = 'Купить сейчас';
    buyBtn.addEventListener('click', () => {
        window.location.href = 'error.html';
    });
    return buyBtn;
}

function createCartButton(product) {
    const store = getStore();
    const cartBtn = document.createElement('button');
    cartBtn.type = 'button';
    cartBtn.className = 'merch-product__cart-btn clickable';
    cartBtn.textContent = 'В корзину';
    cartBtn.addEventListener('click', () => {
        if (store.getMaxQuantity(product) < 1) return;
        store.setQuantity(product.id, pendingQty);
    });
    return cartBtn;
}

function createQuantityControl(product) {
    const store = getStore();
    const max = store.getMaxQuantity(product);
    const qty = store.getQuantity(product.id);

    const quantity = document.createElement('div');
    quantity.className = 'merch-product__quantity';

    const minusBtn = document.createElement('button');
    minusBtn.type = 'button';
    minusBtn.className = 'merch-product__quantity-btn clickable';
    minusBtn.textContent = '-';
    minusBtn.setAttribute('aria-label', 'Уменьшить количество');

    const countEl = document.createElement('span');
    countEl.className = 'merch-product__quantity-count';
    countEl.textContent = String(qty);

    const plusBtn = document.createElement('button');
    plusBtn.type = 'button';
    plusBtn.className = 'merch-product__quantity-btn clickable';
    plusBtn.textContent = '+';
    plusBtn.setAttribute('aria-label', 'Увеличить количество');
    if (qty >= max) {
        plusBtn.classList.add('is-disabled');
        plusBtn.disabled = true;
    }

    minusBtn.addEventListener('click', () => {
        store.setQuantity(product.id, store.getQuantity(product.id) - 1);
    });

    plusBtn.addEventListener('click', () => {
        const current = store.getQuantity(product.id);
        if (current < max) store.setQuantity(product.id, current + 1);
    });

    quantity.append(minusBtn, countEl, plusBtn);
    return quantity;
}

function renderPurchaseBar(product) {
    const store = getStore();
    const purchaseEl = document.querySelector('.merch-product__purchase');
    if (!purchaseEl) return;

    purchaseEl.replaceChildren();
    purchaseEl.appendChild(createBuyButton(product));

    if (store.has(product.id)) {
        purchaseEl.appendChild(createQuantityControl(product));
    } else {
        purchaseEl.appendChild(createCartButton(product));
    }
}

function setStrokeTitle(titleEl, name, productId) {
    if (!titleEl) return;
    const text = name.toLowerCase();
    titleEl.dataset.text = text;
    titleEl.classList.toggle('stroke-text--merch-product-long', LONG_TITLE_IDS.has(productId));
    const span = titleEl.querySelector('span');
    if (span) span.textContent = text;
}

function renderProduct(product) {
    const store = getStore();
    currentProduct = product;

    document.title = `${product.name} — ferma`;

    const titleEl = document.querySelector('.merch-product__title');
    const priceEl = document.querySelector('.merch-product__price-badge');
    const descEl = document.querySelector('.merch-product__detail--description');
    const sizeEl = document.querySelector('.merch-product__detail--size');
    const compositionEl = document.querySelector('.merch-product__detail--composition');
    const imageEl = document.querySelector('.merch-product__image');
    const imageBgEl = document.querySelector('.merch-product__image-bg');
    const galleryEl = document.querySelector('.merch-product__gallery');

    setStrokeTitle(titleEl, product.name, product.id);
    if (priceEl) priceEl.textContent = store.formatPrice(product.price);
    if (descEl) {
        descEl.textContent = window.fixTypography
            ? window.fixTypography(product.description || '')
            : (product.description || '');
    }
    if (sizeEl) {
        sizeEl.innerHTML = `Размер: <strong>${product.size || 'ONE SIZE'}</strong>`;
    }
    if (compositionEl) {
        compositionEl.textContent = product.composition
            ? `Состав: ${product.composition}`
            : '';
        compositionEl.hidden = !product.composition;
    }

    if (imageEl) {
        imageEl.src = store.getProductImage(product);
        imageEl.alt = product.name;
        imageEl.className = `merch-product__image merch-product__image--${product.imageFit || 'cover'}`;
    }

    if (imageBgEl) {
        imageBgEl.hidden = !product.imageBg;
    }

    if (galleryEl) {
        galleryEl.classList.toggle('merch-product__gallery--white', product.galleryBg === 'white');
    }

    renderPurchaseBar(product);
}

function onCartUpdated() {
    if (!currentProduct) return;
    if (!getStore().has(currentProduct.id)) {
        pendingQty = 1;
    }
    renderPurchaseBar(currentProduct);
}

function onResize() {
    if (!currentProduct) return;
    const imageEl = document.querySelector('.merch-product__image');
    if (imageEl) {
        imageEl.src = getStore().getProductImage(currentProduct);
    }
}

function initMerchProduct() {
    const store = getStore();
    if (!store) return;

    const id = new URLSearchParams(window.location.search).get('id');
    const product = store.getProduct(id);

    if (!product) {
        window.location.href = 'merch.html';
        return;
    }

    pendingQty = 1;
    renderProduct(product);
    window.addEventListener('cart:updated', onCartUpdated);
    window.addEventListener('resize', onResize);
}

document.addEventListener('DOMContentLoaded', initMerchProduct);
