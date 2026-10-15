import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { canAddMember, PLANS } from "@/lib/plans";
import type { User } from "@/generated/prisma/client";

/** Must match the cookie name used in lib/auth.ts and switchOrgAction. */
export const ACTIVE_ORG_COOKIE = "layerstack_org";

export async function findInvite(token: string) {
  return db.invitation.findUnique({ where: { token }, include: { organization: true } });
}

export type Invite = NonNullable<Awaited<ReturnType<typeof findInvite>>>;

/**
 * Turns a signed-in (or just-created) user into a member of the inviting
 * organization: enforces the plan seat limit, creates the membership, logs
 * MEMBER_JOINED, consumes the invitation and switches the active-org cookie.
 */
export async function consumeInvite(
  invite: Invite,
  user: User,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const existing = await db.organizationUser.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId: invite.organizationId } },
  });
  if (!existing) {
    const [members, pending] = [
      await db.organizationUser.count({ where: { organizationId: invite.organizationId } }),
      // Exclude this invite itself: it is about to be consumed, so counting it
      // would make an org at (limit - 1) members with one pending invite block
      // the very accept it should allow.
      await db.invitation.count({
        where: {
          organizationId: invite.organizationId,
          id: { not: invite.id },
          expiresAt: { gt: new Date() },
        },
      }),
    ];
    if (!canAddMember(invite.organization.plan, members + pending)) {
      return {
        ok: false,
        error: `The ${PLANS[invite.organization.plan].label} plan is limited to ${PLANS[invite.organization.plan].maxMembers} team members.`,
      };
    }
    await db.organizationUser.create({
      data: { userId: user.id, organizationId: invite.organizationId, role: invite.role },
    });
    await logActivity({
      organizationId: invite.organizationId,
      actorId: user.id,
      type: "MEMBER_JOINED",
      message: `${user.name ?? user.email} joined ${invite.organization.name}`,
    });
  }

  await db.invitation.delete({ where: { id: invite.id } });

  const jar = await cookies();
  jar.set(ACTIVE_ORG_COOKIE, invite.organizationId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return { ok: true };
}

/** Serializable invite summary for auth pages/forms driven by a `?next=/invite/...` param. */
export type InviteInfo = {
  token: string;
  orgName: string;
  role: string;
  email: string;
};

export async function inviteForNextPath(nextPath: string | null): Promise<InviteInfo | null> {
  if (!nextPath) return null;
  const token = nextPath.slice("/invite/".length);
  const invite = await findInvite(token);
  if (!invite || invite.expiresAt <= new Date()) return null;
  return { token, orgName: invite.organization.name, role: invite.role, email: invite.email };
}
