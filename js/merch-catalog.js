function getStore() {
    return window.CartStore;
}

function createCartButton(product) {
    const { setQuantity, getMaxQuantity } = getStore();

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'merch-card__cart-btn clickable';
    btn.setAttribute('aria-label', `Добавить ${product.name} в корзину`);

    const img = document.createElement('img');
    img.src = product.cartBtn || 'assets/img/merch/cart-btn.svg';
    img.alt = '';
    btn.appendChild(img);

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (getMaxQuantity(product) < 1) return;
        setQuantity(product.id, 1);
        renderCatalog();
    });

    return btn;
}

function createQuantityControl(product) {
    const { getQuantity, setQuantity, getMaxQuantity } = getStore();

    const wrap = document.createElement('div');
    wrap.className = 'merch-card__quantity';

    const count = getQuantity(product.id) || 1;
    const max = getMaxQuantity(product);
    const atMax = count >= max;

    const minusBtn = document.createElement('button');
    minusBtn.type = 'button';
    minusBtn.className = 'merch-card__quantity-btn clickable';
    minusBtn.textContent = '-';
    minusBtn.setAttribute('aria-label', 'Уменьшить количество');

    const countEl = document.createElement('span');
    countEl.className = 'merch-card__quantity-count';
    countEl.textContent = String(count);

    const plusBtn = document.createElement('button');
    plusBtn.type = 'button';
    plusBtn.className = 'merch-card__quantity-btn clickable';
    if (atMax) {
        plusBtn.classList.add('is-disabled');
        plusBtn.disabled = true;
    }
    plusBtn.textContent = '+';
    plusBtn.setAttribute('aria-label', 'Увеличить количество');

    minusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setQuantity(product.id, getQuantity(product.id) - 1);
        renderCatalog();
    });

    plusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const current = getQuantity(product.id);
        if (current >= max) return;
        setQuantity(product.id, current + 1);
        renderCatalog();
    });

    wrap.addEventListener('click', (e) => e.stopPropagation());

    wrap.append(minusBtn, countEl, plusBtn);
    return wrap;
}

function createCard(product) {
    const { has, formatPrice } = getStore();
    const productUrl = `merch-product.html?id=${encodeURIComponent(product.id)}`;

    const card = document.createElement('article');
    card.className = 'merch-card';
    card.dataset.productId = product.id;

    const link = document.createElement('a');
    link.className = 'merch-card__link clickable';
    link.href = productUrl;

    const imageWrap = document.createElement('div');
    imageWrap.className = 'merch-card__image-wrap';

    if (product.imageBg) {
        imageWrap.classList.add('merch-card__image-wrap--has-bg');
        const bg = document.createElement('div');
        bg.className = 'merch-card__image-bg';
        imageWrap.appendChild(bg);
    }

    const image = document.createElement('img');
    image.className = `merch-card__image merch-card__image--${product.imageFit}`;
    image.src = getStore().getProductImage(product);
    image.alt = product.name;
    image.decoding = 'async';
    image.loading = 'lazy';
    imageWrap.appendChild(image);

    const footer = document.createElement('div');
    footer.className = 'merch-card__footer';

    const name = document.createElement('p');
    name.className = 'merch-card__name';
    name.textContent = product.name;

    const price = document.createElement('p');
    price.className = 'merch-card__price';
    price.textContent = formatPrice(product.price);

    footer.append(name, price);
    link.append(imageWrap, footer);

    const action = document.createElement('div');
    action.className = 'merch-card__action';
    action.appendChild(
        has(product.id) ? createQuantityControl(product) : createCartButton(product)
    );

    card.append(link, action);

    return card;
}

function renderCatalog() {
    const store = getStore();
    const grid = document.querySelector('.merch-catalog__grid');
    if (!store || !grid) return;

    grid.replaceChildren();
    store.PRODUCTS.forEach((product) => {
        grid.appendChild(createCard(product));
    });
}

function initMerchCatalog() {
    if (!window.CartStore) return;

    renderCatalog();
    window.addEventListener('cart:updated', renderCatalog);
}

document.addEventListener('DOMContentLoaded', initMerchCatalog);
