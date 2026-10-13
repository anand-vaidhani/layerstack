import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { logActivity } from "@/lib/activity";

/**
 * Stripe webhook: keeps Organization.plan in sync with the subscription.
 * Configure STRIPE_WEBHOOK_SECRET and point Stripe at /api/stripe/webhook.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured (set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET)" },
      { status: 503 },
    );
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const organizationId = session.metadata?.organizationId;
      if (session.mode === "subscription" && session.subscription && organizationId) {
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        await db.organization.update({
          where: { id: organizationId },
          data: { plan: "PRO", stripeSubId: subscriptionId },
        });
        await logActivity({
          organizationId,
          type: "PLAN_UPGRADED",
          message: "Billing: subscription activated via Stripe Checkout",
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const organizationId = subscription.metadata?.organizationId;
      const active = subscription.status === "active" || subscription.status === "trialing";
      if (organizationId) {
        await db.organization.update({
          where: { id: organizationId },
          data: { plan: active ? "PRO" : "FREE" },
        });
        await logActivity({
          organizationId,
          type: active ? "PLAN_UPGRADED" : "PLAN_DOWNGRADED",
          message: `Billing: subscription ${subscription.status}`,
        });
      }
      break;
    }
    default:
      // Ignore unhandled event types
      break;
  }

  return NextResponse.json({ received: true });
}
