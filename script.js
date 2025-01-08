// Defina sua chave API como uma constante
const API_KEY = 'AIzaSyCrzVWf2E7g8xAF7Kw_BJ1MTVGPRCLbkfE';

// Atualizar o preview para mostrar múltiplas imagens
document.getElementById('imageInput').addEventListener('change', function(e) {
    const files = e.target.files;
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.innerHTML = '';
    
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxHeight = '200px';
            img.style.margin = '5px';
            imagePreview.appendChild(img);
        }
        reader.readAsDataURL(file);
    }
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

// Função para analisar múltiplas imagens
async function analyzeImages() {
    const imageFiles = document.getElementById('imageInput').files;
    const prompt = document.getElementById('prompt').value || "Descreva detalhadamente esta imagem";
    const resultDiv = document.getElementById('result');
    const submitButton = document.querySelector('button');

    if (!imageFiles.length) {
        showError('Por favor, selecione pelo menos uma imagem para análise.');
        return;
    }

    try {
        submitButton.disabled = true;
        showLoading();

        const results = [];
        
        // Processar cada imagem sequencialmente
        for (let i = 0; i < imageFiles.length; i++) {
            const imageFile = imageFiles[i];
            const imageBase64 = await getBase64(imageFile);
            
            const payload = {
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: imageFile.type,
                                data: imageBase64
                            }
                        }
                    ]
                }]
            };

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            results.push({
                fileName: imageFile.name,
                analysis: data.candidates[0]?.content?.parts[0]?.text || 'Não foi possível analisar esta imagem'
            });

            // Atualizar o progresso
            showProgress(i + 1, imageFiles.length);
        }

        // Mostrar todos os resultados
        showResults(results);
        
    } catch (error) {
        showError(`Erro ao analisar imagens: ${error.message}`);
        console.error('Erro completo:', error);
    } finally {
        submitButton.disabled = false;
    }
}

// Função para mostrar o progresso
function showProgress(current, total) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <div class="loading">
            Processando imagem ${current} de ${total}...
        </div>
    `;
}

// Função para mostrar os resultados
function showResults(results) {
    const resultDiv = document.getElementById('result');
    let html = '<div class="result-box">';
    html += '<div class="success">Análise concluída com sucesso!</div>';
    
    results.forEach((result, index) => {
        html += `
            <div class="image-analysis">
                <h3>Imagem ${index + 1}: ${result.fileName}</h3>
                <pre>${result.analysis}</pre>
            </div>
            <hr>
        `;
    });
    
    html += '</div>';
    resultDiv.innerHTML = html;
}

function showError(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<div class="error">${message}</div>`;
}

function showSuccess() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<div class="success">Análise realizada com sucesso!</div>';
}

function showLoading() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <div class="loading">
            Processando imagem e aguardando resposta da IA...
        </div>
    `;
}