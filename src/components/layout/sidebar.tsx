"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  CreditCard,
  FolderKanban,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlanBadge } from "@/components/shared/badges";
import type { Role, SubscriptionPlan } from "@/generated/prisma/client";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Roles allowed to see this item */
  roles?: Role[];
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

type SidebarProps = {
  orgName: string;
  plan: SubscriptionPlan;
  role: Role;
  projectsUsed: number;
  projectsMax: number | null;
  className?: string;
};

export function Sidebar({ orgName, plan, role, projectsUsed, projectsMax, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
          <Boxes className="size-4.5" />
        </span>
        <span className="font-semibold tracking-tight">LayerStack</span>
      </div>

      <div className="border-b px-5 py-4">
        <p className="truncate text-sm font-medium">{orgName}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <PlanBadge plan={plan} />
          <span className="text-xs capitalize text-muted-foreground">{role.toLowerCase()}</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-xl bg-sidebar-accent/50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Projects used</span>
            <span className="tabular-nums text-muted-foreground">
              {projectsUsed}/{projectsMax === null ? "∞" : projectsMax}
            </span>
          </div>
          <Progress
            value={
              projectsMax === null ? 30 : Math.min(100, Math.round((projectsUsed / projectsMax) * 100))
            }
            className="mt-2 h-1.5"
          />
          {plan === "FREE" ? (
            <Button size="sm" className="mt-3 w-full" nativeButton={false} render={<Link href="/dashboard/billing" />}>
              Upgrade to Pro
            </Button>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              {plan === "PRO" ? "Pro plan — unlimited projects" : "Enterprise plan"}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

export function MobileNav({ items = NAV_ITEMS }: { items?: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b bg-background px-3 py-2 lg:hidden">
      {items.map((item) => {
        const active =
          item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/60",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
