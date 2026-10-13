"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrgContext } from "@/lib/auth";
import type { ActionFailure, ActionResult } from "@/lib/result";
import { appUrl, getStripe, isStripeConfigured } from "@/lib/stripe";
import { logActivity } from "@/lib/activity";

function requireOwner(role: string): ActionFailure | null {
  if (role !== "OWNER") {
    return { ok: false, code: "FORBIDDEN", error: "Only the organization owner can manage billing" };
  }
  return null;
}

/**
 * Upgrade the active organization to PRO.
 * With Stripe keys configured this creates a Checkout session; without them
 * it performs a clearly-labelled demo upgrade so the flow can be exercised.
 */
export async function upgradeToProAction(): Promise<ActionResult<{ url?: string }>> {
  const ctx = await requireOrgContext();
  const forbidden = requireOwner(ctx.role);
  if (forbidden) return forbidden;

  if (ctx.org.plan === "PRO") {
    return { ok: false, code: "CONFLICT", error: "This organization is already on the Pro plan" };
  }

  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_ID_PRO;

  if (stripe && priceId) {
    let customerId = ctx.org.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: ctx.org.name,
        email: ctx.user.email,
        metadata: { organizationId: ctx.org.id },
      });
      customerId = customer.id;
      await db.organization.update({ where: { id: ctx.org.id }, data: { stripeCustomerId: customerId } });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl()}/dashboard/billing?checkout=success`,
      cancel_url: `${appUrl()}/dashboard/billing?checkout=cancelled`,
      metadata: { organizationId: ctx.org.id },
      subscription_data: { metadata: { organizationId: ctx.org.id } },
    });

    if (!session.url) {
      return { ok: false, code: "SERVER", error: "Stripe did not return a checkout URL" };
    }
    return { ok: true, message: "Redirecting to Stripe Checkout", data: { url: session.url } };
  }

  // Demo mode: no Stripe keys configured
  await db.organization.update({ where: { id: ctx.org.id }, data: { plan: "PRO" } });
  await logActivity({
    organizationId: ctx.org.id,
    actorId: ctx.user.id,
    type: "PLAN_UPGRADED",
    message: `${ctx.user.name ?? ctx.user.email} upgraded the workspace to Pro (demo mode)`,
  });
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Upgraded to Pro (demo mode — Stripe keys not configured)" };
}

/** Open the Stripe Customer Portal (or explain that Stripe is not configured). */
export async function manageBillingAction(): Promise<ActionResult<{ url?: string }>> {
  const ctx = await requireOrgContext();
  const forbidden = requireOwner(ctx.role);
  if (forbidden) return forbidden;

  const stripe = getStripe();
  if (!stripe || !isStripeConfigured()) {
    return {
      ok: false,
      code: "STRIPE_REQUIRED",
      error: "Stripe is not configured yet — set STRIPE_SECRET_KEY and STRIPE_PRICE_ID_PRO to enable the customer portal.",
    };
  }
  if (!ctx.org.stripeCustomerId) {
    return { ok: false, code: "NOT_FOUND", error: "No billing customer exists for this organization yet" };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: ctx.org.stripeCustomerId,
    return_url: `${appUrl()}/dashboard/billing`,
  });
  return { ok: true, message: "Opening Stripe Customer Portal", data: { url: session.url } };
}

/** Downgrade back to FREE (demo-mode instant; via Stripe subscription cancellation when configured). */
export async function downgradeToFreeAction(): Promise<ActionResult> {
  const ctx = await requireOrgContext();
  const forbidden = requireOwner(ctx.role);
  if (forbidden) return forbidden;

  if (ctx.org.plan === "FREE") {
    return { ok: false, code: "CONFLICT", error: "This organization is already on the Free plan" };
  }

  const stripe = getStripe();
  if (stripe && ctx.org.stripeSubId) {
    await stripe.subscriptions.update(ctx.org.stripeSubId, { cancel_at_period_end: true });
    return {
      ok: true,
      message: "Your subscription will cancel at the end of the billing period",
    };
  }

  await db.organization.update({ where: { id: ctx.org.id }, data: { plan: "FREE", stripeSubId: null } });
  await logActivity({
    organizationId: ctx.org.id,
    actorId: ctx.user.id,
    type: "PLAN_DOWNGRADED",
    message: `${ctx.user.name ?? ctx.user.email} downgraded the workspace to Free (demo mode)`,
  });
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Downgraded to the Free plan (demo mode)" };
}
