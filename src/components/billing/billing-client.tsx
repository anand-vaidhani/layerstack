"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UpgradeDialog } from "@/components/shared/upgrade-dialog";
import { downgradeToFreeAction, manageBillingAction, upgradeToProAction } from "@/lib/actions/billing";
import { handleActionResult } from "@/lib/toast";
import type { PlanKey } from "@/lib/plans";
import { CheckoutStatusBanner } from "./checkout-status-banner";
import { CurrentPlanCard } from "./current-plan-card";
import { DemoModeNotice } from "./demo-mode-notice";
import { DowngradeDialog } from "./downgrade-dialog";
import { UsageCard } from "./usage-card";

type BillingClientProps = {
  plan: PlanKey;
  projectsUsed: number;
  projectsMax: number | null;
  membersUsed: number;
  membersMax: number | null;
  isOwner: boolean;
  stripeConfigured: boolean;
  checkoutStatus: string | null;
};

export function BillingClient({
  plan,
  projectsUsed,
  projectsMax,
  membersUsed,
  membersMax,
  isOwner,
  stripeConfigured,
  checkoutStatus,
}: BillingClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [downgradeOpen, setDowngradeOpen] = useState(false);

  useEffect(() => {
    if (checkoutStatus === "success") {
      toast.success("Payment successful — welcome to Pro! The plan updates via the Stripe webhook.");
    } else if (checkoutStatus === "cancelled") {
      toast.info("Checkout cancelled — you have not been charged.");
    }
  }, [checkoutStatus]);

  function handleUpgrade() {
    startTransition(async () => {
      const result = await upgradeToProAction();
      if (result.ok) {
        toast.success(result.message);
        if (result.data?.url) {
          window.location.href = result.data.url;
          return;
        }
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handlePortal() {
    startTransition(async () => {
      const result = await manageBillingAction();
      if (result.ok && result.data?.url) {
        window.location.href = result.data.url;
      } else if (!result.ok) {
        toast.error(result.error);
      }
    });
  }

  function handleDowngrade() {
    startTransition(async () => {
      const result = await downgradeToFreeAction();
      handleActionResult(result);
      setDowngradeOpen(false);
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <CheckoutStatusBanner status={checkoutStatus} />

      {!stripeConfigured ? <DemoModeNotice /> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <CurrentPlanCard
          plan={plan}
          stripeConfigured={stripeConfigured}
          isOwner={isOwner}
          pending={pending}
          onUpgrade={handleUpgrade}
          onPortal={handlePortal}
          onDowngrade={() => setDowngradeOpen(true)}
        />

        <UsageCard
          plan={plan}
          projectsUsed={projectsUsed}
          projectsMax={projectsMax}
          membersUsed={membersUsed}
          membersMax={membersMax}
          isOwner={isOwner}
          stripeConfigured={stripeConfigured}
        />
      </div>

      {/* Upgrade modal reused from plan-limit flows */}
      <UpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        reason="Upgrade to unlock more capacity."
        canUpgrade={isOwner}
      />

      <DowngradeDialog
        open={downgradeOpen}
        onOpenChange={setDowngradeOpen}
        pending={pending}
        onConfirm={handleDowngrade}
      />
    </div>
  );
}
