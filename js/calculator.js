/* ============================================
   CALCULATOR.JS — ROI Калькулятор для инвесторов
   ============================================ */

(function() {
    const calcInputs = {
        stationCost: document.getElementById('calcStationCost'),
        power: document.getElementById('calcPower'),
        connectors: document.getElementById('calcConnectors'),
        price: document.getElementById('calcPrice'),
        avgCharge: document.getElementById('calcAvgCharge'),
        sessions: document.getElementById('calcSessions'),
        opex: document.getElementById('calcOpex')
    };
    
    const calcOutputs = {
        roiYears: document.getElementById('roiYears'),
        monthlyRevenue: document.getElementById('monthlyRevenue'),
        monthlyProfit: document.getElementById('monthlyProfit'),
        annualROI: document.getElementById('annualROI'),
        dailyEnergy: document.getElementById('dailyEnergy')
    };
    
    const roiCircle = document.getElementById('roiCircle');
    const calcBtn = document.getElementById('calcROI');
    
    const CIRCUMFERENCE = 2 * Math.PI * 85; // 534
    
    function calculateROI() {
        const stationCost = parseFloat(calcInputs.stationCost.value) || 0;
        const power = parseFloat(calcInputs.power.value) || 0;
        const connectors = parseFloat(calcInputs.connectors.value) || 0;
        const price = parseFloat(calcInputs.price.value) || 0;
        const avgCharge = parseFloat(calcInputs.avgCharge.value) || 0;
        const sessions = parseFloat(calcInputs.sessions.value) || 0;
        const opex = parseFloat(calcInputs.opex.value) || 0;
        
        // Расчеты
        const dailySessions = sessions * connectors;
        const dailyEnergy = dailySessions * avgCharge;
        const dailyRevenue = dailyEnergy * price;
        const monthlyRevenue = dailyRevenue * 30;
        const monthlyProfit = monthlyRevenue - opex;
        const annualProfit = monthlyProfit * 12;
        
        // Срок окупаемости в годах
        const paybackYears = monthlyProfit > 0 ? stationCost / annualProfit : 0;
        
        // Годовая доходность ROI
        const annualROI = stationCost > 0 ? (annualProfit / stationCost * 100) : 0;
        
        return {
            paybackYears,
            monthlyRevenue,
            monthlyProfit,
            annualROI,
            dailyEnergy
        };
    }
    
    function formatCurrency(value) {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + ' млн ₽';
        } else if (value >= 1000) {
            return Math.round(value).toLocaleString('ru-RU') + ' ₽';
        }
        return Math.round(value) + ' ₽';
    }
    
    function formatPercent(value) {
        return value.toFixed(1) + '%';
    }
    
    function updateROIVisual(paybackYears) {
        if (!roiCircle) return;
        
        // Максимальный срок окупаемости для визуализации = 8 лет
        const maxYears = 8;
        const progress = Math.min(paybackYears / maxYears, 1);
        const offset = CIRCUMFERENCE - (progress * CIRCUMFERENCE);
        
        roiCircle.style.strokeDashoffset = offset;
        
        // Цвет в зависимости от срока
        const svg = roiCircle.closest('svg');
        if (svg) {
            const gradient = svg.querySelector('#roiGradient');
            if (gradient) {
                const stops = gradient.querySelectorAll('stop');
                if (paybackYears <= 3) {
                    stops[0].setAttribute('stop-color', '#00d4ff');
                    stops[1].setAttribute('stop-color', '#10b981');
                } else if (paybackYears <= 5) {
                    stops[0].setAttribute('stop-color', '#f59e0b');
                    stops[1].setAttribute('stop-color', '#f97316');
                } else {
                    stops[0].setAttribute('stop-color', '#ef4444');
                    stops[1].setAttribute('stop-color', '#dc2626');
                }
            }
        }
    }
    
    function runCalculation() {
        // Анимация кнопки
        calcBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Расчёт...</span>';
        calcBtn.disabled = true;
        
        setTimeout(() => {
            const results = calculateROI();
            
            // Обновление значений
            if (results.paybackYears > 0 && results.paybackYears < 50) {
                calcOutputs.roiYears.textContent = results.paybackYears.toFixed(1);
                updateROIVisual(results.paybackYears);
            } else {
                calcOutputs.roiYears.textContent = '—';
                if (roiCircle) roiCircle.style.strokeDashoffset = CIRCUMFERENCE;
            }
            
            calcOutputs.monthlyRevenue.textContent = formatCurrency(results.monthlyRevenue);
            calcOutputs.monthlyProfit.textContent = formatCurrency(results.monthlyProfit);
            calcOutputs.annualROI.textContent = formatPercent(results.annualROI);
            calcOutputs.dailyEnergy.textContent = Math.round(results.dailyEnergy).toLocaleString('ru-RU');
            
            // Цветовая индикация прибыли
            if (results.monthlyProfit < 0) {
                calcOutputs.monthlyProfit.style.color = '#ef4444';
            } else {
                calcOutputs.monthlyProfit.style.color = '#10b981';
            }
            
            // Восстановление кнопки
            calcBtn.innerHTML = '<i class="fas fa-chart-pie"></i><span>Рассчитать ROI</span>';
            calcBtn.disabled = false;
            
            // Анимация появления результатов
            document.querySelectorAll('.detail-card').forEach((card, i) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.4s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, i * 100);
            });
        }, 600);
    }
    
    calcBtn.addEventListener('click', runCalculation);
    
    // Автоматический расчет при изменении значений (с дебаунсом)
    let debounceTimer;
    Object.values(calcInputs).forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(runCalculation, 800);
            });
        }
    });
    
    // Инициализация
    if (roiCircle) {
        roiCircle.style.strokeDasharray = CIRCUMFERENCE;
        roiCircle.style.strokeDashoffset = CIRCUMFERENCE;
    }
    
    // Первоначальный расчет
    setTimeout(runCalculation, 500);
})();
