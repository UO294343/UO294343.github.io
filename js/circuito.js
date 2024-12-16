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
            const $xmlDoc = $($.parseXML(xmlText));

            const nombre = $xmlDoc.find('nombre').text();
            const longitudCircuito = $xmlDoc.find('longitud_circuito').text();
            const longitudCircuitoMedida = $xmlDoc.find('longitud_circuito').attr('medida');
            const anchura = $xmlDoc.find('anchura').text();
            const anchuraMedida = $xmlDoc.find('anchura').attr('medida');
            const fecha = $xmlDoc.find('fecha').text();
            const hora = $xmlDoc.find('hora').text();
            const vueltas = $xmlDoc.find('vueltas').text();
            const localidad = $xmlDoc.find('localidad').text();
            const pais = $xmlDoc.find('pais').text();

            const referencias = $xmlDoc.find('referencias referencia').map(function() {
                return $(this).text();
            }).get();

            const fotos = $xmlDoc.find('fotografias fotografia').map(function() {
                return $(this).text();
            }).get();

            const videos = $xmlDoc.find('videos video').map(function() {
                return $(this).text();
            }).get();

            const salida = {
                longitud: $xmlDoc.find('salida coordenadas longitud').text(),
                latitud: $xmlDoc.find('salida coordenadas latitud').text(),
                altitud: $xmlDoc.find('salida coordenadas altitud').text()
            };

            const segmentos = $xmlDoc.find('tramos tramo').map(function() {
                const $tramo = $(this);
                return {
                    distancia: $tramo.find('distancia').text(),
                    medidaDistancia: $tramo.find('distancia').attr('medida'),
                    sector: $tramo.find('sector').text(),
                    coordenadas: {
                        longitud: $tramo.find('coordenadas longitud').text(),
                        latitud: $tramo.find('coordenadas latitud').text(),
                        altitud: $tramo.find('coordenadas altitud').text()
                    }
                };
            }).get();

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
                    <video controls>
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
        const $xmlDoc = $($.parseXML(kmlText));
        const coordinates = [];
        const markers = [];

        $xmlDoc.find('Placemark').each(function() {
            const $placemark = $(this);
            const $coordElements = $placemark.find('coordinates');
            const $nameElements = $placemark.find('name');

            if ($coordElements.length > 0) {
                const coordText = $coordElements.first().text().trim();
                const [lng, lat, alt] = coordText.split(',').map(parseFloat);
                const coord = { lat, lng };
                coordinates.push(coord);

                // Si tiene nombre y no es "Ruta Completa", crear un marcador
                if ($nameElements.length > 0 && $nameElements.first().text() !== 'Ruta Completa') {
                    markers.push({
                        position: coord,
                        title: $nameElements.first().text()
                    });
                }
            }
        });

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
