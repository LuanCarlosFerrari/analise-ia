export function initLanguageToggle() {
    const languageToggle = document.getElementById('languageToggle');
    
    if (!languageToggle) {
        console.error('Language toggle button not found');
        return;
    }

    let currentLang = localStorage.getItem('selectedLanguage') || 'pt';
    updateLanguageIcon(currentLang);

    // Cria o elemento div para o Google Translate
    const translateDiv = document.createElement('div');
    translateDiv.id = 'google_translate_element';
    translateDiv.style.display = 'none';
    document.body.appendChild(translateDiv);

    // Adiciona o script do Google Translate
    const googleTranslateScript = document.createElement('script');
    googleTranslateScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(googleTranslateScript);

    // Configura o Google Translate
    window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'pt',
            includedLanguages: 'en,pt',
            autoDisplay: false
        }, 'google_translate_element');
    };

    const translatePage = (lang) => {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = lang;
            select.dispatchEvent(new Event('change'));
            currentLang = lang;
            updateLanguageIcon(lang);
            localStorage.setItem('selectedLanguage', lang);
        }
    };

    // Adiciona o evento de clique direto, sem debounce
    languageToggle.addEventListener('click', () => {
        const newLang = currentLang === 'pt' ? 'en' : 'pt';
        translatePage(newLang);
    });

    // Aplica o idioma inicial imediatamente
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang && savedLang !== currentLang) {
        translatePage(savedLang);
    }
}

export function updateLanguageIcon(lang) {
    const iconElement = document.querySelector('.language-toggle-icon');
    if (iconElement) {
        iconElement.textContent = lang === 'pt' ? '🇧🇷' : '🇺🇸';
    }
}