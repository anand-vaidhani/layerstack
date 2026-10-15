/** Amber banner shown when every seat on the current plan is used. */
export function SeatLimitBanner({
  memberCount,
  pendingCount,
  maxMembers,
  planLabel,
}: {
  memberCount: number;
  pendingCount: number;
  maxMembers: number | null;
  planLabel: string;
}) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
      <p className="font-medium">Member limit reached</p>
      <p className="text-muted-foreground">
        {memberCount + pendingCount} of {maxMembers} seats used on the {planLabel} plan. Upgrade to Pro for 10 seats.
      </p>
    </div>
  );
}
