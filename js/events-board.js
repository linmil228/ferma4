function initEventsBoard() {
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
