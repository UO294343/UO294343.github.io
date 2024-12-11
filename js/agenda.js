class Agenda {
    constructor() {
        this.baseURL = "https://ergast.com/api/f1/current.json";
    }

    obtenerCarreras() {
        $.ajax({
            url: this.baseURL,
            method: "GET",
            dataType: "json",
            success: (data) => this.mostrarCarreras(data),
            error: (err) => console.error("Error al obtener las carreras:", err),
        });
    }

    mostrarCarreras(data) {
        const contenedor = document.querySelector("main > section");
        contenedor.innerHTML = ""; // Limpia el contenido previo

        const carreras = data.MRData.RaceTable.Races;
        const tituloSection = document.createElement("h3");
        tituloSection.textContent = "Carreras programadas:";
        contenedor.appendChild(tituloSection);
        carreras.forEach((carrera) => {
            const nombre = carrera.raceName;
            const circuito = carrera.Circuit.circuitName;
            const coordenadas = `Latitud: ${carrera.Circuit.Location.lat}, Longitud: ${carrera.Circuit.Location.long}`;
            const fecha = `${carrera.date} ${carrera.time.slice(0, 5) || ""}`;

            // Crear el artículo para cada carrera
            const articulo = document.createElement("article");

            const titulo = document.createElement("h3");
            titulo.textContent = nombre;
            

            const parrafoCircuito = document.createElement("p");
            parrafoCircuito.textContent = `Circuito: ${circuito}`;

            const parrafoCoordenadas = document.createElement("p");
            parrafoCoordenadas.textContent = `Coordenadas: ${coordenadas}`;

            const parrafoFecha = document.createElement("p");
            parrafoFecha.textContent = `Fecha y hora: ${fecha}`;

            // Agregar todo al artículo
            articulo.appendChild(titulo);
            articulo.appendChild(parrafoCircuito);
            articulo.appendChild(parrafoCoordenadas);
            articulo.appendChild(parrafoFecha);

            // Añadir el artículo al contenedor
            contenedor.appendChild(articulo);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const agenda = new Agenda();

    // Agregar evento al botón
    document.querySelector("main > input").addEventListener("click", () => {
        agenda.obtenerCarreras();
    });
});
