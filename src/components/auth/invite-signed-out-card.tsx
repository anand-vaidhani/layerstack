import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InviteCardShell } from "./invite-card-shell";
import type { Role } from "@/generated/prisma/client";

type InviteSignedOutCardProps = {
  orgName: string | null;
  role: Role | null;
  invitedEmail: string | null;
  invitedByName: string | null;
  signInHref: string;
  signUpHref: string;
};

/** Valid invite, no session — offer sign-in / sign-up with the invited email. */
export function InviteSignedOutCard({ orgName, role, invitedEmail, invitedByName, signInHref, signUpHref }: InviteSignedOutCardProps) {
  return (
    <InviteCardShell
      title={`Join ${orgName}`}
      description={
        <>
          {invitedByName ? `${invitedByName} invited ` : "You were invited "}
          <span className="font-medium text-foreground">{invitedEmail}</span> to join {orgName}
          {role ? ` as ${role}` : ""}. Sign in (or create an account) with that email to accept.
        </>
      }
      footer={
        <>
          <Link href={signInHref}>
            <Button variant="outline">Sign in</Button>
          </Link>
          <Link href={signUpHref}>
            <Button>Create account</Button>
          </Link>
        </>
      }
      footerClassName="flex gap-3"
    />
  );
}
