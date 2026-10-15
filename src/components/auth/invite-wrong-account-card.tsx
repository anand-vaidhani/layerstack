import { Button } from "@/components/ui/button";
import { InviteCardShell } from "./invite-card-shell";

type InviteWrongAccountCardProps = {
  invitedEmail: string | null;
  viewerEmail: string;
  pending: boolean;
  onSwitch: () => void;
};

/** Signed in, but not as the invited email — offer sign-out & switch. */
export function InviteWrongAccountCard({ invitedEmail, viewerEmail, pending, onSwitch }: InviteWrongAccountCardProps) {
  return (
    <InviteCardShell
      title="Wrong account"
      description={
        <>
          This invitation was sent to{" "}
          <span className="font-medium text-foreground">{invitedEmail}</span>, but you are signed in as{" "}
          <span className="font-medium text-foreground">{viewerEmail}</span>.
        </>
      }
      footer={
        <Button variant="outline" disabled={pending} onClick={onSwitch}>
          {pending ? "Signing out…" : "Sign out & switch account"}
        </Button>
      }
    />
  );
}
