function normalizeCity(city) {
	return city.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

export function findRouteDistance(origin, destination, routes) {
	const normalizedOrigin = normalizeCity(origin);
	const normalizedDestination = normalizeCity(destination);
	const route = routes.find((candidate) => {
		const routeOrigin = normalizeCity(candidate.origin);
		const routeDestination = normalizeCity(candidate.destination);
		return (routeOrigin === normalizedOrigin && routeDestination === normalizedDestination)
			|| (routeOrigin === normalizedDestination && routeDestination === normalizedOrigin);
	});

	return route ? route.distanceKm : null;
}

export function resolveDistance(origin, destination, manualDistance, routes) {
	const knownDistance = findRouteDistance(origin, destination, routes);
	if (knownDistance !== null) {
		return { distanceKm: knownDistance, source: 'base' };
	}

	if (String(manualDistance).trim() === '') {
		return null;
	}

	const parsedDistance = Number(manualDistance);
	if (!Number.isFinite(parsedDistance) || parsedDistance <= 0) {
		return null;
	}

	return { distanceKm: parsedDistance, source: 'manual' };
}

export function calculateEmissions(distanceKm, factors) {
	if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
		throw new RangeError('A distância deve ser um número maior que zero.');
	}

	return Object.fromEntries(Object.entries(factors).map(([mode, factor]) => {
		if (!Number.isFinite(factor) || factor < 0) {
			throw new RangeError(`Fator de emissão inválido para ${mode}.`);
		}
		return [mode, distanceKm * factor];
	}));
}

export function calculateCompensation(emissionsKg, creditPrice) {
	if (!Number.isFinite(emissionsKg) || emissionsKg < 0) {
		throw new RangeError('As emissões devem ser um número não negativo.');
	}
	if (!Number.isFinite(creditPrice) || creditPrice < 0) {
		throw new RangeError('O preço do crédito deve ser um número não negativo.');
	}

	const tonnes = emissionsKg / 1000;
	// Emissão zero não requer créditos; para valores positivos, arredondamos para cima.
	const wholeCredits = tonnes === 0 ? 0 : Math.ceil(tonnes);

	return {
		tonnes,
		creditsEquivalent: tonnes,
		wholeCredits,
		estimatedCost: wholeCredits * creditPrice
	};
}