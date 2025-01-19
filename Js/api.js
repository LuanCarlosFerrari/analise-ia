import { validateResponse, cleanResponse } from './utils.js';

export const API_KEY = 'AIzaSyCrzVWf2E7g8xAF7Kw_BJ1MTVGPRCLbkfE';
export const RETRY_DELAY = 1000; 
export const MAX_RETRIES = 3;

export const basePrompt = `Você deve analisar esta imagem e retornar EXCLUSIVAMENTE estas informações no formato abaixo:

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
6. Para o campo "Nota fiscal", procure por variações como "nota fiscal" ou "invoice number", "n.f", "N.f", "Nf", "N.F.", "NF.", "Número da nota" ou "Nº da nota"
7. Para o campo "Peso chegada", APENAS use valores que estejam explicitamente identificados como "", "peso liquido", "PESO LIQ". NÃO use valores de "peso de saída", "peso chegada"`;

export async function analyzeWithGemini(imageBase64, prompt, retryCount = 0) {
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

// Add this new function in api.js
export async function analyzeWithCustomPrompt(imageBase64, customPrompt) {
    const requestBody = {
        contents: [{
            parts: [{
                text: customPrompt || "Por favor, analise esta imagem e descreva o que você vê."
            }, {
                inline_data: {
                    mime_type: "image/jpeg",
                    data: imageBase64
                }
            }]
        }],
        generationConfig: {
            temperature: 0.7, // Increased temperature for more creative responses
            topK: 40,
            topP: 1
        }
    };

    // Use the same API endpoint and error handling
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
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}