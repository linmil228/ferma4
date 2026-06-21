function initNavMenu() {
    const burger = document.querySelector('.nav-burger');
    const overlay = document.querySelector('.nav-overlay');
    const mq = window.matchMedia('(max-width: 430px)');

    if (!burger || !overlay) return;

    function closeMenu() {
        document.body.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
        overlay.setAttribute('aria-hidden', 'true');
    }

    function openMenu() {
        if (!mq.matches) return;

        document.body.classList.add('nav-open');
        burger.setAttribute('aria-expanded', 'true');
        overlay.setAttribute('aria-hidden', 'false');
    }

    function toggleMenu() {
        if (document.body.classList.contains('nav-open')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    burger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);

    mq.addEventListener('change', (event) => {
        if (!event.matches) closeMenu();
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });

    document.addEventListener('click', (event) => {
        if (!document.body.classList.contains('nav-open')) return;
        if (event.target.closest('#nav-mobile-panel a')) closeMenu();
    });
}

document.addEventListener('DOMContentLoaded', initNavMenu);
