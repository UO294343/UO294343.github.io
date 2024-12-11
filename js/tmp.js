init() {
    this.loadCircuitOptions();
    this.loadTeamOptions();
    this.bindEvents();
}

fetchOptions(url, callback) {
    fetch(url)
        .then(response => response.json())
        .then(data => callback(data));
}

loadCircuitOptions() {
    const circuitSelect = document.querySelector('[name="circuito"]');
    this.fetchOptions('?action=obtener_circuitos', (circuitos) => {
        circuitos.forEach(circuito => {
            const option = document.createElement('option');
            option.value = circuito.id_circuito;
            option.textContent = circuito.nombre;
            circuitSelect.appendChild(option);
        });
    });
}

loadTeamOptions() {
    const teamSelect = document.querySelector('[name="equipo"]');
    this.fetchOptions('?action=obtener_equipos', (equipos) => {
        equipos.forEach(equipo => {
            const option = document.createElement('option');
            option.value = equipo.id_equipo;
            option.textContent = equipo.nombre;
            teamSelect.appendChild(option);
        });
    });
}

updatePilotsAndStrategies(equipoId) {
    const pilotSelect = document.querySelector('[name="piloto"]');
    const strategySelect = document.querySelector('[name="estrategia"]');
    pilotSelect.innerHTML = '<option value=\"\">Selecciona un piloto</option>';
    strategySelect.innerHTML = '<option value=\"\">Selecciona una estrategia</option>';

    this.fetchOptions(`?action=obtener_pilotos&equipo=${equipoId}`, (pilotos) => {
        .forEach(piloto => {
            const option = document.createElement('option');
            option.value = piloto.id_piloto;
            option.textContent = piloto.nombre_completo;
            pilotSelect.appendChild(option);
        });
    });

    this.fetchOptions(`?action=obtener_estrategias&equipo=${equipoId}`, (estrategias) => {
        estrategias.forEach(estrategia => {
            const option = document.createElement('option');
            option.value = estrategia.id_estrategia;
            option.textContent = estrategia.nombre;
            strategySelect.appendChild(option);
        });
    });
}

showCircuitDetails(circuitoId) {
    const circuitDetailsDiv = document.querySelector('[name="circuito"] + section');
    this.fetchOptions(`?action=obtener_detalles_circuito&circuito=${circuitoId}`, (detalles) => {
        circuitDetailsDiv.innerHTML = `
            <p>País: ${detalles.pais}</p>
            <p>Longitud: ${detalles.longitud} km</p>
            <p>Número de Vueltas: ${detalles.numero_vueltas}</p>
            <p>Condiciones Comunes: ${detalles.condiciones_comunes}</p>
        `;
    });
}

showStrategyDetails(estrategiaId) {
    const strategyDetailsDiv = document.querySelector('[name="estrategia"] + div');
    this.fetchOptions(`?action=obtener_detalles_estrategia&estrategia=${estrategiaId}`, (detalles) => {
        strategyDetailsDiv.innerHTML = `
            <p>Tipo de Neumático: ${detalles.tipo_neumatico}</p>
            <p>Combustible Inicial: ${detalles.combustible_inicial}</p>
        `;
    });
}

bindEvents() {
    document.querySelector('[name="circuito"]').addEventListener('change', (event) => {
        this.showCircuitDetails(event.target.value);
    });

    document.querySelector('[name="equipo"]').addEventListener('change', (event) => {
        this.updatePilotsAndStrategies(event.target.value);
    });

    document.querySelector('[name="estrategia"]').addEventListener('change', (event) => {
        this.showStrategyDetails(event.target.value);
    });
}