"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ChevronsUpDown, CreditCard, LogOut, Settings, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOutAction, switchOrgAction } from "@/lib/actions/auth";
import { handleActionResult } from "@/lib/toast";
import { PlanBadge, RoleBadge } from "@/components/shared/badges";
import type { Role, SubscriptionPlan } from "@/generated/prisma/client";

export type OrgOption = {
  organizationId: string;
  role: Role;
  organization: { id: string; name: string; plan: SubscriptionPlan };
};

function initials(name: string | null, email: string): string {
  const source = name?.trim() || email;
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function OrgSwitcher({
  memberships,
  activeOrgId,
}: {
  memberships: OrgOption[];
  activeOrgId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const active = memberships.find((m) => m.organizationId === activeOrgId) ?? memberships[0];

  function switchTo(organizationId: string) {
    if (organizationId === activeOrgId) return;
    startTransition(async () => {
      const result = await switchOrgAction(organizationId);
      handleActionResult(result);
      if (result.ok) router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="max-w-[16rem] justify-between gap-2 font-medium"
            disabled={pending}
          />
        }
      >
        <span className="truncate">{active?.organization.name ?? "Organization"}</span>
        <span className="flex items-center gap-1.5">
          <PlanBadge plan={active?.organization.plan ?? "FREE"} />
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Organizations</DropdownMenuLabel>
        </DropdownMenuGroup>
        {memberships.map((m) => (
          <DropdownMenuItem
            key={m.organizationId}
            disabled={pending}
            onClick={() => switchTo(m.organizationId)}
            className="gap-3"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
              {initials(m.organization.name, m.organization.name)}
            </span>
            <span className="flex-1 truncate">{m.organization.name}</span>
            <RoleBadge role={m.role} />
            {m.organizationId === activeOrgId ? <Check className="size-4" /> : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
          <Settings className="size-4" />
          Workspace settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserMenu({
  name,
  email,
  role,
}: {
  name: string | null;
  email: string;
  role: Role;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      const result = await signOutAction();
      handleActionResult(result, { successMessage: "Signed out" });
      router.push("/sign-in");
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="gap-2 pl-1.5" />
        }
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-violet-600 text-xs font-semibold text-white">
            {initials(name, email)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden flex-col items-start leading-none sm:flex">
          <span className="text-sm font-medium">{name ?? email}</span>
          <span className="text-xs text-muted-foreground">{role.toLowerCase()}</span>
        </span>
        <ChevronsUpDown className="hidden size-3.5 text-muted-foreground sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <p className="truncate text-sm font-medium">{name ?? email}</p>
            <p className="truncate text-xs font-normal text-muted-foreground">{email}</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
          <UserRound className="size-4" />
          Account settings
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/billing" />}>
          <CreditCard className="size-4" />
          Billing
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={pending} onClick={handleSignOut}>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
