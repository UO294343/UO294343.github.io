class QuizGame {
    constructor() {
        // DOM Elements
        this.fileInput = document.querySelector("section > input");
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');

        // Game State
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.timeLeft = 0;
        this.timerInterval = null;
        this.gameStarted = false;
        this.canAnswer = true;

        // Audio Setup
        this.audioContext = null;
        this.correctSound = null;
        this.incorrectSound = null;

        // Bind methods
        this.setupEventListeners();
        this.drawInitialScreen();
    }

    setupEventListeners() {
        this.fileInput.addEventListener('change', this.handleFileUpload.bind(this));
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));

    }

    handleCanvasClick(event) {
        if (!this.audioContext) {
            this.initializeAudio();
        }
        if (!this.gameStarted && this.questions.length > 0) {
            this.startQuiz();
        } else if (this.gameStarted && this.canAnswer) {
            this.checkAnswer(event);
        }
    }

    handleCanvasTouch(event) {
        if (!this.audioContext) {
            this.initializeAudio();
        }
        if (!this.gameStarted && this.questions.length > 0) {
            this.startQuiz();
        } else if (this.gameStarted) {
            // Obtener la posición del toque
            const rect = this.canvas.getBoundingClientRect();
            const touch = event.touches[0]; // Obtener el primer toque
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
    
            this.checkAnswer({ clientX: x, clientY: y }); // Pasar las coordenadas como si fueran de clic
        }
    }
    checkAnswer(event) {
        
        const rect = this.canvas.getBoundingClientRect(); // Dimensiones físicas del lienzo
        const scaleX = this.canvas.width / rect.width;   // Relación horizontal
        const scaleY = this.canvas.height / rect.height; // Relación vertical
    
        const x = (event.clientX - rect.left) * scaleX;  // Ajustar coordenadas X
        const y = (event.clientY - rect.top) * scaleY;   // Ajustar coordenadas Y
    
        const question = this.questions[this.currentQuestionIndex];
        const buttonHeight = 50;
        const buttonWidth = 300;
        const spacing = 20;
    
        question.options.forEach((option, index) => {
            const buttonY = 200 + (buttonHeight + spacing) * index;
            const buttonX = (this.canvas.width - buttonWidth) / 2;
    
            if (x >= buttonX && x <= buttonX + buttonWidth &&
                y >= buttonY && y <= buttonY + buttonHeight) {
                const isCorrect = index === question.answer;
                this.handleAnswer(isCorrect);
            }
        });
    }

    initializeAudio() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.loadSounds();
    }

    async loadSounds() {
        try {
            this.correctSound = await this.loadSound('multimedia/audio/correct-sound.mp3');
            this.incorrectSound = await this.loadSound('multimedia/audio/incorrect-sound.mp3');
        } catch (error) {
            console.error('Error cargando sonidos:', error);
        }
    }

    async loadSound(url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuffer);
    }

    playSound(buffer) {
        if (buffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start(0);
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                this.questions = JSON.parse(e.target.result);
                this.drawQuestionLoadedScreen();
            } catch (error) {
                alert('Error parsing JSON file. Please check the file format.');
            }
        };

        reader.readAsText(file);
    }

    drawInitialScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Carga tus preguntas de F1', this.canvas.width / 2, this.canvas.height / 2 - 50);
        this.ctx.fillText('Selecciona un archivo JSON', this.canvas.width / 2, this.canvas.height / 2);
    }

    drawQuestionLoadedScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Preguntas cargadas: ${this.questions.length}`, this.canvas.width / 2, this.canvas.height / 2 - 50);
        this.ctx.fillText('Haz clic para comenzar', this.canvas.width / 2, this.canvas.height / 2);
    }

    startQuiz() {
        this.gameStarted = true;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.nextQuestion();
    }

    nextQuestion() {
        this.canAnswer = true;
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endQuiz();
            return;
        }
        const question = this.questions[this.currentQuestionIndex];
        this.drawQuestionScreen(question);
        this.startTimer(15); // 15 seconds per question
    }

    drawQuestionScreen(question) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Question Text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(question.question, this.canvas.width / 2, 100);

        // Timer Bar
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(50, 150, (this.timeLeft / 15) * (this.canvas.width - 100), 20);

        // Create buttons for options
        this.renderOptionButtons(question.options);
    }

    renderOptionButtons(options) {
        const buttonHeight = 50;
        const buttonWidth = 300;
        const spacing = 20;

        options.forEach((option, index) => {
            const buttonY = 200 + (buttonHeight + spacing) * index;
            
            // Button background
            this.ctx.fillStyle = '#3498db';
            this.ctx.fillRect(
                (this.canvas.width - buttonWidth) / 2, 
                buttonY, 
                buttonWidth, 
                buttonHeight
            );

            // Button text
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '18px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                option, 
                this.canvas.width / 2, 
                buttonY + buttonHeight / 2 + 5
            );
        });
    }

    startTimer(duration) {
        this.timeLeft = duration;
        
        // Clear any existing interval
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(() => {
            this.timeLeft -= 1;
            
            // Redraw question screen to update timer
            const question = this.questions[this.currentQuestionIndex];
            this.drawQuestionScreen(question);

            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.handleAnswer(false);
            }
        }, 1000);
    }

    handleAnswer(isCorrect) {
        this.canAnswer = false;
        // Stop the timer
        clearInterval(this.timerInterval);

        // Play appropriate sound
        if (isCorrect) {
            this.playSound(this.correctSound);
            this.score++;
        } else {
            this.playSound(this.incorrectSound);
        }

        // Move to next question
        this.currentQuestionIndex++;
        setTimeout(() => this.nextQuestion(), 1500);
    }

    endQuiz() {
        this.gameStarted = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Final Score
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Quiz Completado`, this.canvas.width / 2, this.canvas.height / 2 - 50);
        this.ctx.fillText(`Tu puntuación: ${this.score} / ${this.questions.length}`, this.canvas.width / 2, this.canvas.height / 2);
        
        // Instruction to replay
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Haz clic para volver a jugar', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new QuizGame();
});