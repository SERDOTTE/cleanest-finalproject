/**
 * Quote Calculator Module
 * Business logic and pricing matrix for CleanNest services.
 *
 * TODO (Week 6): Connect distanceKm from a route-distance provider.
 * TODO (Week 6): Implement PDF quote generator export.
 */

export const BASE_PRICES = {
  Waterproofing: 120,
  'Sofa Cleaning': 150,
  'Mattress Cleaning': 100,
  'Internal Cleaning of automobiles': 200,
  'Leather Hydration': 180,
  'Carpet Cleaning': 130,
};

export const SIZE_MULTIPLIERS = { // Small, Medium, Large, X-Large size categories
  small: 1.0,
  medium: 1.3,
  large: 1.6,
  xlarge: 2.0,
};

export const SOIL_MULTIPLIERS = { // Light, Moderate, Heavy soil levels 
  light: 1.0,
  moderate: 1.2,
  heavy: 1.5,
};

/** Distance surcharge: free within BASE_RADIUS_KM, then per extra km. */
const BASE_RADIUS_KM = 10;
const SURCHARGE_PER_KM = 2.5; // BRL per km

/**
 * Calculate a quote for a list of selected service items.
 *
 * @param {Array<{ service: string, size: string, soilDepth: string }>} items
 * @param {number} [distanceKm=0] - Customer distance from HQ (manual or API)
 * @returns {{ items: Array, subtotal: number, distanceFee: number, total: number }}
 */
export function calculateQuote(items = [], distanceKm = 0) {
  const breakdown = items.map((item) => {
    const base = BASE_PRICES[item.service] ?? 0;
    const sizeMult = SIZE_MULTIPLIERS[item.size] ?? 1.0;
    const soilMult = SOIL_MULTIPLIERS[item.soilDepth] ?? 1.0;
    const price = round2(base * sizeMult * soilMult);
    return { ...item, basePrice: base, price };
  });

  const subtotal = round2(breakdown.reduce((sum, i) => sum + i.price, 0));
  const extraKm = Math.max(0, distanceKm - BASE_RADIUS_KM);
  const distanceFee = round2(extraKm * SURCHARGE_PER_KM);
  const total = round2(subtotal + distanceFee);

  return { items: breakdown, subtotal, distanceFee, total };
}

/**
 * Format USD price values for UI rendering.
 * @param {number} value
 * @returns {string}
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value) || 0);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// ── Stubs for Week 6 ─────────────────────────────────────────────────────────

// export function generateQuotePDF(quoteData) { ... }
