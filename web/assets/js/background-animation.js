/**
 * Ruya Agency - Interactive Background Canvas Animation
 * Responds dynamically to mouse movements, velocity, and hovering.
 * Brand colors: Electric Blue (#2534C8), Vivid Pink (#FF5CA8), Vibrant Gold (#FFB703)
 */

(function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const colorPalette = [
        { r: 37, g: 52, b: 200 },    // Ruya Blue
        { r: 255, g: 92, b: 168 },   // Ruya Pink
        { r: 255, g: 183, b: 3 },    // Ruya Gold / Yellow
        { r: 88, g: 101, b: 242 }    // Soft Indigo
    ];

    const mouse = {
        x: null,
        y: null,
        targetX: null,
        targetY: null,
        radius: 180,
        isMoving: false,
        lastMoved: 0
    };

    // Glow follower element
    const cursorGlow = document.getElementById('cursor-glow');

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.baseSize = Math.random() * 2.8 + 1.2;
            this.size = this.baseSize;
            this.color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.alpha = Math.random() * 0.6 + 0.25;
            this.angle = Math.random() * Math.PI * 2;
            this.angleSpeed = (Math.random() - 0.5) * 0.02;
            this.pulseSpeed = Math.random() * 0.03 + 0.01;
            this.pulse = 0;
        }

        update() {
            // Pulse size & alpha
            this.pulse += this.pulseSpeed;
            const sizePulse = Math.sin(this.pulse) * 0.5;
            this.size = Math.max(0.5, this.baseSize + sizePulse);

            // Natural ambient drifting
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges smoothly
            if (this.x < 0) { this.x = 0; this.vx *= -1; }
            if (this.x > width) { this.x = width; this.vx *= -1; }
            if (this.y < 0) { this.y = 0; this.vy *= -1; }
            if (this.y > height) { this.y = height; this.vy *= -1; }

            // Mouse interaction (Repulsion + Swirl)
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.hypot(dx, dy);

                if (dist < mouse.radius) {
                    const force = (1 - dist / mouse.radius);
                    const angle = Math.atan2(dy, dx);
                    
                    // Push away gently
                    const pushX = Math.cos(angle) * force * 4.5;
                    const pushY = Math.sin(angle) * force * 4.5;

                    // Add subtle vortex / swirl tangent
                    const swirlX = -Math.sin(angle) * force * 2.0;
                    const swirlY = Math.cos(angle) * force * 2.0;

                    this.x -= (pushX + swirlX);
                    this.y -= (pushY + swirlY);

                    // Glow increase on proximity
                    this.alpha = Math.min(1, 0.4 + force * 0.6);
                } else {
                    this.alpha = Math.max(0.2, this.alpha - 0.01);
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.6)`;
            ctx.fill();
            ctx.shadowBlur = 0; // Reset
        }
    }

    function initParticles() {
        particles = [];
        const isMobile = window.innerWidth < 768;
        // Calibrate density for optimal 60fps rendering on both mobile, tablet, and desktop
        const divisor = isMobile ? 16000 : 11000;
        const maxCount = isMobile ? 50 : 120;
        const count = Math.min(maxCount, Math.max(25, Math.floor((width * height) / divisor)));
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        const isMobile = window.innerWidth < 768;
        const maxDist = isMobile ? 95 : 135;
        const count = particles.length;

        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                const p1 = particles[i];
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.hypot(dx, dy);

                if (dist < maxDist) {
                    const factor = 1 - dist / maxDist;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);

                    // Gradient link between two particle colors
                    const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                    grad.addColorStop(0, `rgba(${p1.color.r}, ${p1.color.g}, ${p1.color.b}, ${factor * 0.28})`);
                    grad.addColorStop(1, `rgba(${p2.color.r}, ${p2.color.g}, ${p2.color.b}, ${factor * 0.28})`);

                    ctx.strokeStyle = grad;
                    ctx.lineWidth = factor * 1.3;
                    ctx.stroke();
                }
            }

            // Also draw interactive beams connecting to the mouse
            if (mouse.x !== null && mouse.y !== null) {
                const mdx = mouse.x - particles[i].x;
                const mdy = mouse.y - particles[i].y;
                const mDist = Math.hypot(mdx, mdy);
                if (mDist < mouse.radius * 0.9) {
                    const mFactor = 1 - mDist / (mouse.radius * 0.9);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(${particles[i].color.r}, ${particles[i].color.g}, ${particles[i].color.b}, ${mFactor * 0.4})`;
                    ctx.lineWidth = mFactor * 1.6;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Smooth mouse interpolation
        if (mouse.targetX !== null && mouse.targetY !== null) {
            if (mouse.x === null) {
                mouse.x = mouse.targetX;
                mouse.y = mouse.targetY;
            } else {
                mouse.x += (mouse.targetX - mouse.x) * 0.12;
                mouse.y += (mouse.targetY - mouse.y) * 0.12;
            }
        }

        // Draw connecting constellation lines
        drawConnections();

        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        requestAnimationFrame(animate);
    }

    // Event Listeners for Mouse and Touch
    window.addEventListener('mousemove', (e) => {
        mouse.targetX = e.clientX;
        mouse.targetY = e.clientY;
        mouse.isMoving = true;
        mouse.lastMoved = Date.now();

        if (cursorGlow) {
            cursorGlow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            cursorGlow.style.opacity = '1';
        }
    });

    window.addEventListener('mouseleave', () => {
        mouse.targetX = null;
        mouse.targetY = null;
        mouse.x = null;
        mouse.y = null;
        if (cursorGlow) cursorGlow.style.opacity = '0';
    });

    // Touch support for mobile phones and tablets
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            mouse.targetX = e.touches[0].clientX;
            mouse.targetY = e.touches[0].clientY;
            mouse.isMoving = true;
            if (cursorGlow) {
                cursorGlow.style.transform = `translate3d(${mouse.targetX}px, ${mouse.targetY}px, 0)`;
                cursorGlow.style.opacity = '0.8';
            }
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouse.targetX = e.touches[0].clientX;
            mouse.targetY = e.touches[0].clientY;
            if (cursorGlow) {
                cursorGlow.style.transform = `translate3d(${mouse.targetX}px, ${mouse.targetY}px, 0)`;
                cursorGlow.style.opacity = '0.8';
            }
        }
    }, { passive: true });

    window.addEventListener('touchend', () => {
        mouse.targetX = null;
        mouse.targetY = null;
        if (cursorGlow) cursorGlow.style.opacity = '0';
    });

    window.addEventListener('resize', resize);

    // Initialize
    resize();
    animate();
})();

