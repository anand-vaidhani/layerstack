"use client";

import { Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOrgAction } from "@/lib/actions/settings";
import { SettingsCard } from "./settings-card";
import { useFormSubmit } from "./use-form-submit";

export function OrgSettingsCard({ orgName, canEditOrg }: { orgName: string; canEditOrg: boolean }) {
  const { pending, submit } = useFormSubmit(updateOrgAction);

  return (
    <SettingsCard
      icon={Building2}
      title="Organization"
      description="Workspace name shown to every member"
      disabled={!canEditOrg}
      pending={pending}
      submitLabel="Save changes"
      pendingLabel="Saving…"
      onSubmit={submit}
    >
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
    </SettingsCard>
  );
}
