"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronsUpDown, CreditCard, LogOut, UserRound } from "lucide-react";
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
import { signOutAction } from "@/lib/actions/auth";
import { handleActionResult } from "@/lib/toast";
import { initials } from "@/lib/format";
import type { Role } from "@/generated/prisma/client";

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
