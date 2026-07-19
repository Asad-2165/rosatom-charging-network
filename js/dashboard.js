/* ============================================
   DASHBOARD.JS — Интерактивный дашборд модели
   ============================================ */

(function() {
    // Данные по регионам
    const regionData = {
        moscow: {
            name: 'Москва',
            density: 1.0,
            trafficMultiplier: 1.0,
            powerCost: 1.0,
            avgSessions: 8,
            evGrowth: 0.68
        },
        spb: {
            name: 'Санкт-Петербург',
            density: 0.75,
            trafficMultiplier: 0.8,
            powerCost: 0.9,
            avgSessions: 7,
            evGrowth: 0.45
        },
        ekb: {
            name: 'Екатеринбург',
            density: 0.5,
            trafficMultiplier: 0.6,
            powerCost: 0.8,
            avgSessions: 6,
            evGrowth: 0.35
        },
        sochi: {
            name: 'Сочи',
            density: 0.4,
            trafficMultiplier: 0.7,
            powerCost: 1.1,
            avgSessions: 9,
            evGrowth: 0.25
        },
        kazan: {
            name: 'Казань',
            density: 0.55,
            trafficMultiplier: 0.65,
            powerCost: 0.85,
            avgSessions: 6,
            evGrowth: 0.30
        }
    };
    
    // Типы локаций
    const locationTypes = {
        all: { multiplier: 1.0, name: 'Все' },
        tc: { multiplier: 0.85, name: 'ТЦ' },
        highway: { multiplier: 1.15, name: 'Магистрали' },
        business: { multiplier: 1.0, name: 'Бизнес-кластеры' },
        residential: { multiplier: 0.75, name: 'Жилые районы' }
    };
    
    // Генерация топа локаций
    const locationNames = {
        moscow: ['ТЦ Европейский', 'МКАД 65 км', 'Бизнес-парк Румянцево', 'ЖК Мосфильмовский', 
                 'ТЦ Авиапарк', 'Шоссе Энтузиастов', 'БЦ Москва-Сити', 'ЖК Зиларт',
                 'ТЦ Мега Химки', 'Ленинградское шоссе', 'БЦ Белые Сады', 'ЖК Фили Град'],
        spb: ['ТЦ Галерея', 'КАД 15 км', 'БЦ Невский 68', 'ЖК Лондон Парк',
              'ТЦ Лето', 'Пулковское шоссе', 'БЦ Василеостровский', 'ЖК Огни залива'],
        ekb: ['ТЦ Гринвич', 'ЕКАД 25 км', 'БЦ Саммит', 'ЖК Академический',
              'ТЦ Мега', 'Московский тракт', 'БЦ Палладиум', 'ЖК Ботаника'],
        sochi: ['ТЦ Моремолл', 'Адлерское шоссе', 'БЦ Сочи-Парк', 'ЖК Актер Гэлакси',
                'ТЦ Новый век', 'Курортный проспект', 'БЦ Сириус', 'ЖК Мадрид Парк'],
        kazan: ['ТЦ Парк Хаус', 'М7 120 км', 'БЦ Сулейманов', 'ЖК Салават Купере',
                'ТЦ XL', 'Проспект Победы', 'БЦ Татнефть-Арена', 'ЖК Новое Караваево']
    };
    
    // DOM элементы
    const regionSelect = document.getElementById('regionSelect');
    const powerRange = document.getElementById('powerRange');
    const powerValue = document.getElementById('powerValue');
    const forecastRange = document.getElementById('forecastRange');
    const forecastValue = document.getElementById('forecastValue');
    const connectorsRange = document.getElementById('connectorsRange');
    const connectorsValue = document.getElementById('connectorsValue');
    const runModelBtn = document.getElementById('runModel');
    const chipBtns = document.querySelectorAll('.chip');
    
    let selectedType = 'all';
    let loadChartInstance = null;
    
    // Обновление значений слайдеров
    powerRange.addEventListener('input', () => {
        powerValue.textContent = powerRange.value;
    });
    
    forecastRange.addEventListener('input', () => {
        forecastValue.textContent = forecastRange.value;
    });
    
    connectorsRange.addEventListener('input', () => {
        connectorsValue.textContent = connectorsRange.value;
    });
    
    // Чипы типов локаций
    chipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            chipBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedType = btn.getAttribute('data-type');
        });
    });
    
    // Расчет модели
    function calculateModel() {
        const region = regionData[regionSelect.value];
        const power = parseInt(powerRange.value);
        const forecast = parseInt(forecastRange.value);
        const connectors = parseInt(connectorsRange.value);
        const locType = locationTypes[selectedType];
        
        // Базовые расчеты
        const baseLoad = region.density * locType.multiplier * region.trafficMultiplier;
        const powerFactor = Math.min(power / 150, 1.5);
        const forecastFactor = 1 + (region.evGrowth * forecast * 0.5);
        const connectorFactor = Math.min(connectors / 4, 1.3);
        
        // Прогноз загрузки (0-100%)
        const predictedLoad = Math.min(Math.round(baseLoad * powerFactor * forecastFactor * connectorFactor * 100), 95);
        
        // Выручка в месяц
        const sessionsPerDay = region.avgSessions * connectors * locType.multiplier;
        const avgCharge = 35; // кВт·ч
        const pricePerKwh = 18; // руб
        const dailyRevenue = sessionsPerDay * avgCharge * pricePerKwh;
        const monthlyRevenue = Math.round(dailyRevenue * 30);
        
        // Срок окупаемости
        const stationCost = 3500000 * (power / 150) * (connectors / 4);
        const monthlyOpex = 85000 + (power * 50);
        const monthlyProfit = monthlyRevenue - monthlyOpex;
        const paybackMonths = monthlyProfit > 0 ? Math.round(stationCost / monthlyProfit) : 0;
        const paybackYears = paybackMonths > 0 ? (paybackMonths / 12).toFixed(1) : '—';
        
        // Оценка локации (0-100)
        const locationScore = Math.min(Math.round(predictedLoad * 0.4 + (100 - paybackMonths / 12 * 10) * 0.3 + powerFactor * 20 * 0.3), 100);
        
        return {
            predictedLoad,
            monthlyRevenue,
            paybackYears,
            locationScore,
            sessionsPerDay,
            monthlyProfit
        };
    }
    
    // Генерация данных для графика загрузки по часам
    function generateHourlyData(predictedLoad) {
        const hours = [];
        const loads = [];
        
        for (let h = 0; h < 24; h++) {
            hours.push(h + ':00');
            
            // Создаем реалистичный профиль загрузки
            let baseLoad;
            if (h >= 0 && h < 6) baseLoad = 0.15; // Ночь
            else if (h >= 6 && h < 9) baseLoad = 0.45; // Утренний пик
            else if (h >= 9 && h < 12) baseLoad = 0.35; // Рабочее время
            else if (h >= 12 && h < 14) baseLoad = 0.6; // Обеденный пик
            else if (h >= 14 && h < 17) baseLoad = 0.4; // Рабочее время
            else if (h >= 17 && h < 20) baseLoad = 0.85; // Вечерний пик
            else if (h >= 20 && h < 23) baseLoad = 0.55; // Вечер
            else baseLoad = 0.3; // Поздний вечер
            
            // Добавляем случайность
            const noise = (Math.random() - 0.5) * 0.1;
            const load = Math.min(Math.round((baseLoad + noise) * predictedLoad), 100);
            loads.push(load);
        }
        
        return { hours, loads };
    }
    
    // Рисование графика загрузки
    function drawLoadChart(hours, loads) {
        const canvas = document.getElementById('loadChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        const width = rect.width;
        const height = rect.height;
        const padding = { top: 20, right: 20, bottom: 40, left: 40 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        ctx.clearRect(0, 0, width, height);
        
        // Фон сетки
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        
        // Горизонтальные линии
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            
            // Подписи по Y
            ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
            ctx.font = '10px Inter';
            ctx.textAlign = 'right';
            ctx.fillText((100 - i * 20) + '%', padding.left - 8, y + 3);
        }
        
        // Градиент для столбцов
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(124, 58, 237, 0.3)');
        
        const barWidth = chartWidth / loads.length * 0.7;
        const barSpacing = chartWidth / loads.length;
        
        // Рисуем столбцы
        loads.forEach((load, i) => {
            const x = padding.left + i * barSpacing + (barSpacing - barWidth) / 2;
            const barHeight = (load / 100) * chartHeight;
            const y = padding.top + chartHeight - barHeight;
            
            // Столбец
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Подсветка верха
            ctx.fillStyle = 'rgba(0, 212, 255, 0.6)';
            ctx.fillRect(x, y, barWidth, 2);
            
            // Подписи по X (каждые 3 часа)
            if (i % 3 === 0) {
                ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
                ctx.font = '10px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(hours[i], x + barWidth / 2, height - padding.bottom + 15);
            }
        });
        
        // Линия средней загрузки
        const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
        const avgY = padding.top + chartHeight - (avgLoad / 100) * chartHeight;
        
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(244, 114, 182, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(padding.left, avgY);
        ctx.lineTo(width - padding.right, avgY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Подпись средней линии
        ctx.fillStyle = 'rgba(244, 114, 182, 0.8)';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'right';
        ctx.fillText('Средн: ' + Math.round(avgLoad) + '%', width - padding.right, avgY - 5);
    }
    
    // Генерация топа локаций
    function generateTopLocations(regionKey, count = 8) {
        const names = locationNames[regionKey] || locationNames.moscow;
        const locations = [];
        
        for (let i = 0; i < Math.min(count, names.length); i++) {
            const score = Math.round(95 - i * 8 + Math.random() * 5);
            const load = Math.round(score * 0.7 + Math.random() * 10);
            const distance = Math.round(0.5 + Math.random() * 15);
            
            locations.push({
                name: names[i],
                score,
                load,
                distance
            });
        }
        
        return locations.sort((a, b) => b.score - a.score);
    }
    
    // Отображение локаций
    function renderLocations(locations) {
        const container = document.getElementById('locationsList');
        if (!container) return;
        
        let html = '';
        locations.forEach((loc, i) => {
            const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            html += `
                <div class="location-item" data-index="${i}">
                    <span class="location-rank ${rankClass}">${i + 1}</span>
                    <span class="location-score">${loc.score}</span>
                    <div class="location-name">${loc.name}</div>
                    <div class="location-meta">
                        <span><i class="fas fa-battery-three-quarters"></i> ${loc.load}% загрузка</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${loc.distance} км</span>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // Запуск модели
    runModelBtn.addEventListener('click', () => {
        // Анимация кнопки
        runModelBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Расчёт...</span>';
        runModelBtn.disabled = true;
        
        setTimeout(() => {
            const results = calculateModel();
            
            // Обновление результатов с анимацией
            animateValue('predictedLoad', results.predictedLoad + '%');
            animateValue('predictedRevenue', formatNumber(results.monthlyRevenue) + ' ₽');
            animateValue('predictedPayback', results.paybackYears + ' лет');
            animateValue('locationScore', results.locationScore + '/100');
            
            // График
            const chartData = generateHourlyData(results.predictedLoad);
            drawLoadChart(chartData.hours, chartData.loads);
            
            // Топ локаций
            const locations = generateTopLocations(regionSelect.value);
            renderLocations(locations);
            
            // Восстановление кнопки
            runModelBtn.innerHTML = '<i class="fas fa-play"></i><span>Запустить расчёт</span>';
            runModelBtn.disabled = false;
        }, 800);
    });
    
    // Анимация значений
    function animateValue(id, finalValue) {
        const el = document.getElementById(id);
        if (!el) return;
        
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            el.textContent = finalValue;
            el.style.transition = 'all 0.4s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 200);
    }
    
    // Форматирование чисел
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    
    // Инициализация графика при загрузке
    window.addEventListener('load', () => {
        setTimeout(() => {
            const chartData = generateHourlyData(45);
            drawLoadChart(chartData.hours, chartData.loads);
        }, 500);
    });
    
    // Перерисовка графика при ресайзе
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const currentLoad = document.getElementById('predictedLoad');
            const loadValue = currentLoad && currentLoad.textContent !== '—' 
                ? parseInt(currentLoad.textContent) 
                : 45;
            const chartData = generateHourlyData(loadValue);
            drawLoadChart(chartData.hours, chartData.loads);
        }, 250);
    });
})();
