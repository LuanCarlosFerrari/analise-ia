const API_KEY = 'AIzaSyCrzVWf2E7g8xAF7Kw_BJ1MTVGPRCLbkfE';

const RETRY_DELAY = 1000; 
const MAX_RETRIES = 3;

document.getElementById('imageInput').addEventListener('change', function(e) {
    const files = e.target.files;
    const imagePreview = document.getElementById('imagePreview');
    
    const fileList = document.createElement('ul');
    fileList.classList.add('file-list');
    
    imagePreview.innerHTML = '';
    imagePreview.appendChild(fileList);
    
    const counter = document.createElement('div');
    counter.classList.add('file-counter');
    counter.textContent = `Total de arquivos: ${files.length}`;
    imagePreview.insertBefore(counter, fileList);
    
    Array.from(files).forEach((file, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('file-item');
        listItem.textContent = `${index + 1}. ${file.name}`;
        fileList.appendChild(listItem);
    });
});

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
}

const basePrompt = `Você deve analisar esta imagem e retornar EXCLUSIVAMENTE estas informações no formato abaixo:

Nome da empresa:
Cnpj:
Nota fiscal:
CTE:
Peso saida:
Peso chegada:

REGRAS OBRIGATÓRIAS:
1. APENAS retorne os campos acima
2. Se não encontrar a informação, deixe o campo vazio
3. NÃO adicione campos extras
4. NÃO adicione explicações ou comentários
5. Mantenha exatamente este formato`;

function validateResponse(response) {
    const allowedFields = [
        'Nome da empresa:',
        'Cnpj:',
        'Nota fiscal:',
        'CTE:',
        'Peso saida:',
        'Peso chegada:'
    ];
    
    const lines = response.split('\n').filter(line => line.trim());
    return lines.every(line => allowedFields.some(field => line.startsWith(field)));
}

function cleanResponse(response) {
    const allowedFields = [
        'Nome da empresa:',
        'Cnpj:',
        'Nota fiscal:',
        'CTE:',
        'Peso saida:',
        'Peso chegada:'
    ];

    const lines = response.split('\n');
    return allowedFields
        .map(field => lines.find(line => line.startsWith(field)) || field)
        .join('\n');
}

async function analyzeImages() {
    const imageFiles = document.getElementById('imageInput').files;
    if (imageFiles.length === 0) {
        showError('Por favor, selecione pelo menos uma imagem.');
        return;
    }

    showLoading();
    const results = [];

    try {
        for (let i = 0; i < imageFiles.length; i++) {
            try {
                const imageBase64 = await getBase64(imageFiles[i]);
                const customPrompt = document.getElementById('prompt').value || basePrompt;
                
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                const result = {
                    fileName: imageFiles[i].name,
                    analysis: await analyzeWithGemini(imageBase64, customPrompt)
                };
                
                results.push(result);
                showProgress(i + 1, imageFiles.length);
            } catch (error) {
                console.error(`Erro na imagem ${imageFiles[i].name}:`, error);
                results.push({
                    fileName: imageFiles[i].name,
                    analysis: `Erro: ${error.message}`
                });
            }
        }

        showResults(results);
        showSuccess();
    } catch (error) {
        console.error('Erro:', error);
        showError(error.message);
    }
}

async function analyzeWithGemini(imageBase64, prompt, retryCount = 0) {
    try {
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }, {
                    inline_data: {
                        mime_type: "image/jpeg",
                        data: imageBase64
                    }
                }]
            }],
            generationConfig: {
                temperature: 0.4,
                topK: 32,
                topP: 1
            }
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            }
        );

        if (response.status === 429) {
            if (retryCount < MAX_RETRIES) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                return await analyzeWithGemini(imageBase64, prompt, retryCount + 1);
            } else {
                throw new Error('Limite de requisições atingido. Por favor, tente novamente mais tarde.');
            }
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            throw new Error('Formato de resposta inválido');
        }

        let result = data.candidates[0].content.parts[0].text;

        if (!validateResponse(result)) {
            result = cleanResponse(result);
        }

        return result;

    } catch (error) {
        if (error.message.includes('quota')) {
            throw new Error('Limite de requisições da API atingido. Por favor, tente novamente em alguns minutos.');
        }
        throw error;
    }
}

class UIManager {
    constructor() {
        this.resultDiv = document.getElementById('result');
        this.template = this.createTemplate();
    }

    createTemplate() {
        return {
            container: '<div class="results-container">',
            result: (fileName, analysis) => `
                <div class="analysis-result">
                    <h3>Arquivo: ${fileName}</h3>
                    <div class="analysis-content">
                        <pre>${analysis}</pre>
                    </div>
                </div>
            `
        };
    }

    async displayResults(results) {
        if (!results?.length) {
            this.showError('Nenhum resultado para exibir');
            return;
        }

        this.showLoading();
        const container = document.createElement('div');
        container.className = 'results-container';

        const batchSize = 5;
        for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);
            await this.processBatch(batch, container);
        }

        this.resultDiv.innerHTML = '';
        this.resultDiv.appendChild(container);
        document.getElementById('exportButton').disabled = false;
    }

    async processBatch(batch, container) {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                batch.forEach(result => {
                    const element = document.createElement('div');
                    element.innerHTML = this.template.result(result.fileName, result.analysis);
                    container.appendChild(element.firstElementChild);
                });
                resolve();
            });
        });
    }

    showError(message) {
        this.resultDiv.innerHTML = `<div class="error">${message}</div>`;
    }

    showSuccess() {
        const successMessage = document.createElement('div');
        successMessage.className = 'success';
        successMessage.textContent = 'Análise concluída com sucesso!';
        this.resultDiv.prepend(successMessage);
    }

    showLoading() {
        this.resultDiv.innerHTML = '<div class="loading">Analisando imagens...</div>';
    }
}


const uiManager = new UIManager();


function showResults(results) {
    uiManager.displayResults(results);
}

function showError(message) {
    uiManager.showError(message);
}

function showSuccess() {
    uiManager.showSuccess();
}

function showLoading() {
    uiManager.showLoading();
}

function showProgress(current, total) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<div class="loading">Analisando imagem ${current} de ${total}...</div>`;
}

function parseAnalysisToObject(text) {
    const fields = [
        'Nome da empresa',
        'Cnpj',
        'Nota fiscal',
        'CTE',
        'Peso saida',
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

function exportToExcel() {
    const resultElements = document.querySelectorAll('.analysis-result');
    if (resultElements.length === 0) {
        showError('Não há dados para exportar');
        return;
    }

    const data = [];

    resultElements.forEach(element => {
        const fileName = element.querySelector('h3').textContent.replace('Arquivo: ', '');
        const analysisText = element.querySelector('.analysis-content pre').textContent;
        const parsedData = parseAnalysisToObject(analysisText);
        
        data.push({
            'Nome do Arquivo': fileName,
            'Nome da empresa': parsedData['Nome da empresa'],
            'Cnpj': parsedData['Cnpj'],
            'Nota fiscal': parsedData['Nota fiscal'],
            'CTE': parsedData['CTE'],
            'Peso saida': parsedData['Peso saida'],
            'Peso chegada': parsedData['Peso chegada']
        });
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Análises');
    XLSX.writeFile(workbook, 'analise_imagens.xlsx');
}

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    if (!themeToggle) {
        console.error('Theme toggle button not found');
        return;
    }

    let currentTheme;
    try {
        currentTheme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch (e) {
        console.warn('Could not access localStorage:', e);
        currentTheme = 'light';
    }
    
    const applyTheme = (theme) => {
        html.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            console.warn('Could not save theme preference:', e);
        }
    };

   
    applyTheme(currentTheme);

   
    themeToggle.addEventListener('click', () => {
        const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });
}

function updateThemeIcon(theme) {
    const iconElement = document.querySelector('.theme-toggle-icon');
    if (iconElement) {
        iconElement.textContent = theme === 'dark' ? '🌜' : '🌞';
    }
}

document.addEventListener('DOMContentLoaded', initThemeToggle);