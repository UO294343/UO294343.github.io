<?php
class Moneda {
    private $monedaLocal;
    private $monedaComparada;
    private $apiKey;

    public function __construct($monedaLocal, $monedaComparada) {
        $this->monedaLocal = $monedaLocal;
        $this->monedaComparada = $monedaComparada;
        $this->apiKey = '75ba611790afc91bc8d24cb9'; 
    }

    public function obtenerCambio() {
        $url = "https://v6.exchangerate-api.com/v6/{$this->apiKey}/pair/{$this->monedaLocal}/{$this->monedaComparada}";

        $response = file_get_contents($url);
        $data = json_decode($response, true);

        if (isset($data['conversion_rate'])) {
            return $data['conversion_rate'];
        } else {
            return null;
        }
    }

    public function mostrarCambio() {
        $cambio = $this->obtenerCambio();
        echo "<section>";
        echo "<h3>Cambio de moneda</h3>";
        if ($cambio) {
            echo "<p>1 {$this->monedaLocal} equivale a {$cambio} {$this->monedaComparada}.</p>";
        } else {
            echo "<p>No se pudo obtener el tipo de cambio en este momento.</p>";
        }
        echo "</section>";
    }
}
class Carrusel {
    private $pais;
    private $capital;
    private $imagenes;
    private $apiKey;
    
    public function __construct($capital, $pais) {
        $this->capital = $capital;
        $this->pais = $pais;
        $this->apiKey = '82b1d95babce0f92f495b26ce6b2d33e';  
        $this->obtenerImagenes();
    }
    
    private function obtenerImagenes() {
        $url = "https://api.flickr.com/services/rest/?method=flickr.photos.search" .
               "&api_key={$this->apiKey}" .
               "&text=" . urlencode("{$this->pais} {$this->capital} country") .
               "&format=json&nojsoncallback=1" .
               "&per_page=10";
        
        $response = file_get_contents($url);
        $data = json_decode($response, true);
        
        $this->imagenes = [];
        if (isset($data['photos']['photo'])) {
            foreach ($data['photos']['photo'] as $photo) {
                $imageUrl = "https://farm{$photo['farm']}.staticflickr.com/{$photo['server']}/{$photo['id']}_{$photo['secret']}_m.png";
                $this->imagenes[] = $imageUrl;
            }
        }
    }
    
    public function insertarImagenesCarrusel() {
        echo "<article>";
        echo"<h3>Carrusel</h3>";
        foreach ($this->imagenes as $imagen) {
            echo "<img src='{$imagen}' alt='Imagen de {$this->pais}'>";
        }
        echo "<button><</button>";
        echo "<button>></button>";
        echo "</article>";
    }
    
}

$carrusel = new Carrusel("Mónaco", "Mónaco");
$moneda = new Moneda("EUR", "USD"); 
?>
<!DOCTYPE HTML>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <!--Autor-->
    <meta name="author" content="Sergio Riesco Collar"/>
    <!--Descripción-->
    <meta name ="description" content ="Sección viajes" />
    <!--Palabras clave del contenido-->
    <meta name ="keywords" content ="viajes, f1" />
    <!--Definir la ventana gráfica-->
    <meta name ="viewport" content ="width=device-width, initial-scale=1.0" />
    <!--Definir hoja de estilos-->
    <link rel="stylesheet" type="text/css" href="estilo/estilo.css" />
    <link rel="stylesheet" type="text/css" href="estilo/layout.css" />
    <link rel="icon" href="multimedia/imagenes/favicon.ico" />
    <script async="" defer="" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDHPlVboVe4tAPPNCVNUv3utDaydnXmBk8&loading=async&libraries=marker"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script src="js/viajes.js"></script>
    <title>Viajes - F1 Desktop</title>
</head>
<body>
    <header> 
        <a href="index.html"><h1>F1 Desktop</h1></a>
        <nav>
            <a href="index.html">Inicio</a> 
            <a href="piloto.html">Piloto</a> 
            <a href="noticias.html">Noticias</a> 
            <a href="calendario.html">Calendario</a> 
            <a href="metereologia.html">Metereología</a> 
            <a href="circuito.html">Circuito</a> 
            <a href="viajes.php" class="active">Viajes</a> 
            <a href="juegos.html">Juegos</a> 
        </nav>   
    </header>
    <p>Estás en: <a href="index.html">Inicio</a> >> Viajes</p>
    <main>
        <h2>Viajes</h2>
        
        <?php $carrusel->insertarImagenesCarrusel(); ?>
        
        <?php $moneda->mostrarCambio(); ?>
        
        <section>
            <h3>Mapa</h3>
            <button>Obtener mapa estático</button>
            <button>Obtener mapa dinámico</button>
        </section>
        
    </main>
    
    
</body>
</html>
