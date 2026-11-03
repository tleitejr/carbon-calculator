import { calculateCompensation, calculateEmissions, findRouteDistance, resolveDistance } from './calculator.js';
import { CREDIT_PRICE_BRL, EMISSION_FACTORS, MODES } from './config.js';
import { ROUTES } from './route-data.js';
import { createUI } from './ui.js';

const ui = createUI();
const form = document.querySelector('#trip-form');
const cityOptions = document.querySelector('#city-options');

const cities = [...new Set(ROUTES.flatMap(({ origin, destination }) => [origin, destination]))]
	.sort((first, second) => first.localeCompare(second, 'pt-BR'));
cities.forEach((city) => {
	const option = document.createElement('option');
	option.value = city;
	cityOptions.append(option);
});

function refreshRouteHint() {
	const { origin, destination } = ui.elements;
	const originValue = origin.value.trim();
	const destinationValue = destination.value.trim();
	if (!originValue || !destinationValue) {
		ui.updateRouteMode('incomplete');
		return;
	}

	const distance = findRouteDistance(originValue, destinationValue, ROUTES);
	if (distance === null) {
		ui.updateRouteMode('unknown');
	} else {
		ui.updateRouteMode('known', distance);
	}
}

[ui.elements.origin, ui.elements.destination].forEach((input) => {
	input.addEventListener('input', refreshRouteHint);
});

form.addEventListener('submit', async (event) => {
	event.preventDefault();
	ui.clearFieldErrors();
	ui.setMessage('');
	ui.clearResults();

	const origin = ui.elements.origin.value.trim();
	const destination = ui.elements.destination.value.trim();
	let firstInvalidField = null;

	if (!origin) {
		ui.setFieldError(ui.elements.origin, 'Informe a cidade de origem.');
		firstInvalidField = ui.elements.origin;
	}
	if (!destination) {
		ui.setFieldError(ui.elements.destination, 'Informe a cidade de destino.');
		firstInvalidField ??= ui.elements.destination;
	}
	if (firstInvalidField) {
		ui.setMessage('Preencha os campos indicados para continuar.', 'error');
		firstInvalidField.focus();
		return;
	}

	const routeDistance = findRouteDistance(origin, destination, ROUTES);
	const manualDistance = ui.elements.manualDistance.value;
	const resolvedDistance = resolveDistance(origin, destination, manualDistance, ROUTES);
	if (!resolvedDistance) {
		if (routeDistance === null) {
			ui.setFieldError(ui.elements.manualDistance, 'Informe uma distância válida, maior que zero.');
			ui.setMessage('Não encontramos essa rota. Informe a distância em quilômetros.', 'error');
			ui.elements.manualDistance.focus();
		} else {
			ui.setMessage('Não foi possível determinar a distância desta rota.', 'error');
		}
		return;
	}

	ui.setLoading(true);
	await new Promise((resolve) => setTimeout(resolve, 0));

	try {
		const mode = document.querySelector('#mode').value;
		const emissions = calculateEmissions(resolvedDistance.distanceKm, EMISSION_FACTORS);
		const compensation = calculateCompensation(emissions[mode], CREDIT_PRICE_BRL);
		ui.renderResults({
			origin,
			destination,
			distanceKm: resolvedDistance.distanceKm,
			source: resolvedDistance.source,
			mode,
			modes: MODES,
			emissions,
			compensation,
			creditPrice: CREDIT_PRICE_BRL
		});
	} catch (error) {
		ui.setMessage(error instanceof Error ? error.message : 'Ocorreu um erro ao calcular a viagem.', 'error');
	} finally {
		ui.setLoading(false);
	}
});