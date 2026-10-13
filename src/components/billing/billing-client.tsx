"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, CreditCard, Crown, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlanBadge } from "@/components/shared/badges";
import { UpgradeDialog } from "@/components/shared/upgrade-dialog";
import { downgradeToFreeAction, manageBillingAction, upgradeToProAction } from "@/lib/actions/billing";
import { handleActionResult } from "@/lib/toast";
import { PLANS, type PlanKey } from "@/lib/plans";

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

function usageTone(used: number, max: number | null): string {
  if (max === null) return "text-emerald-600 dark:text-emerald-400";
  const ratio = used / max;
  if (ratio >= 1) return "text-red-600 dark:text-red-400";
  if (ratio >= 0.7) return "text-amber-600 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
}

function UsageBar({
  label,
  used,
  max,
  unlimitedNote,
}: {
  label: string;
  used: number;
  max: number | null;
  unlimitedNote: string;
}) {
  const percent = max === null ? Math.min(100, used * 5) : Math.min(100, Math.round((used / max) * 100));
  const indicator =
    max === null
      ? "bg-emerald-500"
      : used >= max
        ? "bg-red-500"
        : used / max >= 0.7
          ? "bg-amber-500"
          : "bg-emerald-500";
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={`tabular-nums text-sm font-semibold ${usageTone(used, max)}`}>
          {used}/{max === null ? "∞" : max}
          {max === null ? <span className="ml-1 text-xs font-normal text-muted-foreground">{unlimitedNote}</span> : null}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${indicator}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

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
  const planInfo = PLANS[plan];

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
      {/* Checkout result banner */}
      {checkoutStatus === "success" ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
          <p className="font-medium text-emerald-700 dark:text-emerald-400">Checkout complete</p>
          <p className="text-muted-foreground">
            Your subscription is active. The plan updates automatically through the Stripe webhook.
          </p>
        </div>
      ) : checkoutStatus === "cancelled" ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <p className="font-medium text-amber-700 dark:text-amber-400">Checkout cancelled</p>
          <p className="text-muted-foreground">No charge was made — you can upgrade whenever you’re ready.</p>
        </div>
      ) : null}

      {/* Demo mode notice */}
      {!stripeConfigured ? (
        <div className="flex items-start gap-3 rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 text-sm">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-violet-500" />
          <div>
            <p className="font-medium">Demo mode — Stripe keys not configured</p>
            <p className="text-muted-foreground">
              Upgrades apply instantly without a real charge. Add{" "}
              <code className="rounded bg-background px-1 py-0.5 text-xs">STRIPE_SECRET_KEY</code> and{" "}
              <code className="rounded bg-background px-1 py-0.5 text-xs">STRIPE_PRICE_ID_PRO</code> to enable real
              Stripe Checkout, webhooks and the customer portal.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current plan */}
        <Card className="shadow-xs lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
                  <Crown className="size-5" />
                </span>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {planInfo.label} plan <PlanBadge plan={plan} />
                  </CardTitle>
                  <CardDescription>{planInfo.blurb}</CardDescription>
                </div>
              </div>
              <p className="text-2xl font-semibold tracking-tight">
                {planInfo.priceMonthly === null ? "Custom" : planInfo.priceMonthly === 0 ? "$0" : `$${planInfo.priceMonthly}`}
                {planInfo.priceMonthly !== null ? (
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                ) : null}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2.5">
              {planInfo.features.map((f) => (
                <p key={f} className="flex items-center gap-2.5 text-sm">
                  <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                    <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                  </span>
                  {f}
                </p>
              ))}
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="text-muted-foreground">Billing cycle</p>
                <p className="mt-0.5 font-medium">
                  {plan === "FREE" ? "No subscription" : "Monthly · renews on the 10th"}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="text-muted-foreground">Payment method</p>
                <p className="mt-0.5 font-medium">
                  {stripeConfigured ? "Managed in Stripe portal" : "Demo mode — none on file"}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-end gap-2 border-t pt-4">
            {plan === "FREE" ? (
              <>
                <Button variant="outline" disabled={!isOwner || pending} title={isOwner ? undefined : "Only the owner can manage billing"} onClick={handlePortal}>
                  <CreditCard />
                  Manage billing
                </Button>
                <Button
                  disabled={!isOwner || pending}
                  title={isOwner ? undefined : "Only the owner can manage billing"}
                  className="bg-violet-600 hover:bg-violet-700"
                  onClick={handleUpgrade}
                >
                  <Crown />
                  {pending ? "Redirecting…" : "Upgrade to Pro — $29/mo"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" disabled={!isOwner || pending} onClick={() => setDowngradeOpen(true)}>
                  Downgrade to Free
                </Button>
                <Button disabled={!isOwner || pending} onClick={handlePortal}>
                  <CreditCard />
                  {pending ? "Opening…" : "Manage billing in Stripe"}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>

        {/* Usage */}
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>Current period against plan limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <UsageBar label="Projects" used={projectsUsed} max={projectsMax} unlimitedNote="unlimited" />
            <UsageBar label="Team members" used={membersUsed} max={membersMax} unlimitedNote="unlimited" />
            {!isOwner ? (
              <p className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                <Lock className="size-3.5" />
                Only the organization owner can change the plan.
              </p>
            ) : null}
            {!stripeConfigured && plan !== "FREE" ? (
              <p className="text-xs text-muted-foreground">
                Downgrading instantly reverts limits in demo mode (no subscription to cancel).
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Upgrade modal reused from plan-limit flows */}
      <UpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        reason="Upgrade to unlock more capacity."
        canUpgrade={isOwner}
      />

      {/* Downgrade confirmation */}
      <AlertDialog open={downgradeOpen} onOpenChange={setDowngradeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Downgrade to Free?</AlertDialogTitle>
            <AlertDialogDescription>
              Your workspace returns to the Free plan limits: 3 projects and 2 team members. Extra projects stay
              visible but new creation will be blocked until you are within the limit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Keep Pro</AlertDialogCancel>
            <AlertDialogAction disabled={pending} onClick={handleDowngrade}>
              {pending ? "Downgrading…" : "Downgrade"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
