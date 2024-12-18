CREATE TABLE IF NOT EXISTS equipos (
    id_equipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS pilotos (
    id_piloto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100),
    id_equipo INT,
    numero_coche INT,
    habilidad INT,
    FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo)
);

CREATE TABLE IF NOT EXISTS circuitos (
    id_circuito INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    pais VARCHAR(100),
    longitud DECIMAL(5,2),
    numero_vueltas INT,
    condiciones_comunes ENUM('SOLEADO', 'LLUVIOSO', 'NUBLADO')
);

CREATE TABLE IF NOT EXISTS estrategias (
    id_estrategia INT AUTO_INCREMENT PRIMARY KEY,
    id_equipo INT,
    nombre VARCHAR(100),
    tipo_neumatico ENUM('BLANDO', 'MEDIO', 'DURO'),
    combustible_inicial ENUM('BAJO', 'NORMAL', 'ALTO'),
    FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo)
);

CREATE TABLE IF NOT EXISTS resultados (
    id_resultado INT AUTO_INCREMENT PRIMARY KEY,
    id_circuito INT,
    id_piloto INT,
    id_estrategia INT,
    posicion_final INT,
    FOREIGN KEY (id_circuito) REFERENCES circuitos(id_circuito),
    FOREIGN KEY (id_piloto) REFERENCES pilotos(id_piloto),
    FOREIGN KEY (id_estrategia) REFERENCES estrategias(id_estrategia)
);
