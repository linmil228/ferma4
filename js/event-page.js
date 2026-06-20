function setStrokeTitle(titleEl, name) {
    if (!titleEl) return;
    const text = name.toLowerCase();
    titleEl.dataset.text = text;
    const span = titleEl.querySelector('span');
    if (span) span.textContent = text;
}

function renderEvent(event) {
    document.title = `${event.name} — ferma`;

    const galleryEl = document.querySelector('.event-page__gallery');
    const posterFrameEl = document.querySelector('.event-page__poster');
    const posterEl = document.querySelector('.event-page__poster-image');
    const panelEl = document.querySelector('.event-page__panel');
    const dateEl = document.querySelector('.event-page__date-badge');
    const titleEl = document.querySelector('.event-page__title');
    const descEl = document.querySelector('.event-page__description');
    const ticketEl = document.querySelector('.event-page__ticket-btn');

    if (galleryEl && event.galleryColor) {
        galleryEl.style.backgroundColor = event.galleryColor;
    }

    if (posterFrameEl && event.posterFrameColor) {
        posterFrameEl.style.backgroundColor = event.posterFrameColor;
    }

    if (panelEl) {
        panelEl.className = `event-page__panel ${event.panelBgClass || ''}`.trim();
    }

    if (posterEl) {
        posterEl.src = event.poster;
        posterEl.alt = event.name;
    }

    if (dateEl) dateEl.textContent = event.date;
    setStrokeTitle(titleEl, event.name);

    if (descEl) {
        descEl.textContent = window.fixTypography
            ? window.fixTypography(event.description)
            : event.description;
    }

    if (ticketEl) {
        ticketEl.href = 'error.html';
    }
}

function initEventPage() {
    const store = window.EventsStore;
    if (!store) return;

    const id = new URLSearchParams(window.location.search).get('id');
    const event = store.getEvent(id);

    if (!event) {
        window.location.href = 'events.html';
        return;
    }

    renderEvent(event);
}

document.addEventListener('DOMContentLoaded', initEventPage);
