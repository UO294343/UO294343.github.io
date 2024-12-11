<?php
// Archivo principal para gestionar la aplicación de F1 Strategy Manager

// Clase para gestionar la base de datos
class BaseDeDatos {
    private $conexion;

    public function __construct($servidor, $usuario, $clave, $nombreDB) {
        $this->conexion = new mysqli($servidor, $usuario, $clave);
        if ($this->conexion->connect_error) {
            die("Error de conexión: " . $this->conexion->connect_error);
        }
        $this->conexion->query("CREATE DATABASE IF NOT EXISTS $nombreDB");
        $this->conexion->select_db($nombreDB);
    }

    public function crearTablas() {
        $tablas = [
            "CREATE TABLE IF NOT EXISTS equipos (
                id_equipo INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100)
            )",
            "CREATE TABLE IF NOT EXISTS pilotos (
                id_piloto INT AUTO_INCREMENT PRIMARY KEY,
                nombre_completo VARCHAR(100),
                id_equipo INT,
                numero_coche INT,
                FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo)
            )",
            "CREATE TABLE IF NOT EXISTS circuitos (
                id_circuito INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100),
                pais VARCHAR(100),
                longitud DECIMAL(5,2),
                numero_vueltas INT,
                condiciones_comunes ENUM('SOLEADO', 'LLUVIOSO', 'NUBLADO')
            )",
            "CREATE TABLE IF NOT EXISTS estrategias (
                id_estrategia INT AUTO_INCREMENT PRIMARY KEY,
                id_equipo INT,
                nombre VARCHAR(100),
                tipo_neumatico VARCHAR(50),
                combustible_inicial ENUM('BAJO', 'NORMAL', 'ALTO'),
                FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo)
            )",
            "CREATE TABLE IF NOT EXISTS resultados (
                id_resultado INT AUTO_INCREMENT PRIMARY KEY,
                id_circuito INT,
                id_piloto INT,
                id_estrategia INT,
                posicion_final INT,
                FOREIGN KEY (id_circuito) REFERENCES circuitos(id_circuito),
                FOREIGN KEY (id_piloto) REFERENCES pilotos(id_piloto),
                FOREIGN KEY (id_estrategia) REFERENCES estrategias(id_estrategia)
            )"
        ];

        foreach ($tablas as $sql) {
            $this->conexion->query($sql);
        }
    }

    public function importarTodasTablasDesdeCSV($archivo) {
        $file = fopen($archivo, 'r');
        if ($file === false) {
            die("No se pudo abrir el archivo.");
        }

        // Obtener todas las tablas
        $tablas = ['equipos', 'pilotos', 'circuitos', 'estrategias'];

        foreach ($tablas as $tabla) {
            // Reiniciar el puntero del archivo
            rewind($file);
            
            // Obtener las columnas para esta tabla específica
            $columnas = fgetcsv($file);
            
            // Preparar la consulta base
            $queryBase = "INSERT INTO $tabla (" . implode(",", $columnas) . ") VALUES ";
            $valores = [];

            // Leer y procesar cada fila
            while (($fila = fgetcsv($file)) !== false) {
                // Verificar si el número de columnas coincide
                if (count($fila) === count($columnas)) {
                    $valores[] = "('" . implode("','", array_map([$this->conexion, 'real_escape_string'], $fila)) . "')";
                }
            }

            // Ejecutar la inserción si hay valores
            if (!empty($valores)) {
                $query = $queryBase . implode(",", $valores);
                $this->conexion->query($query);
            }
        }

        fclose($file);
        return "Datos importados correctamente para todas las tablas.";
    }

    public function exportarTodasTablasACSV() {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="exportacion.csv"');
        $output = fopen('php://output', 'w');
    
        $tablas = ['equipos', 'pilotos', 'circuitos', 'estrategias', 'resultados'];
    
        foreach ($tablas as $tabla) {
            // Añadir un separador entre tablas
            fputcsv($output, ["--- $tabla ---"]);
    
            $resultado = $this->conexion->query("SELECT * FROM $tabla");
            $columnas = array_keys($resultado->fetch_assoc());
            fputcsv($output, $columnas);
    
            $resultado->data_seek(0); // Reiniciar el puntero del resultado
            while ($fila = $resultado->fetch_assoc()) {
                fputcsv($output, $fila);
            }
        }
    
        fclose($output);
        exit; // Terminar para evitar agregar datos adicionales al archivo.
    }

    public function obtenerOpciones($tabla, $columnaFiltro = null, $valorFiltro = null) {
        $query = "SELECT * FROM $tabla";
        if ($columnaFiltro && $valorFiltro !== null) {
            $query .= " WHERE $columnaFiltro = '$valorFiltro'";
        }
        $resultado = $this->conexion->query($query);
        $opciones = [];
        while ($fila = $resultado->fetch_assoc()) {
            $opciones[] = $fila;
        }
        return $opciones;
    }

    public function obtenerDetallesCircuito($circuitoId) {
        $query = "SELECT * FROM circuitos WHERE id_circuito = $circuitoId";
        $resultado = $this->conexion->query($query);
        return $resultado->fetch_assoc();
    }

    public function obtenerDetallesEstrategia($estrategiaId) {
        $query = "SELECT * FROM estrategias WHERE id_estrategia = $estrategiaId";
        $resultado = $this->conexion->query($query);
        return $resultado->fetch_assoc();
    }

    public function simularCarrera($circuitoId, $equipoId, $estrategiaId, $pilotoId) {
        // Obtener condiciones del circuito
        $circuito = $this->conexion->query("SELECT condiciones_comunes FROM circuitos WHERE id_circuito = $circuitoId")
                                  ->fetch_assoc();
        $condiciones = $circuito['condiciones_comunes'];

        // Obtener detalles de la estrategia
        $estrategia = $this->conexion->query("SELECT tipo_neumatico, combustible_inicial FROM estrategias WHERE id_estrategia = $estrategiaId")
                                    ->fetch_assoc();

        // Calcular posición final
        $posicion = rand(1, 10);
        if (($condiciones === 'SOLEADO' && $estrategia['tipo_neumatico'] === 'BLANDO') ||
            ($condiciones === 'LLUVIOSO' && $estrategia['tipo_neumatico'] === 'INTERMEDIO')) {
            $posicion -= 2; // Mejora la posición si el neumático es adecuado
        }

        if ($estrategia['combustible_inicial'] === 'BAJO') {
            $posicion += 1; // Penalización por paradas frecuentes
        } elseif ($estrategia['combustible_inicial'] === 'ALTO') {
            $posicion += rand(0, 1); // Potencial penalización por peso
        }

        $posicion = max(1, min(10, $posicion)); // Asegurar posición entre 1 y 10

        // Guardar resultados
        $query = "INSERT INTO resultados (id_circuito, id_piloto, id_estrategia, posicion_final) 
                  VALUES ($circuitoId, $pilotoId, $estrategiaId, $posicion)";
        $this->conexion->query($query);

        return "Carrera simulada con éxito. Posición final: $posicion.";
    }
}   

// Procesamiento de solicitudes
$bd = new BaseDeDatos('localhost', 'DBUSER2024', 'DBPSWD2024', 'f1_strategy_manager');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['crear_bd'])) {
        $bd->crearTablas();
        echo 'Base de datos y tablas creadas correctamente.';
    }
    if (isset($_POST['importar_csv'])) {
        $mensaje = $bd->importarTodasTablasDesdeCSV($_FILES['archivo_csv']['tmp_name']);
        echo $mensaje;
    }
    if (isset($_POST['exportar_csv'])) {
        $bd->exportarTodasTablasACSV();
    }
    if (isset($_POST['simular_carrera'])) {
        $mensaje = $bd->simularCarrera($_POST['circuito'], $_POST['equipo'], $_POST['estrategia'], $_POST['piloto']);
        echo $mensaje;
    }
}

if (isset($_GET['action'])) {
    switch ($_GET['action']) {
        case 'obtener_pilotos':
            $equipoId = $_GET['equipo'];
            $pilotos = $bd->obtenerOpciones('pilotos', 'id_equipo', $equipoId);
            echo json_encode($pilotos);
            exit;

        case 'obtener_estrategias':
            $equipoId = $_GET['equipo'];
            $estrategias = $bd->obtenerOpciones('estrategias', 'id_equipo', $equipoId);
            echo json_encode($estrategias);
            exit;

        case 'obtener_detalles_circuito':
            $circuitoId = $_GET['circuito'];
            $detalles = $bd->obtenerDetallesCircuito($circuitoId);
            echo json_encode($detalles);
            exit;

        case 'obtener_detalles_estrategia':
            $estrategiaId = $_GET['estrategia'];
            $detalles = $bd->obtenerDetallesEstrategia($estrategiaId);
            echo json_encode($detalles);
            exit;
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>F1 Strategy Manager</title>
    <script src="js/test.js"></script>
</head>
<body>
    <form method="post">
        <section>
            <h1>Crear Base de Datos</h1>
            <button type="submit" name="crear_bd">Crear Base de Datos</button>
        </section>
    </form>

    <form method="post" enctype="multipart/form-data">
        <section>
            <h1>Importar Datos desde CSV</h1>
            <label>Archivo CSV:</label>
            <input type="file" name="archivo_csv" accept=".csv" required>
            <button type="submit" name="importar_csv">Importar para Todas las Tablas</button>
        </section>
    </form>

    <form method="post">
        <section>
            <h1>Exportar Datos a CSV</h1>
            <button type="submit" name="exportar_csv">Exportar Todas las Tablas</button>
        </section>
    </form>

    <form method="post">
        <section>
            <h1>Simular Carrera</h1>
            <label>Selecciona Circuito:</label>
            <select name="circuito">
                <option value="">Selecciona un circuito</option>
                <?php
                $circuitos = $bd->obtenerOpciones('circuitos');
                foreach ($circuitos as $circuito) {
                    echo "<option value='{$circuito['id_circuito']}'>{$circuito['nombre']}</option>";
                }
                ?>
            </select>
            <div id="circuito_detalles"></div>

            <label>Selecciona Equipo:</label>
            <select name="equipo">
                <option value="">Selecciona un equipo</option>
                <?php
                $equipos = $bd->obtenerOpciones('equipos');
                foreach ($equipos as $equipo) {
                    echo "<option value='{$equipo['id_equipo']}'>{$equipo['nombre']}</option>";
                }
                ?>
            </select>

            <label>Selecciona Estrategia:</label>
            <select name="estrategia">
                <option value="">Selecciona una estrategia</option>
            </select>
            <div id="estrategia_detalles"></div>

            <label>Selecciona Piloto:</label>
            <select name="piloto" id="piloto">
                <option value="">Selecciona un piloto</option>
            </select>

            <button type="submit" name="simular_carrera">Simular Carrera</button>
        </section>
    </form>
</body>
</html>
