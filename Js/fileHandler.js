import { analyzeWithGemini, analyzeWithCustomPrompt, basePrompt } from './api.js';
import { showError, showLoading, showProgress, showResults, showSuccess } from './uiManager.js';

export function initFileInput() {
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
            const fileType = file.type === 'application/pdf' ? '📄' : '🖼️';
            listItem.textContent = `${index + 1}. ${fileType} ${file.name}`;
            fileList.appendChild(listItem);
        });
    });
}

export function getBase64(file) {
    return new Promise((resolve, reject) => {
        if (file.type === 'application/pdf') {
            // Carregando o PDF.js dinamicamente
            const pdfjsLib = window['pdfjs-dist/build/pdf'];
            if (!pdfjsLib) {
                reject(new Error('PDF.js não foi carregado corretamente'));
                return;
            }

            // Configurar worker do PDF.js
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js';
            
            const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
            loadingTask.promise
                .then(pdf => {
                    return pdf.getPage(1);
                })
                .then(page => {
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };

                    return page.render(renderContext).promise.then(() => {
                        const base64String = canvas.toDataURL('image/jpeg').split(',')[1];
                        resolve(base64String);
                    });
                })
                .catch(error => {
                    console.error('Erro ao processar PDF:', error);
                    reject(new Error('Erro ao processar o arquivo PDF'));
                });
        } else {
            // Para imagens, mantém o código existente
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = error => {
                console.error('Erro ao ler arquivo:', error);
                reject(error);
            };
        }
    });
}

export async function analyzeImages() {
    const imageFiles = document.getElementById('imageInput').files;
    const customPrompt = document.getElementById('prompt').value;
    
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
                
                let analysis;
                if (customPrompt) {
                    // Use free-form analysis with custom prompt
                    analysis = await analyzeWithCustomPrompt(imageBase64, customPrompt);
                } else {
                    // Use structured analysis with basePrompt
                    analysis = await analyzeWithGemini(imageBase64, basePrompt);
                }
                
                results.push({
                    fileName: imageFiles[i].name,
                    analysis: analysis
                });
                
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