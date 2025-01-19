import { getSelectedTemplate } from './templates/templateManager.js';
import { showError } from './uiManager.js';

export function exportToExcel() {
    const resultElements = document.querySelectorAll('.analysis-result');
    const selectedTemplate = getSelectedTemplate();
    
    if (resultElements.length === 0) {
        showError('Não há dados para exportar');
        return;
    }

    const data = [];
    const columnWidths = {};

    // Initialize column widths with selected template fields
    selectedTemplate.fields.forEach(field => {
        columnWidths[field] = field.length;
    });
    columnWidths['Nome do Arquivo'] = 'Nome do Arquivo'.length;

    resultElements.forEach(element => {
        const fileName = element.querySelector('h3').textContent.replace('Arquivo: ', '');
        const analysisText = element.querySelector('.analysis-content pre').textContent;
        const parsedData = selectedTemplate.parseToObject(analysisText);

        const row = {
            'Nome do Arquivo': fileName,
            ...parsedData
        };

        Object.entries(row).forEach(([key, value]) => {
            columnWidths[key] = Math.max(columnWidths[key], (value || '').length);
        });

        data.push(row);
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    worksheet['!cols'] = Object.values(columnWidths).map(width => ({
        wch: width + 2
    }));

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Análises');
    XLSX.writeFile(workbook, `analise_${selectedTemplate.name.toLowerCase()}.xlsx`);
}