// Defina sua chave API como uma constante
const API_KEY = 'AIzaSyCrzVWf2E7g8xAF7Kw_BJ1MTVGPRCLbkfE';

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

// Prompt base para análise
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
            const imageBase64 = await getBase64(imageFiles[i]);
            const customPrompt = document.getElementById('prompt').value || basePrompt;
            
            // Preparar análise para cada imagem
            const result = {
                fileName: imageFiles[i].name,
                analysis: await analyzeWithGemini(imageBase64, customPrompt)
            };
            
            console.log('Resultado da análise:', result); // Debug log
            results.push(result);
            showProgress(i + 1, imageFiles.length);
        }

        console.log('Todos resultados:', results); // Debug log
        showResults(results);
        showSuccess();
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro ao analisar imagens: ' + error.message);
    }
}

async function analyzeWithGemini(imageBase64, prompt) {
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
    
    if (!results || results.length === 0) {
        resultDiv.innerHTML = '<div class="error">Nenhum resultado para exibir</div>';
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