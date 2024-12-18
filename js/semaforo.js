class Semaforo {
    constructor() {
        this.levels = [0.2, 0.5, 0.8];
        this.lights = 4;
        this.unload_moment = null;
        this.clic_moment = null;
        this.difficulty = this.levels[Math.floor(Math.random() * 3)]; // Usar dificultad proporcionada
        this.createStructure();
    }

    createStructure() {
        const main = document.querySelector("main");
        
        const h2 = document.createElement("h2");
        h2.textContent = 'Juego de Tiempo de Reacción';
        main.appendChild(h2);
        
        // Crear las luces del semáforo
        for (let i = 0; i < this.lights; i++) {
            const light = document.createElement('div');
            main.appendChild(light);
        }
        
        // Botones para iniciar el semáforo 
        this.startButton = document.createElement("button");
        this.startButton.innerText = "Arranque";
        this.startButton.onclick = () => this.initSequence();
        
        this.reactionButton = document.createElement("button");
        this.reactionButton.innerText = "Reacción";
        this.reactionButton.disabled = true;
        this.reactionButton.onclick = () => this.stopReaction();

        main.appendChild(this.startButton);
        main.appendChild(this.reactionButton);
    }

    initSequence() {
        this.deleteForms();
       

        const h3 = document.querySelector("main > h3");
        if (h3) {
            h3.remove();
        }
        document.querySelector("main").classList.add("load");
        this.startButton.disabled = true;

        setTimeout(() => {
            this.unload_moment = new Date();
            this.endSequence();
        }, 2000 + this.difficulty * 100);
    }


    deleteForms() {
        const formContainer = document.querySelector("main > section:nth-of-type(2)");
        if (formContainer && formContainer.querySelector("form")) {
            formContainer.remove();
        }
    }
    endSequence() {
        document.querySelector("main").classList.add("unload");
        this.reactionButton.disabled = false;
    }

    stopReaction() {
        this.clic_moment = new Date();
        const reactionTime = (this.clic_moment - this.unload_moment) / 1000;
        const resultDisplay = document.createElement('h3');
        resultDisplay.innerText = `Tu tiempo de reacción: ${reactionTime.toFixed(3)} segundos`;
        
        const buttonReaction = document.querySelector("main > button:nth-of-type(2)");
        buttonReaction.after(resultDisplay);
        
        const main = document.querySelector('main');
        main.classList.remove("unload");
        main.classList.remove("load");
        

        this.startButton.disabled = false;
        this.reactionButton.disabled = true;
        this.createRecordForm(reactionTime);
    }

    createRecordForm(reactionTime) {
        
        const container = document.createElement("section")

        const formTitle = document.createElement("h2");
        formTitle.innerText = "Enviar Record";
        container.appendChild(formTitle);
        // Crear el formulario
        const form = document.createElement("form");
        form.action = "semaforo.php";  
        form.method = "POST";

        // Campo de nombre
        const nameLabel = document.createElement("label");
        nameLabel.innerText = "Nombre:";
        nameLabel.setAttribute("for", "nombre");
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.name = "nombre";
        nameInput.id = "nombre";
        nameInput.required = true;

        // Campo de apellidos
        const surnameLabel = document.createElement("label");
        surnameLabel.innerText = "Apellidos:";
        surnameLabel.setAttribute("for", "apellidos")
        const surnameInput = document.createElement("input");
        surnameInput.type = "text";
        surnameInput.name = "apellidos";
        surnameInput.id = "apellidos"
        surnameInput.required = true;

        // Campo de nivel (solo lectura)
        const levelLabel = document.createElement("label");
        levelLabel.innerText = "Nivel:";
        levelLabel.setAttribute("for", "nivel")
        const levelInput = document.createElement("input");
        levelInput.type = "text";
        levelInput.name = "nivel";
        levelInput.id = "nivel";
        levelInput.value = this.difficulty;  // Rellenar con el nivel del juego
        levelInput.readOnly = true;

        // Campo de tiempo de reacción (solo lectura)
        const timeLabel = document.createElement("label");
        timeLabel.innerText = "Tiempo de Reacción (segundos):";
        timeLabel.setAttribute("for", "tiempo_reaccion");
        const timeInput = document.createElement("input");
        timeInput.type = "text";
        timeInput.name = "tiempo_reaccion";
        timeInput.id = "tiempo_reaccion";
        timeInput.value = reactionTime.toFixed(3);  // Rellenar con el tiempo de reacción
        timeInput.readOnly = true;

        // Crear botón de envío
        const submitButton = document.createElement("button");
        submitButton.type = "submit";
        submitButton.innerText = "Enviar Record";

        // Añadir los campos al formulario
        form.appendChild(nameLabel);
        form.appendChild(nameInput);
        form.appendChild(surnameLabel);
        form.appendChild(surnameInput);
        form.appendChild(levelLabel);
        form.appendChild(levelInput);
        form.appendChild(timeLabel);
        form.appendChild(timeInput);
        form.appendChild(submitButton);
        

        /* Este trozo de código sirve para que al enviar el formulario no se recargue la pagina
        y por tanto la dificultad no cambie. Por favor espero que esto no invalide el proyecto, lo único
        que hago es evitar la recarga de la página y poner la lista con los records en el sitio correspondiente, pero toda esta información
        viene del php, eso es lo importante, el js es solo para colocarla en el sitio correspondiente. */
        
    
        // Añadir el formulario al contenedor
        container.appendChild(form);

        // Agregar el contenedor al DOM
        document.querySelector("main > h3").after(container);
    }
}

let currentDifficulty;
