"use client";

import { useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signInAction } from "@/lib/actions/auth";
import { handleActionResult } from "@/lib/toast";
import type { InviteInfo } from "@/lib/invites";
import { DemoCredentials } from "./demo-credentials";
import { Field } from "./field";
import { InviteBanner } from "./invite-banner";

export function SignInForm({
  next,
  invite,
}: {
  next?: string | null;
  invite?: InviteInfo | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await signInAction(formData);
      handleActionResult(result);
      if (result.ok) {
        router.push(next ?? "/dashboard");
        router.refresh();
      }
    });
  }

  function fillDemo(email: string, password: string) {
    const form = formRef.current;
    if (!form) return;
    const emailInput = form.elements.namedItem("email") as HTMLInputElement | null;
    const passwordInput = form.elements.namedItem("password") as HTMLInputElement | null;
    if (emailInput) emailInput.value = email;
    if (passwordInput) passwordInput.value = password;
  }

  return (
    <Card className="w-full shadow-sm max-w-xl">
      <CardHeader>
        <CardTitle className="text-xl">
          {invite ? `Sign in to join ${invite.orgName}` : "Welcome back"}
        </CardTitle>
        <CardDescription>
          {invite
            ? `You'll be asked to accept the ${invite.role} invitation after signing in`
            : "Sign in to your workspace to continue"}
        </CardDescription>
      </CardHeader>
      <form ref={formRef} action={handleSubmit}>
        <CardContent className="grid gap-4">
          <Field
            id="email"
            label="Email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            defaultValue={invite?.email}
            readOnly={Boolean(invite)}
          />
          <Field id="password" label="Password" type="password" placeholder="••••••••" autoComplete="current-password" />
          {invite ? (
            <InviteBanner
              invite={invite}
              href={`/sign-up${next ? `?next=${encodeURIComponent(next)}` : ""}`}
              actionLabel="Create an account instead"
            />
          ) : (
            <DemoCredentials onFill={fillDemo} />
          )}
        </CardContent>
        <CardFooter className="mt-2 flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-sm text-muted-foreground">
            No account?{" "}
            <Link
              href={`/sign-up${next ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
