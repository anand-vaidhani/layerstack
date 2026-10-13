/** Compact relative time label, e.g. "3d ago" — computed at render time. */
export function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const future = diffMs < 0;
  const absMs = Math.abs(diffMs);
  const minutes = Math.floor(absMs / 60_000);

  if (future) {
    if (minutes < 60) return `in ${Math.max(1, minutes)}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `in ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `in ${days}d`;
    return `in ${Math.floor(days / 30)}mo`;
  }

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function shortDay(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
