"use client";

import { KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction } from "@/lib/actions/settings";
import { SettingsCard } from "./settings-card";
import { useFormSubmit } from "./use-form-submit";

export function PasswordSettingsCard({ className }: { className?: string }) {
  const { pending, submit } = useFormSubmit(changePasswordAction, { resetOnSuccess: true });

  return (
    <SettingsCard
      icon={KeyRound}
      title="Password"
      description="Use at least 8 characters"
      className={className}
      pending={pending}
      submitLabel="Update password"
      pendingLabel="Updating…"
      onSubmit={submit}
      contentClassName="grid gap-4 sm:grid-cols-2"
    >
      <div className="grid gap-2">
        <Label htmlFor="current-password">Current password</Label>
        <Input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="new-password">New password</Label>
        <Input id="new-password" name="newPassword" type="password" autoComplete="new-password" minLength={8} required />
      </div>
    </SettingsCard>
  );
}
