class Pais {
    constructor(nombrePais, nombreCapital, poblacion) {
        this.nombrePais = nombrePais;
        this.nombreCapital = nombreCapital;
        this.poblacion = poblacion;
        this.nombreCircuitoF1 = null;
        this.formaGobierno = null;
        this.coordenadasLineaMeta = null;
        this.religionMayoritaria = null;

        
    }

    // Método para rellenar el valor del resto de atributos
    setDatosExtras(nombreCircuitoF1, formaGobierno, coordenadasLineaMeta, religionMayoritaria) {
        this.nombreCircuitoF1 = nombreCircuitoF1;
        this.formaGobierno = formaGobierno;
        this.coordenadasLineaMeta = coordenadasLineaMeta;
        this.religionMayoritaria = religionMayoritaria;
    }

    // Método que devuelve el nombre del país
    obtenerNombrePais() {
        return `Nombre del país: ${this.nombrePais}`;
    }

    // Método que devuelve el nombre de la capital
    obtenerNombreCapital() {
        return `Capital: ${this.nombreCapital}`;
    }

    // Método que devuelve la información secundaria en formato HTML5
    obtenerInfoSecundaria() {
        return `
            <ul>
                <li><strong>Circuito de F1:</strong> ${this.nombreCircuitoF1}</li>
                <li><strong>Población:</strong> ${this.poblacion}</li>
                <li><strong>Forma de Gobierno:</strong> ${this.formaGobierno}</li>
                <li><strong>Religión Mayoritaria:</strong> ${this.religionMayoritaria}</li>
            </ul>
        `;
    }

    // Método para escribir las coordenadas de la línea de meta en el documento HTML
    mostrarCoordenadasEnHTML() {
        return `Coordenadas de la Línea de Meta: latitud ${this.coordenadasLineaMeta.lat}, longitud ${this.coordenadasLineaMeta.lon}, 
            altitud ${this.coordenadasLineaMeta.alt}`;
    }

}

class Meteo {
    constructor() {
        this.apikey = "9ad14e0d0f95c11fdb7be75e6efbee72";
        this.ciudad = "Monaco";
        this.tipo = "&mode=xml";
        this.unidades = "&units=metric";
        this.idioma = "&lang=es";
        this.url = `https://api.openweathermap.org/data/2.5/forecast?q=${this.ciudad}${this.tipo}${this.unidades}${this.idioma}&APPID=${this.apikey}`;
        this.verXML();
    }

    cargarDatos() {
        $.ajax({
            dataType: "xml",
            url: this.url,
            method: 'GET',
            success: function(datos) {
                let pronosticoContainer = $("main > section + section");
                if (pronosticoContainer.length > 0) {
                    pronosticoContainer.empty();
                } else {
                    $("main").append("<section></section>");
                    pronosticoContainer = $("main > section + section");	
                }
                pronosticoContainer.append("<h3>Pronóstico del tiempo</h3>");
                let diasAgregados = new Set(); // Control para asegurar que se agregue solo una entrada por día

                $(datos).find("time").each(function() {
                    let fechaCompleta = $(this).attr("from");
                    let [fecha, hora] = fechaCompleta.split("T"); // Dividimos en fecha y hora

                    // Solo añadimos el pronóstico si es a las 12:00 y aún no hemos agregado ese día
                    if (hora === "12:00:00" && diasAgregados.size < 5 && !diasAgregados.has(fecha)) {  
                        diasAgregados.add(fecha); // Añadimos el día al conjunto

                        let tempMax = $(this).find("temperature").attr("max");
                        let tempMin = $(this).find("temperature").attr("min");
                        let humedad = $(this).find("humidity").attr("value");
                        let icono = $(this).find("symbol").attr("var");
                        let precipitacion = $(this).find("precipitation").attr("value") || "0";
                        // Crear el artículo para cada día
                        let diaHtml = `
                            <article>
                                <h3>${fecha}</h3>
                                <p>Temperatura máxima: ${tempMax}°C</p>
                                <p>Temperatura mínima: ${tempMin}°C</p>
                                <p>Humedad: ${humedad}%</p>
                                <p>Precipitación: ${precipitacion} mm</p>
                                <img src="https://openweathermap.org/img/wn/${icono}@4x.png" alt="Icono del tiempo">
                            </article>`;
                        
                        // Añadimos el artículo al contenedor de pronósticos
                        pronosticoContainer.append(diaHtml);
                    }
                });
            },
            error: function() {
                $("main section").last().html("¡Tenemos problemas! No puedo obtener XML de <a href='https://openweathermap.org'>OpenWeatherMap</a>");
            }
        });
    }

    verXML() {
        
        this.cargarDatos();
        $("button").attr("disabled", "disabled");
    }
}


document.addEventListener("DOMContentLoaded", function() {
    var pais = new Pais("Mónaco", "Mónaco", 39050);
    pais.setDatosExtras("Circuito de Mónaco", "Monarquía Constitucional", { lat: 43.7350309, lon: 7.4212720, alt: 4.6307028 }, "Católica");
    let informacionPais = `
        <section>
            <h3>Información sobre el país</h3>
            <p>${pais.obtenerNombrePais()}</p>
            <p>${pais.obtenerNombreCapital()}</p>
            ${pais.obtenerInfoSecundaria()}
            <p>${pais.mostrarCoordenadasEnHTML()}</p>
        </section>`;
    document.querySelector("main").insertAdjacentHTML("beforeend", informacionPais);

    

    var meteo = new Meteo();
    meteo.verXML();
    
});



