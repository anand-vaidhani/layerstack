"use client";

import { useTransition } from "react";
import { Check, Crown, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { upgradeToProAction } from "@/lib/actions/billing";
import { PLANS } from "@/lib/plans";

type UpgradeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Why the upgrade is being suggested (plan-limit message) */
  reason?: string;
  /** Only the organization owner can upgrade */
  canUpgrade: boolean;
};

export function UpgradeDialog({ open, onOpenChange, reason, canUpgrade }: UpgradeDialogProps) {
  const [pending, startTransition] = useTransition();
  const pro = PLANS.PRO;

  function handleUpgrade() {
    startTransition(async () => {
      const result = await upgradeToProAction();
      if (result.ok) {
        toast.success(result.message);
        onOpenChange(false);
        if (result.data?.url) {
          window.location.href = result.data.url;
        }
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/25">
            <Crown className="size-5" />
          </div>
          <DialogTitle className="text-xl">Upgrade to Pro</DialogTitle>
          <DialogDescription>
            {reason ?? "Unlock the full potential of your workspace."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/40 p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold">{pro.label}</p>
            <p className="text-2xl font-semibold tracking-tight">
              ${pro.priceMonthly}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
          </div>
          <Separator className="my-3" />
          <ul className="grid gap-2.5">
            {pro.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm">
                <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                  <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5 text-xs text-muted-foreground">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-violet-500" />
          {canUpgrade
            ? "Stripe keys are not configured in this environment, so the upgrade completes instantly in demo mode. With keys set, you would be redirected to Stripe Checkout."
            : "Only the organization owner can change the billing plan. Ask your owner to upgrade."}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Not now
          </Button>
          <Button onClick={handleUpgrade} disabled={pending || !canUpgrade} className="bg-violet-600 hover:bg-violet-700">
            {pending ? "Upgrading…" : `Upgrade to Pro — $${pro.priceMonthly}/mo`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
