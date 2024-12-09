class Viajes {
    constructor() {
        this.latitude = null;
        this.longitude = null;
        this.error = null;
        this.configurarCarrusel();
        // Intentar obtener la posición del usuario
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this.setPosition.bind(this),
                this.handleError.bind(this)
            );
        } else {
            this.error = "Geolocalización no soportada por el navegador.";
            console.error(this.error);
        }
    }

    configurarCarrusel() {
        const slides = document.querySelectorAll("article img");
        // select next slide button
        const nextSlide = document.querySelector("article button:nth-of-type(1)");

        // current slide counter
        let curSlide = 3;
        // maximum number of slides
        let maxSlide = slides.length - 1;

        // add event listener and navigation functionality
        nextSlide.addEventListener("click", function () {
        // check if current slide is the last and reset current slide
            if (curSlide === maxSlide) {
            curSlide = 0;
        } else {
            curSlide++;
        }

        //   move slide by -100%
        slides.forEach((slide, indx) => {
            var trans = 100 * (indx - curSlide);
            $(slide).css('transform', 'translateX(' + trans + '%)')
        });
        });

        // select next slide button
        const prevSlide = document.querySelector("article button:nth-of-type(2)");

        // add event listener and navigation functionality
        prevSlide.addEventListener("click", function () {
        // check if current slide is the first and reset current slide to last
        if (curSlide === 0) {
            curSlide = maxSlide;
        } else {
            curSlide--;
        }

        //   move slide by 100%
        slides.forEach((slide, indx) => {
            var trans = 100 * (indx - curSlide);
            $(slide).css('transform', 'translateX(' + trans + '%)')
        });
        });
    }

    updateSlides(slides, curSlide) {
        slides.forEach((slide, indx) => {
            const trans = 100 * (indx - curSlide);
            $(slide).css('transform', `translateX(${trans}%)`);
        });
    }

    setPosition(position) {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        console.log(`Latitud: ${this.latitude}, Longitud: ${this.longitude}`);
        this.getStaticMap();
        this.createDynamicMap();
    }

    handleError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                this.error = "El usuario denegó el permiso de geolocalización.";
                break;
            case error.POSITION_UNAVAILABLE:
                this.error = "La información de la posición no está disponible.";
                break;
            case error.TIMEOUT:
                this.error = "La solicitud de geolocalización ha expirado.";
                break;
            default:
                this.error = "Error desconocido al obtener la geolocalización.";
                break;
        }
        console.error(this.error);
    }
    getStaticMap() {
        if (this.latitude && this.longitude) {
            const apiKey = "AIzaSyDHPlVboVe4tAPPNCVNUv3utDaydnXmBk8";
            const url = `https://maps.googleapis.com/maps/api/staticmap?center=${this.latitude},${this.longitude}&zoom=14&size=600x400&markers=color:red%7C${this.latitude},${this.longitude}&key=${apiKey}`;
            document.querySelector("main > section:nth-of-type(2) > img").src = url;
        } else {
            console.error("No se pudo obtener el mapa estático, faltan coordenadas.");
        }
    }
    createDynamicMap() {
        if (this.latitude && this.longitude) {
            const map = new google.maps.Map(document.querySelector("main > section:nth-of-type(2) > div"), {
                center: { lat: this.latitude, lng: this.longitude },
                zoom: 14,
                mapId: "DYNAMIC_MAP_ID",
            });
    
            new google.maps.marker.AdvancedMarkerElement({
                position: { lat: this.latitude, lng: this.longitude },
                map: map,
            });
        } else {
            console.error("No se pudo crear el mapa dinámico, faltan coordenadas.");
        }
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const viajes = new Viajes();
});

