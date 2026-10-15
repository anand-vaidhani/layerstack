"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ChevronsUpDown, Settings } from "lucide-react";
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
import { switchOrgAction } from "@/lib/actions/auth";
import { handleActionResult } from "@/lib/toast";
import { PlanBadge, RoleBadge } from "@/components/shared/badges";
import { initials } from "@/lib/format";
import type { Role, SubscriptionPlan } from "@/generated/prisma/client";

export type OrgOption = {
  organizationId: string;
  role: Role;
  organization: { id: string; name: string; plan: SubscriptionPlan };
};

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
