import { initFileInput, analyzeImages } from './fileHandler.js';
import { initThemeToggle } from './themeManager.js';
import { initLanguageToggle } from './languageManager.js';
import { exportToExcel } from './exporter.js';
import { initTemplateSelector } from './templates/templateManager.js';

document.addEventListener('DOMContentLoaded', () => {
    initFileInput();
    initThemeToggle();
    initLanguageToggle();
    initTemplateSelector();
    
    window.analyzeImages = analyzeImages;
    window.exportToExcel = exportToExcel;
    window.ticketTemplate = ticketTemplate;
    window.invoiceTemplate = invoiceTemplate;
});