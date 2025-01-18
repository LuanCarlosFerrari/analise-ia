import { parseAnalysisToObject } from './utils.js';
import { showError } from './uiManager.js';

export function exportToExcel() {
    const resultElements = document.querySelectorAll('.analysis-result');
    if (resultElements.length === 0) {
        showError('Não há dados para exportar');
        return;
    }

    const data = [];
    const columnWidths = {
        'Nome do Arquivo': 0,
        'Nome da empresa': 0,
        'Cnpj': 0,
        'Nota fiscal': 0,
        'Peso chegada': 0
    };

    // Collect data and calculate max widths
    resultElements.forEach(element => {
        const fileName = element.querySelector('h3').textContent.replace('Arquivo: ', '');
        const analysisText = element.querySelector('.analysis-content pre').textContent;
        const parsedData = parseAnalysisToObject(analysisText);
        
        const row = {
            'Nome do Arquivo': fileName,
            'Nome da empresa': parsedData['Nome da empresa'],
            'Cnpj': parsedData['Cnpj'],
            'Nota fiscal': parsedData['Nota fiscal'],
            'Peso chegada': parsedData['Peso chegada']
        };

        // Update column widths
        Object.entries(row).forEach(([key, value]) => {
            columnWidths[key] = Math.max(columnWidths[key], key.length, (value || '').length);
        });

        data.push(row);
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set column widths
    worksheet['!cols'] = Object.values(columnWidths).map(width => ({
        wch: width + 2 // Add some padding
    }));

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Análises');
    XLSX.writeFile(workbook, 'analise_imagens.xlsx');
}