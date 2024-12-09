class Circuito {
    constructor() {
        this.mapContainer = document.querySelector('main > section > input + div');
        this.svgContainer = document.querySelector('main > section:nth-of-type(2) > input + div');
        this.routeLine = null;
        this.map = null;
        this.initMap();
        this.loadSvg();
    }

    loadSvg() {
        const fileInput = document.querySelector('main > section:nth-of-type(2) > input');
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const svgContainer = $('main > section:nth-of-type(2) > input + div');
                    const svg = $(e.target.result);
                    svg.attr('viewBox', '0 0 800 400');
                    svgContainer.html(svg);
                };
                reader.readAsText(file);
            }
        });
    }

    // Inicializar el mapa
    initMap() {
        this.map = new google.maps.Map(this.mapContainer, {
            zoom: 15,
            mapId: "DYNAMIC_MAP_ID"
        });

        this.setupKmlFileInput();
    }

    // Configurar el evento de carga del archivo
    setupKmlFileInput() {
        const fileInput = document.querySelector('main > section > input');
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleKmlFileUpload(file);
            }
        });
    }

    // Manejar la carga del archivo KML
    handleKmlFileUpload(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const kmlText = e.target.result;
            const { coordinates, markers } = this.parseKML(kmlText);

            // Centrar el mapa en el primer punto si hay coordenadas
            if (coordinates.length > 0) {
                this.map.setCenter(coordinates[0]);
            }

            // Dibujar la línea del circuito
            this.drawRoute(coordinates);

            // Crear marcadores para cada punto (opcional, descomentar si es necesario)
            this.addMarkers(markers);
        };

        reader.readAsText(file);
    }

    // Parsear el KML y extraer coordenadas y marcadores
    parseKML(kmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(kmlText, "text/xml");

        const placemarks = xmlDoc.getElementsByTagName('Placemark');
        const coordinates = [];
        const markers = [];

        for (let placemark of placemarks) {
            const coordElements = placemark.getElementsByTagName('coordinates');
            const nameElements = placemark.getElementsByTagName('name');

            if (coordElements.length > 0) {
                const coordText = coordElements[0].textContent.trim();
                const [lng, lat, alt] = coordText.split(',').map(parseFloat);

                const coord = { lat, lng };
                coordinates.push(coord);

                // Si tiene nombre y no es "Ruta Completa", crear un marcador
                if (nameElements.length > 0 && nameElements[0].textContent !== 'Ruta Completa') {
                    markers.push({
                        position: coord,
                        title: nameElements[0].textContent
                    });
                }
            }
        }

        return { coordinates, markers };
    }
a
    // Dibujar la ruta en el mapa
    drawRoute(coordinates) {
        if (this.routeLine) {
            this.routeLine.setMap(null); // Eliminar la línea previa si existe
        }

        this.routeLine = new google.maps.Polyline({
            path: coordinates,
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 4,
            map: this.map
        });
    }

    // Añadir marcadores al mapa (opcional, descomentar si lo necesitas)
    addMarkers(markers) {
        markers.forEach(markerData => {
            new google.maps.marker.AdvancedMarkerElement({
                position: markerData.position,
                map: this.map,
                title: markerData.title
            });
        });
    }
}

// Iniciar la clase cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    const circuito = new Circuito();
});
