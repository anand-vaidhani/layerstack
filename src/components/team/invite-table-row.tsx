import { Link as LinkIcon, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/shared/badges";
import { timeAgo } from "@/lib/format";
import type { InviteRow } from "./types";

type InviteTableRowProps = {
  row: InviteRow;
  pending: boolean;
  canInvite: boolean;
  onCopyLink: (token: string) => void;
  onRevoke: (inviteId: string) => void;
};

export function InviteTableRow({ row, pending, canInvite, onCopyLink, onRevoke }: InviteTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-muted text-muted-foreground">
              <UserPlus className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.email}</p>
            <p className="text-xs text-muted-foreground">Expires {timeAgo(new Date(row.expiresAt))}</p>
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
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            disabled={!canInvite}
            title="Copy the invitation link to share"
            onClick={() => onCopyLink(row.token)}
          >
            <LinkIcon />
            Copy link
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            disabled={pending || !canInvite}
            onClick={() => onRevoke(row.id)}
          >
            <X />
            Revoke
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
