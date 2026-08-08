import { UNLOCK_COST } from "@/lib/coupon-constants";

// Per-item coupon cost overrides. Any content_id NOT listed here
// falls back to the standard UNLOCK_COST (10). Add entries here
// whenever an item should cost something other than the default.
export const CONTENT_COST_OVERRIDES: Record<string, number> = {
  "funding-disbursement-requirements": 5,
};

export function getContentCost(contentId: string): number {
  return CONTENT_COST_OVERRIDES[contentId] ?? UNLOCK_COST;
}
