import Link from "next/link";
import { InviteCardShell } from "./invite-card-shell";

/** Unknown or revoked token — or one past its expiry. */
export function InviteInvalidCard({ expired }: { expired: boolean }) {
  return (
    <InviteCardShell
      title={expired ? "Invitation expired" : "Invitation unavailable"}
      description={
        expired
          ? "This invitation has expired. Ask an owner or admin of the workspace to send you a new one."
          : "This invitation link is not valid — it may have been revoked or already used."
      }
      footer={
        <Link href="/" className="text-sm font-medium underline-offset-4 hover:underline">
          Back to LayerStack
        </Link>
      }
    />
  );
}
