type UsageBarProps = {
  label: string;
  used: number;
  max: number | null;
  unlimitedNote: string;
};

function usageTone(used: number, max: number | null): string {
  if (max === null) return "text-emerald-600 dark:text-emerald-400";
  const ratio = used / max;
  if (ratio >= 1) return "text-red-600 dark:text-red-400";
  if (ratio >= 0.7) return "text-amber-600 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
}

/** Label + progress bar for one plan resource (projects, members, …). */
export function UsageBar({ label, used, max, unlimitedNote }: UsageBarProps) {
  const percent = max === null ? Math.min(100, used * 5) : Math.min(100, Math.round((used / max) * 100));
  const indicator =
    max === null
      ? "bg-emerald-500"
      : used >= max
        ? "bg-red-500"
        : used / max >= 0.7
          ? "bg-amber-500"
          : "bg-emerald-500";
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={`tabular-nums text-sm font-semibold ${usageTone(used, max)}`}>
          {used}/{max === null ? "∞" : max}
          {max === null ? <span className="ml-1 text-xs font-normal text-muted-foreground">{unlimitedNote}</span> : null}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${indicator}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
