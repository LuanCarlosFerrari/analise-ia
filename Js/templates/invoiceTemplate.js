export const invoiceTemplate = {
    name: 'Nota Fiscal',
    fields: [
        'Número da NF',
        'Data de Emissão',
        'Valor Total',
        'CNPJ Emitente',
        'Razão Social Emitente',
        'CNPJ Destinatário',
        'Razão Social Destinatário',
        'Base de Cálculo ICMS',
        'Valor ICMS',
        'Valor Total Produtos'
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
                result[field] = value.replace(':', '').trim();
            } else {
                result[field] = 'Não encontrado';
            }
        });

        return result;
    },
    prompt: `Analise esta imagem de nota fiscal e retorne APENAS as seguintes informações no formato especificado:

Número da NF:
Data de Emissão:
Valor Total:
CNPJ Emitente:
Razão Social Emitente:
CNPJ Destinatário:
Razão Social Destinatário:
Base de Cálculo ICMS:
Valor ICMS:
Valor Total Produtos:

REGRAS OBRIGATÓRIAS:
1. Retorne SOMENTE os campos acima
2. Se não encontrar a informação, deixe o campo vazio após os dois pontos
3. NÃO adicione campos extras
4. NÃO adicione explicações ou comentários
5. Mantenha exatamente este formato
6. Valores monetários devem estar no formato numérico (exemplo: 1234.56)
7. Data deve estar no formato DD/MM/AAAA
8. CNPJ deve estar no formato numérico sem pontuação`
};