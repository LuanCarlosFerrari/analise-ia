// Função para atualizar as variáveis CSS de viewport
function updateViewportProperties() {
    // Obtém as dimensões reais da viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    // Calcula o aspect ratio
    const aspectRatio = vw / vh;
    
    // Atualiza as variáveis CSS
    document.documentElement.style.setProperty('--vw', vw);
    document.documentElement.style.setProperty('--vh', vh);
    document.documentElement.style.setProperty('--aspect-ratio', aspectRatio);
}

// Função debounce para melhor performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Atualiza quando a página carrega
window.addEventListener('load', updateViewportProperties);

// Atualiza quando a janela é redimensionada (com debounce)
window.addEventListener('resize', debounce(updateViewportProperties, 250));

// Atualiza quando a orientação muda (para dispositivos móveis)
window.addEventListener('orientationchange', updateViewportProperties);