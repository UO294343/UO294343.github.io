/*
    Este js solo se utiliza para mostrar la diferente información al usuario respecto a los selectores,
    la lógica principal se encuentra en en el php correspondiente. Además, la poca lógica que aparece 
    aquí hace llamadas al php para obtener la información
*/
class F1StrategyManager {
    constructor() {
        this.$circuitSelect = $('select[name="circuito"]');
        this.$teamSelect = $('select[name="equipo"]');
        this.$pilotSelect = $('select[name="piloto"]');
        this.$strategySelect = $('select[name="estrategia"]');
        this.addListeners();
    }

    addListeners() {
        this.addListenerCircuit();
        this.addListenerTeam();
        this.addListenerPilot();
        this.addListenerStrategy();
    }

    fetchOptions(url, callback) {
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            async: false,
            success: callback,
            error: () => callback(null)
        });
    }

    addListenerCircuit() {
        this.$circuitSelect.on('change', (event) => {
            this.showCircuitDetails($(event.target).val());
        });
    }

    addListenerTeam() {
        this.$teamSelect.on('change', (event) => {
            this.updatePilotsAndStrategies($(event.target).val());
        });
    }

    addListenerPilot() {
        this.$pilotSelect.on('change', (event) => {
            this.showPilotDetails($(event.target).val());
        });
    }

    addListenerStrategy() {
        this.$strategySelect.on('change', (event) => {
            this.showStrategyDetails($(event.target).val());
        });
    }

    showPilotDetails(pilotoId) {
        $('[name="piloto"] + section').remove();
        const $pilotDetailsSection = $('<section><h3>Detalles del piloto</h3></section>');
        this.$pilotSelect.after($pilotDetailsSection);

        this.fetchOptions(`?action=obtener_detalles_piloto&piloto=${pilotoId}`, (detalles) => {
            if (!detalles) return;
            $pilotDetailsSection.append(`
                <ul>
                    <li>Número coche: ${detalles.numero_coche}</li>
                    <li>Habilidad (1-10): ${detalles.habilidad}</li>
                </ul>
            `);
        });
    }

    updatePilotsAndStrategies(equipoId) {
        this.$pilotSelect.html('<option value="">Selecciona un piloto</option>');
        this.fetchOptions(`?action=obtener_pilotos&equipo=${equipoId}`, (pilotos) => {
            if (!pilotos) return;
            pilotos.forEach((piloto) => {
                this.$pilotSelect.append(`<option value="${piloto.id_piloto}">${piloto.nombre_completo}</option>`);
            });
        });

        this.$strategySelect.html('<option value="">Selecciona una estrategia</option>');
        this.fetchOptions(`?action=obtener_estrategias&equipo=${equipoId}`, (estrategias) => {
            if (!estrategias) return;
            estrategias.forEach((estrategia) => {
                this.$strategySelect.append(`<option value="${estrategia.id_estrategia}">${estrategia.nombre}</option>`);
            });
        });
    }

    showCircuitDetails(circuitoId) {
        $('[name="circuito"] + section').remove();
        const $circuitDetailsSection = $('<section><h3>Detalles del circuito</h3></section>');
        this.$circuitSelect.after($circuitDetailsSection);

        this.fetchOptions(`?action=obtener_detalles_circuito&circuito=${circuitoId}`, (detalles) => {
            if (!detalles) return;
            $circuitDetailsSection.append(`
                <ul>
                    <li>País: ${detalles.pais}</li>
                    <li>Longitud: ${detalles.longitud} km</li>
                    <li>Número de Vueltas: ${detalles.numero_vueltas}</li>
                    <li>Condiciones Comunes: ${detalles.condiciones_comunes}</li>
                </ul>
            `);
        });
    }

    showStrategyDetails(strategyId) {
        $('[name="estrategia"] + section').remove();
        const $strategyDetailsSection = $('<section><h3>Detalles de la estrategia</h3></section>');
        this.$strategySelect.after($strategyDetailsSection);

        this.fetchOptions(`?action=obtener_detalles_estrategia&estrategia=${strategyId}`, (detalles) => {
            if (!detalles) return;
            $strategyDetailsSection.append(`
                <ul>
                    <li>Tipo de Neumático: ${detalles.tipo_neumatico}</li>
                    <li>Combustible Inicial: ${detalles.combustible_inicial}</li>
                </ul>
            `);
        });
    }
}

$(document).ready(() => new F1StrategyManager());
