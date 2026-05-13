/**
 * Centralized pricing logic for gold products.
 * Single source of truth — previously duplicated in:
 *   - src/app/api/products/route.ts
 *   - src/app/api/products/[id]/route.ts
 */

export interface GoldPrices {
  gram24k: number;
  gram21k: number;
  gram18k: number;
}

/**
 * Craftsmanship premium table.
 * bar     → lower premium (minimal labour)
 * jewelry → higher premium (skilled labour)
 */
const PREMIUMS = {
  karat24: { heavy: 1.02, light: 1.05 }, // heavy = weight >= 10g
  bar21: 1.08,
  bar18: 1.10,
  jewelry21: 1.20,
  jewelry18: 1.25,
} as const;

/**
 * Calculate the dynamic retail price for a product.
 * Returns null when insufficient data is available (no weight or unknown karat).
 */
export function calculateDynamicPrice(
  weight: number | null,
  karat: number,
  productType: string | null,
  goldPrices: GoldPrices
): number | null {
  if (!weight || weight <= 0) return null;

  const isBar = productType === 'bar';

  switch (karat) {
    case 24: {
      const premium = weight >= 10 ? PREMIUMS.karat24.heavy : PREMIUMS.karat24.light;
      return Math.round(weight * goldPrices.gram24k * premium);
    }
    case 21: {
      const premium = isBar ? PREMIUMS.bar21 : PREMIUMS.jewelry21;
      return Math.round(weight * goldPrices.gram21k * premium);
    }
    case 18: {
      const premium = isBar ? PREMIUMS.bar18 : PREMIUMS.jewelry18;
      return Math.round(weight * goldPrices.gram18k * premium);
    }
    default:
      return null;
  }
}
