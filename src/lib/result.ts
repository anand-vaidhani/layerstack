import type { z } from "zod";

export type ActionCode =
  | "VALIDATION"
  | "AUTH"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PLAN_LIMIT"
  | "STRIPE_REQUIRED"
  | "SERVER";

export type ActionFailure = {
  ok: false;
  code: ActionCode;
  error: string;
  /** Which plan limit was hit */
  limit?: "projects" | "members";
};

export type ActionResult<T = null> = { ok: true; message: string; data?: T } | ActionFailure;

export function formDataObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

export function parseForm<S extends z.ZodType>(
  schema: S,
  formData: FormData,
): { ok: true; data: z.output<S> } | { ok: false; error: string } {
  const parsed = schema.safeParse(formDataObject(formData));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const field = first?.path.join(".");
    return { ok: false, error: field ? `${field}: ${first?.message}` : (first?.message ?? "Invalid input") };
  }
  return { ok: true, data: parsed.data };
}
