"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptInviteAction } from "@/lib/actions/team";
import { signOutAction } from "@/lib/actions/auth";
import { handleActionResult } from "@/lib/toast";
import { InviteInvalidCard } from "./invite-invalid-card";
import { InviteJoinCard } from "./invite-join-card";
import { InviteSignedOutCard } from "./invite-signed-out-card";
import { InviteWrongAccountCard } from "./invite-wrong-account-card";
import type { Role } from "@/generated/prisma/client";

type InviteCardProps = {
  token: string;
  /** Token resolves to an unexpired invitation */
  valid: boolean;
  expired: boolean;
  orgName: string | null;
  role: Role | null;
  invitedEmail: string | null;
  invitedByName: string | null;
  /** Email of the signed-in viewer, or null when signed out */
  viewerEmail: string | null;
};

export function InviteCard({
  token,
  valid,
  expired,
  orgName,
  role,
  invitedEmail,
  invitedByName,
  viewerEmail,
}: InviteCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const signInHref = `/sign-in?next=${encodeURIComponent(`/invite/${token}`)}`;
  const signUpHref = `/sign-up?next=${encodeURIComponent(`/invite/${token}`)}`;

  function accept() {
    startTransition(async () => {
      try {
        const result = await acceptInviteAction(token);
        if (result.ok) {
          setError(null);
        } else {
          // Keep the message on screen (toasts disappear) and leave a way out —
          // a blocked accept must never strand the signed-in user here.
          setError(result.error);
        }
      } catch {
        // A successful accept redirects (NEXT_REDIRECT) away from this page.
        router.refresh();
      }
    });
  }

  /** Signs out and returns home — the escape hatch from any signed-in state. */
  function signOut() {
    startTransition(async () => {
      const result = await signOutAction();
      handleActionResult(result);
      if (result.ok) {
        router.push("/");
        router.refresh();
      }
    });
  }

  /** Signs out and returns to this invite link to sign in as the invited account. */
  function signOutAndSwitch() {
    startTransition(async () => {
      const result = await signOutAction();
      if (result.ok) {
        router.push(signInHref);
        router.refresh();
      } else {
        handleActionResult(result);
      }
    });
  }

  if (!valid) {
    return <InviteInvalidCard expired={expired} />;
  }

  if (!viewerEmail) {
    return (
      <InviteSignedOutCard
        orgName={orgName}
        role={role}
        invitedEmail={invitedEmail}
        invitedByName={invitedByName}
        signInHref={signInHref}
        signUpHref={signUpHref}
      />
    );
  }

  const emailMatches =
    invitedEmail !== null && viewerEmail.toLowerCase() === invitedEmail.toLowerCase();

  if (!emailMatches) {
    return (
      <InviteWrongAccountCard
        invitedEmail={invitedEmail}
        viewerEmail={viewerEmail}
        pending={pending}
        onSwitch={signOutAndSwitch}
      />
    );
  }

  return (
    <InviteJoinCard
      orgName={orgName}
      role={role}
      invitedByName={invitedByName}
      viewerEmail={viewerEmail}
      error={error}
      pending={pending}
      onJoin={accept}
      onSignOut={signOut}
    />
  );
}
