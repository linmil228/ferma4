const COUNTER_KEY = 'ferma4-pageviews';
const COUNTER_HIT_URL = `https://countapi.mileshilliard.com/api/v1/hit/${COUNTER_KEY}`;

const MAX_VIEWS = 999_999_999_999;

function formatPageViews(count) {
    const safe = Math.min(Math.max(0, Math.floor(count)), MAX_VIEWS);
    const digits = String(safe).padStart(12, '0');
    return '№' + digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
}

function setCounterText(el, count) {
    const text = formatPageViews(count);
    el.dataset.text = text;
    el.querySelector('span').textContent = text;
}

async function initPageCounter() {
    const el = document.querySelector('.stroke-text--counter');
    if (!el) return;

    try {
        const response = await fetch(COUNTER_HIT_URL);
        if (!response.ok) return;

        const data = await response.json();
        if (typeof data.value === 'number') {
            setCounterText(el, data.value);
        }
    } catch (err) {
        console.error('Счётчик не загрузился', err);
    }
}

document.addEventListener('DOMContentLoaded', initPageCounter);