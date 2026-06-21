function getLazyBgUrl(el) {
    if (window.matchMedia('(max-width: 430px)').matches && el.dataset.bg430) {
        return el.dataset.bg430;
    }
    if (window.matchMedia('(max-width: 768px)').matches && el.dataset.bg768) {
        return el.dataset.bg768;
    }
    return el.dataset.bg;
}

function applyLazyBg(el) {
    const url = getLazyBgUrl(el);
    if (!url || el.classList.contains('is-bg-loaded')) return;
    el.style.backgroundImage = `url(${url})`;
    el.classList.add('is-bg-loaded');
}

function initLazyBackgrounds() {
    const elements = document.querySelectorAll('.lazy-bg[data-bg]');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
        elements.forEach(applyLazyBg);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(({ isIntersecting, target }) => {
            if (!isIntersecting) return;
            applyLazyBg(target);
            observer.unobserve(target);
        });
    }, { rootMargin: '200px 0px' });

    elements.forEach((el) => observer.observe(el));
}

window.addEventListener('resize', () => {
    document.querySelectorAll('.lazy-bg.is-bg-loaded[data-bg768]').forEach((el) => {
        el.style.backgroundImage = `url(${getLazyBgUrl(el)})`;
    });
});

document.addEventListener('DOMContentLoaded', initLazyBackgrounds);
