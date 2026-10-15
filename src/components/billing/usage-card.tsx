import { Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsageBar } from "./usage-bar";
import type { PlanKey } from "@/lib/plans";

type UsageCardProps = {
  plan: PlanKey;
  projectsUsed: number;
  projectsMax: number | null;
  membersUsed: number;
  membersMax: number | null;
  isOwner: boolean;
  stripeConfigured: boolean;
};

/** Resource usage for the current billing period, against plan limits. */
export function UsageCard({
  plan,
  projectsUsed,
  projectsMax,
  membersUsed,
  membersMax,
  isOwner,
  stripeConfigured,
}: UsageCardProps) {
  return (
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
  );
}
