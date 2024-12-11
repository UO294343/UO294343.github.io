class F1StrategyManager {
    constructor() {
        this.circuitSelect = document.querySelector('select[name="circuito"]');
        this.teamSelect = document.querySelector('select[name="equipo"]');
        this.pilotSelect = document.querySelector('select[name="piloto"]');
        this.strategySelect = document.querySelector('select[name="estrategia"]');
        this.addListeners();
     }

    addListeners() {
        this.addListenerCircuit();
        this.addListenerTeam();
        this.addListenerStrategy();
    }

    fetchOptions(url, callback) {
        fetch(url)
            .then(response => response.json())
            .then(data => callback(data));
    }

    addListenerCircuit() {
        this.circuitSelect.addEventListener('change', (event) => {
            this.showCircuitDetails(event.target.value);
        });
    }

    addListenerTeam() {
        this.teamSelect.addEventListener('change', (event) => {
            this.updatePilotsAndStrategies(event.target.value);
        });
    }

    addListenerStrategy() {
        this.strategySelect.addEventListener('change', (event) => {
            this.showStrategyDetails(event.target.value);
        })
    }
    updatePilotsAndStrategies(equipoId) {
        this.pilotSelect.innerHTML = '<option value=\"\">Selecciona un piloto</option>';
        this.fetchOptions(`?action=obtener_pilotos&equipo=${equipoId}`, (pilotos) => {
            pilotos.forEach(piloto => {
                const option = document.createElement('option');
                option.value = piloto.id_piloto;
                option.textContent = piloto.nombre_completo;
                this.pilotSelect.appendChild(option);
            });
        });

        this.strategySelect.innerHTML = '<option value=\"\">Selecciona una estrategia</option>';
        this.fetchOptions(`?action=obtener_estrategias&equipo=${equipoId}`, (estrategias) => {
            estrategias.forEach(estrategia => {
                const option = document.createElement('option');
                option.value = estrategia.id_estrategia;
                option.textContent = estrategia.nombre;
                this.strategySelect.appendChild(option);
            });
        });
    }
    
    showCircuitDetails(circuitoId) {
        if (document.querySelector('[name="circuito"] + section')) {
            document.querySelector('[name="circuito"] + section').remove();
        }
        const circuitDetailsSection = document.createElement('section');
        this.circuitSelect.after(circuitDetailsSection);
        this.fetchOptions(`?action=obtener_detalles_circuito&circuito=${circuitoId}`, (detalles) => {
            circuitDetailsSection.innerHTML = `
                <p>País: ${detalles.pais}</p>
                <p>Longitud: ${detalles.longitud} km</p>
                <p>Número de Vueltas: ${detalles.numero_vueltas}</p>
                <p>Condiciones Comunes: ${detalles.condiciones_comunes}</p>
            `;
        });
    }
    
    showStrategyDetails(strategyId) {
        if (document.querySelector('[name="estrategia"] + section')) {
            document.querySelector('[name="estrategia"] + section').remove();
        }
        const strategyDetailsSection = document.createElement('section');
        this.strategySelect.after(strategyDetailsSection);
        this.fetchOptions(`?action=obtener_detalles_estrategia&estrategia=${strategyId}`, (detalles) => {
            strategyDetailsSection.innerHTML = `
                <p>Tipo de Neumático: ${detalles.tipo_neumatico}</p>
                <p>Combustible Inicial: ${detalles.combustible_inicial}</p>
            `;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new F1StrategyManager());
