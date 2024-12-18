class Memoria {
    constructor() {
        this.hasFlippedCard = false;
        this.lockBoard = false;
        this.firstCard = null;
        this.secondCard = null;
        this.elements = [
            { element: "RedBull", source: "https://upload.wikimedia.org/wikipedia/de/c/c4/Red_Bull_Racing_logo.svg" },
            { element: "RedBull", source: "https://upload.wikimedia.org/wikipedia/de/c/c4/Red_Bull_Racing_logo.svg" },
            { element: "McLaren", source: "https://upload.wikimedia.org/wikipedia/en/6/66/McLaren_Racing_logo.svg" },
            { element: "McLaren", source: "https://upload.wikimedia.org/wikipedia/en/6/66/McLaren_Racing_logo.svg" },
            { element: "Alpine", source: "https://upload.wikimedia.org/wikipedia/fr/b/b7/Alpine_F1_Team_2021_Logo.svg" },
            { element: "Alpine", source: "https://upload.wikimedia.org/wikipedia/fr/b/b7/Alpine_F1_Team_2021_Logo.svg" },
            { element: "AstonMartin", source: "https://upload.wikimedia.org/wikipedia/fr/7/72/Aston_Martin_Aramco_Cognizant_F1.svg" },
            { element: "AstonMartin", source: "https://upload.wikimedia.org/wikipedia/fr/7/72/Aston_Martin_Aramco_Cognizant_F1.svg" },
            { element: "Ferrari", source: "https://upload.wikimedia.org/wikipedia/de/c/c0/Scuderia_Ferrari_Logo.svg" },
            { element: "Ferrari", source: "https://upload.wikimedia.org/wikipedia/de/c/c0/Scuderia_Ferrari_Logo.svg" },
            { element: "Mercedes", source: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Mercedes_AMG_Petronas_F1_Logo.svg" },
            { element: "Mercedes", source: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Mercedes_AMG_Petronas_F1_Logo.svg" }
        ];
        this.button = null; /* Pruebas de usabilidad */
        this.matches = 0; /* Pruebas de usabilidad */
        this.audioContext = null; /* Pruebas de usabilidad */
        this.correctSound = null; /* Pruebas de usabilidad */
        this.incorrectSound = null; /* Pruebas de usabilidad */
        this.addListenerButton(); /* Pruebas de usabilidad */
    }
    /* Pruebas de usabilidad */
    addListenerButton() {
        this.button = document.querySelector("main > section:nth-of-type(2) > button");
        this.button.addEventListener("click", this.startGame.bind(this));
    }
    
    /* Pruebas de usabilidad */
    startGame() {
        this.initializeAudio();
        this.button.remove();
        this.shuffleElements();
        this.createElements();
        this.addEventListeners();
    }
    /* Pruebas de usabilidad */
    initializeAudio() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.loadSounds();
    }
    /* Pruebas de usabilidad */
    async loadSounds() {
        try {
            this.correctSound = await this.loadSound('multimedia/audio/correct-sound.mp3');
            this.incorrectSound = await this.loadSound('multimedia/audio/incorrect-sound.mp3');
        } catch (error) {
            console.error('Error cargando sonidos:', error);
        }
    }
    /* Pruebas de usabilidad */
    async loadSound(url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuffer);
    }
    /* Pruebas de usabilidad */
    playSound(buffer) {
        if (buffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start(0);
        }
    }
    /* Pruebas de usabilidad */
    createAudios() {
        if (this.wrongAudio === null) {
            this.wrongAudio = new Audio("multimedia/audio/incorrect-sound.mp3");
        }
        if (this.correctAudio === null) {
            this.correctAudio = new Audio("multimedia/audio/correct-sound.mp3");
        }
    }

    shuffleElements() {
        this.elements.sort(() => Math.random() - 0.5);
    }

    createElements() {
        
        const board = document.createElement("section");
        const h2 = document.createElement("h3");
        h2.textContent = "Tablero";
        board.appendChild(h2);
        this.elements.forEach((item) => {
            const card = document.createElement("article");
            card.setAttribute("data-element", item.element);
            card.setAttribute("data-state", "hidden");
    
            const front = document.createElement("h3");
            front.textContent = "Tarjeta de memoria";
    
            const back = document.createElement("img");
            back.src = item.source;
            back.alt = item.element;
    
            card.appendChild(front);
            card.appendChild(back);
            board.appendChild(card);
        });
    
        const main = document.querySelector("main");
        main.appendChild(board);
    }
    

    addEventListeners() {
        const cards = document.querySelectorAll("article");
        cards.forEach((card) => {
            card.addEventListener("click", this.flipCard.bind(this, card));
        });
    }

    flipCard(card) {
        if (this.lockBoard || card.getAttribute("data-state") === "revealed" || card === this.firstCard) return;

        card.setAttribute('data-state', 'flip');

        if (!this.hasFlippedCard) {
            this.hasFlippedCard = true;
            this.firstCard = card;
        } else {
            this.secondCard = card;
            this.checkForMatch();
        }
    }

    checkForMatch() {
        const isMatch = this.firstCard.getAttribute("data-element") === this.secondCard.getAttribute("data-element");
        if (isMatch) {
            this.disableCards();
            
            this.matches++;/* Pruebas de usabilidad */
            setTimeout(() => {
                this.playSound(this.correctSound); /* Pruebas de usabilidad */
                if (this.matches === this.elements.length / 2) { 
                    alert("¡Has ganado! Reinicia la página para jugar de nuevo."); /* Pruebas de usabilidad */
                }
            }, 500);
        } else {
            setTimeout(() => {
                this.playSound(this.incorrectSound); /* Pruebas de usabilidad */
            }, 500);
            this.unflipCards();
        }
    }

    disableCards() {
        this.firstCard.setAttribute("data-state", "revealed");
        this.secondCard.setAttribute("data-state", "revealed");
        this.resetBoard();
    }

    unflipCards() {
        this.lockBoard = true;

        setTimeout(() => {
            this.firstCard.setAttribute("data-state", "hidden");
            this.secondCard.setAttribute("data-state", "hidden");
            this.resetBoard();
        }, 1000);
        
    }

    resetBoard() {
        this.hasFlippedCard = false;
        this.lockBoard = false;
        this.firstCard = null;
        this.secondCard = null;
    }
}

document.addEventListener("DOMContentLoaded", () => new Memoria());
