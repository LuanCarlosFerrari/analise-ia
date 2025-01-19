import { invoiceTemplate } from './invoiceTemplate.js';
import { ticketTemplate } from './ticketTemplate.js';

export const templates = {
    invoice: invoiceTemplate,
    ticket: ticketTemplate
};

export function getSelectedTemplate() {
    const selector = document.getElementById('templateSelect');
    return templates[selector.value] || invoiceTemplate;
}

export function initTemplateSelector() {
    const selector = document.getElementById('templateSelect');
    
    // Add event listener to update prompt placeholder when template changes
    selector.addEventListener('change', () => {
        const template = templates[selector.value];
        const promptArea = document.getElementById('prompt');
        promptArea.placeholder = template ? 
            "Digite aqui seu prompt personalizado (ou deixe vazio para usar o template padrão)" :
            "Template não encontrado";
    });
}