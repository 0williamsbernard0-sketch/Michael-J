export const ANNUAL_PRICE_USD = 100;

const PROMO_CODES: Record<string, number> = {
  MD07: 60, // percent off
  MD03: 50,//  percent off
};

export function getPrice(code?: string) {
  const key = code?.trim().toUpperCase();
  if (!key) return { valid: true, code: null as string | null, price: ANNUAL_PRICE_USD };
  const pct = PROMO_CODES[key];
  if (!pct) return { valid: false, code: null as string | null, price: ANNUAL_PRICE_USD };
  return {
    valid: true,
    code: key as string | null,
    price: Math.round(ANNUAL_PRICE_USD * (1 - pct / 100) * 100) / 100,
  };
}
