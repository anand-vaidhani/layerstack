import {
  ArrowUpDown,
  CreditCard,
  FolderKanban,
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
  UserRoundCog,
  type LucideIcon,
} from "lucide-react";
import { timeAgo } from "@/lib/format";

export type ActivityItem = {
  id: string;
  type: string;
  message: string;
  createdAt: Date;
  actorName: string | null;
  actorEmail: string | null;
};

const ICONS: Record<string, LucideIcon> = {
  PROJECT_CREATED: Plus,
  PROJECT_DELETED: Trash2,
  PROJECT_STATUS_CHANGED: ArrowUpDown,
  MEMBER_INVITED: UserPlus,
  MEMBER_INVITE_REVOKED: UserMinus,
  MEMBER_JOINED: UserPlus,
  MEMBER_REMOVED: UserMinus,
  ROLE_CHANGED: UserRoundCog,
  PLAN_UPGRADED: CreditCard,
  PLAN_DOWNGRADED: CreditCard,
  ORG_RENAMED: FolderKanban,
  PROFILE_UPDATED: UserRoundCog,
};

const TINTS: Record<string, string> = {
  PROJECT_CREATED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  PROJECT_DELETED: "bg-red-500/10 text-red-600 dark:text-red-400",
  PROJECT_STATUS_CHANGED: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  PLAN_UPGRADED: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  PLAN_DOWNGRADED: "bg-muted text-muted-foreground",
  ROLE_CHANGED: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <p className="px-1 py-8 text-center text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <ol className="relative space-y-5 pl-1">
      {items.map((item) => {
        const Icon = ICONS[item.type] ?? FolderKanban;
        const tint = TINTS[item.type] ?? "bg-muted text-muted-foreground";
        return (
          <li key={item.id} className="relative flex gap-3">
            <span
              className={`z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${tint}`}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm leading-snug break-words">{item.message}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {timeAgo(item.createdAt)}
                {item.actorEmail ? ` · ${item.actorEmail}` : ""}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
