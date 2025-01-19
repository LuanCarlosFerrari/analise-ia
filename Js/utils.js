export function validateResponse(response) {
    const allowedFields = [
        'Nome da empresa:',
        'Cnpj:',
        'Nota fiscal:',
        'Peso chegada:'
    ];
    
    const lines = response.split('\n').filter(line => line.trim());
    return lines.every(line => allowedFields.some(field => line.startsWith(field)));
}

export function cleanResponse(response) {
    const allowedFields = [
        'Nome da empresa:',
        'Cnpj:',
        'Nota fiscal:',
        'Peso chegada:'
    ];

    const lines = response.split('\n');
    return allowedFields
        .map(field => lines.find(line => line.startsWith(field)) || field)
        .join('\n');
}

export function parseAnalysisToObject(text) {
    const fields = [
        'Nome da empresa',
        'Cnpj',
        'Nota fiscal',
        'Peso chegada'
    ];
    
    const result = {};
    const lines = text.split('\n');
    
    fields.forEach(field => {
        const line = lines.find(l => l.toLowerCase().includes(field.toLowerCase()));
        if (line) {
            const value = line.substring(line.toLowerCase().indexOf(field.toLowerCase()) + field.length).trim();
            result[field] = value;
        } else {
            result[field] = 'Não encontrado';
        }
    });
    
    return result;
}