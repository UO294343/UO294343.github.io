class Noticias {
    constructor() {
        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            alert("Tu navegador no soporta la API de archivos.");
        } else {
            console.log("La API de archivos está soportada.");
        }
    }

    readInputFile(file) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            const content = event.target.result;
            this.parseFileContent(content);
        };

        reader.readAsText(file);
    }

    parseFileContent(content) {
        const lines = content.split('\n');
        lines.forEach(line => {
            const parts = line.split('_');
            if (parts.length === 3) {
                const title = parts[0];
                const lead = parts[1];
                const author = parts[2];
                this.addNews(title, lead, author);
            }
        });
    }

    addNews(title, lead, author) {
        const newsSection = $('main section:last-child');
        const article = $('<article></article>');
        
        article.append(`<h3>${title}</h3>`);
        article.append(`<p>${lead}</p>`);
        article.append(`<p>Autor: ${author}</p>`);
        
        newsSection.append(article);
    }
}

$(document).ready(function() {
    const noticias = new Noticias();

    // Manejar la carga del archivo
    $('main > section input').on('change', function(event) {
        if (event == null || event.target == null || event.target.files == null) return;
        const file = event.target.files[0];
        if (file) {
            noticias.readInputFile(file);
        }
    });

    // Manejar la adición de una nueva noticia
    $("main > section:nth-of-type(2) button").on('click', function(event) {
        event.preventDefault();
        const title = $('main > section:nth-of-type(2) input:nth-of-type(1)').val();
        const text = $('main > section:nth-of-type(2) textarea').val();
        const author = $('main > section:nth-of-type(2) input:nth-of-type(2)').val();

        if (title && text && author) {
            noticias.addNews(title, text, author);
            // Limpiar el formulario
            $('main > section:nth-of-type(2) input:nth-of-type(1)').val('');
            $('main > section:nth-of-type(2) textarea').val('');
            $('main > section:nth-of-type(2) input:nth-of-type(2)').val('');
        } else {
            alert("Por favor, rellena todos los campos.");
        }
    });
});
