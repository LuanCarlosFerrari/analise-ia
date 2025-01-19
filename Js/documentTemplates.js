export const templates = {
    notaFiscal: {
        name: 'Nota Fiscal',
        fields: [
            'Nome da empresa',
            'Cnpj',
            'Nota fiscal',
            'Peso chegada'
        ],
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
    },
    // Exemplo de outro template
    contratoSocial: {
        name: 'Contrato Social',
        fields: [
            'Razão Social',
            'CNPJ',
            'Data Constituição',
            'Capital Social'
        ],
        prompt: `Analise esta imagem de contrato social e retorne apenas:

Razão Social:
CNPJ:
Data Constituição:
Capital Social:

REGRAS:
1. Mantenha apenas os campos acima
2. Deixe vazio se não encontrar
3. Não adicione outros campos ou comentários`
    }
};