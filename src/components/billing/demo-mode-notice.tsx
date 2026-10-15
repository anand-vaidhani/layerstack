import { Sparkles } from "lucide-react";

/** Explains that Stripe keys are missing and upgrades are simulated. */
export function DemoModeNotice() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 text-sm">
      <Sparkles className="mt-0.5 size-4 shrink-0 text-violet-500" />
      <div>
        <p className="font-medium">Demo mode — Stripe is not configured</p>
        
      </div>
    </div>
  );
}
