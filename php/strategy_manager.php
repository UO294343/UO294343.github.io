<?php
class F1StrategyManager {
    private $conexion;

    public function __construct($servidor, $usuario, $clave, $nombreDB) {
        $this->conexion = new mysqli($servidor, $usuario, $clave);
        if ($this->conexion->connect_error) {
            throw new Exception("Error de conexión: " . $this->conexion->connect_error);
        }
        $this->listaCondiciones = ['SOLEADO', 'LLUVIOSO', 'NUBLADO'];
        $this->tablas = ["resultados", "estrategias", "pilotos", "circuitos", "equipos"];
        $this->crearTablas(FALSE);
        $this->conexion->select_db($nombreDB);
    }


    public function crearTablas($borrarTablas = true) {
        if ($borrarTablas) {
            $this->borrarTablas();
        }
        
        // Leer el archivo SQL
        $archivoSQL = 'base_de_datos.sql';
        $contenidoSQL = file_get_contents($archivoSQL);

        if ($contenidoSQL === false) {
            throw new Exception("Error al leer el archivo SQL.");
        }

        // Dividir el archivo en consultas individuales 
        $consultas = explode(';', $contenidoSQL);

        // Ejecutar cada consulta de SQL
        foreach ($consultas as $consulta) {
            $consulta = trim($consulta); // Eliminar espacios en blanco alrededor de la consulta
            if (!empty($consulta)) {
                // Ejecutar la consulta
                if (!$this->conexion->query($consulta)) {
                    throw new Exception("Error al ejecutar la consulta: " . $this->conexion->error);
                }
            }
        }
    }

    public function borrarTablas() {
        foreach ($this->tablas as $tabla) {
            $this->conexion->query("DROP TABLE IF EXISTS $tabla");
        }
    }
    public function borrarDatosTablas() {
        // Desactivar restricciones de clave foránea
        $this->conexion->query("SET FOREIGN_KEY_CHECKS = 0");
    
        // Listar las tablas que deben limpiarse
    
        foreach ($this->tablas as $tabla) {
            $query = "DELETE FROM $tabla";
            if (!$this->conexion->query($query)) {
                // Volver a activar las restricciones si hay un error
                $this->conexion->query("SET FOREIGN_KEY_CHECKS = 1");
                throw new Exception("Error al borrar los datos de la tabla $tabla: " . $this->conexion->error);
            }
        }
    
        // Volver a activar las restricciones de clave foránea
        $this->conexion->query("SET FOREIGN_KEY_CHECKS = 1");
    }
    
    public function importarCSV($archivo) {
        // Validar archivo
        if (!file_exists($archivo) || !is_readable($archivo)) {
            throw new Exception("El archivo no existe o no es legible.");
        }
    
        $file = fopen($archivo, 'r');
        if ($file === false) {
            throw new Exception("No se pudo abrir el archivo.");
        }
    
        $this->conexion->begin_transaction();
        $tablaActual = null;
        $columnas = [];
        $stmt = null;
        try {
            $this->borrarDatosTablas();
            while (($linea = fgets($file)) !== false) {
                $linea = trim($linea);
    
                // Detectar la sección de una tabla
                if (preg_match('/^#(.+)$/', $linea, $matches)) {
                    $tablaActual = $matches[1];
                    
                    $columnas = [];
                } else if ($tablaActual && !$columnas) {
                    $columnas = str_getcsv($linea);
                    if (!$columnas) {
                        throw new Exception("Error al leer las columnas de la tabla $tablaActual.");
                    }
                    // Preparar la consulta para la tabla actual

                    // Numero de columnas
                    $placeholders = implode(',', array_fill(0, count($columnas), '?'));

                    // Consulta 
                    $query = "INSERT INTO " . $tablaActual. " (" . implode(',', $columnas) . ") VALUES ($placeholders)";
                    try {
                        $stmt = $this->conexion->prepare($query);
                    } catch (Exception $e) {
                        throw new Exception("Error al preparar la consulta SQL para la tabla $tablaActual.");
                    }
                }
                elseif ($tablaActual && $columnas) {
                    // Procesar una fila de datos
                    $fila = str_getcsv($linea);
                    
                    // Ignorar líneas vacías
                    if (empty(array_filter($fila))) {
                        continue;
                    }
    
                    // Validar número de columnas
                    if (count($fila) !== count($columnas)) {
                        throw new Exception("La fila no coincide con el número de columnas para la tabla $tablaActual.");
                    }
    
                    // Vincular parámetros
                    $tipos = str_repeat('s', count($fila));
                    $stmt->bind_param($tipos, ...$fila);
                    
                    // Ejecutar la consulta
                    if (!$stmt->execute()) {
                        throw new Exception("Error al insertar los datos en la tabla $tablaActual: " . $stmt->error);
                    }
                }
            }
    
            // Finalizar transacción
            $this->conexion->commit();
        } catch (Exception $e) {
            // Revertir transacción en caso de error
            $this->conexion->rollback();
            throw new Exception("Error al importar el archivo CSV, asegurate de que el formato del CSV sea correcto y la base de datos esté creada: " . $e->getMessage());
        } finally {
            // Asegurar cierre de recursos
            if ($stmt) {
                $stmt->close();
            }
            fclose($file);
        }
    }

    public function exportarCSV() {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="exportacion.csv"');
        $output = fopen('php://output', 'w');
        
        if (!$output) {
            throw new Exception('No se pudo abrir el flujo de salida para el archivo CSV.');
        }

        $tablas = ["equipos",  "pilotos", "estrategias", "circuitos", "resultados"];
        foreach ($tablas as $tabla) {
            // Verificar si la tabla existe en la base de datos
            $resultado = $this->conexion->query("SHOW TABLES LIKE '$tabla'");
            if ($resultado->num_rows == 0) {
                // Si no existe la tabla indica el error en el archivo
                fwrite($output, "Error la tabla $tabla no existe en la base de datos.\n");
                fclose($output);
                exit;
            }

            // Añadir un separador entre tablas
            fputcsv($output, ["#".$tabla]);

            $resultado = $this->conexion->query("SELECT * FROM $tabla");
            if (!$resultado) {
                // Si la consulta falla indica el error en el archivo
                fwrite($output, "Error la tabla $tabla no existe en la base de datos.\n");
                fclose($output);
                exit;
            }

            if (!$resultado->fetch_assoc()) {
                continue;  // Si la tabla está vacía, saltamos
            }

            // Escribir los encabezados de las columnas
            $columnas = array_keys($resultado->fetch_assoc());
            fputcsv($output, $columnas);

            // Reiniciar el puntero del resultado
            $resultado->data_seek(0);
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

    public function obtenerDetallesPiloto($pilotoId) {
        $query = "SELECT * FROM pilotos WHERE id_piloto = $pilotoId";
        $resultado = $this->conexion->query($query);
        return $resultado->fetch_assoc();
    }

    public function simularCarrera($circuitoId, $equipoId, $estrategiaId, $pilotoId) {
        // Obtener detalles del circuito
        $circuito = $this->obtenerDetallesCircuito($circuitoId);
        $condiciones = $circuito['condiciones_comunes'];
        $longitud_circuito = $circuito['longitud'];
        $numero_vueltas = $circuito['numero_vueltas'];
    
        // Cambiar las condiciones según un valor aleatorio
        if (rand(0, 10) === 0) {
            $condiciones = $this->listaCondiciones[rand(0, 2)];
        }
    
        // Obtener detalles de la estrategia
        $estrategia = $this->obtenerDetallesEstrategia($estrategiaId);
    
        // Obtener detalles del piloto
        $piloto = $this->obtenerDetallesPiloto($pilotoId);
        $habilidadPiloto = $piloto['habilidad']; // Habilidad del piloto
    
        // Calcular posición base (aleatoria entre 1 y 10)
        $posicion = rand(1, 10);
    
        // Aplicar habilidad del piloto de forma aleatoria
        $modificadorHabilidad = rand(0, 10) < $habilidadPiloto ? 1 : -1;
        $posicion += $modificadorHabilidad; // Mejor o empeorar la posición según la habilidad
    
        // Factor de exigencia del circuito
        $factor_exigencia = ($longitud_circuito / 5) + ($numero_vueltas / 10);
    
        // Penalización por estrategia poco eficiente en circuitos exigentes
        if ($estrategia['combustible_inicial'] === 'BAJO' && $factor_exigencia >= 6) {
            $paradas_extras = ceil($factor_exigencia / 5);
            $posicion += $paradas_extras;
        }

        if($estrategia['tipo_neumatico'] === 'BLANDO' && $factor_exigencia >= 6){
            $paradas_extras = ceil($factor_exigencia / 5);
            $posicion += $paradas_extras;
        }
        
        // Penalización por estrategia poco eficiente en circuitos cortos
        if ($estrategia['combustible_inicial'] === 'ALTO' && $factor_exigencia < 6) {
            $paradas_extras = ceil($factor_exigencia / 5);
            $posicion += $paradas_extras;
        }

        if ($estrategia['tipo_neumatico'] === 'DURO' && $factor_exigencia < 6){
            $paradas_extras = ceil($factor_exigencia / 5);
            $posicion += $paradas_extras;
        }

        // Recompensa por estrategia optimizada en circuitos cortos
        if ($estrategia['combustible_inicial'] === 'BAJO' && $factor_exigencia < 6) {
            $mejora_posiciones = ceil((6 - $factor_exigencia) / 2);
            $posicion -= $mejora_posiciones;
        }
        
        if ($estrategia['tipo_neumatico'] === 'BLANDO' && $factor_exigencia < 6) {
            $mejora_posiciones = ceil((6 - $factor_exigencia) / 2);
            $posicion -= $mejora_posiciones;
        }
        
        // Recompensa por estrategia optimizada en circuitos largos
        if ($estrategia['combustible_inicial'] === 'ALTO' && $factor_exigencia > 10) {
            $mejora_posiciones = ceil((6 - $factor_exigencia) / 2);
            $posicion -= $mejora_posiciones;
        }

        if ($estrategia['tipo_neumatico'] === 'DURO' && $factor_exigencia > 10) {
            $mejora_posiciones = ceil((6 - $factor_exigencia) / 2);
            $posicion -= $mejora_posiciones;
        }

        // Ajustes por condiciones meteorológicas
        if (($condiciones === 'SOLEADO' && $estrategia['tipo_neumatico'] === 'BLANDO') ||
            ($condiciones === 'LLUVIOSO' && $estrategia['tipo_neumatico'] === 'INTERMEDIO')) {
            $posicion -= 2;
        }
    
        // Limitar la posición a un rango entre 1 y 10
        $posicion = max(1, min(10, $posicion));
    
        // Guardar los resultados
        $query = "INSERT INTO resultados (id_circuito, id_piloto, id_estrategia, posicion_final) 
          VALUES (?, ?, ?, ?)";

        // Preparar el statement
        $stmt = $this->conexion->prepare($query);

        // Verificar si la preparación del statement fue exitosa
        if ($stmt === false) {
            throw new Exception('Error al preparar la consulta: ' . $this->conexion->error);
        }

        // Vincular los parámetros a los marcadores de posición
        $stmt->bind_param("iiii", $circuitoId, $pilotoId, $estrategiaId, $posicion);

        // Ejecutar la consulta
        if (!$stmt->execute()) {
            throw new Exception('Error al ejecutar la consulta: ' . $stmt->error);
        }

        // Cerrar el statement
        $stmt->close();
    
        return "Carrera simulada con éxito. Condiciones finales: $condiciones. Posición final: $posicion.";
    }
    

    public function enseñarListaResultados($circuitoId) {
        $query = "SELECT r.id_resultado, p.nombre_completo AS piloto, e.nombre AS equipo, 
                         r.posicion_final, es.nombre AS estrategia
                  FROM resultados r
                  JOIN pilotos p ON r.id_piloto = p.id_piloto
                  JOIN equipos e ON p.id_equipo = e.id_equipo
                  JOIN circuitos c ON r.id_circuito = c.id_circuito
                  JOIN estrategias es ON r.id_estrategia = es.id_estrategia
                  WHERE r.id_circuito = ?
                  ORDER BY r.posicion_final ASC
                  LIMIT 10";
    
        // Preparar el statement
        $stmt = $this->conexion->prepare($query);
        // Verificar si la preparación del statement fue exitosa
        if ($stmt === false) {
            throw new Exception('Error al preparar la consulta: ' . $this->conexion->error);
        }
        $stmt->bind_param("i", $circuitoId);

        // Ejecutar la consulta
        if (!$stmt->execute()) {
            throw new Exception('Error al ejecutar la consulta: ' . $stmt->error);
        }
        $resultado = $stmt->get_result();
    
        $resultados = [];
        while ($fila = $resultado->fetch_assoc()) {
            $resultados[] = $fila;
        }
    
        $lista_resultados = "<section>
              <h3>Resultados del circuito</h3>
              <ul>";
        foreach ($resultados as $resultado) {
            $lista_resultados .= "<li>Posición: " . $resultado['posicion_final'] . " - Piloto: " . $resultado['piloto'] . " - Equipo: " . $resultado['equipo'] . " - Estrategia: " . $resultado['estrategia'] . "</li>";
        }
        $lista_resultados .= "</ul>
              </section>";
    
        $stmt->free_result();
        $stmt->close();
        return $lista_resultados;
    }
}   

// Procesamiento de solicitudes
$f1SM = new F1StrategyManager('localhost', 'DBUSER2024', 'DBPSWD2024', 'f1_strategy_manager');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['crear_bd'])) {
        try {
            $f1SM->crearTablas();
            $mensaje_crear_bd = 'Base de datos y tablas creadas correctamente.';
        } catch (Exception $e) {
            $mensaje_crear_bd = 'Error al crear la base de datos: ' . $e->getMessage();
        }
        
    }
    if (isset($_POST['importar_csv'])) {
        try {   
            $f1SM->importarCSV($_FILES['archivo_csv']['tmp_name']);
            $mensaje_importar_csv = 'Datos importados. Si faltan datos revisar estructura del CSV';
        }
        catch (Exception $e) {
            $mensaje_importar_csv = $e->getMessage();
        }
       
    }
    if (isset($_POST['exportar_csv'])) {
        try {
            $f1SM->exportarCSV();
            $mensaje_exportar_csv = 'Datos exportados correctamente.';
        } catch (Exception $e) {
            $mensaje_exportar_csv = 'Error al exportar los datos: ' . $e->getMessage();
        }
        
    }
    if (isset($_POST['simular_carrera'])) {
        try {
            $mensaje_resultado_carrera = $f1SM->simularCarrera($_POST['circuito'], $_POST['equipo'], $_POST['estrategia'], $_POST['piloto']);
            $lista_resultados = $f1SM->enseñarListaResultados($_POST['circuito']);
        } catch (Exception $e) {
            $mensaje_resultado_carrera = 'Error al simular la carrera: ' . $e->getMessage();
        }
    }
}

if (isset($_GET['action'])) {
    switch ($_GET['action']) {
        case 'obtener_pilotos':
            $equipoId = $_GET['equipo'];
            $pilotos = $f1SM->obtenerOpciones('pilotos', 'id_equipo', $equipoId);
            echo json_encode($pilotos);
            exit;

        case 'obtener_estrategias':
            $equipoId = $_GET['equipo'];
            $estrategias = $f1SM->obtenerOpciones('estrategias', 'id_equipo', $equipoId);
            echo json_encode($estrategias);
            exit;

        case 'obtener_detalles_circuito':
            $circuitoId = $_GET['circuito'];
            $detalles = $f1SM->obtenerDetallesCircuito($circuitoId);
            echo json_encode($detalles);
            exit;

        case 'obtener_detalles_estrategia':
            $estrategiaId = $_GET['estrategia'];
            $detalles = $f1SM->obtenerDetallesEstrategia($estrategiaId);
            echo json_encode($detalles);
            exit;
        case 'obtener_detalles_piloto':
            $pilotoId = $_GET['piloto'];
            $detalles = $f1SM->obtenerDetallesPiloto($pilotoId);
            echo json_encode($detalles);
            exit;
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <!--Autor-->
    <meta name="author" content="Sergio Riesco Collar"/>
    <!--Descripción-->
    <meta name ="description" content ="Juego Estrategia F1" />
    <!--Palabras clave del contenido-->
    <meta name ="keywords" content ="f1, estrategia, juego" />
    <!--Definir la ventana gráfica-->
    <meta name ="viewport" content ="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="../estilo/estilo.css"/>
    <link rel="stylesheet" href="../estilo/layout.css"/>
    <link rel="icon" href="../multimedia/imagenes/favicon.ico" />
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script src="../js/strategy_manager.js"></script>
    <title>F1 Strategy Manager - F1 Desktop</title>
</head>
<body>
    <header>
        <a href="../index.html"><h1>F1 Desktop</h1></a>
        <nav>
            <a href="../index.html">Inicio</a>
            <a href="../piloto.html">Piloto</a>
            <a href="../noticias.html">Noticias</a>
            <a href="../calendario.html">Calendario</a>
            <a href="../metereologia.html">Metereología</a>
            <a href="../circuito.html">Circuito</a>
            <a href="../viajes.php">Viajes</a>
            <a href="../juegos.html" class="active">Juegos</a>
        </nav>  
    </header>
    <p>Estás en: <a href="../index.html">Inicio</a> >> <a href="../juegos.html">Juegos</a> >> F1 Strategy Manager</p>
    <main>
        <section>
            <h2>Explora nuestros juegos</h2>
            <ul>
                <li><a href="../memoria.html">Juego de Memoria</a></li>
                <li><a href="../semaforo.php">Juego de Tiempo de Reacción</a></li>
                <li><a href="../quiz.html">Quiz F1</a></li>
                <li><a href="strategy_manager.php">F1 Strategy Manager</a></li>
            </ul>
        </section>
        <h2>F1 Strategy Manager</h2>
        <p>En F1 Strategy Manager, tus decisiones afectan directamente el rendimiento del piloto en la carrera. Estos son los principales factores que influyen en la simulación:</p>
        <ul>
            <li>Circuito: Longitud y número de vueltas juegan un papel clave en la estrategia, teniendo que decidir la más óptima para la longitud total.</li>
            <li>Condiciones climáticas: El clima puede cambiar inesperadamente, afectando la efectividad de los neumáticos seleccionados.</li>
            <li>Habilidad del piloto: La pericia y experiencia de tu piloto pueden mejorar o empeorar posiciones.</li>
            <li>Estrategia de equipo: La elección de combustible inicial y tipo de neumáticos determina la eficiencia en circuitos exigentes o cortos y con condiciones 
                climáticas adversas.</li>
        </ul>

       
        <form method="post"> 
            <section> 
                <h2>Crear Datos de Prueba</h2> 
                <button type="submit" name="crear_bd">Crear Datos</button> 
                <?php if (isset($mensaje_crear_bd)) : ?> 
                    <p><?php echo $mensaje_crear_bd; ?></p> 
                <?php endif; ?> </section>
        </form> 


        <form method="post" enctype="multipart/form-data">
            <section>
                <h2>Importar Datos desde CSV</h2>
                <p>
                    Por favor, carga un archivo CSV que contenga los datos para las diferentes tablas. 
                    Asegúrate de que el archivo tenga el siguiente formato:
                </p>
                <ul>
                    <li>
                        Cada tabla debe estar delimitada por una línea con el nombre de la tabla: <code>#nombre_tabla</code>.
                    </li>
                    <li>
                        Debajo de esta línea, debe haber una fila con los nombres de las columnas de la tabla.
                    </li>
                    <li>
                        Las filas siguientes deben contener los datos, separados por comas.
                    </li>
                </ul>
                <label for="archivo_csv">Archivo CSV:</label>
                <input type="file" id = "archivo_csv" name="archivo_csv" accept=".csv" required>
                <button type="submit" name="importar_csv">Importar</button>
                <?php if (isset($mensaje_importar_csv)) : ?>
                    <p><?php echo $mensaje_importar_csv; ?></p>
                <?php endif; ?>
            </section>
        </form>

        <form method="post">
            <section>
                <h2>Exportar Datos a CSV</h2>
                <button type="submit" name="exportar_csv">Exportar Todas las Tablas</button>
                <?php if (isset($mensaje_exportar_csv)) : ?>
                    <p><?php echo $mensaje_exportar_csv; ?></p>
                <?php endif; ?>
            </section>
        </form>

        <form method="post">
            <section>
                <h2>Simular Carrera</h2>
                <label for="circuito">Selecciona Circuito:</label>
                <select id="circuito" name="circuito" required>
                    <option value="">Selecciona un circuito</option>
                    <?php
                    $circuitos = $f1SM->obtenerOpciones('circuitos');
                    foreach ($circuitos as $circuito) {
                        echo "<option value='{$circuito['id_circuito']}'>{$circuito['nombre']}</option>";
                    }
                    ?>
                </select>

                <label for="equipo">Selecciona Equipo:</label>
                <select id="equipo" name="equipo" required>
                    <option value="">Selecciona un equipo</option>
                    <?php
                    $equipos = $f1SM->obtenerOpciones('equipos');
                    foreach ($equipos as $equipo) {
                        echo "<option value='{$equipo['id_equipo']}'>{$equipo['nombre']}</option>";
                    }
                    ?>
                </select>

                <label for="estrategia">Selecciona Estrategia:</label>
                <select id="estrategia" name="estrategia" required>
                    <option value="">Selecciona una estrategia</option>
                </select>
                

                <label for="piloto">Selecciona Piloto:</label>
                <select id="piloto" name="piloto" id="piloto" required>
                    <option value="">Selecciona un piloto</option>
                </select>

                <button type="submit" name="simular_carrera">Simular Carrera</button>
                <?php if (isset($mensaje_resultado_carrera)) : ?>
                    <p><?php echo $mensaje_resultado_carrera; ?></p>
                <?php endif; ?>
            </section>
        </form>
        <?php if (isset($mensaje_resultado_carrera)) : ?>
            <p><?php echo $lista_resultados; ?></p>
        <?php endif; ?>           
        
    </main>
</body>
</html>
