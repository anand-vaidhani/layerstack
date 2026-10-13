import type { Metadata } from "next";
import { requireOrgContext } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const ctx = await requireOrgContext();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Settings" description="Manage your organization profile and personal account." />
      <SettingsClient
        orgName={ctx.org.name}
        userName={ctx.user.name ?? ""}
        userEmail={ctx.user.email}
        canEditOrg={ctx.role !== "MEMBER"}
      />
    </div>
  );
}
