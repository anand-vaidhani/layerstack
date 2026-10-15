export { cn } from "cn"

/**
 * Sanitizes a post-auth redirect target. Only invite links are honored so a
 * crafted `?next=` cannot be used as an open redirect.
 */
export function inviteNext(next: unknown): string | null {
  if (typeof next !== "string") return null;
  return next.startsWith("/invite/") && !next.startsWith("//") && !next.includes("\\")
    ? next
    : null;
}
