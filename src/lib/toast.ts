import { toast } from "sonner";
import type { ActionResult } from "@/lib/result";

type HandleOptions = {
  /** Called with the plan-limit message when a PLAN_LIMIT error arrives */
  onPlanLimit?: (message: string) => void;
  /** Override for the success toast */
  successMessage?: string;
};

/**
 * Central toast handling for server-action results.
 * PLAN_LIMIT errors are delegated to `onPlanLimit` so callers can open the
 * "Upgrade to Pro" modal instead of showing a plain error toast.
 */
export function handleActionResult<T>(result: ActionResult<T>, options: HandleOptions = {}): void {
  if (result.ok) {
    toast.success(options.successMessage ?? result.message);
    return;
  }
  if (result.code === "PLAN_LIMIT" && options.onPlanLimit) {
    options.onPlanLimit(result.error);
    return;
  }
  toast.error(result.error);
}
