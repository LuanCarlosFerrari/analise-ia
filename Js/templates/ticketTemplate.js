export const ticketTemplate = {
    name: 'Ticket de Descarga',
    fields: [
        'Nome da empresa',
        'Cnpj',
        'Nota fiscal',
        'Peso chegada'
    ],
    validateResponse(response) {
        const lines = response.split('\n').filter(line => line.trim());
        return lines.every(line => this.fields.some(field => line.startsWith(field + ':')));
    },
    cleanResponse(response) {
        const lines = response.split('\n');
        return this.fields
            .map(field => lines.find(line => line.startsWith(field + ':')) || field + ':')
            .join('\n');
    },
    parseToObject(text) {
        const result = {};
        const lines = text.split('\n');

        this.fields.forEach(field => {
            const line = lines.find(l => l.toLowerCase().includes(field.toLowerCase()));
            if (line) {
                const value = line.substring(line.toLowerCase().indexOf(field.toLowerCase()) + field.length).trim();
                result[field] = value;
            } else {
                result[field] = 'Não encontrado';
            }
        });

        return result;
    },
    prompt: `Você deve analisar esta imagem e retornar EXCLUSIVAMENTE estas informações no formato abaixo:

Nome da empresa:
Cnpj:
Nota fiscal:
Peso chegada:

REGRAS OBRIGATÓRIAS:
1. APENAS retorne os campos acima
2. Se não encontrar a informação, deixe o campo vazio
3. NÃO adicione campos extras
4. NÃO adicione explicações ou comentários
5. Mantenha exatamente este formato
6. Para o campo "Nota fiscal", procure por variações como "nota fiscal", "N.F", "NF", "N.F.", "NF.", "Número da nota" ou "Nº da nota"
7. Para o campo "Peso chegada", APENAS use valores que estejam explicitamente identificados como "peso chegada", "peso entrada", "peso bruto"`
};