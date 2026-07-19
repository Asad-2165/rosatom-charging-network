 ============================================
   PARTICLES.JS — Анимированные сферы и частицы
   ============================================ 

(function() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let spheres = [];
    let animationId;
    let mouse = { x null, y null };
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resize();
    window.addEventListener('resize', resize);
    
    window.addEventListener('mousemove', (e) = {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseleave', () = {
        mouse.x = null;
        mouse.y = null;
    });
    
     Класс сферы (большие плавающие сферы)
    class Sphere {
        constructor() {
            this.x = Math.random()  canvas.width;
            this.y = Math.random()  canvas.height;
            this.radius = Math.random()  80 + 40;
            this.vx = (Math.random() - 0.5)  0.3;
            this.vy = (Math.random() - 0.5)  0.3;
            this.opacity = Math.random()  0.08 + 0.02;
            this.hue = Math.random()  0.5  190  260;  cyan или purple
            this.pulsePhase = Math.random()  Math.PI  2;
            this.pulseSpeed = Math.random()  0.01 + 0.005;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.pulsePhase += this.pulseSpeed;
            
             Отскок от границ
            if (this.x  -this.radius) this.x = canvas.width + this.radius;
            if (this.x  canvas.width + this.radius) this.x = -this.radius;
            if (this.y  -this.radius) this.y = canvas.height + this.radius;
            if (this.y  canvas.height + this.radius) this.y = -this.radius;
            
             Реакция на мышь
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx  dx + dy  dy);
                if (dist  200) {
                    const force = (200 - dist)  200  0.02;
                    this.vx -= dx  force  0.01;
                    this.vy -= dy  force  0.01;
                }
            }
            
             Ограничение скорости
            const speed = Math.sqrt(this.vx  this.vx + this.vy  this.vy);
            if (speed  0.8) {
                this.vx = (this.vx  speed)  0.8;
                this.vy = (this.vy  speed)  0.8;
            }
        }
        
        draw() {
            const pulse = Math.sin(this.pulsePhase)  0.03;
            const currentOpacity = this.opacity + pulse;
            
             Градиент сферы
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.radius
            );
            
            if (this.hue === 190) {
                gradient.addColorStop(0, `rgba(0, 212, 255, ${currentOpacity  2})`);
                gradient.addColorStop(0.5, `rgba(0, 150, 255, ${currentOpacity})`);
                gradient.addColorStop(1, `rgba(0, 100, 200, 0)`);
            } else {
                gradient.addColorStop(0, `rgba(124, 58, 237, ${currentOpacity  2})`);
                gradient.addColorStop(0.5, `rgba(100, 40, 200, ${currentOpacity})`);
                gradient.addColorStop(1, `rgba(80, 30, 180, 0)`);
            }
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI  2);
            ctx.fillStyle = gradient;
            ctx.fill();
            
             Обводка
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius  0.7, 0, Math.PI  2);
            ctx.strokeStyle = `rgba(0, 212, 255, ${currentOpacity  0.3})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    }
    
     Класс частицы (маленькие точки)
    class Particle {
        constructor() {
            this.x = Math.random()  canvas.width;
            this.y = Math.random()  canvas.height;
            this.size = Math.random()  2 + 0.5;
            this.vx = (Math.random() - 0.5)  0.5;
            this.vy = (Math.random() - 0.5)  0.5;
            this.opacity = Math.random()  0.5 + 0.2;
            this.hue = Math.random()  60 + 180;  от cyan до purple
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x  0) this.x = canvas.width;
            if (this.x  canvas.width) this.x = 0;
            if (this.y  0) this.y = canvas.height;
            if (this.y  canvas.height) this.y = 0;
            
             Реакция на мышь
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx  dx + dy  dy);
                if (dist  150) {
                    const angle = Math.atan2(dy, dx);
                    const force = (150 - dist)  150;
                    this.vx -= Math.cos(angle)  force  0.3;
                    this.vy -= Math.sin(angle)  force  0.3;
                }
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI  2);
            ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${this.opacity})`;
            ctx.fill();
        }
    }
    
     Соединения между частицами
    function drawConnections() {
        const maxDist = 120;
        const maxConnections = 3;
        
        for (let i = 0; i  particles.length; i++) {
            let connections = 0;
            for (let j = i + 1; j  particles.length; j++) {
                if (connections = maxConnections) break;
                
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx  dx + dy  dy);
                
                if (dist  maxDist) {
                    const opacity = (1 - dist  maxDist)  0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                    connections++;
                }
            }
        }
    }
    
     Инициализация
    function init() {
        particles = [];
        spheres = [];
        
        const sphereCount = Math.min(6, Math.floor(canvas.width  250));
        for (let i = 0; i  sphereCount; i++) {
            spheres.push(new Sphere());
        }
        
        const particleCount = Math.min(80, Math.floor(canvas.width  15));
        for (let i = 0; i  particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
     Анимационный цикл
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
         Рисуем сферы (на заднем плане)
        spheres.forEach(sphere = {
            sphere.update();
            sphere.draw();
        });
        
         Рисуем соединения
        drawConnections();
        
         Рисуем частицы
        particles.forEach(particle = {
            particle.update();
            particle.draw();
        });
        
        animationId = requestAnimationFrame(animate);
    }
    
    init();
    animate();
    
     Переинициализация при ресайзе
    let resizeTimeout;
    window.addEventListener('resize', () = {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() = {
            resize();
            init();
        }, 250);
    });
})();
