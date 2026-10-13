"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MailPlus, UserMinus, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/shared/badges";
import { UpgradeDialog } from "@/components/shared/upgrade-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { changeRoleAction, inviteMemberAction, removeMemberAction, revokeInviteAction } from "@/lib/actions/team";
import { handleActionResult } from "@/lib/toast";
import { timeAgo } from "@/lib/format";
import type { Role } from "@/generated/prisma/client";

export type TeamRow =
  | {
      kind: "member";
      id: string;
      name: string | null;
      email: string;
      role: Role;
      isSelf: boolean;
      lastSignInAt: string | null;
    }
  | {
      kind: "invite";
      id: string;
      email: string;
      role: Role;
      expiresAt: string;
    };

function initials(name: string | null, email: string): string {
  const source = name?.trim() || email;
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

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
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>(undefined);
  const [removeTarget, setRemoveTarget] = useState<{ id: string; email: string } | null>(null);
  const inviteFormRef = useRef<HTMLFormElement>(null);

  const canInvite = viewerRole !== "MEMBER";
  const atLimit = maxMembers !== null && memberCount + pendingCount >= maxMembers;

  function openUpgrade(reason: string) {
    setUpgradeReason(reason);
    setUpgradeOpen(true);
  }

  function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("role", inviteRole);
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
        inviteFormRef.current?.reset();
        setInviteRole("MEMBER");
        router.refresh();
      }
    });
  }

  /** OWNER can edit anyone but themselves; ADMIN can edit MEMBER rows only. */
  function canEditRole(row: TeamRow): boolean {
    if (row.kind !== "member" || row.isSelf) return false;
    if (viewerRole === "OWNER") return true;
    if (viewerRole === "ADMIN") return row.role === "MEMBER";
    return false;
  }

  function allowedRoles(row: TeamRow): Role[] {
    if (viewerRole === "OWNER") return ["OWNER", "ADMIN", "MEMBER"];
    // Admins can manage members but never grant/keep owner
    void row;
    return ["ADMIN", "MEMBER"];
  }

  function changeRole(row: TeamRow, role: Role) {
    if (row.kind !== "member") return;
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description={`${memberCount} member${memberCount === 1 ? "" : "s"} · ${pendingCount} pending invite${pendingCount === 1 ? "" : "s"} · ${planLabel} plan limit ${maxMembers === null ? "unlimited" : maxMembers}`}
        actions={
          <Button
            onClick={() => setInviteOpen(true)}
            disabled={pending || !canInvite}
            title={canInvite ? undefined : "Only owners and admins can invite teammates"}
            variant={canInvite ? "default" : "outline"}
          >
            <MailPlus />
            Invite member
          </Button>
        }
      />

      {atLimit ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <p className="font-medium">Member limit reached</p>
          <p className="text-muted-foreground">
            {memberCount + pendingCount} of {maxMembers} seats used on the {planLabel} plan. Upgrade to Pro for 10 seats.
          </p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Last sign-in</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              if (row.kind === "invite") {
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            <UserPlus className="size-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{row.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Expires {timeAgo(new Date(row.expiresAt))}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={row.role} />
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <span className="size-1.5 rounded-full bg-amber-500" />
                        Pending
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">—</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        disabled={pending || !canInvite}
                        onClick={() => revoke(row.id)}
                      >
                        <X />
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }

              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-violet-600/10 text-xs font-semibold text-violet-600 dark:text-violet-400">
                          {initials(row.name, row.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {row.name ?? row.email}
                          {row.isSelf ? <span className="ml-1.5 text-xs text-muted-foreground">(you)</span> : null}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{row.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {canEditRole(row) ? (
                      <Select
                        value={row.role}
                        onValueChange={(v) => {
                          if (v) changeRole(row, v as Role);
                        }}
                        items={allowedRoles(row).map((r) => ({ label: r, value: r }))}
                        disabled={pending}
                      >
                        <SelectTrigger size="sm" className="w-28" aria-label={`Change role for ${row.email}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedRoles(row).map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <RoleBadge role={row.role} />
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {row.lastSignInAt ? timeAgo(new Date(row.lastSignInAt)) : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={pending || !canInvite || row.isSelf}
                      title={
                        row.isSelf
                          ? "You cannot remove yourself"
                          : canInvite
                            ? undefined
                            : "Only owners and admins can remove members"
                      }
                      onClick={() => setRemoveTarget({ id: row.id, email: row.email })}
                    >
                      <UserMinus />
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite teammate</DialogTitle>
            <DialogDescription>
              Send an invitation to join this workspace. Seats count against your plan limit.
            </DialogDescription>
          </DialogHeader>
          <form ref={inviteFormRef} onSubmit={handleInvite} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                name="email"
                type="email"
                placeholder="teammate@company.com"
                autoFocus
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(v) => {
                  if (v) setInviteRole(v as "ADMIN" | "MEMBER");
                }}
                items={[
                  { label: "MEMBER", value: "MEMBER" },
                  { label: "ADMIN", value: "ADMIN" },
                ]}
              >
                <SelectTrigger id="invite-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">MEMBER — can view and create projects</SelectItem>
                  <SelectItem value="ADMIN">ADMIN — can manage team and projects</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="role" value={inviteRole} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Sending…" : "Send invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <AlertDialog open={removeTarget !== null} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget?.email} will lose access to this organization immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmRemove}
            >
              {pending ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} reason={upgradeReason} canUpgrade={canUpgrade} />
    </div>
  );
}
