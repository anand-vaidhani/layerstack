import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

type PlanLimitBannerProps = {
  planLabel: string;
  maxProjects: number;
  onUpgrade: () => void;
};

/** Amber banner shown when the project cap for the current plan is hit. */
export function PlanLimitBanner({ planLabel, maxProjects, onUpgrade }: PlanLimitBannerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
          <Lock className="size-4 text-amber-600 dark:text-amber-400" />
        </span>
        <div>
          <p className="text-sm font-medium">You’ve reached the {planLabel} plan limit</p>
          <p className="text-sm text-muted-foreground">
            {maxProjects} of {maxProjects} projects used. Upgrade to Pro for unlimited projects.
          </p>
        </div>
      </div>
      <Button
        className="shrink-0 bg-violet-600 hover:bg-violet-700"
        onClick={() => onUpgrade()}
      >
        Upgrade to Pro
      </Button>
    </div>
  );
}
