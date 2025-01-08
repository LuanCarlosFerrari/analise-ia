// Defina sua chave API como uma constante
const API_KEY = 'AIzaSyCrzVWf2E7g8xAF7Kw_BJ1MTVGPRCLbkfE';

// Configurar preview da imagem
document.getElementById('imageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
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

async function analyzeImage() {
    const imageFile = document.getElementById('imageInput').files[0];
    const prompt = document.getElementById('prompt').value || "Descreva detalhadamente esta imagem";
    const resultDiv = document.getElementById('result');
    const submitButton = document.querySelector('button');

    if (!imageFile) {
        showError('Por favor, selecione uma imagem para análise.');
        return;
    }

    try {
        submitButton.disabled = true;
        showLoading();

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

        const responseText = await response.text();

        if (!response.ok) {
            const errorData = JSON.parse(responseText);
            throw new Error(
                errorData.error?.message || 
                'Erro na autenticação. Verifique se a chave API está correta.'
            );
        }

        const data = JSON.parse(responseText);
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            showSuccess();
            resultDiv.innerHTML = `
                <div class="result-box">
                    <div class="success">Análise concluída com sucesso!</div>
                    <pre>${data.candidates[0].content.parts[0].text}</pre>
                </div>
            `;
        } else {
            throw new Error('Resposta da API em formato inesperado');
        }
        
    } catch (error) {
        showError(`Erro ao analisar imagem: ${error.message}`);
        console.error('Erro completo:', error);
    } finally {
        submitButton.disabled = false;
    }
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