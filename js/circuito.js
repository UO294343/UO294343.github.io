class Circuito {
    constructor() {
        this.mapContainer = null;
        this.routeLine = null;
        this.map = null;
        this.loadXml();
        this.setupKmlFileInput();
        this.loadSvg();
    }

    loadXml() {
        const fileInput = $('main > section:first-of-type > input');
        fileInput.on('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleXmlFileUpload(file);
            }
        });
    }

    handleXmlFileUpload(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const xmlText = e.target.result;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");

            const nombre = xmlDoc.querySelector("nombre").textContent;
            const longitudCircuito = xmlDoc.querySelector("longitud_circuito").textContent;
            const longitudCircuitoMedida = xmlDoc.querySelector("longitud_circuito").getAttribute("medida");
            const anchura = xmlDoc.querySelector("anchura").textContent;
            const anchuraMedida = xmlDoc.querySelector("anchura").getAttribute("medida");
            const fecha = xmlDoc.querySelector("fecha").textContent;
            const hora = xmlDoc.querySelector("hora").textContent;
            const vueltas = xmlDoc.querySelector("vueltas").textContent;
            const localidad = xmlDoc.querySelector("localidad").textContent;
            const pais = xmlDoc.querySelector("pais").textContent;

            const referencias = Array.from(xmlDoc.querySelectorAll('referencias referencia')).map(ref => ref.textContent);
            const fotos = Array.from(xmlDoc.querySelectorAll('fotografias fotografia')).map(foto => foto.textContent);
            const videos = Array.from(xmlDoc.querySelectorAll('videos video')).map(video => video.textContent);

            const salida = {
                longitud: xmlDoc.querySelector('salida coordenadas longitud').textContent,
                latitud: xmlDoc.querySelector('salida coordenadas latitud').textContent,
                altitud: xmlDoc.querySelector('salida coordenadas altitud').textContent
            };

            const segmentos = Array.from(xmlDoc.querySelectorAll('tramos tramo')).map(tramo => ({
                distancia: tramo.querySelector('distancia').textContent,
                medidaDistancia: tramo.querySelector('distancia').getAttribute('medida'),
                sector: tramo.querySelector('sector').textContent,
                coordenadas: {
                    longitud: tramo.querySelector('coordenadas longitud').textContent,
                    latitud: tramo.querySelector('coordenadas latitud').textContent,
                    altitud: tramo.querySelector('coordenadas altitud').textContent
                }
            }));

            let stringDatos = ` 
                <p>Nombre:${nombre}</p>
                <p>Longitud: ${longitudCircuito} ${longitudCircuitoMedida}</p>
                <p>Ancho: ${anchura} ${anchuraMedida}</p>
                <p>Fecha: ${fecha}</p>
                <p>Hora: ${hora}</p>
                <p>Vueltas: ${vueltas}</p>
                <p>Localidad: ${localidad}</p>
                <p>País: ${pais}</p>
            `;

            stringDatos += "<p>Referencias:</p><ul>";
            referencias.forEach(referencia => {
                stringDatos += `<li><a href="${referencia}">${referencia}</a></li>`;
            });
            stringDatos += "</ul>";

            stringDatos += "<p>Fotos:</p><ul>";
            fotos.forEach(foto => {
                stringDatos += `<li><img src="xml/${foto}" alt="Foto: ${foto}"></li>`;
            });
            stringDatos += "</ul>";

            stringDatos += "<p>Videos:</p><ul>";
            videos.forEach(video => {
                stringDatos += `
                <li>
                    <video width="320" height="240" controls>
                    <source src="xml/${video}" type="video/mp4">
                    Tu navegador no soporta este formato de video.
                    </video>
                </li>
                `;
            });
            stringDatos += "</ul>";

            stringDatos += `
                <p>Coordenadas de la salida de meta:</p>
                <ul>
                <li>Longitud: ${salida.longitud}</li>
                <li>Latitud: ${salida.latitud}</li>
                <li>Altitud: ${salida.altitud} m</li>
                </ul>
            `;

            stringDatos += "<p>Segmentos:</p><ul>";
            var count = 1;
            segmentos.forEach(segmento => {
                stringDatos += `
                <li>
                    <p>Segmento: ` + count + `<p/>
                    <p>Distancia: ${segmento.distancia} ${segmento.medidaDistancia}</p>
                    <p>Sector: ${segmento.sector}</p>
                    <p>Coordenadas:</p>
                    <ul>
                    <li>Longitud: ${segmento.coordenadas.longitud}</li>
                    <li>Latitud: ${segmento.coordenadas.latitud}</li>
                    <li>Altitud: ${segmento.coordenadas.altitud} m</li>
                    </ul>
                </li>
                `;
                count += 1;
            });
            stringDatos += "</ul>";

            const container = $("main > section:first-of-type");
            container.append(stringDatos);

        };
        reader.readAsText(file);    
    }

    loadSvg() {
        const fileInput = $('main > section:last-of-type > input');
        fileInput.on('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const oldSvg = $('main > section:last-of-type > svg');
                    if (oldSvg.length) {
                        oldSvg.remove();
                    }
                    const svgContainer = $('main > section:last-of-type');
                    const svg = $(e.target.result);
                    svg.attr('viewBox', '0 0 800 400');
                    svgContainer.append(svg);
                };
                reader.readAsText(file);
            }
        });
    }

    // Configurar el evento de carga del archivo
    setupKmlFileInput() {
        const fileInput = $('main > section:nth-of-type(2) > input');
        fileInput.on('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleKmlFileUpload(file);
            }
        });
    }

    // Manejar la carga del archivo KML
    handleKmlFileUpload(file) {
        if (!this.mapContainer) {
            const div = $("<div></div>");
            $("main > section:nth-of-type(2)").append(div);
            this.mapContainer = $("main > section:nth-of-type(2) div")[0];
        }

        this.map = new google.maps.Map(this.mapContainer, {
            zoom: 15,
            mapId: "DYNAMIC_MAP_ID"
        });

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
$(document).ready(() => {
    const circuito = new Circuito();
});
