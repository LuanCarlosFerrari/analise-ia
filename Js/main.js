import { initFileInput, analyzeImages } from './fileHandler.js';
import { initThemeToggle } from './themeManager.js';
import { exportToExcel } from './exporter.js';
import { ticketTemplate } from './templates/ticketTemplate.js';

document.addEventListener('DOMContentLoaded', () => {
    initFileInput();
    initThemeToggle();
    
    // Expor funções globalmente
    window.analyzeImages = analyzeImages;
    window.exportToExcel = exportToExcel;
    window.ticketTemplate = ticketTemplate;
});