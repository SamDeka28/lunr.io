import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeSingleton;
}

/** Map plan name → Stripe Price ID from env */
export function getStripePriceId(
  planName: string,
  billingCycle: "monthly" | "yearly"
): string | null {
  const key = `STRIPE_PRICE_${planName.toUpperCase()}_${billingCycle === "monthly" ? "MONTHLY" : "YEARLY"}`;
  return process.env[key] || null;
}
