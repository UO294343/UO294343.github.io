class Fondo {
    constructor(pais, capital, circuito) {
        this.pais = pais;
        this.capital = capital;
        this.circuito = circuito;
        this.apiKey = '82b1d95babce0f92f495b26ce6b2d33e'; 
    }

    obtenerImagenFondo() {
        // Corrected URL with appropriate parameters
        const url = `https://api.flickr.com/services/rest/?method=flickr.photos.search`;

        $.getJSON(url, {
            per_page: 10, // Limit number of results
            api_key: this.apiKey, 
            tags: `${this.pais}, ${this.capital}, ${this.circuito}`, 
            text: "Grand Prix Monaco",
            tagmode: "all",
            format: "json", 
            nojsoncallback: 1 
        })
        .done((data) => {
            const fotos = data.photos.photo;
            if (fotos.length > 0) {
                const indiceAleatorio = Math.floor(Math.random() * fotos.length);
                const foto = fotos[indiceAleatorio];

                const imageUrl = `https://live.staticflickr.com/${foto.server}/${foto.id}_${foto.secret}_b.jpg`;

                this.establecerImagenDeFondo(imageUrl);
            } else {
                console.log("No se encontraron imágenes para el circuito.");
            }
        })
    }

    establecerImagenDeFondo(imageUrl) {
        $("main").css({
            "background-image": `url(${imageUrl})`,
            "background-size": "cover",
            "background-position": "center",
            "background-repeat": "no-repeat",
            "min-height": "100vh", // Ensure full screen coverage
            "margin": "0"
        });
    }
}

$(document).ready(function() {
    // Example with Monaco Circuit
    const fondo = new Fondo("Monaco", "Monaco", "Monaco Circuit F1");
    fondo.obtenerImagenFondo();
});
