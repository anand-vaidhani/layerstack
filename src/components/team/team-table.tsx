import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InviteTableRow } from "./invite-table-row";
import { MemberTableRow } from "./member-table-row";
import type { Role } from "@/generated/prisma/client";
import type { TeamRow } from "./types";

type TeamTableProps = {
  rows: TeamRow[];
  viewerRole: Role;
  pending: boolean;
  canInvite: boolean;
  onRoleChange: (row: Extract<TeamRow, { kind: "member" }>, role: Role) => void;
  onRemove: (row: Extract<TeamRow, { kind: "member" }>) => void;
  onCopyLink: (token: string) => void;
  onRevoke: (inviteId: string) => void;
};

export function TeamTable({ rows, viewerRole, pending, canInvite, onRoleChange, onRemove, onCopyLink, onRevoke }: TeamTableProps) {
  return (
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
          {rows.map((row) =>
            row.kind === "invite" ? (
              <InviteTableRow key={row.id} row={row} pending={pending} canInvite={canInvite} onCopyLink={onCopyLink} onRevoke={onRevoke} />
            ) : (
              <MemberTableRow
                key={row.id}
                row={row}
                viewerRole={viewerRole}
                pending={pending}
                canInvite={canInvite}
                onRoleChange={onRoleChange}
                onRemove={onRemove}
              />
            ),
          )}
        </TableBody>
      </Table>
    </div>
  );
}
