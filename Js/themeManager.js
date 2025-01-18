export function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    if (!themeToggle) {
        console.error('Theme toggle button not found');
        return;
    }

    let currentTheme;
    try {
        currentTheme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch (e) {
        console.warn('Could not access localStorage:', e);
        currentTheme = 'light';
    }
    
    const applyTheme = (theme) => {
        html.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            console.warn('Could not save theme preference:', e);
        }
    };

    applyTheme(currentTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });
}

export function updateThemeIcon(theme) {
    const iconElement = document.querySelector('.theme-toggle-icon');
    if (iconElement) {
        iconElement.textContent = theme === 'dark' ? '🌜' : '🌞';
    }
}