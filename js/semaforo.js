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
        const container = document.getElementById("semaforo-container");

        

        const lightContainer = document.createElement("div");
        lightContainer.classList.add("light-container");
        
        // Crear las luces del semáforo
        for (let i = 0; i < this.lights; i++) {
            const light = document.createElement("div");
            light.classList.add("light");
            lightContainer.appendChild(light);
        }
        container.appendChild(lightContainer);

        // Botones para iniciar el semáforo y medir la reacción
        this.startButton = document.createElement("button");
        this.startButton.innerText = "Arranque";
        this.startButton.onclick = () => this.initSequence();
        
        this.reactionButton = document.createElement("button");
        this.reactionButton.innerText = "Reacción";
        this.reactionButton.disabled = true;
        this.reactionButton.onclick = () => this.stopReaction();

        container.appendChild(this.startButton);
        container.appendChild(this.reactionButton);

        this.resultDisplay = document.createElement("p");
        container.appendChild(this.resultDisplay);
    }

    initSequence() {
        // Eliminar formularios previos
        const forms = document.querySelectorAll("#semaforo-container + section form");
        
        forms.forEach(form => form.remove());

        this.startButton.disabled = true;
        this.resultDisplay.innerText = "";

        const lights = document.querySelectorAll(".light");
        let delay = 500;

        // Encender luces una a una con un retardo
        lights.forEach((light, index) => {
            setTimeout(() => light.classList.add("red"), delay * index);
        });

        // Iniciar temporizador para el apagado con dificultad
        const timeout = 2000 + this.difficulty * 1000;
        setTimeout(() => {
            this.unload_moment = new Date();
            this.endSequence();
        }, timeout);
    }

    endSequence() {
        document.querySelectorAll(".light").forEach(light => {
            light.classList.remove("red");
        });
        document.querySelector(".light-container").classList.add("unload");

        this.reactionButton.disabled = false;
    }

    stopReaction() {
        this.clic_moment = new Date();
        const reactionTime = (this.clic_moment - this.unload_moment) / 1000;
        this.resultDisplay.innerText = `Tu tiempo de reacción: ${reactionTime.toFixed(3)} segundos`;

        this.startButton.disabled = false;
        this.reactionButton.disabled = true;

        document.querySelector(".light-container").classList.remove("unload");
        this.createRecordForm(reactionTime);
    }

    createRecordForm(reactionTime) {
        
        const container = document.createElement("section")

        const formTitle = document.createElement("h3");
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

        form.addEventListener("submit", (event) => {
            event.preventDefault(); 
        
            const formData = new FormData(form);
            
            fetch("semaforo.php", {
                method: "POST",
                body: formData,
            })
            .then(response => response.text())
            .then(data => {
                const main = document.querySelector("main");
                const semaphore = document.querySelector("main > section:nth-of-type(2)");

                container.remove();
                
                if(semaphore) {
                    semaphore.insertAdjacentHTML("afterend", data);
                }else {
                    main.insertAdjacentHTML("beforeend", data);
                }

                const extraRecordsSection = document.querySelector("main > section:nth-of-type(4)");
                if (extraRecordsSection) {
                    extraRecordsSection.remove();
                }
            })
            .catch(error => {
                console.error("Error al enviar el formulario:", error);
            });
        });
    
        // Añadir el formulario al contenedor
        container.appendChild(form);

        // Agregar el contenedor al DOM
        document.querySelector("main > section:nth-of-type(2)").after(container);
    }
}

let currentDifficulty;

document.addEventListener("DOMContentLoaded", () => {
    new Semaforo();
});