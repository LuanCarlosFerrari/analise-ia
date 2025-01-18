export class UIManager {
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

export const uiManager = new UIManager();

export function showResults(results) {
    uiManager.displayResults(results);
}

export function showError(message) {
    uiManager.showError(message);
}

export function showSuccess() {
    uiManager.showSuccess();
}

export function showLoading() {
    uiManager.showLoading();
}

export function showProgress(current, total) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<div class="loading">Analisando imagem ${current} de ${total}...</div>`;
}