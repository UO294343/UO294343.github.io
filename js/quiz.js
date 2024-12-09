class QuizGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // Game state
        this.questions = [
            { question: "¿Quién tiene más títulos en la F1?", options: ["Lewis Hamilton", "Michael Schumacher", "Sebastian Vettel"], answer: 1 },
            { question: "¿Qué piloto debutó en 2022?", options: ["Oscar Piastri", "Zhou Guanyu", "Mick Schumacher"], answer: 1 }
        ];
        this.currentQuestionIndex = 0;
        this.score = 0;

        // Visual settings
        this.styles = {
            questionFont: "24px Arial",
            optionFont: "18px Arial",
            messageFont: "20px Arial",
            titleFont: "30px Arial"
        };

        this.simulatedCursor = { x: canvas.width / 2, y: canvas.height / 2, visible: false };
        this.optionRects = [];
        this.isOnStartScreen = true;
        this.isOnEndScreen = false;
        this.message = null;
        this.canAnswer = true;

        // Initialization
        this.setupEventListeners();
        this.drawStartScreen();
    }

    setupEventListeners() {
        this.canvas.addEventListener("click", this.handleCanvasClick.bind(this));
        document.addEventListener("pointerlockchange", this.handlePointerLockChange.bind(this));
        document.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, "#1E1E2F");
        gradient.addColorStop(1, "#414161");
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawCenteredText(text, y, font = this.styles.titleFont, color = "#FFFFFF") {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.textAlign = "center";
        this.ctx.fillText(text, this.canvas.width / 2, y);
    }

    drawStartScreen() {
        this.isOnStartScreen = true;
        this.drawBackground();
        this.drawCenteredText("¡Bienvenido al Quiz!", this.canvas.height / 2 - 50);
        this.drawCenteredText("Haz clic para comenzar", this.canvas.height / 2 + 50);
    }

    drawEndScreen() {
        this.isOnEndScreen = true;
        this.drawBackground();
        this.drawCenteredText("¡Quiz completado! Tu puntuación: "+this.score, this.canvas.height / 2 - 50);
        this.drawCenteredText("Haz clic para intentar otra vez", this.canvas.height / 2 + 50);
    }

    drawQuestion() {
        this.drawBackground();

        // Draw question text
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.font = this.styles.questionFont;
        this.ctx.textAlign = "left";
        this.ctx.fillText(this.questions[this.currentQuestionIndex].question, 50, 50);

        // Draw options
        this.optionRects = [];
        this.questions[this.currentQuestionIndex].options.forEach((option, index) => {
            const rect = { x: 50, y: 100 + index * 80, width: 300, height: 60 };
            this.optionRects.push(rect);
            this.drawRoundedRect(rect, "#AD0600");
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.font = this.styles.optionFont;
            this.ctx.fillText(option, rect.x + 20, rect.y + 35);
        });

        // Draw drop area
        const responseRect = { x: 500, y: 115, width: 200, height: 200 };
        const responseGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        responseGradient.addColorStop(0, "#76b852");
        responseGradient.addColorStop(1, "#8DC26F");
        this.drawRoundedRect(responseRect, responseGradient, 20);

        // Draw "drag here" text
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.font = this.styles.messageFont;
        this.ctx.textAlign = "center";
        this.ctx.fillText("Arrastra aquí", responseRect.x + responseRect.width / 2, responseRect.y + responseRect.height / 2);

        // Show message if exists
        if (this.message) {
            this.drawCenteredText(this.message, this.canvas.height - 50, this.styles.messageFont);
        }

        // Draw simulated cursor
        if (this.simulatedCursor.visible) {
            this.ctx.fillStyle = "#FFD700";
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = "rgba(255, 215, 0, 0.6)";
            this.ctx.beginPath();
            this.ctx.arc(this.simulatedCursor.x, this.simulatedCursor.y, 8, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
    }

    drawRoundedRect(rect, fillStyle, radius = 10) {
        this.ctx.fillStyle = fillStyle;
        this.ctx.beginPath();
        this.ctx.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
        this.ctx.fill();
    }

    handleCanvasClick() {
        if (this.isOnStartScreen) {
            this.isOnStartScreen = false;
            this.message = null;
            this.drawQuestion();
            this.canvas.requestPointerLock();
        } else if (this.isOnEndScreen) {
            this.resetGame();
        } else if (!document.pointerLockElement) {
            this.canvas.requestPointerLock(); 
        }
    }

    handlePointerLockChange() {
        this.simulatedCursor.visible = document.pointerLockElement === this.canvas;
        if (!this.isOnEndScreen && !this.isOnStartScreen) this.drawQuestion();
    }

    handleMouseMove(event) {
        if (document.pointerLockElement === this.canvas) {
            this.simulatedCursor.x = Math.max(0, Math.min(this.canvas.width, this.simulatedCursor.x + event.movementX));
            this.simulatedCursor.y = Math.max(0, Math.min(this.canvas.height, this.simulatedCursor.y + event.movementY));
            if (!this.isOnEndScreen && !this.isOnStartScreen) this.drawQuestion();
        }
    }

    handleMouseDown() {
        const cursor = this.simulatedCursor;
        const clickedOptionIndex = this.optionRects.findIndex(
            rect => cursor.x >= rect.x && cursor.x <= rect.x + rect.width && cursor.y >= rect.y && cursor.y <= rect.y + rect.height
        );

        if (clickedOptionIndex !== -1) {
            this.handleOptionDrag(clickedOptionIndex);
        }
    }

    handleOptionDrag(optionIndex) {
        this.isDragging = true;
        const selectedOption = this.optionRects[optionIndex];

        const onMouseMove = (event) => {
            this.simulatedCursor.x += event.movementX;
            this.simulatedCursor.y += event.movementY;
            this.drawQuestion();

            this.drawRoundedRect(
                { x: this.simulatedCursor.x - 150, y: this.simulatedCursor.y - 30, width: 300, height: 60 },
                "#AD0600"
            );
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.font = this.styles.optionFont;
            this.ctx.textAlign = "left";
            this.ctx.fillText(
                this.questions[this.currentQuestionIndex].options[optionIndex],
                this.simulatedCursor.x - 130,
                this.simulatedCursor.y
            );
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            this.isDragging = false;
            this.checkDrop(optionIndex);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }

    checkDrop(optionIndex) {
        if (!this.canAnswer) return;
        const cursor = this.simulatedCursor;
        const responseZone = { x: 500, y: 115, width: 200, height: 200 };
        if (
            cursor.x >= responseZone.x &&
            cursor.x <= responseZone.x + responseZone.width &&
            cursor.y >= responseZone.y &&
            cursor.y <= responseZone.y + responseZone.height
        ) {
            this.canAnswer = false;
            this.showMessage(optionIndex === this.questions[this.currentQuestionIndex].answer);
        } else {
            this.drawQuestion();
        }
    }

    showMessage(isCorrect) {
        this.message = isCorrect ? "¡Correcto!" : "Incorrecto.";
        if (isCorrect) this.score++;
        setTimeout(() => {
            this.message = null;
            this.currentQuestionIndex++;
            if (this.currentQuestionIndex >= this.questions.length) {
                this.drawEndScreen();
            } else {
                this.drawQuestion();
            }
            this.canAnswer = true;
        }, 1500);
    }

    resetGame() {
        this.score = 0;
        this.currentQuestionIndex = 0;
        this.isOnEndScreen = false;
        this.drawStartScreen();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector("canvas");
    new QuizGame(canvas);
});