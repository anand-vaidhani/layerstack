import type { Metadata } from "next";
import { requireOrgContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/plans";
import { isStripeConfigured } from "@/lib/stripe";
import { PageHeader } from "@/components/shared/page-header";
import { BillingClient } from "@/components/billing/billing-client";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage({ searchParams }: PageProps<"/dashboard/billing">) {
  const ctx = await requireOrgContext();
  const { checkout } = await searchParams;
  const checkoutStatus = checkout === "success" || checkout === "cancelled" ? checkout : null;

  const [projectCount, memberCount] = await Promise.all([
    db.project.count({ where: { organizationId: ctx.org.id } }),
    db.organizationUser.count({ where: { organizationId: ctx.org.id } }),
  ]);
  const plan = PLANS[ctx.org.plan];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Billing & plans"
        description="Manage your subscription, monitor plan usage and upgrade when you’re ready."
      />
      <BillingClient
        plan={ctx.org.plan}
        projectsUsed={projectCount}
        projectsMax={plan.maxProjects}
        membersUsed={memberCount}
        membersMax={plan.maxMembers}
        isOwner={ctx.role === "OWNER"}
        stripeConfigured={isStripeConfigured()}
        checkoutStatus={checkoutStatus}
      />
    </div>
  );
}
