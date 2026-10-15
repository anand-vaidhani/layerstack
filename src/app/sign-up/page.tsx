import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Boxes } from "lucide-react";
import { getCurrentUser, userHasOrg } from "@/lib/auth";
import { inviteNext } from "@/lib/utils";
import { inviteForNextPath } from "@/lib/invites";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = { title: "Create account" };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = inviteNext(next);
  const [user, invite] = await Promise.all([getCurrentUser(), inviteForNextPath(nextPath)]);
  if (user) {
    if (nextPath) redirect(nextPath);
    // See sign-in page: zero-membership accounts go to /no-workspace, never /dashboard.
    redirect((await userHasOrg(user.id)) ? "/dashboard" : "/no-workspace");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2 text-lg font-semibold tracking-tight">
        <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
          <Boxes className="size-4.5" />
        </span>
        LayerStack
      </Link>
      <SignUpForm next={nextPath} invite={invite} />
    </div>
  );
}
