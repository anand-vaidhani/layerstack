export const STATUSES = ["Active", "Paused", "Completed"] as const;

/** Deterministic hue per project id so each card gets a stable gradient. */
export function hueFor(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 360;
  return hash;
}
