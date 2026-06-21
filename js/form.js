const EXPRESS_FEE = 300;

function normalize(value) {
    return value.trim().toLowerCase();
}

function matches(query, value) {
    if (!query) return true;
    return normalize(value).includes(normalize(query));
}

class FormCombobox {
    static instances = [];

    constructor(root, { options = [], placeholder = '', onChange = null, disabled = false } = {}) {
        this.root = root;
        this.placeholder = placeholder;
        this.onChange = onChange;
        this.disabled = disabled;
        this.options = options;
        this.selected = '';
        this.isOpen = false;

        this.trigger = root.querySelector('.form-combobox__trigger');
        this.input = root.querySelector('.form-combobox__input');
        this.arrow = root.querySelector('.form-combobox__arrow');
        this.list = root.querySelector('.form-combobox__list');

        this.bindEvents();
        this.renderList();
        this.close();
        if (disabled) this.setDisabled(true);

        FormCombobox.instances.push(this);
    }

    bindEvents() {
        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.disabled) return;
            if (e.target === this.input) {
                this.open();
                return;
            }
            this.toggle();
        });

        this.input.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.disabled) this.open();
        });

        this.input.addEventListener('focus', () => {
            if (!this.disabled) this.open();
        });

        this.input.addEventListener('input', () => {
            if (this.disabled) return;
            if (this.selected && this.input.value !== this.selected) {
                this.selected = '';
                this.updateFilledState();
            }
            this.open();
            this.renderList(this.input.value);
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
                this.input.blur();
            }
        });

        this.arrow.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.disabled) return;
            this.toggle();
        });

        this.list.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = e.target.closest('.form-combobox__option');
            if (!item || item.classList.contains('form-combobox__option--empty')) return;
            this.select(item.dataset.value);
        });

        document.addEventListener('click', (e) => {
            if (!this.root.contains(e.target)) this.close();
        });
    }

    setOptions(options) {
        this.options = options;
        this.renderList(this.isOpen ? this.input.value : '');
    }

    setDisabled(disabled) {
        this.disabled = disabled;
        this.root.classList.toggle('is-disabled', disabled);
        this.input.disabled = disabled;
        if (disabled) this.close();
    }

    setValue(value) {
        this.selected = value || '';
        this.input.value = this.selected;
        if (!this.selected) {
            this.input.placeholder = this.placeholder;
        }
        this.updateFilledState();
    }

    clear() {
        this.selected = '';
        this.input.value = '';
        this.input.placeholder = this.placeholder;
        this.renderList();
        this.close();
        this.updateFilledState();
    }

    getValue() {
        return this.selected;
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    open() {
        if (this.disabled) return;

        FormCombobox.instances.forEach((box) => {
            if (box !== this) box.close();
        });

        this.isOpen = true;
        this.root.classList.add('is-open');
        this.renderList(this.input.value);
    }

    close() {
        this.isOpen = false;
        this.root.classList.remove('is-open');
        if (this.selected) {
            this.input.value = this.selected;
        } else {
            this.input.value = '';
            this.input.placeholder = this.placeholder;
        }
        this.updateFilledState();
    }

    select(value) {
        this.selected = value;
        this.input.value = value;
        this.updateFilledState();
        this.close();
        if (this.onChange) this.onChange(value);
    }

    updateFilledState() {
        this.root.classList.toggle('is-filled', Boolean(this.selected));
    }

    renderList(query = '') {
        const filtered = this.options.filter((option) => matches(query, option));
        this.list.replaceChildren();

        filtered.forEach((option) => {
            const li = document.createElement('li');
            li.className = 'form-combobox__option';
            li.dataset.value = option;
            li.textContent = option;
            this.list.appendChild(li);
        });

        if (filtered.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'form-combobox__option form-combobox__option--empty';
            empty.textContent = 'Ничего не найдено';
            this.list.appendChild(empty);
        }
    }
}

function formatPrice(value) {
    return `${value} ₽`;
}

function hasCheckoutItems() {
    const orderTotal = window.OrderStore?.getTotalPrice?.() ?? 0;
    const cartTotal = window.CartStore?.getTotalPrice?.() ?? 0;
    return orderTotal > 0 || cartTotal > 0;
}

function updatePayButton() {
    const payBtn = document.querySelector('.form__pay-btn');
    if (payBtn) payBtn.disabled = !hasCheckoutItems();
}

function updateTotal() {
    const totalEl = document.querySelector('.form__total');
    const expressEl = document.querySelector('#express-delivery');
    if (!totalEl) return;

    let total = 0;

    if (window.OrderStore && typeof window.OrderStore.getTotalPrice === 'function') {
        total = window.OrderStore.getTotalPrice();
    }

    if (total === 0 && window.CartStore && typeof window.CartStore.getTotalPrice === 'function') {
        total = window.CartStore.getTotalPrice();
    }

    if (!hasCheckoutItems()) {
        total = 0;
    } else if (total === 0) {
        total = 770;
    }

    if (expressEl?.checked && hasCheckoutItems()) total += EXPRESS_FEE;

    totalEl.textContent = formatPrice(total);
    updatePayButton();
}

function initFormComboboxes() {
    const data = window.FormAddresses;
    if (!data) return;

    const cityRoot = document.querySelector('[data-combobox="city"]');
    const streetRoot = document.querySelector('[data-combobox="street"]');
    const houseRoot = document.querySelector('[data-combobox="house"]');

    let cityBox;
    let streetBox;
    let houseBox;

    houseBox = new FormCombobox(houseRoot, {
        placeholder: 'Дом',
        disabled: true,
    });

    streetBox = new FormCombobox(streetRoot, {
        placeholder: 'Улица',
        disabled: true,
        onChange: (street) => {
            houseBox.clear();
            const city = cityBox.getValue();
            if (city && street) {
                const key = `${city}|${street}`;
                houseBox.setOptions(data.houses[key] || []);
                houseBox.setDisabled(false);
            } else {
                houseBox.setOptions([]);
                houseBox.setDisabled(true);
            }
        },
    });

    cityBox = new FormCombobox(cityRoot, {
        placeholder: 'Город',
        options: data.cities,
        onChange: (city) => {
            streetBox.clear();
            houseBox.clear();
            houseBox.setDisabled(true);
            if (city) {
                streetBox.setOptions(data.streets[city] || []);
                streetBox.setDisabled(false);
            } else {
                streetBox.setOptions([]);
                streetBox.setDisabled(true);
            }
        },
    });

    window.formComboboxes = { cityBox, streetBox, houseBox };
}

function initFormToggles() {
    document.querySelectorAll('.form-toggle__input').forEach((input) => {
        input.checked = false;
        input.addEventListener('change', () => {
            if (input.id === 'express-delivery') updateTotal();
        });
    });
}

function initFormPhone() {
    const phoneInput = document.querySelector('#phone');
    if (!phoneInput) return;

    function formatRuPhone(raw) {
        let digits = raw.replace(/\D/g, '');

        if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
        if (digits.startsWith('7')) digits = digits.slice(1);

        digits = digits.slice(0, 10);

        if (!digits.length) return '+7';

        let formatted = '+7';

        if (digits.length <= 3) {
            formatted += ` (${digits}`;
        } else if (digits.length <= 6) {
            formatted += ` (${digits.slice(0, 3)}) ${digits.slice(3)}`;
        } else if (digits.length <= 8) {
            formatted += ` (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        } else {
            formatted += ` (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
        }

        return formatted;
    }

    phoneInput.addEventListener('keydown', (e) => {
        const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
        if (allowed.includes(e.key)) return;
        if (e.ctrlKey || e.metaKey) return;
        if (!/^\d$/.test(e.key)) e.preventDefault();
    });

    phoneInput.addEventListener('input', () => {
        phoneInput.value = formatRuPhone(phoneInput.value);
    });

    phoneInput.addEventListener('focus', () => {
        if (!phoneInput.value) phoneInput.value = '+7';
    });

    phoneInput.addEventListener('blur', () => {
        if (phoneInput.value === '+7') phoneInput.value = '';
    });
}

function initForm() {
    initFormComboboxes();
    initFormToggles();
    initFormPhone();
    updateTotal();

    const form = document.querySelector('.form__card');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!hasCheckoutItems()) return;
        window.location.href = 'error.html';
    });
}

document.addEventListener('DOMContentLoaded', initForm);
window.addEventListener('cart:updated', updateTotal);
