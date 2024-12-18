CREATE DATABASE IF NOT EXISTS f1_strategy_manager DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE f1_strategy_manager;
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

DELETE FROM resultados;
DELETE FROM estrategias;
DELETE FROM circuitos;
DELETE FROM pilotos;
DELETE FROM equipos;

INSERT INTO equipos (id_equipo, nombre) VALUES
(1, 'Ferrari'),
(2, 'Mercedes'),
(3, 'Red Bull Racing');

INSERT INTO pilotos (id_piloto, nombre_completo, id_equipo, numero_coche, habilidad) VALUES
(1, 'Charles Leclerc', 1, 16, 8),
(2, 'Lewis Hamilton', 2, 44, 7),    
(3, 'Max Verstappen', 3, 33, 10);

INSERT INTO circuitos (id_circuito, nombre, pais, longitud, numero_vueltas, condiciones_comunes) VALUES
(1, 'Monza', 'Italia', 5.79, 53, 'SOLEADO'),
(2, 'Spa-Francorchamps', 'Belgica', 7.00, 44, 'LLUVIOSO'),
(3, 'Silverstone', 'Reino Unido', 5.89, 52, 'NUBLADO');

INSERT INTO estrategias (id_estrategia, id_equipo, nombre, tipo_neumatico, combustible_inicial) VALUES
(1, 1, 'Estrategia A', 'BLANDO', 'BAJO'),
(2, 2, 'Estrategia B', 'MEDIO', 'NORMAL'),
(3, 3, 'Estrategia C', 'DURO', 'ALTO');
