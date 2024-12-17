class Agenda {
    constructor() {
        this.baseURL = "https://ergast.com/api/f1/current.json";
        this.addEventListeners();
    }

    addEventListeners() {
        $("main > input").on("click", () => {
            this.obtenerCarreras();
        });
    }

    obtenerCarreras() {
        $.ajax({
            url: this.baseURL,
            method: "GET",
            dataType: "json",
            success: (data) => this.mostrarCarreras(data),
            error: (err) => this.mostrarError(err),
        });
    }

    mostrarCarreras(data) {
        const $contenedor = $("main > section");
        $contenedor.empty(); // Limpia el contenido previo

        const carreras = data.MRData.RaceTable.Races;

        if (carreras.length === 0) {
            $contenedor.append("<p>No hay carreras programadas actualmente.</p>");
            return;
        }

        $contenedor.append("<h3>Carreras programadas:</h3>");

        carreras.forEach((carrera) => {
            const nombre = carrera.raceName;
            const circuito = carrera.Circuit.circuitName;
            const coordenadas = `Latitud: ${carrera.Circuit.Location.lat}, Longitud: ${carrera.Circuit.Location.long}`;
            const fecha = `${carrera.date} ${carrera.time ? carrera.time.slice(0, 5) : ""}`;

            // Crear el artículo para cada carrera
            const articulo = `
                <article>
                    <h3>${nombre}</h3>
                    <p><strong>Circuito:</strong> ${circuito}</p>
                    <p><strong>Coordenadas:</strong> ${coordenadas}</p>
                    <p><strong>Fecha y hora:</strong> ${fecha}</p>
                </article>
            `;

            $contenedor.append(articulo);
        });
    }

    mostrarError(err) {
        const $contenedor = $("main > section");
        $contenedor.empty(); // Limpia cualquier contenido previo
        console.error("Error al obtener las carreras:", err);
        $contenedor.append("<p>Hubo un error al obtener las carreras. Por favor, inténtalo más tarde.</p>");
    }
}

$(document).ready(() => {
    const agenda = new Agenda();

    
});
