const ERROR_ELEMENTS = Array.from(
    { length: 8 },
    (_, i) => `assets/img/error-elements/e-element-${i + 1}.svg`
);

const ERROR_DESIGN_WIDTH = 1920;
const ERROR_DESIGN_BANNER = 720;

const ERROR_FLOAT_CONFIG = {

    sizeMin: 0.35,
    sizeMax: 0.4,

    spawnRadiusFactor: 0.65,
    spawnRadiusExtra: 80,

    countMin: 8,
    countMax: 8,
};

function getReferenceWidth() {
    return Math.min(window.innerWidth, ERROR_DESIGN_WIDTH);
}

function getBannerReferenceSize() {
    return ERROR_DESIGN_BANNER * (getReferenceWidth() / ERROR_DESIGN_WIDTH);
}

function shuffle(items) {
    const list = [...items];
    for (let i = list.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function getPlayArea() {
    const nav = document.querySelector('nav');
    const footer = document.querySelector('footer');
    const body = document.body;
    const navBottom = nav?.getBoundingClientRect().bottom ?? 60;
    const footerTop = footer?.getBoundingClientRect().top ?? window.innerHeight;
    const bodyRect = body.getBoundingClientRect();

    return {
        top: navBottom,
        bottom: footerTop,
        left: bodyRect.left,
        right: bodyRect.right,
        width: bodyRect.width,
        height: Math.max(0, footerTop - navBottom),
    };
}

function clampParticleToArea(particle, area) {
    const margin = particle.size * 0.05;

    particle.x = clamp(particle.x, area.left + margin, area.right - particle.size - margin);
    particle.y = clamp(particle.y, area.top + margin, area.bottom - particle.size - margin);
}

function initErrorPage() {
    const floatsEl = document.querySelector('.error__floats');
    const banner = document.querySelector('.error__banner');
    if (!floatsEl || !banner) return;

    const count = ERROR_FLOAT_CONFIG.countMin
        + Math.floor(Math.random() * (ERROR_FLOAT_CONFIG.countMax - ERROR_FLOAT_CONFIG.countMin + 1));
    const picked = shuffle(ERROR_ELEMENTS).slice(0, count);
    const particles = [];
    let time = 0;

    function getElementSize(bannerSize, randomFactor) {
        return bannerSize * (
            ERROR_FLOAT_CONFIG.sizeMin
            + randomFactor * (ERROR_FLOAT_CONFIG.sizeMax - ERROR_FLOAT_CONFIG.sizeMin)
        );
    }

    function applyParticleSize(particle, bannerSize) {
        particle.size = getElementSize(bannerSize, particle.sizeRandom);
        particle.el.style.width = `${particle.size}px`;
    }

    requestAnimationFrame(() => {
        const bannerRect = banner.getBoundingClientRect();
        const contentEl = document.querySelector('.error__content');
        const contentRect = contentEl?.getBoundingClientRect();
        const centerX = contentRect
            ? contentRect.left + contentRect.width / 2
            : bannerRect.left + bannerRect.width / 2;
        const centerY = contentRect
            ? contentRect.top + contentRect.height / 2
            : bannerRect.top + bannerRect.height / 2;
        const bannerSize = getBannerReferenceSize();
        const spawnRadius = bannerSize * ERROR_FLOAT_CONFIG.spawnRadiusFactor + ERROR_FLOAT_CONFIG.spawnRadiusExtra * (getReferenceWidth() / ERROR_DESIGN_WIDTH);
        const playArea = getPlayArea();

        picked.forEach((src, index) => {
            const el = document.createElement('img');
            const sizeRandom = Math.random();
            const size = getElementSize(bannerSize, sizeRandom);

            el.className = 'error-float';
            el.src = src;
            el.alt = '';
            el.draggable = false;
            el.style.width = `${size}px`;
            el.style.animationDelay = `${index * 0.08 + Math.random() * 0.15}s`;

            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * spawnRadius;
            const x = centerX + Math.cos(angle) * distance - size / 2;
            const y = centerY + Math.sin(angle) * distance - size / 2;

            const particle = {
                el,
                x,
                y,
                vx: (Math.random() - 0.5) * 0.45,
                vy: (Math.random() - 0.5) * 0.45,
                rot: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 0.12,
                size,
                sizeRandom,
                phaseX: Math.random() * Math.PI * 2,
                phaseY: Math.random() * Math.PI * 2,
                driftAmp: 0.06 + Math.random() * 0.1,
                driftFreq: 0.0015 + Math.random() * 0.0025,
                dragging: false,
                lastMoveX: 0,
                lastMoveY: 0,
            };

            clampParticleToArea(particle, playArea);

            const onPointerDown = (event) => {
                event.preventDefault();
                particle.dragging = true;
                particle.lastMoveX = event.clientX;
                particle.lastMoveY = event.clientY;
                el.classList.add('is-dragging');
                el.setPointerCapture(event.pointerId);
            };

            const onPointerMove = (event) => {
                if (!particle.dragging) return;

                const dx = event.clientX - particle.lastMoveX;
                const dy = event.clientY - particle.lastMoveY;

                particle.x += dx;
                particle.y += dy;
                particle.vx = dx * 0.35;
                particle.vy = dy * 0.35;
                particle.lastMoveX = event.clientX;
                particle.lastMoveY = event.clientY;
                clampParticleToArea(particle, getPlayArea());
            };

            const onPointerUp = (event) => {
                if (!particle.dragging) return;

                particle.dragging = false;
                el.classList.remove('is-dragging');
                el.releasePointerCapture(event.pointerId);
            };

            el.addEventListener('pointerdown', onPointerDown);
            el.addEventListener('pointermove', onPointerMove);
            el.addEventListener('pointerup', onPointerUp);
            el.addEventListener('pointercancel', onPointerUp);

            floatsEl.appendChild(el);
            particles.push(particle);
        });

        function tick() {
            time += 1;
            const area = getPlayArea();

            particles.forEach((particle) => {
                if (!particle.dragging) {
                    particle.x += particle.vx + Math.sin(time * particle.driftFreq + particle.phaseX) * particle.driftAmp;
                    particle.y += particle.vy + Math.cos(time * particle.driftFreq + particle.phaseY) * particle.driftAmp;
                    particle.rot += particle.rotSpeed;

                    particle.vx *= 0.9995;
                    particle.vy *= 0.9995;

                    const speed = Math.hypot(particle.vx, particle.vy);
                    if (speed < 0.12) {
                        const angle = Math.random() * Math.PI * 2;
                        particle.vx += Math.cos(angle) * 0.02;
                        particle.vy += Math.sin(angle) * 0.02;
                    }

                    const edgeMargin = particle.size * 0.05;

                    if (particle.x < area.left + edgeMargin) {
                        particle.x = area.left + edgeMargin;
                        particle.vx = Math.abs(particle.vx) * 0.92;
                    }
                    if (particle.y < area.top + edgeMargin) {
                        particle.y = area.top + edgeMargin;
                        particle.vy = Math.abs(particle.vy) * 0.92;
                    }
                    if (particle.x > area.right - particle.size - edgeMargin) {
                        particle.x = area.right - particle.size - edgeMargin;
                        particle.vx = -Math.abs(particle.vx) * 0.92;
                    }
                    if (particle.y > area.bottom - particle.size - edgeMargin) {
                        particle.y = area.bottom - particle.size - edgeMargin;
                        particle.vy = -Math.abs(particle.vy) * 0.92;
                    }

                    const maxSpeed = 0.75;
                    const currentSpeed = Math.hypot(particle.vx, particle.vy);
                    if (currentSpeed > maxSpeed) {
                        const ratio = maxSpeed / currentSpeed;
                        particle.vx *= ratio;
                        particle.vy *= ratio;
                    }
                }

                clampParticleToArea(particle, area);

                particle.el.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0) rotate(${particle.rot}deg)`;
            });

            requestAnimationFrame(tick);
        }

        window.addEventListener('resize', () => {
            const area = getPlayArea();
            const nextBannerSize = getBannerReferenceSize();
            particles.forEach((particle) => {
                applyParticleSize(particle, nextBannerSize);
                clampParticleToArea(particle, area);
            });
        });

        requestAnimationFrame(tick);
    });
}

document.addEventListener('DOMContentLoaded', initErrorPage);
