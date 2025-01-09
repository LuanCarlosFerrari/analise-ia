// Defina sua chave API como uma constante
const API_KEY = 'AIzaSyCrzVWf2E7g8xAF7Kw_BJ1MTVGPRCLbkfE';

// Add these constants at the top
const RETRY_DELAY = 1000; // 1 second
const MAX_RETRIES = 3;

// Atualizar o event listener do input de imagens
document.getElementById('imageInput').addEventListener('change', function(e) {
    const files = e.target.files;
    const imagePreview = document.getElementById('imagePreview');
    
    // Criar lista de arquivos
    const fileList = document.createElement('ul');
    fileList.classList.add('file-list');
    
    // Limpar preview anterior
    imagePreview.innerHTML = '';
    imagePreview.appendChild(fileList);
    
    // Contador de arquivos
    const counter = document.createElement('div');
    counter.classList.add('file-counter');
    counter.textContent = `Total de arquivos: ${files.length}`;
    imagePreview.insertBefore(counter, fileList);
    
    // Adicionar cada arquivo à lista
    Array.from(files).forEach((file, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('file-item');
        listItem.textContent = `${index + 1}. ${file.name}`;
        fileList.appendChild(listItem);
    });
});

// Função para converter imagem para Base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remover o prefixo "data:image/jpeg;base64," do resultado
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
}

// This keeps the exact formatting with line breaks
const basePrompt = `Analise esta imagem e retorne APENAS as seguintes informações no formato EXATO, sem texto adicional:

Nome completo da empresa:
CNPJ:
Nome do produto:
Número do contrato:
Número da nota fiscal:
Data e hora da pesagem inicial:
Peso inicial:
Data e hora da pesagem final:
Peso final:

IMPORTANTE: Não adicione nenhuma outra informação, explicação ou comentário. Mantenha exatamente este formato e estes campos.`;

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
                
                // Add delay between requests
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
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

        console.log('Request:', JSON.stringify(requestBody, null, 2));

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
            console.error('API Error:', errorData);
            throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            console.error('Invalid Response Structure:', data);
            throw new Error('Formato de resposta inválido');
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        if (error.message.includes('quota')) {
            throw new Error('Limite de requisições da API atingido. Por favor, tente novamente em alguns minutos.');
        }
        console.error('Full Error:', error);
        throw error;
    }
}

// Função para mostrar o progresso
function showProgress(current, total) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<div class="loading">Analisando imagem ${current} de ${total}...</div>`;
}

// Função para mostrar os resultados
function parseAnalysisResponse(text) {
    const fields = [
        'Nome completo da empresa:',
        'CNPJ:',
        'Nome do produto:',
        'Número do contrato:',
        'Número da nota fiscal:',
        'Data e hora da pesagem inicial:',
        'Peso inicial:',
        'Data e hora da pesagem final:',
        'Peso final:'
    ];
    
    let parsedResult = '';
    for (const field of fields) {
        const regex = new RegExp(`${field}.*?(?=\\n|$)`, 'i');
        const match = text.match(regex);
        if (match) {
            parsedResult += match[0] + '\n';
        }
    }
    return parsedResult;
}

function showResults(results) {
    const resultDiv = document.getElementById('result');
    const exportButton = document.getElementById('exportButton');
    
    if (!results || results.length === 0) {
        resultDiv.innerHTML = '<div class="error">Nenhum resultado para exibir</div>';
        exportButton.disabled = true;
        return;
    }
    
    let allResults = '<div class="results-container">';
    
    results.forEach(result => {
        allResults += `
            <div class="analysis-result">
                <h3>Arquivo: ${result.fileName}</h3>
                <div class="analysis-content">
                    <pre>${result.analysis}</pre>
                </div>
            </div>
        `;
    });
    
    allResults += '</div>';
    resultDiv.innerHTML = allResults;
    exportButton.disabled = false;
}

function showError(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<div class="error">${message}</div>`;
}

function showSuccess() {
    const successMessage = document.createElement('div');
    successMessage.classList.add('success');
    successMessage.textContent = 'Análise concluída com sucesso!';
    document.getElementById('result').prepend(successMessage);
}

function showLoading() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<div class="loading">Analisando imagens...</div>';
}

// Function to format analysis data for Excel
function parseAnalysisToObject(text) {
    const fields = [
        'Nome completo da empresa',
        'CNPJ',
        'Nome do produto',
        'Número do contrato',
        'Número da nota fiscal',
        'Data e hora da pesagem inicial',
        'Peso inicial',
        'Data e hora da pesagem final',
        'Peso final'
    ];
    
    const result = {};
    fields.forEach(field => {
        const regex = new RegExp(`${field}:(.*)(?=\\n|$)`, 'i');
        const match = text.match(regex);
        result[field] = match ? match[1].trim() : '';
    });
    return result;
}

// Function to export results to Excel
function exportToExcel() {
    const resultElements = document.querySelectorAll('.analysis-result');
    if (resultElements.length === 0) {
        showError('Não há dados para exportar');
        return;
    }

    const workbook = XLSX.utils.book_new();
    const data = [];

    resultElements.forEach(element => {
        const fileName = element.querySelector('h3').textContent.replace('Arquivo: ', '');
        const analysisText = element.querySelector('.analysis-content pre').textContent;
        const parsedData = parseAnalysisToObject(analysisText);
        
        data.push({
            'Nome do Arquivo': fileName,
            ...parsedData
        });
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Análises');

    // Generate Excel file
    XLSX.writeFile(workbook, 'analise_imagens.xlsx');
}

function resetPrompt() {
    document.getElementById('prompt').value = basePrompt;
}