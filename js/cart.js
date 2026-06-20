function renderCart() {
    if (!window.CartStore) return;

    const { getItems, setQuantity, getMaxQuantity, getTotalPrice, formatPrice } = window.CartStore;

    const grid = document.querySelector('.cart__grid');
    const totalEl = document.querySelector('.cart__total');

    if (!grid || !totalEl) return;

    const items = getItems();

    grid.replaceChildren();
    items.forEach(({ product, quantity }) => {
        grid.appendChild(createCartCard(product, quantity, setQuantity, getMaxQuantity, formatPrice));
    });

    totalEl.textContent = formatPrice(getTotalPrice());
}

function createCartCard(product, quantity, setQuantity, getMaxQuantity, formatPrice) {
    const card = document.createElement('article');
    card.className = 'cart-card';
    card.dataset.productId = product.id;

    const imageWrap = document.createElement('div');
    imageWrap.className = 'cart-card__image-wrap';

    if (product.imageBg) {
        const bg = document.createElement('div');
        bg.className = 'cart-card__image-bg';
        imageWrap.appendChild(bg);
    }

    const img = document.createElement('img');
    img.className = `cart-card__image cart-card__image--${product.imageFit}`;
    img.src = product.image;
    img.alt = product.name;
    imageWrap.appendChild(img);
    imageWrap.appendChild(createQuantityControl(product, quantity, setQuantity, getMaxQuantity, renderCart));

    const footer = document.createElement('div');
    footer.className = 'cart-card__footer';

    const name = document.createElement('p');
    name.className = 'cart-card__name';
    name.textContent = product.name;

    const price = document.createElement('p');
    price.className = 'cart-card__price';
    price.textContent = formatPrice(product.price * quantity);

    footer.append(name, price);
    card.append(imageWrap, footer);

    return card;
}

function createQuantityControl(product, quantity, setQuantity, getMaxQuantity, onUpdate) {
    const wrap = document.createElement('div');
    wrap.className = 'cart-card__quantity';

    const max = getMaxQuantity(product);
    const atMax = quantity >= max;

    const minus = document.createElement('button');
    minus.type = 'button';
    minus.className = 'cart-card__quantity-btn clickable';
    minus.textContent = '-';
    minus.setAttribute('aria-label', 'Уменьшить количество');

    const count = document.createElement('span');
    count.className = 'cart-card__quantity-count';
    count.textContent = String(quantity);

    const plus = document.createElement('button');
    plus.type = 'button';
    plus.className = 'cart-card__quantity-btn clickable';
    plus.textContent = '+';
    plus.setAttribute('aria-label', 'Увеличить количество');
    if (atMax) {
        plus.disabled = true;
        plus.classList.add('cart-card__quantity-btn--disabled');
    }

    minus.addEventListener('click', () => {
        setQuantity(product.id, quantity - 1);
        onUpdate();
    });

    plus.addEventListener('click', () => {
        if (quantity < max) {
            setQuantity(product.id, quantity + 1);
            onUpdate();
        }
    });

    wrap.append(minus, count, plus);
    return wrap;
}

function initCartPayButton() {
    const payBtn = document.querySelector('.cart__pay-btn');
    payBtn?.addEventListener('click', () => {
        window.location.href = 'error.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    initCartPayButton();
});
window.addEventListener('cart:updated', renderCart);
