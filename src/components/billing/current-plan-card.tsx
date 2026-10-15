import { Check, CreditCard, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlanBadge } from "@/components/shared/badges";
import { PLANS, type PlanKey } from "@/lib/plans";

type CurrentPlanCardProps = {
  plan: PlanKey;
  stripeConfigured: boolean;
  isOwner: boolean;
  pending: boolean;
  onUpgrade: () => void;
  onPortal: () => void;
  onDowngrade: () => void;
};

/** Feature/cycle summary for the active plan, with the plan action buttons. */
export function CurrentPlanCard({
  plan,
  stripeConfigured,
  isOwner,
  pending,
  onUpgrade,
  onPortal,
  onDowngrade,
}: CurrentPlanCardProps) {
  const planInfo = PLANS[plan];
  const ownerOnlyTitle = isOwner ? undefined : "Only the owner can manage billing";

  return (
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
            <Button variant="outline" disabled={!isOwner || pending} title={ownerOnlyTitle} onClick={onPortal}>
              <CreditCard />
              Manage billing
            </Button>
            <Button
              disabled={!isOwner || pending}
              title={ownerOnlyTitle}
              className="bg-violet-600 hover:bg-violet-700"
              onClick={onUpgrade}
            >
              <Crown />
              {pending ? "Redirecting…" : "Upgrade to Pro — $29/mo"}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" disabled={!isOwner || pending} onClick={onDowngrade}>
              Downgrade to Free
            </Button>
            <Button disabled={!isOwner || pending} onClick={onPortal}>
              <CreditCard />
              {pending ? "Opening…" : "Manage billing in Stripe"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
