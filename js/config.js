export const MODES = {
	bicycle: { label: 'Bicicleta', factor: 0 },
	car: { label: 'Carro', factor: 0.192 },
	bus: { label: 'Ônibus', factor: 0.822 },
	truck: { label: 'Caminhão', factor: 0.95 }
};

// Fatores didáticos em kg CO2e por veículo-km, sem rateio por passageiro ou carga.
export const EMISSION_FACTORS = Object.fromEntries(
	Object.entries(MODES).map(([key, mode]) => [key, mode.factor])
);

// Preço ilustrativo por crédito equivalente a uma tonelada de CO2e; não é cotação de mercado.
export const CREDIT_PRICE_BRL = 80;