import Stripe from "stripe";

/**
 * Stripe integration is optional at runtime: when the keys are absent the
 * app falls back to a clearly-labelled demo upgrade flow so the product is
 * fully usable without credentials.
 */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID_PRO);
}

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      appInfo: { name: "LayerStack SaaS Dashboard", version: "1.0.0" },
    });
  }
  return stripeClient;
}

export function appUrl(): string {
  return process.env.APP_URL ?? "http://localhost:3000";
}
