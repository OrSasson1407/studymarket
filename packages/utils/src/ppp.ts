import { PPPAdjustment } from '@studymarket/types';

// Baseline multipliers (1.0 = standard pricing)
const PPP_RATES: Record<string, number> = {
  'IL': 1.0, // Israel
  'US': 1.0, // United States
  'UK': 1.0, // United Kingdom
  'BR': 0.6, // Brazil (40% discount)
  'IN': 0.4, // India (60% discount)
  'AR': 0.5  // Argentina (50% discount)
};

export function calculatePPP(countryCode: string, originalPriceAmount: number): PPPAdjustment {
  const multiplier = PPP_RATES[countryCode] || 1.0;
  return {
    countryCode,
    discountMultiplier: multiplier,
    originalPrice: originalPriceAmount
  };
}

export function applyPPP(amount: number, adjustment: PPPAdjustment): number {
  // Returns the new price rounded to the nearest whole integer (e.g., agorot or cents)
  return Math.round(amount * adjustment.discountMultiplier);
}
