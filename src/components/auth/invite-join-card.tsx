import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/shared/badges";
import { InviteCardShell } from "./invite-card-shell";
import type { Role } from "@/generated/prisma/client";

type InviteJoinCardProps = {
  orgName: string | null;
  role: Role | null;
  invitedByName: string | null;
  viewerEmail: string;
  error: string | null;
  pending: boolean;
  onJoin: () => void;
  onSignOut: () => void;
};

/**
 * Final invite state for the invited, signed-in viewer: the Join button plus a
 * persistent error banner and a sign-out escape hatch, so a blocked accept can
 * never strand the user on this page.
 */
export function InviteJoinCard({ orgName, role, invitedByName, viewerEmail, error, pending, onJoin, onSignOut }: InviteJoinCardProps) {
  return (
    <InviteCardShell
      title={`Join ${orgName}`}
      description={
        <>
          {invitedByName ? `${invitedByName} invited you` : "You were invited"} to join{" "}
          <span className="font-medium text-foreground">{orgName}</span> as{" "}
          {role ? <RoleBadge role={role} /> : null}
        </>
      }
      contentClassName="grid gap-3 text-sm text-muted-foreground"
      content={
        <>
          <p>
            You&apos;ll get access to this workspace&apos;s projects, team and dashboard — your other
            workspaces stay untouched and switchable from the header.
          </p>
          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <p className="font-medium text-destructive">Couldn&apos;t join yet</p>
              <p className="mt-0.5 text-destructive/90">{error}</p>
            </div>
          ) : null}
        </>
      }
      footerClassName="flex-col items-stretch gap-3"
      footer={
        <>
          <Button onClick={onJoin} disabled={pending} className="w-full">
            {pending ? "Joining…" : `Join ${orgName}`}
          </Button>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Signed in as {viewerEmail}</span>
            <button
              type="button"
              onClick={onSignOut}
              disabled={pending}
              className="font-medium underline-offset-4 hover:underline disabled:opacity-50"
            >
              Sign out
            </button>
          </div>
        </>
      }
    />
  );
}
