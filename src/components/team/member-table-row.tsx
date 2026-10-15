import { UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/shared/badges";
import { initials, timeAgo } from "@/lib/format";
import { allowedRoles, canEditRole } from "./permissions";
import type { Role } from "@/generated/prisma/client";
import type { MemberRow } from "./types";

type MemberTableRowProps = {
  row: MemberRow;
  viewerRole: Role;
  pending: boolean;
  canInvite: boolean;
  onRoleChange: (row: MemberRow, role: Role) => void;
  onRemove: (row: MemberRow) => void;
};

export function MemberTableRow({ row, viewerRole, pending, canInvite, onRoleChange, onRemove }: MemberTableRowProps) {
  const editable = canEditRole(viewerRole, row);
  const roles = allowedRoles(viewerRole);

  return (
    <TableRow>
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
        {editable ? (
          <Select
            value={row.role}
            onValueChange={(v) => {
              if (v) onRoleChange(row, v as Role);
            }}
            items={roles.map((r) => ({ label: r, value: r }))}
            disabled={pending}
          >
            <SelectTrigger size="sm" className="w-28" aria-label={`Change role for ${row.email}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
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
          onClick={() => onRemove(row)}
        >
          <UserMinus />
          Remove
        </Button>
      </TableCell>
    </TableRow>
  );
}
