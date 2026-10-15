"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MailPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UpgradeDialog } from "@/components/shared/upgrade-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { changeRoleAction, inviteMemberAction, removeMemberAction, revokeInviteAction } from "@/lib/actions/team";
import { handleActionResult } from "@/lib/toast";
import { canInvite } from "./permissions";
import { InviteDialog } from "./invite-dialog";
import { RemoveMemberDialog } from "./remove-member-dialog";
import { SeatLimitBanner } from "./seat-limit-banner";
import { TeamTable } from "./team-table";
import type { Role } from "@/generated/prisma/client";
import type { MemberRow, TeamRow } from "./types";

export type { TeamRow } from "./types";

type TeamClientProps = {
  rows: TeamRow[];
  viewerRole: Role;
  memberCount: number;
  pendingCount: number;
  maxMembers: number | null;
  planLabel: string;
  canUpgrade: boolean;
};

export function TeamClient({
  rows,
  viewerRole,
  memberCount,
  pendingCount,
  maxMembers,
  planLabel,
  canUpgrade,
}: TeamClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteFormKey, setInviteFormKey] = useState(0);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>(undefined);
  const [removeTarget, setRemoveTarget] = useState<{ id: string; email: string } | null>(null);

  const inviteAllowed = canInvite(viewerRole);
  const atLimit = maxMembers !== null && memberCount + pendingCount >= maxMembers;

  function openUpgrade(reason: string) {
    setUpgradeReason(reason);
    setUpgradeOpen(true);
  }

  function handleInvite(formData: FormData) {
    startTransition(async () => {
      const result = await inviteMemberAction(formData);
      handleActionResult(result, {
        onPlanLimit: (message) => {
          setInviteOpen(false);
          openUpgrade(message);
        },
      });
      if (result.ok) {
        setInviteOpen(false);
        // Remount the form so email + role start fresh (cancel keeps input).
        setInviteFormKey((key) => key + 1);
        router.refresh();
      }
    });
  }

  function changeRole(row: MemberRow, role: Role) {
    const formData = new FormData();
    formData.set("membershipId", row.id);
    formData.set("role", role);
    startTransition(async () => {
      const result = await changeRoleAction(formData);
      handleActionResult(result, { onPlanLimit: openUpgrade });
      if (result.ok) router.refresh();
    });
  }

  function confirmRemove() {
    if (!removeTarget) return;
    const formData = new FormData();
    formData.set("membershipId", removeTarget.id);
    startTransition(async () => {
      const result = await removeMemberAction(formData);
      handleActionResult(result, { onPlanLimit: openUpgrade });
      setRemoveTarget(null);
      if (result.ok) router.refresh();
    });
  }

  function revoke(inviteId: string) {
    startTransition(async () => {
      const result = await revokeInviteAction(inviteId);
      handleActionResult(result, { onPlanLimit: openUpgrade });
      if (result.ok) router.refresh();
    });
  }

  /** No email delivery in this app — the invite link is the delivery mechanism. */
  function copyInviteLink(token: string) {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Invite link copied", { description: url }))
      .catch(() => toast.error("Could not copy — " + url));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description={`${memberCount} member${memberCount === 1 ? "" : "s"} · ${pendingCount} pending invite${pendingCount === 1 ? "" : "s"} · ${planLabel} plan limit ${maxMembers === null ? "unlimited" : maxMembers}`}
        actions={
          <Button
            onClick={() => setInviteOpen(true)}
            disabled={pending || !inviteAllowed}
            title={inviteAllowed ? undefined : "Only owners and admins can invite teammates"}
            variant={inviteAllowed ? "default" : "outline"}
          >
            <MailPlus />
            Invite member
          </Button>
        }
      />

      {atLimit ? (
        <SeatLimitBanner memberCount={memberCount} pendingCount={pendingCount} maxMembers={maxMembers} planLabel={planLabel} />
      ) : null}

      <TeamTable
        rows={rows}
        viewerRole={viewerRole}
        pending={pending}
        canInvite={inviteAllowed}
        onRoleChange={changeRole}
        onRemove={(row) => setRemoveTarget({ id: row.id, email: row.email })}
        onCopyLink={copyInviteLink}
        onRevoke={revoke}
      />

      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        pending={pending}
        formKey={inviteFormKey}
        onSubmit={handleInvite}
      />

      <RemoveMemberDialog
        target={removeTarget}
        pending={pending}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        onConfirm={confirmRemove}
      />

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} reason={upgradeReason} canUpgrade={canUpgrade} />
    </div>
  );
}
