import { initFileInput, analyzeImages } from './fileHandler.js';
import { initThemeToggle } from './themeManager.js';
import { exportToExcel } from './exporter.js';
import { initTemplateSelector } from './templates/templateManager.js';
import { ticketTemplate } from './templates/ticketTemplate.js';
import { invoiceTemplate } from './templates/invoiceTemplate.js';

document.addEventListener('DOMContentLoaded', () => {
    initFileInput();
    initThemeToggle();
    initTemplateSelector();
    
    window.analyzeImages = analyzeImages;
    window.exportToExcel = exportToExcel;
    window.ticketTemplate = ticketTemplate;
    window.invoiceTemplate = invoiceTemplate;
});