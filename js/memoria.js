class Memoria {
    constructor() {
        this.hasFlippedCard = false;
        this.lockBoard = false;
        this.firstCard = null;
        this.secondCard = null;
        this.elements = this.createElements();
        this.shuffleElements();
        this.createCards();
        this.addEventListeners();
    }

    createElements() {
        const elements = [
            { element: "RedBull", source: "https://upload.wikimedia.org/wikipedia/de/c/c4/Red_Bull_Racing_logo.svg" },
            { element: "McLaren", source: "https://upload.wikimedia.org/wikipedia/en/6/66/McLaren_Racing_logo.svg" },
            { element: "Alpine", source: "https://upload.wikimedia.org/wikipedia/fr/b/b7/Alpine_F1_Team_2021_Logo.svg" },
            { element: "AstonMartin", source: "https://upload.wikimedia.org/wikipedia/fr/7/72/Aston_Martin_Aramco_Cognizant_F1.svg" },
            { element: "Ferrari", source: "https://upload.wikimedia.org/wikipedia/de/c/c0/Scuderia_Ferrari_Logo.svg" },
            { element: "Mercedes", source: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Mercedes_AMG_Petronas_F1_Logo.svg" }
        ];
        return [...elements, ...elements]; // Duplicate elements to make 12 cards
    }

    shuffleElements() {
        this.elements.sort(() => Math.random() - 0.5);
    }

    createCards() {
        const board = document.querySelector("main > section:last-of-type"); // Ajustado para seleccionar el <section:last-of-type>
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
            this.firstCard.setAttribute("data-state", "revealed");
            this.secondCard.setAttribute("data-state", "revealed");
            this.resetBoard();
        } else {
            this.unflipCards();
        }
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
