/* ============================================
   MAIN.JS — Основная логика сайта
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // НАВИГАЦИЯ
    // ==========================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Скролл навигации
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        updateActiveNav();
    });
    
    // Мобильное меню
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Закрытие меню при клике на ссылку
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Активная секция в навигации
    function updateActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // ==========================================
    // АНИМИРОВАННЫЕ ЧИСЛА (Counter)
    // ==========================================
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;
    
    function startCounters() {
        if (countersStarted) return;
        countersStarted = true;
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000;
            const startTime = performance.now();
            
            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing: easeOutQuart
                const easeProgress = 1 - Math.pow(1 - progress, 4);
                const current = Math.floor(easeProgress * target);
                
                stat.textContent = current.toLocaleString('ru-RU');
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target.toLocaleString('ru-RU');
                }
            }
            
            requestAnimationFrame(updateCounter);
        });
    }
    
    // Intersection Observer для счетчиков
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounters();
                heroObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    const heroSection = document.getElementById('hero');
    if (heroSection) heroObserver.observe(heroSection);
    
    // ==========================================
    // АНИМАЦИИ ПРИ СКРОЛЛЕ (AOS-like)
    // ==========================================
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    const aosObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-aos-delay') || 0;
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, delay);
                aosObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        aosObserver.observe(el);
    });
    
    // ==========================================
    // ПАРАЛЛАКС ЭФФЕКТ
    // ==========================================
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const parallaxElements = document.querySelectorAll('.orbit-system, .solution-visual');
        
        parallaxElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const speed = 0.05;
                el.style.transform = `translateY(${scrolled * speed}px)`;
            }
        });
    });
    
    // ==========================================
    // ПЛАВНЫЙ СКРОЛЛ ДЛЯ ЯКОРЕЙ
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // ==========================================
    // SVG ГРАДИЕНТ ДЛЯ ROI КАЛЬКУЛЯТОРА
    // ==========================================
    const svgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const linearGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    linearGradient.setAttribute('id', 'roiGradient');
    linearGradient.setAttribute('x1', '0%');
    linearGradient.setAttribute('y1', '0%');
    linearGradient.setAttribute('x2', '100%');
    linearGradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#00d4ff');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#10b981');
    
    linearGradient.appendChild(stop1);
    linearGradient.appendChild(stop2);
    svgDefs.appendChild(linearGradient);
    
    // Добавляем в первый SVG на странице
    const firstSvg = document.querySelector('svg');
    if (firstSvg) {
        firstSvg.insertBefore(svgDefs, firstSvg.firstChild);
    }
    
    // ==========================================
    // TOOLTIP ДЛЯ ОРБИТАЛЬНЫХ НОД
    // ==========================================
    const orbitNodes = document.querySelectorAll('.orbit-node');
    orbitNodes.forEach(node => {
        node.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.3)';
            this.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.5)';
        });
        node.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.2)';
        });
    });
    
    // ==========================================
    // ПОДСВЕТКА КАРТОЧЕК ПРИ НАВЕДЕНИИ
    // ==========================================
    const cards = document.querySelectorAll('.problem-card, .impact-card, .team-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.borderColor = 'rgba(0, 212, 255, 0.3)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.borderColor = '';
        });
    });
    
    // ==========================================
    // КОНСОЛЬНОЕ ПРИВЕТСТВИЕ
    // ==========================================
    console.log('%c⚡ Росатом СЗС — Оптимизация сети зарядных станций', 
        'color: #00d4ff; font-size: 16px; font-weight: bold;');
    console.log('%cBrainstormers · ТашГЭU · 2026', 
        'color: #7c3aed; font-size: 12px;');
});
