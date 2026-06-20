(function initCursorTrail() {
    const trail = document.querySelector('.cursor-trail');
    if (!trail) return;

    const root = getComputedStyle(document.documentElement);
    const colorKeys = ['--color-blue', '--color-yellow', '--color-gray'];
    const colors = colorKeys.map((key) => root.getPropertyValue(key).trim());

    const config = () => ({
        fallDistance: parseFloat(root.getPropertyValue('--cursor-dot-fall-distance')) || 100,
        duration: parseFloat(root.getPropertyValue('--cursor-dot-fall-duration')) * 1000 || 800,
        fadeAt: parseFloat(root.getPropertyValue('--cursor-dot-fade-at')) || 0.7,
        interval: parseFloat(root.getPropertyValue('--cursor-dot-spawn-interval')) || 40,
    });

    let lastSpawn = 0;

    function randomColor() {
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function spawnDot(x, y) {
        const { fallDistance, duration, fadeAt } = config();
        const dot = document.createElement('span');
        dot.className = 'cursor-dot';
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
        dot.style.backgroundColor = randomColor();
        dot.style.borderColor = randomColor();
        trail.appendChild(dot);

        const start = performance.now();

        function tick(now) {
            const t = Math.min((now - start) / duration, 1);
            const yOffset = fallDistance * t;
            const opacity = t >= fadeAt ? 0 : 1 - t / fadeAt;

            dot.style.transform = `translate(-50%, calc(-50% + ${yOffset}px))`;
            dot.style.opacity = String(opacity);

            if (t < 1) {
                requestAnimationFrame(tick);
            } else {
                dot.remove();
            }
        }

        requestAnimationFrame(tick);
    }

    document.addEventListener('mousemove', (e) => {
        if (e.target.closest('nav, footer')) return;
    
        const now = performance.now();
        const { interval } = config();
        if (now - lastSpawn < interval) return;
        lastSpawn = now;
        spawnDot(e.clientX, e.clientY);
    });
})();