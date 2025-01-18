import { initFileInput, analyzeImages } from './fileHandler.js';
import { initThemeToggle } from './themeManager.js';
import { exportToExcel } from './exporter.js';

document.addEventListener('DOMContentLoaded', () => {
    initFileInput();
    initThemeToggle();
    
    // Make functions available globally
    window.analyzeImages = analyzeImages;
    window.exportToExcel = exportToExcel;
});