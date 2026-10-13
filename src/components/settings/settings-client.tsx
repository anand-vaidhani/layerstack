"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, KeyRound, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction, updateOrgAction, updateProfileAction } from "@/lib/actions/settings";
import { handleActionResult } from "@/lib/toast";
import type { ActionResult } from "@/lib/result";

type SettingsClientProps = {
  orgName: string;
  userName: string;
  userEmail: string;
  canEditOrg: boolean;
};

export function SettingsClient({ orgName, userName, userEmail, canEditOrg }: SettingsClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const orgFormRef = useRef<HTMLFormElement>(null);
  const profileFormRef = useRef<HTMLFormElement>(null);
  const passwordFormRef = useRef<HTMLFormElement>(null);

  function submit(action: (fd: FormData) => Promise<ActionResult>, form: HTMLFormElement | null, clear = false) {
    if (!form) return;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await action(formData);
      handleActionResult(result);
      if (result.ok) {
        if (clear) form.reset();
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Organization profile */}
      <Card className="shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <Building2 className="size-4.5 text-muted-foreground" />
            </span>
            <div>
              <CardTitle>Organization</CardTitle>
              <CardDescription>Workspace name shown to every member</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form
          ref={orgFormRef}
          onSubmit={(e) => {
            e.preventDefault();
            submit(updateOrgAction, orgFormRef.current);
          }}
        >
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="org-name">Organization name</Label>
              <Input
                id="org-name"
                name="name"
                defaultValue={orgName}
                disabled={!canEditOrg || pending}
                required
              />
              {!canEditOrg ? (
                <p className="text-xs text-muted-foreground">Only owners and admins can edit organization settings.</p>
              ) : null}
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t pt-4">
            <Button type="submit" disabled={!canEditOrg || pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* User profile */}
      <Card className="shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <UserRound className="size-4.5 text-muted-foreground" />
            </span>
            <div>
              <CardTitle>Your profile</CardTitle>
              <CardDescription>Personal details for this account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form
          ref={profileFormRef}
          onSubmit={(e) => {
            e.preventDefault();
            submit(updateProfileAction, profileFormRef.current);
          }}
        >
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="profile-name">Display name</Label>
              <Input id="profile-name" name="name" defaultValue={userName} disabled={pending} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" value={userEmail} disabled />
              <p className="text-xs text-muted-foreground">Sign-in email is read-only in this demo.</p>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t pt-4">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Password */}
      <Card className="shadow-xs lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <KeyRound className="size-4.5 text-muted-foreground" />
            </span>
            <div>
              <CardTitle>Password</CardTitle>
              <CardDescription>Use at least 8 characters</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form
          ref={passwordFormRef}
          onSubmit={(e) => {
            e.preventDefault();
            submit(changePasswordAction, passwordFormRef.current, true);
          }}
        >
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" name="newPassword" type="password" autoComplete="new-password" minLength={8} required />
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t pt-4">
            <Button type="submit" disabled={pending}>
              {pending ? "Updating…" : "Update password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
