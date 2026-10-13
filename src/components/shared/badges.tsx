import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";
import type { Role, SubscriptionPlan } from "@/generated/prisma/client";

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  const styles: Record<Role, string> = {
    OWNER: "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    ADMIN: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
    MEMBER: "border-border bg-muted text-muted-foreground",
  };
  return (
    <Badge variant="outline" className={cn(styles[role], className)}>
      {role}
    </Badge>
  );
}

export function PlanBadge({ plan, className }: { plan: SubscriptionPlan; className?: string }) {
  const styles: Record<SubscriptionPlan, string> = {
    FREE: "border-border bg-muted text-muted-foreground",
    PRO: "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400",
    ENTERPRISE: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };
  return (
    <Badge variant="outline" className={cn(styles[plan], className)}>
      {plan === "FREE" ? "Free" : plan === "PRO" ? "Pro" : "Enterprise"}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    Paused: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    Completed: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  };
  return (
    <Badge variant="outline" className={cn(styles[status] ?? "border-border bg-muted text-muted-foreground", "font-medium")}>
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "Active" && "bg-emerald-500",
          status === "Paused" && "bg-amber-500",
          status === "Completed" && "bg-sky-500",
        )}
      />
      {status}
    </Badge>
  );
}

export function InfoCard({
  icon,
  label,
  value,
  hint,
  className,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 shadow-xs transition-colors hover:border-foreground/20",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
