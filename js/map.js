/* ============================================
   MAP.JS — Интерактивная карта приоритетных локаций
   ============================================ */

(function() {
    const canvas = document.getElementById('mapCanvas');
    const mapInfo = document.getElementById('mapInfo');
    const filterBtns = document.querySelectorAll('.map-filter');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let points = [];
    let hoveredPoint = null;
    let currentFilter = 'all';
    let animationProgress = 0;
    let animationId;
    
    // Генерация точек на карте
    function generatePoints() {
        points = [];
        const count = 60;
        
        // Существующие станции (синие)
        for (let i = 0; i < 15; i++) {
            points.push({
                x: 0.1 + Math.random() * 0.8,
                y: 0.1 + Math.random() * 0.8,
                type: 'existing',
                priority: 'existing',
                name: 'Существующая станция #' + (i + 1),
                load: Math.round(20 + Math.random() * 40),
                power: [50, 75, 100, 150][Math.floor(Math.random() * 4)],
                connectors: Math.floor(Math.random() * 4) + 1
            });
        }
        
        // Новые точки с приоритетами
        const priorities = ['high', 'high', 'high', 'medium', 'medium', 'low'];
        const locationNames = [
            'ТЦ Европейский', 'МКАД 65 км', 'Бизнес-парк Румянцево', 'ЖК Мосфильмовский',
            'ТЦ Авиапарк', 'Шоссе Энтузиастов', 'БЦ Москва-Сити', 'ЖК Зиларт',
            'ТЦ Мега Химки', 'Ленинградское шоссе', 'БЦ Белые Сады', 'ЖК Фили Град',
            'ТЦ Галерея', 'КАД 15 км', 'БЦ Невский 68', 'ЖК Лондон Парк',
            'ТЦ Гринвич', 'ЕКАД 25 км', 'БЦ Саммит', 'ЖК Академический',
            'ТЦ Моремолл', 'Адлерское шоссе', 'БЦ Сочи-Парк', 'ЖК Актер Гэлакси',
            'ТЦ Парк Хаус', 'М7 120 км', 'БЦ Сулейманов', 'ЖК Салават Купере',
            'ТЦ XL', 'Проспект Победы', 'БЦ Татнефть-Арена', 'ЖК Новое Караваево',
            'ТЦ Лето', 'Пулковское шоссе', 'БЦ Василеостровский', 'ЖК Огни залива',
            'ТЦ Мега', 'Московский тракт', 'БЦ Палладиум', 'ЖК Ботаника',
            'ТЦ Новый век', 'Курортный проспект', 'БЦ Сириус', 'ЖК Мадрид Парк'
        ];
        
        for (let i = 0; i < count; i++) {
            const priority = priorities[Math.floor(Math.random() * priorities.length)];
            const name = locationNames[i % locationNames.length] + (i >= locationNames.length ? ' #' + (i + 1) : '');
            
            points.push({
                x: 0.05 + Math.random() * 0.9,
                y: 0.05 + Math.random() * 0.9,
                type: 'new',
                priority: priority,
                name: name,
                score: priority === 'high' ? Math.round(75 + Math.random() * 20) : 
                       priority === 'medium' ? Math.round(50 + Math.random() * 25) :
                       Math.round(25 + Math.random() * 25),
                load: Math.round(40 + Math.random() * 50),
                power: [50, 75, 100, 150, 200][Math.floor(Math.random() * 5)],
                connectors: Math.floor(Math.random() * 6) + 2,
                revenue: Math.round(150000 + Math.random() * 400000)
            });
        }
    }
    
    // Цвета по приоритету
    function getPointColor(point) {
        if (point.type === 'existing') return '#00d4ff';
        switch (point.priority) {
            case 'high': return '#10b981';
            case 'medium': return '#f59e0b';
            case 'low': return '#ef4444';
            default: return '#94a3b8';
        }
    }
    
    function getPointRadius(point) {
        const base = point.type === 'existing' ? 5 : 7;
        return base * animationProgress;
    }
    
    // Рисование карты
    function drawMap() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        const width = rect.width;
        const height = rect.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // Фон карты — сетка
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.03)';
        ctx.lineWidth = 1;
        
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Рисуем "дороги" — линии между некоторыми точками
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.05)';
        ctx.lineWidth = 2;
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const dx = points[i].x - points[j].x;
                const dy = points[i].y - points[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 0.15) {
                    ctx.beginPath();
                    ctx.moveTo(points[i].x * width, points[i].y * height);
                    ctx.lineTo(points[j].x * width, points[j].y * height);
                    ctx.stroke();
                }
            }
        }
        
        // Рисуем точки
        points.forEach(point => {
            // Фильтрация
            if (currentFilter !== 'all' && point.priority !== currentFilter && !(currentFilter === 'all' && point.type === 'existing')) {
                if (currentFilter === 'existing' && point.type !== 'existing') return;
                if (currentFilter !== 'existing' && point.type === 'existing') return;
                if (currentFilter !== 'existing' && point.priority !== currentFilter) return;
            }
            
            const px = point.x * width;
            const py = point.y * height;
            const color = getPointColor(point);
            const radius = getPointRadius(point);
            
            // Свечение
            if (point === hoveredPoint || point.priority === 'high') {
                const glowRadius = radius * 3;
                const gradient = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
                gradient.addColorStop(0, color + '40');
                gradient.addColorStop(1, color + '00');
                ctx.beginPath();
                ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }
            
            // Пульсация для high priority
            if (point.priority === 'high' && point.type === 'new') {
                const pulseRadius = radius * (2 + Math.sin(Date.now() / 1000 + point.x * 10) * 0.5);
                ctx.beginPath();
                ctx.arc(px, py, pulseRadius, 0, Math.PI * 2);
                ctx.strokeStyle = color + '30';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            // Точка
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            
            // Обводка
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            // Метка для hovered
            if (point === hoveredPoint) {
                ctx.beginPath();
                ctx.arc(px, py, radius + 4, 0, Math.PI * 2);
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
    }
    
    // Обработка движения мыши
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        let closest = null;
        let closestDist = Infinity;
        
        points.forEach(point => {
            const dx = point.x - x;
            const dy = point.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 0.03 && dist < closestDist) {
                closest = point;
                closestDist = dist;
            }
        });
        
        hoveredPoint = closest;
        
        if (hoveredPoint) {
            canvas.style.cursor = 'pointer';
            const color = getPointColor(hoveredPoint);
            const typeLabel = hoveredPoint.type === 'existing' ? 'Существующая станция' : 
                             hoveredPoint.priority === 'high' ? 'Высокий приоритет' :
                             hoveredPoint.priority === 'medium' ? 'Средний приоритет' : 'Низкий приоритет';
            
            mapInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                    <span style="width: 12px; height: 12px; border-radius: 50%; background: ${color}; display: inline-block; box-shadow: 0 0 8px ${color};"></span>
                    <strong style="color: var(--text-primary);">${hoveredPoint.name}</strong>
                    <span style="font-size: 0.75rem; color: var(--text-muted); padding: 0.125rem 0.5rem; background: var(--glass-bg); border-radius: 4px;">${typeLabel}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; font-size: 0.8rem; color: var(--text-secondary);">
                    <div><i class="fas fa-battery-three-quarters" style="color: var(--accent-cyan); margin-right: 0.25rem;"></i> ${hoveredPoint.load || hoveredPoint.score}% загрузка</div>
                    <div><i class="fas fa-bolt" style="color: var(--accent-cyan); margin-right: 0.25rem;"></i> ${hoveredPoint.power} кВт</div>
                    <div><i class="fas fa-plug" style="color: var(--accent-cyan); margin-right: 0.25rem;"></i> ${hoveredPoint.connectors} коннектора</div>
                    ${hoveredPoint.revenue ? `<div><i class="fas fa-ruble-sign" style="color: var(--accent-cyan); margin-right: 0.25rem;"></i> ${hoveredPoint.revenue.toLocaleString('ru-RU')} ₽/мес</div>` : ''}
                </div>
            `;
        } else {
            canvas.style.cursor = 'crosshair';
            mapInfo.innerHTML = '<p class="map-hint">Наведите на точку для деталей</p>';
        }
    });
    
    canvas.addEventListener('mouseleave', () => {
        hoveredPoint = null;
        mapInfo.innerHTML = '<p class="map-hint">Наведите на точку для деталей</p>';
    });
    
    // Фильтры
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
        });
    });
    
    // Анимация появления точек
    function animateEntrance() {
        if (animationProgress < 1) {
            animationProgress += 0.02;
            if (animationProgress > 1) animationProgress = 1;
        }
        drawMap();
        animationId = requestAnimationFrame(animateEntrance);
    }
    
    // Инициализация
    function init() {
        generatePoints();
        animateEntrance();
    }
    
    // Перерисовка при ресайзе
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(drawMap, 250);
    });
    
    // Запускаем когда секция видна
    const mapSection = document.getElementById('map');
    if (mapSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && animationProgress === 0) {
                    init();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        observer.observe(mapSection);
    } else {
        init();
    }
})();
