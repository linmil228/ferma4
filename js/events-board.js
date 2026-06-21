const EVENT_HOVER_IMAGES = {
    podium: 'assets/img/events/bg-podium-hover.svg',
    festival: 'assets/img/events/bg-fest-hover.svg',
    zine: 'assets/img/events/bg-zine-hover.svg',
    lecture: 'assets/img/events/bg-lec-hover.svg',
    masterclass: 'assets/img/events/bg-master-hover.svg',
    poster: 'assets/img/events/bg-web-hover.svg',
};

function enableCardHover(card) {
    const type = [...card.classList]
        .find((cls) => cls.startsWith('event-card--'))
        ?.slice('event-card--'.length);
    const hoverSrc = type && EVENT_HOVER_IMAGES[type];
    if (!hoverSrc || card.dataset.hoverReady) return;
    card.dataset.hoverReady = '1';
    card.style.setProperty('--card-image-hover', `url(${hoverSrc})`);
}

function initEventsBoard() {
    document.querySelectorAll('.event-card').forEach((card) => {
        card.addEventListener('pointerenter', () => enableCardHover(card), { once: true });
        card.addEventListener('focusin', () => enableCardHover(card), { once: true });
    });

    document.querySelectorAll('.event-card[data-event-id]').forEach((card) => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.event-card__link')) return;
            const id = card.dataset.eventId;
            if (!id) return;
            window.location.href = `event.html?id=${encodeURIComponent(id)}`;
        });
    });
}

document.addEventListener('DOMContentLoaded', initEventsBoard);
