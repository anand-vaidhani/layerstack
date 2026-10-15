import type { Metadata } from "next";
import { requireOrgContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/plans";
import { TeamClient, type TeamRow } from "@/components/team/team-client";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const ctx = await requireOrgContext();
  const [memberships, invitations] = await Promise.all([
    db.organizationUser.findMany({
      where: { organizationId: ctx.org.id },
      include: { user: true },
    }),
    db.invitation.findMany({
      where: { organizationId: ctx.org.id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const plan = PLANS[ctx.org.plan];

  const memberRows: TeamRow[] = memberships
    .sort((a, b) => {
      const order = { OWNER: 0, ADMIN: 1, MEMBER: 2 } as const;
      if (order[a.role] !== order[b.role]) return order[a.role] - order[b.role];
      return a.user.email.localeCompare(b.user.email);
    })
    .map((m) => ({
      kind: "member",
      id: m.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      isSelf: m.userId === ctx.user.id,
      lastSignInAt: m.user.lastSignInAt?.toISOString() ?? null,
    }));

  const inviteRows: TeamRow[] = invitations.map((i) => ({
    kind: "invite",
    id: i.id,
    email: i.email,
    role: i.role,
    token: i.token,
    expiresAt: i.expiresAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <TeamClient
        rows={[...memberRows, ...inviteRows]}
        viewerRole={ctx.role}
        memberCount={memberships.length}
        pendingCount={invitations.length}
        maxMembers={plan.maxMembers}
        planLabel={plan.label}
        canUpgrade={ctx.role === "OWNER"}
      />
    </div>
  );
}
