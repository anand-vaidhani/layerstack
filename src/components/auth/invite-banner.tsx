import Link from "next/link";
import type { InviteInfo } from "@/lib/invites";

/** Context banner shown on sign-in/sign-up when arriving from an invite link. */
export function InviteBanner({ invite, href, actionLabel }: { invite: InviteInfo; href: string; actionLabel: string }) {
  return (
    <div className="mt-4 w-full rounded-lg border border-violet-500/30 bg-violet-500/5 p-3 text-sm">
      <p className="font-medium">You&apos;re invited to join {invite.orgName} as {invite.role}</p>
      <p className="text-muted-foreground">
        This invitation was sent to{" "}
        <span className="font-mono font-medium text-foreground">{invite.email}</span>.{" "}
        <Link href={href} className="font-medium text-foreground underline-offset-4 hover:underline">
          {actionLabel}
        </Link>{" "}
        if you don&apos;t have an account yet — you&apos;ll come straight back here.
      </p>
    </div>
  );
}
