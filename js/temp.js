class Semaforo {
    constructor() {
        this.levels = [0.2, 0.5, 0.8];
        this.lights = 4;
        this.unload_moment = null;
        this.clic_moment = null;
        this.difficulty = this.levels[Math.floor(Math.random() * this.levels.length)];
        this.createStructure();
    }

    createStructure() {
        const main = document.querySelector('main');
        // Título del juego
        const header = document.createElement('h1');
        header.textContent = 'Juego de Tiempo de Reacción';
        main.appendChild(header);

        // Crear luces del semáforo
        for (let i = 0; i < this.lights; i++) {
            const light = document.createElement('div');
            main.appendChild(light);
        }

        // Botón de arranque
        const startButton = document.createElement('button');
        startButton.textContent = 'Arranque';
        startButton.onclick = () => this.initSequence(startButton);
        main.appendChild(startButton);

        // Botón de reacción
        const reactionButton = document.createElement('button');
        reactionButton.textContent = 'Reacción';
        reactionButton.disabled = true;
        reactionButton.onclick = () => this.stopReaction(reactionButton, startButton);
        main.appendChild(reactionButton);
    }

    initSequence(startButton) {
        const main = document.querySelector('main');
        main.classList.add('load');
        startButton.disabled = true;

        setTimeout(() => {
            this.unload_moment = new Date();
            this.endSequence();
        }, 2000 + this.difficulty * 100);
    }

    endSequence() {
        document.querySelector('main').classList.add('unload');
        this.reactionButton.disabled = false;

    }
    stopReaction(reactionButton, startButton) {
        this.clic_moment = new Date();
        const reactionTime = this.clic_moment - this.unload_moment;
        const result = document.createElement('p');
        result.textContent = 'Tu tiempo de reacción es: ' + (reactionTime / 1000).toFixed(3) + 'segundos.';
        main.appendChild(result);

        const main = document.querySelector('main');
        main.classList.remove('unload');
        main.classList.remove('load');
        

        reactionButton.disabled = true;
        startButton.disabled = false;
    }
}

// Inicializar el semáforo cuando se cargue el documento
document.addEventListener('DOMContentLoaded', () => {
    new Semaforo();
});