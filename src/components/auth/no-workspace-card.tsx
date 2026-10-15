"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOutAction } from "@/lib/actions/auth";
import { handleActionResult } from "@/lib/toast";

/**
 * Shown to signed-in accounts that belong to no organization — typically after
 * an invite-mode signup was blocked by the workspace's plan limit. Redirects
 * between /dashboard and /sign-in would loop for these accounts, so they land
 * here instead and get an explanation plus a way out.
 */
export function NoWorkspaceCard({ email }: { email: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

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

  return (
    <Card className="w-full shadow-sm max-w-xl">
      <CardHeader>
        <CardTitle className="text-xl">No workspace for this account</CardTitle>
        <CardDescription>
          <span className="font-mono font-medium text-foreground">{email}</span> isn&apos;t a
          member of any workspace yet.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        This usually happens when an invitation couldn&apos;t be accepted — for example the
        workspace was at its plan&apos;s member limit. Ask the workspace owner to free a seat or
        upgrade the plan, then reopen your invitation link and sign in again.
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button variant="outline" disabled={pending} onClick={() => router.push("/")}>
          Back to home
        </Button>
        <Button disabled={pending} onClick={signOut}>
          {pending ? "Signing out…" : "Sign out"}
        </Button>
      </CardFooter>
    </Card>
  );
}
