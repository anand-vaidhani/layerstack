"use client";

import { UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "@/lib/actions/settings";
import { SettingsCard } from "./settings-card";
import { useFormSubmit } from "./use-form-submit";

export function ProfileSettingsCard({ userName, userEmail }: { userName: string; userEmail: string }) {
  const { pending, submit } = useFormSubmit(updateProfileAction);

  return (
    <SettingsCard
      icon={UserRound}
      title="Your profile"
      description="Personal details for this account"
      pending={pending}
      submitLabel="Save profile"
      pendingLabel="Saving…"
      onSubmit={submit}
    >
      <div className="grid gap-2">
        <Label htmlFor="profile-name">Display name</Label>
        <Input id="profile-name" name="name" defaultValue={userName} disabled={pending} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="profile-email">Email</Label>
        <Input id="profile-email" value={userEmail} disabled />
        <p className="text-xs text-muted-foreground">Sign-in email is read-only in this demo.</p>
      </div>
    </SettingsCard>
  );
}
