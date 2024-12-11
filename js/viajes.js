class Viajes {
    constructor() {
        this.latitude = null;
        this.longitude = null;
        this.error = null;
        this.configurarCarrusel();
        this.addListeners();
        // Intentar obtener la posición del usuario
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this.setPosition.bind(this),
                this.handleError.bind(this)
            );
        } else {
            this.error = "Geolocalización no soportada por el navegador.";
            let p = document.createElement("p").textContent = this.error;
            document.querySelector("main").appendChild(p);
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
        const p = document.createElement("p")
        p.textContent = this.error
        document.querySelector("main > section:nth-of-type(2)").append(p);
        this.buttonStatic.remove();
        this.buttonDynamic.remove();
    }

    addListeners() {
        this.buttonStatic = document.querySelector("main > section:nth-of-type(2) > button");
        this.buttonStatic.addEventListener("click", () => {
            this.createStaticMap();
            this.buttonStatic.remove();
        })
        this.buttonDynamic = document.querySelector("main > section:nth-of-type(2) > button:nth-of-type(2)");
        this.buttonDynamic.addEventListener("click", () => {
            this.createDynamicMap();
            this.buttonDynamic.remove();
        })

    }
    
    createStaticMap() {
        
            
        if (this.latitude && this.longitude) {
            const apiKey = "AIzaSyDHPlVboVe4tAPPNCVNUv3utDaydnXmBk8";
            const img = document.createElement("img");
            img.alt="Mapa estático";
            document.querySelector("main > section:nth-of-type(2)").appendChild(img);
            const url = `https://maps.googleapis.com/maps/api/staticmap?center=${this.latitude},${this.longitude}&zoom=14&size=600x400&markers=color:red%7C${this.latitude},${this.longitude}&key=${apiKey}`;
            document.querySelector("main > section:nth-of-type(2) > img").src = url;
        } else {
            return;
        }
    }
    createDynamicMap() {
        if (this.latitude && this.longitude) {
            const div = document.createElement("div");
            document.querySelector("main > section:nth-of-type(2)").appendChild(div);
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
            return;
        }
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const viajes = new Viajes();
});

