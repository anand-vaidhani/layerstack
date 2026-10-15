import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Boxes } from "lucide-react";
import { getCurrentUser, userHasOrg } from "@/lib/auth";
import { NoWorkspaceCard } from "@/components/auth/no-workspace-card";

export const metadata: Metadata = { title: "No workspace" };

export default async function NoWorkspacePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  // A signed-in user who does belong to a workspace should never sit here.
  if (await userHasOrg(user.id)) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2 text-lg font-semibold tracking-tight">
        <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
          <Boxes className="size-4.5" />
        </span>
        LayerStack
      </Link>
      <NoWorkspaceCard email={user.email} />
    </div>
  );
}
