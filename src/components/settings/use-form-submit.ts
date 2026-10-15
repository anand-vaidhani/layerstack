"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { handleActionResult } from "@/lib/toast";
import type { ActionResult } from "@/lib/result";

/**
 * Shared submit behavior for settings forms: run a server action, toast the
 * result, refresh the router on success, optionally reset the form.
 */
export function useFormSubmit(
  action: (formData: FormData) => Promise<ActionResult>,
  options: { resetOnSuccess?: boolean } = {},
) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function submit(form: HTMLFormElement) {
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await action(formData);
      handleActionResult(result);
      if (result.ok) {
        if (options.resetOnSuccess) form.reset();
        router.refresh();
      }
    });
  }

  return { pending, submit };
}
