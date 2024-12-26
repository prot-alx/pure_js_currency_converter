// Конфигурация API
const API_KEY = 'ead5e2b0ac7b41dda384c59426485f48';
const API_URL = 'https://api.currencyfreaks.com/v2.0/rates/latest';
const ALLOWED_CURRENCIES = ['USD', 'EUR', 'KZT', 'RUB'];

// DOM элементы
const elements = {
    sections: {
        converter: document.getElementById('converter'),
        rates: document.getElementById('rates')
    },
    baseCurrencySelector: document.getElementById('baseCurrencySelector'),
    targetCurrencySelector: document.getElementById('targetCurrencySelector'),
    baseCurrencyAmount: document.getElementById('baseCurrencyAmount'),
    result: document.getElementById('result'),
    ratesList: document.getElementById('rates')
};

// Хранилище данных
const state = {
    currencies: null,
    lastUpdate: null
};

// API методы
const api = {
    async fetchCurrencies() {
        try {
            const response = await fetch(`${API_URL}?apikey=${API_KEY}`);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const data = await response.json();
            state.currencies = data;
            state.lastUpdate = new Date();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};

// Функции конвертера
const converter = {
    // Заполнение селекторов валют
    initSelectors() {        
        [elements.baseCurrencySelector, elements.targetCurrencySelector].forEach(selector => {
            selector.innerHTML = ''; // очищаем селектор
            ALLOWED_CURRENCIES.forEach(currency => {
                const option = document.createElement('option');
                option.value = currency;
                option.textContent = currency;
                selector.appendChild(option);
            });
        });

        // Устанавливаем базовые значения
        elements.baseCurrencySelector.value = 'USD';
        elements.targetCurrencySelector.value = 'RUB';
    },

    // Конвертация валют
    convert() {
        const amount = parseFloat(elements.baseCurrencyAmount.value);
        const fromCurrency = elements.baseCurrencySelector.value;
        const toCurrency = elements.targetCurrencySelector.value;
        
        if (isNaN(amount)) {
            elements.result.textContent = 'Введите число';
            return;
        }

        const fromRate = state.currencies.rates[fromCurrency];
        const toRate = state.currencies.rates[toCurrency];
        const result = amount * (toRate / fromRate);

        elements.result.textContent = `${result.toFixed(2)} ${toCurrency}`;
    }
};

// Функции для страницы курсов
const rates = {
    displayRates() {
        if (!state.currencies) return;

        const baseCurrency = elements.baseCurrencySelector.value;
        const baseRate = state.currencies.rates[baseCurrency];
        
        let html = `
            <h3>Курсы относительно ${baseCurrency}</h3>
            <table class="rates-table">
                <tr>
                    <th>Валюта</th>
                    <th>Курс</th>
                </tr>
        `;

        ALLOWED_CURRENCIES.forEach(currency => {
            if (currency !== baseCurrency) {
                const rate = state.currencies.rates[currency];
                const crossRate = rate / baseRate;
                html += `
                    <tr>
                        <td>${currency}</td>
                        <td>${crossRate.toFixed(4)}</td>
                    </tr>
                `;
            }
        });

        html += '</table>';
        elements.ratesList.innerHTML = html;
    }
};

// Роутер для навигации
const router = {
    navigate(hash) {
        const page = hash.slice(1) || 'converter';
        
        // Скрываем все секции
        Object.values(elements.sections).forEach(section => {
            section.style.display = 'none';
        });
        
        // Показываем нужную секцию
        const currentSection = elements.sections[page];
        if (currentSection) {
            currentSection.style.display = 'block';
            
            // Если открыта страница курсов, обновляем их
            if (page === 'rates') {
                rates.displayRates();
            }
        }
    }
};

// Инициализация приложения
async function initApp() {
    try {
        // Загружаем курсы валют
        const data = await api.fetchCurrencies();
        
        // Инициализируем селекторы
        converter.initSelectors(data);
        
        // Устанавливаем обработчики событий
        elements.baseCurrencyAmount.addEventListener('input', () => converter.convert());
        elements.baseCurrencySelector.addEventListener('change', () => {
            converter.convert();
            rates.displayRates();
        });
        elements.targetCurrencySelector.addEventListener('change', () => converter.convert());
        
        // Обработчик изменения hash в URL
        window.addEventListener('hashchange', () => {
            router.navigate(window.location.hash);
        });
        
        // Первоначальная навигация
        router.navigate(window.location.hash);
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
}

// Запускаем приложение при загрузке страницы
document.addEventListener('DOMContentLoaded', initApp);