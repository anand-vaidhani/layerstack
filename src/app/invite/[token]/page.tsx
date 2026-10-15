import type { Metadata } from "next";
import Link from "next/link";
import { Boxes } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { InviteCard } from "@/components/auth/invite-card";

export const metadata: Metadata = { title: "Join workspace" };

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [invite, user] = await Promise.all([
    db.invitation.findUnique({ where: { token }, include: { organization: true } }),
    getCurrentUser(),
  ]);
  const invitedBy = invite?.invitedById
    ? await db.user.findUnique({
        where: { id: invite.invitedById },
        select: { name: true, email: true },
      })
    : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2 text-lg font-semibold tracking-tight">
        <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
          <Boxes className="size-4.5" />
        </span>
        LayerStack
      </Link>
      <InviteCard
        token={token}
        valid={invite !== null && invite.expiresAt > new Date()}
        expired={invite !== null && invite.expiresAt <= new Date()}
        orgName={invite?.organization.name ?? null}
        role={invite?.role ?? null}
        invitedEmail={invite?.email ?? null}
        invitedByName={invitedBy?.name ?? invitedBy?.email ?? null}
        viewerEmail={user?.email ?? null}
      />
    </div>
  );
}
