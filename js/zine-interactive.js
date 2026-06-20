const ZINE_PAGES = [
    'assets/img/zine-first.svg',
    'assets/img/zine-page-1.svg',
    'assets/img/zine-page-2.svg',
    'assets/img/zine-page-3.svg',
    'assets/img/zine-page-4.svg',
    'assets/img/zine-page-5.svg',
    'assets/img/zine-page-3-1.svg',
    'assets/img/zine-page-2.svg',
];

const FADE_MS = 350;
let currentPage = 0;
let isAnimating = false;

const pageStage = document.getElementById('zine-page-stage');
const pageImage = document.getElementById('zine-page-image');
const tabs = document.querySelectorAll('.zine-interactive__content .tab');

function setActiveTab(pageIndex) {
    tabs.forEach((tab) => {
        tab.classList.toggle('is-active', Number(tab.dataset.page) === pageIndex);
    });
}

function preloadPages() {
    ZINE_PAGES.forEach((src) => {
        const img = new Image();
        img.src = src;
    });
}

function changePage(pageIndex) {
    if (isAnimating || pageIndex === currentPage) return;
    if (!pageStage || !pageImage) return;

    isAnimating = true;
    pageStage.classList.add('is-fading');

    setTimeout(() => {
        pageImage.src = ZINE_PAGES[pageIndex];
        currentPage = pageIndex;
        setActiveTab(pageIndex);

        requestAnimationFrame(() => {
            pageStage.classList.remove('is-fading');
        });

        setTimeout(() => {
            isAnimating = false;
        }, FADE_MS);
    }, FADE_MS);
}

tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        changePage(Number(tab.dataset.page));
    });
});

document.addEventListener('DOMContentLoaded', () => {
    preloadPages();
    setActiveTab(0);
});