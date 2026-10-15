"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, requireOrgContext, type SessionContext } from "@/lib/auth";
import { consumeInvite, findInvite } from "@/lib/invites";
import { parseForm, type ActionResult } from "@/lib/result";
import { changeRoleSchema, inviteMemberSchema, removeMemberSchema } from "@/lib/schemas";
import { canAddMember, PLANS } from "@/lib/plans";
import { logActivity } from "@/lib/activity";

const INVITE_TTL_DAYS = 7;

async function countMembers(ctx: SessionContext): Promise<number> {
  return db.organizationUser.count({ where: { organizationId: ctx.org.id } });
}

async function countPendingInvites(ctx: SessionContext): Promise<number> {
  return db.invitation.count({
    where: { organizationId: ctx.org.id, expiresAt: { gt: new Date() } },
  });
}

export async function inviteMemberAction(
  formData: FormData,
): Promise<ActionResult<{ email: string; token: string }>> {
  const ctx = await requireOrgContext();
  if (ctx.role === "MEMBER") {
    return { ok: false, code: "FORBIDDEN", error: "You need admin access to invite teammates" };
  }
  const parsed = parseForm(inviteMemberSchema, formData);
  if (!parsed.ok) return { ok: false, code: "VALIDATION", error: parsed.error };

  // Only owners may invite other admins
  if (parsed.data.role === "ADMIN" && ctx.role !== "OWNER") {
    return { ok: false, code: "FORBIDDEN", error: "Only owners can invite admins" };
  }

  const [members, pending] = [await countMembers(ctx), await countPendingInvites(ctx)];
  if (!canAddMember(ctx.org.plan, members + pending)) {
    return {
      ok: false,
      code: "PLAN_LIMIT",
      limit: "members",
      error: `The ${PLANS[ctx.org.plan].label} plan is limited to ${PLANS[ctx.org.plan].maxMembers} team members. Upgrade to Pro to invite more.`,
    };
  }

  const existingMember = await db.user.findUnique({
    where: { email: parsed.data.email },
    include: { organizations: { where: { organizationId: ctx.org.id } } },
  });
  if (existingMember?.organizations.length) {
    return { ok: false, code: "CONFLICT", error: "That person is already a member of this organization" };
  }
  const existingInvite = await db.invitation.findFirst({
    where: { organizationId: ctx.org.id, email: parsed.data.email, expiresAt: { gt: new Date() } },
  });
  if (existingInvite) {
    return { ok: false, code: "CONFLICT", error: "That person already has a pending invitation" };
  }

  const invitation = await db.invitation.create({
    data: {
      email: parsed.data.email,
      role: parsed.data.role,
      organizationId: ctx.org.id,
      invitedById: ctx.user.id,
      expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000),
    },
  });
  await logActivity({
    organizationId: ctx.org.id,
    actorId: ctx.user.id,
    type: "MEMBER_INVITED",
    message: `${ctx.user.name ?? ctx.user.email} invited ${parsed.data.email} as ${parsed.data.role}`,
  });

  revalidatePath("/dashboard", "layout");
  return {
    ok: true,
    message: `Invitation sent to ${parsed.data.email}`,
    data: { email: parsed.data.email, token: invitation.token },
  };
}

/**
 * Accepts a team invitation from its shareable link (`/invite/[token]`).
 * The signed-in account must match the invited email address; on success the
 * invitation is consumed, membership created and the active org switched.
 */
export async function acceptInviteAction(token: string): Promise<ActionResult> {
  const invite = await findInvite(token);
  if (!invite) {
    return { ok: false, code: "NOT_FOUND", error: "This invitation link is not valid" };
  }
  if (invite.expiresAt <= new Date()) {
    await db.invitation.delete({ where: { id: invite.id } });
    return {
      ok: false,
      code: "NOT_FOUND",
      error: "This invitation has expired. Ask an owner or admin to send a new one.",
    };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false, code: "AUTH", error: "Sign in to accept this invitation" };
  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return {
      ok: false,
      code: "FORBIDDEN",
      error: `This invitation was sent to ${invite.email}. Sign in with that account to accept it.`,
    };
  }

  const consumed = await consumeInvite(invite, user);
  if (!consumed.ok) {
    return {
      ok: false,
      code: "PLAN_LIMIT",
      limit: "members",
      error: `${consumed.error} Upgrade to Pro to accept this invitation.`,
    };
  }
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function changeRoleAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireOrgContext();
  const parsed = parseForm(changeRoleSchema, formData);
  if (!parsed.ok) return { ok: false, code: "VALIDATION", error: parsed.error };
  const { membershipId, role } = parsed.data;

  const target = await db.organizationUser.findFirst({
    where: { id: membershipId, organizationId: ctx.org.id },
  });
  if (!target) return { ok: false, code: "NOT_FOUND", error: "Member not found" };

  if (target.userId === ctx.user.id) {
    return { ok: false, code: "FORBIDDEN", error: "You cannot change your own role" };
  }
  if (ctx.role === "MEMBER") {
    return { ok: false, code: "FORBIDDEN", error: "Only owners and admins can change roles" };
  }
  if (ctx.role === "ADMIN" && (target.role !== "MEMBER" || role === "OWNER")) {
    return { ok: false, code: "FORBIDDEN", error: "Only owners can manage owners and admins" };
  }

  if (target.role === "OWNER" && role !== "OWNER") {
    const owners = await db.organizationUser.count({
      where: { organizationId: ctx.org.id, role: "OWNER" },
    });
    if (owners <= 1) {
      return { ok: false, code: "FORBIDDEN", error: "An organization must keep at least one owner" };
    }
  }

  await db.organizationUser.update({ where: { id: target.id }, data: { role } });
  const member = await db.user.findUnique({ where: { id: target.userId } });
  await logActivity({
    organizationId: ctx.org.id,
    actorId: ctx.user.id,
    type: "ROLE_CHANGED",
    message: `${ctx.user.name ?? ctx.user.email} changed ${member?.email ?? "a member"}’s role to ${role}`,
  });

  revalidatePath("/dashboard", "layout");
  return { ok: true, message: `Role updated to ${role}` };
}

export async function removeMemberAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireOrgContext();
  const parsed = parseForm(removeMemberSchema, formData);
  if (!parsed.ok) return { ok: false, code: "VALIDATION", error: parsed.error };

  const target = await db.organizationUser.findFirst({
    where: { id: parsed.data.membershipId, organizationId: ctx.org.id },
    include: { user: true },
  });
  if (!target) return { ok: false, code: "NOT_FOUND", error: "Member not found" };

  if (target.userId === ctx.user.id) {
    return { ok: false, code: "FORBIDDEN", error: "You cannot remove yourself from the organization" };
  }
  if (ctx.role === "MEMBER") {
    return { ok: false, code: "FORBIDDEN", error: "Only owners and admins can remove members" };
  }
  if (ctx.role === "ADMIN" && target.role !== "MEMBER") {
    return { ok: false, code: "FORBIDDEN", error: "Only owners can remove owners and admins" };
  }
  if (target.role === "OWNER") {
    const owners = await db.organizationUser.count({
      where: { organizationId: ctx.org.id, role: "OWNER" },
    });
    if (owners <= 1) {
      return { ok: false, code: "FORBIDDEN", error: "An organization must keep at least one owner" };
    }
  }

  await db.organizationUser.delete({ where: { id: target.id } });
  await logActivity({
    organizationId: ctx.org.id,
    actorId: ctx.user.id,
    type: "MEMBER_REMOVED",
    message: `${ctx.user.name ?? ctx.user.email} removed ${target.user.email}`,
  });

  revalidatePath("/dashboard", "layout");
  return { ok: true, message: `${target.user.email} removed` };
}

export async function revokeInviteAction(inviteId: string): Promise<ActionResult> {
  const ctx = await requireOrgContext();
  if (ctx.role === "MEMBER") {
    return { ok: false, code: "FORBIDDEN", error: "Only owners and admins can revoke invitations" };
  }

  const invite = await db.invitation.findFirst({ where: { id: inviteId, organizationId: ctx.org.id } });
  if (!invite) return { ok: false, code: "NOT_FOUND", error: "Invitation not found" };

  await db.invitation.delete({ where: { id: invite.id } });
  await logActivity({
    organizationId: ctx.org.id,
    actorId: ctx.user.id,
    type: "MEMBER_INVITE_REVOKED",
    message: `${ctx.user.name ?? ctx.user.email} revoked the invitation for ${invite.email}`,
  });

  revalidatePath("/dashboard", "layout");
  return { ok: true, message: `Invitation for ${invite.email} revoked` };
}
