const numberFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 });
const distanceFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const currencyFormat = new Intl.NumberFormat('pt-BR', {
	style: 'currency',
	currency: 'BRL',
	minimumFractionDigits: 2
});

function formatNumber(value, maximumFractionDigits = 3) {
	return new Intl.NumberFormat('pt-BR', { maximumFractionDigits }).format(value);
}

export function createUI() {
	const elements = {
		origin: document.querySelector('#origin'),
		destination: document.querySelector('#destination'),
		manualDistance: document.querySelector('#manual-distance'),
		manualDistanceField: document.querySelector('#manual-distance-field'),
		routeHint: document.querySelector('#route-hint'),
		formMessage: document.querySelector('#form-message'),
		calculateButton: document.querySelector('#calculate-button'),
		buttonLabel: document.querySelector('#button-label'),
		results: document.querySelector('#results'),
		resultOrigin: document.querySelector('#result-origin'),
		resultDestination: document.querySelector('#result-destination'),
		resultDistance: document.querySelector('#result-distance'),
		resultEmissions: document.querySelector('#result-emissions'),
		emissionsLabel: document.querySelector('#emissions-label'),
		resultSource: document.querySelector('#result-source'),
		comparisonBody: document.querySelector('#comparison-body'),
		creditPrice: document.querySelector('#credit-price'),
		offsetBasis: document.querySelector('#offset-basis'),
		offsetTonnes: document.querySelector('#offset-tonnes'),
		offsetEquivalent: document.querySelector('#offset-equivalent'),
		offsetCredits: document.querySelector('#offset-credits'),
		offsetCost: document.querySelector('#offset-cost')
	};

	function setFieldError(input, message) {
		const error = document.querySelector(`#${input.id}-error`);
		input.setAttribute('aria-invalid', 'true');
		error.textContent = message;
	}

	function clearFieldErrors() {
		[elements.origin, elements.destination, elements.manualDistance].forEach((input) => {
			input.removeAttribute('aria-invalid');
			const error = document.querySelector(`#${input.id}-error`);
			if (error) error.textContent = '';
		});
	}

	function setMessage(message, state = '') {
		elements.formMessage.textContent = message;
		if (state) {
			elements.formMessage.dataset.state = state;
		} else {
			delete elements.formMessage.dataset.state;
		}
	}

	function updateRouteMode(state, distanceKm = null) {
		const isUnknown = state === 'unknown';
		elements.manualDistanceField.hidden = !isUnknown;
		elements.manualDistance.required = isUnknown;

		if (state === 'known') {
			elements.routeHint.textContent = `Distância encontrada na base local: ${distanceFormat.format(distanceKm)} km.`;
		} else if (isUnknown) {
			elements.routeHint.textContent = 'Rota fora da base local: informe uma distância maior que zero.';
		} else {
			elements.routeHint.textContent = '';
		}
	}

	function setLoading(isLoading) {
		elements.calculateButton.disabled = isLoading;
		elements.buttonLabel.textContent = isLoading ? 'Calculando…' : 'Calcular viagem';
	}

	function clearResults() {
		elements.results.hidden = true;
	}

	function renderResults({ origin, destination, distanceKm, source, mode, modes, emissions, compensation, creditPrice }) {
		elements.resultOrigin.textContent = origin;
		elements.resultDestination.textContent = destination;
		elements.resultDistance.textContent = `${distanceFormat.format(distanceKm)} km`;
		elements.resultEmissions.textContent = `${formatNumber(emissions[mode])} kg CO₂e`;
		elements.emissionsLabel.textContent = `Emissão estimada · ${modes[mode].label}`;
		elements.resultSource.textContent = source === 'base'
			? 'Distância obtida na base local de rotas simuladas.'
			: 'Distância informada manualmente.';

		const lowestEmission = Math.min(...Object.values(emissions));
		elements.comparisonBody.replaceChildren();
		Object.entries(modes).forEach(([key, modeDetails]) => {
			const row = document.createElement('tr');
			if (emissions[key] === lowestEmission) row.classList.add('is-lowest');

			const modeCell = document.createElement('th');
			modeCell.scope = 'row';
			modeCell.textContent = modeDetails.label;
			const factorCell = document.createElement('td');
			factorCell.textContent = `${numberFormat.format(modeDetails.factor)} kg CO₂e/veículo-km`;
			const emissionsCell = document.createElement('td');
			emissionsCell.textContent = `${formatNumber(emissions[key])} kg CO₂e`;

			row.append(modeCell, factorCell, emissionsCell);
			elements.comparisonBody.append(row);
		});

		elements.creditPrice.textContent = `${currencyFormat.format(creditPrice)} / crédito`;
		elements.offsetBasis.textContent = `Compensação calculada para ${modes[mode].label.toLocaleLowerCase('pt-BR')} (${formatNumber(emissions[mode])} kg CO₂e).`;
		elements.offsetTonnes.textContent = `${formatNumber(compensation.tonnes, 6)} t CO₂e`;
		elements.offsetEquivalent.textContent = formatNumber(compensation.creditsEquivalent, 6);
		elements.offsetCredits.textContent = `${compensation.wholeCredits} ${compensation.wholeCredits === 1 ? 'crédito' : 'créditos'}`;
		elements.offsetCost.textContent = currencyFormat.format(compensation.estimatedCost);

		elements.results.hidden = false;
		setMessage('Cálculo atualizado.', 'success');
	}

	return {
		elements,
		setFieldError,
		clearFieldErrors,
		setMessage,
		updateRouteMode,
		setLoading,
		clearResults,
		renderResults
	};
}