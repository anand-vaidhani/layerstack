"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signUpAction } from "@/lib/actions/auth";
import { handleActionResult } from "@/lib/toast";
import type { InviteInfo } from "@/lib/invites";
import { Field } from "./field";

export function SignUpForm({
  next,
  invite,
}: {
  next?: string | null;
  invite?: InviteInfo | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setError(null);
      const result = await signUpAction(formData);
      handleActionResult(result);
      if (result.ok) {
        // Invite-mode signup joins the org directly — no personal workspace, so
        // land on the dashboard instead of the (now consumed) invite link.
        router.push(invite ? "/dashboard" : (next ?? "/dashboard"));
        router.refresh();
      } else if (invite) {
        // e.g. PLAN_LIMIT after the account was already created — keep it on
        // screen instead of a toast that disappears, since the user is now
        // signed in with nowhere obvious to go.
        setError(result.error);
      }
    });
  }

  return (
    <Card className="w-full shadow-sm max-w-xl">
      <CardHeader>
        <CardTitle className="text-xl">
          {invite ? `Join ${invite.orgName}` : "Create your workspace"}
        </CardTitle>
        <CardDescription>
          {invite
            ? `Create your account to join ${invite.orgName} as ${invite.role} — choose a password, no workspace needed`
            : "Start on the Free plan — no credit card required"}
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="grid gap-4">
          <Field id="name" label="Your name" placeholder="Ada Lovelace" autoComplete="name" />
          <Field
            id="email"
            label="Email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            defaultValue={invite?.email}
            readOnly={Boolean(invite)}
          />
          <Field
            id="password"
            label="Password"
            type="password"
            placeholder={invite ? "Choose a password — at least 8 characters" : "At least 8 characters"}
            autoComplete="new-password"
          />
          {invite ? null : (
            <Field id="organizationName" label="Organization name" placeholder="Acme Inc" autoComplete="organization" />
          )}
          {invite ? <input type="hidden" name="inviteToken" value={invite.token} /> : null}
          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <p className="font-medium text-destructive">Couldn&apos;t finish joining</p>
              <p className="mt-0.5 text-destructive/90">{error}</p>
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="mt-2 flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating account…" : invite ? "Create account & join" : "Create workspace"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={`/sign-in${next ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
