// Theme Management
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Set dark theme as default if not saved
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);

    // Add rotation animation
    themeToggle.style.transform = 'scale(1.1) rotate(360deg)';
    setTimeout(() => {
        themeToggle.style.transform = '';
    }, 400);
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Currency Converter Logic
const flag = document.querySelectorAll('.flag-img');
const select = document.querySelectorAll('.currency-select');
const amount = document.getElementById('input');
const btn = document.querySelector("#convert");
const resultSection = document.querySelector('.result-section');
const resultContent = document.querySelector('.result-content');
const swapBtn = document.querySelector('#swap-currencies');

let BASE_URL = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/pkr.json`;
let currcode = 'pkr';
let tocurrcode = 'inr';

// Swap currencies function
swapBtn.addEventListener('click', () => {
    // Add animation
    swapBtn.style.transform = 'scale(1.1) rotate(180deg)';
    setTimeout(() => {
        swapBtn.style.transform = '';
    }, 400);

    // Swap the selected values
    const fromSelect = select[0];
    const toSelect = select[1];

    const fromValue = fromSelect.value;
    const toValue = toSelect.value;

    const fromIndex = fromSelect.selectedIndex;
    const toIndex = toSelect.selectedIndex;

    // Swap selections
    fromSelect.selectedIndex = toIndex;
    toSelect.selectedIndex = fromIndex;

    // Update flags and codes
    updateflagandfrom(fromSelect, 0);
    updateflagandfrom(toSelect, 1);

    // Hide result
    resultSection.classList.remove('show');
});

function updateflagandfrom(el, index) {
    const selected = el.options[el.selectedIndex];
    const value = selected.value;
    const code = selected.getAttribute('curcode').toLowerCase();

    // Add flag animation
    flag[index].style.transform = 'scale(0)';
    setTimeout(() => {
        flag[index].src = `https://flagsapi.com/${value}/shiny/64.png`;
        flag[index].style.transform = 'scale(1)';
    }, 150);

    if (index === 0) {
        currcode = code;
        BASE_URL = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${currcode}.json`;
    }

    if (index === 1) {
        tocurrcode = code;
    }
}

// Populate select options
select.forEach((element, index) => {
    for (const key in countryList) {
        const opt = document.createElement("option");
        opt.value = `${countryList[key]}`;
        opt.setAttribute('curcode', `${key}`);
        opt.textContent = `${key}`;
        element.append(opt);
    }

    // Set default selections
    Array.from(element.options).forEach(option => {
        if (option.value === 'PK' && element.closest('.from-currency')) {
            option.selected = true;
        }
        if (option.value === 'IN' && element.closest('.to-currency')) {
            option.selected = true;
        }
    });

    element.addEventListener('change', function () {
        updateflagandfrom(element, index);
        resultSection.classList.remove('show');
    });
});

// Convert button functionality
btn.addEventListener('click', async () => {
    // Add loading state
    btn.classList.add('loading');
    btn.disabled = true;

    try {
        let resp = await fetch(BASE_URL);
        if (!resp.ok) throw new Error('Failed to fetch exchange rates');

        let data = await resp.json();
        getresult(data);

        // Show result with animation
        resultSection.classList.add('show');

    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        resultContent.innerHTML = `
            <div style="color: var(--error-color);">
                <i class="fas fa-exclamation-triangle"></i>
                Error fetching exchange rates. Please try again.
            </div>
        `;
        resultSection.classList.add('show');
    } finally {
        // Remove loading state
        setTimeout(() => {
            btn.classList.remove('loading');
            btn.disabled = false;
        }, 500);
    }
});

function getresult(data) {
    try {
        let rate = data[currcode][tocurrcode];
        const amval = amount.value > 0 ? parseFloat(amount.value) : 1;
        let final = rate * amval;

        resultContent.innerHTML = `
            <div class="conversion-result">
                <div style="font-size: 1.3rem; margin-bottom: 8px;">
                    <span style="color: var(--accent-primary); font-weight: 700;">${amval.toLocaleString()}</span>
                    <span style="color: var(--text-muted);">${currcode.toUpperCase()}</span>
                    <i class="fas fa-arrow-right" style="margin: 0 10px; color: var(--text-muted);"></i>
                    <span style="color: var(--success-color); font-weight: 700;">${final.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span style="color: var(--text-muted);">${tocurrcode.toUpperCase()}</span>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-muted);">
                    1 ${currcode.toUpperCase()} = ${rate.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} ${tocurrcode.toUpperCase()}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error calculating conversion:', error);
        resultContent.innerHTML = `
            <div style="color: var(--error-color);">
                <i class="fas fa-exclamation-triangle"></i>
                Error calculating conversion. Please try again.
            </div>
        `;
    }
}

// Input validation and formatting
amount.addEventListener('input', (e) => {
    const value = e.target.value;
    if (value < 0) {
        e.target.value = 0;
    }

    // Hide result when amount changes
    if (resultSection.classList.contains('show')) {
        resultSection.classList.remove('show');
    }
});

// Enter key support for conversion
amount.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        btn.click();
    }
});

// Auto-focus on amount input
document.addEventListener('DOMContentLoaded', () => {
    amount.focus();
});


