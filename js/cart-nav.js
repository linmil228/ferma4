const NAV_CART_DEFAULT =
    '<a href="./cart.html" class="nav-section clickable" data-cart-link>' +
    '<img class="default-nav" src="assets/img/ui/cart.svg" alt="">' +
    '<img class="active-nav" src="assets/img/ui/cart-active.svg" alt="">' +
    '</a>';

const NAV_CART_ACTIVE =
    '<a href="./cart.html" class="nav-section clickable" data-cart-link>' +
    '<img class="default-nav" src="assets/img/ui/cart-active.svg" alt="">' +
    '<img class="active-nav" src="assets/img/ui/cart-active.svg" alt="">' +
    '</a>';

const FOOTER_CART_HTML = '<a href="./cart.html" data-cart-link>корзина</a>';

function cartHasItems() {
    if (window.CartStore) {
        return CartStore.getItems().length > 0;
    }
    try {
        var raw = localStorage.getItem('ferma-cart');
        var cart = raw ? JSON.parse(raw) : {};
        return Object.keys(cart).some(function (id) {
            return (cart[id] || 0) > 0;
        });
    } catch (e) {
        return false;
    }
}

function isCartPage() {
    return /(?:^|\/)cart\.html$/i.test(window.location.pathname);
}

function getNavCartHtml() {
    return isCartPage() ? NAV_CART_ACTIVE : NAV_CART_DEFAULT;
}

function renderCartLinks(hasItems) {
    var navSections = document.querySelector('.nav-sections');
    var footerLinks = document.querySelector('.footer-links');
    var navCart = navSections && navSections.querySelector('[data-cart-link]');
    var footerCart = footerLinks && footerLinks.querySelector('[data-cart-link]');

    if (hasItems) {
        var navHtml = getNavCartHtml();

        if (navSections) {
            if (navCart) {
                navCart.outerHTML = navHtml;
            } else {
                navSections.insertAdjacentHTML('beforeend', navHtml);
            }
        }

        if (footerLinks && !footerCart) {
            footerLinks.insertAdjacentHTML('beforeend', FOOTER_CART_HTML);
        }
    } else {
        if (navCart) navCart.remove();
        if (footerCart) footerCart.remove();
    }
}

function updateCartLinksVisibility() {
    var hasItems = cartHasItems();
    document.documentElement.classList.toggle('cart-has-items', hasItems);
    document.documentElement.classList.toggle('cart-empty', !hasItems);
    renderCartLinks(hasItems);
}

document.addEventListener('DOMContentLoaded', updateCartLinksVisibility);
window.addEventListener('cart:updated', updateCartLinksVisibility);
window.addEventListener('storage', function (e) {
    if (e.key === 'ferma-cart') updateCartLinksVisibility();
});
