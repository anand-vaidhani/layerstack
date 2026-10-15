"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { clearSession, createSession, getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { consumeInvite, findInvite } from "@/lib/invites";
import { parseForm, type ActionResult } from "@/lib/result";
import { signInSchema, signUpSchema } from "@/lib/schemas";

export async function signInAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(signInSchema, formData);
  if (!parsed.ok) return { ok: false, code: "VALIDATION", error: parsed.error };

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.passwordHash || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return { ok: false, code: "AUTH", error: "Invalid email or password" };
  }

  await db.user.update({ where: { id: user.id }, data: { lastSignInAt: new Date() } });
  await createSession(user.id);
  return { ok: true, message: `Welcome back, ${user.name ?? user.email}` };
}

export async function signUpAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(signUpSchema, formData);
  if (!parsed.ok) return { ok: false, code: "VALIDATION", error: parsed.error };

  const { name, email, password, organizationName, inviteToken } = parsed.data;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { ok: false, code: "CONFLICT", error: "An account with this email already exists" };

  // Invite-mode signup: no personal workspace is created — the account is made
  // to join the inviting organization instead. Validate before creating anything.
  const invite = inviteToken ? await findInvite(inviteToken) : null;
  if (inviteToken && !invite) {
    return { ok: false, code: "NOT_FOUND", error: "This invitation link is not valid" };
  }
  if (invite && invite.expiresAt <= new Date()) {
    return { ok: false, code: "NOT_FOUND", error: "This invitation has expired. Ask for a new invite link." };
  }
  if (invite && invite.email.toLowerCase() !== email.toLowerCase()) {
    return {
      ok: false,
      code: "FORBIDDEN",
      error: `This invitation was sent to ${invite.email}. Use that email to create your account.`,
    };
  }

  const slugBase =
    organizationName?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "org";
  const slug = `${slugBase}-${Math.random().toString(36).slice(2, 7)}`;

  const user = invite
    ? await db.user.create({
        data: {
          name,
          email,
          passwordHash: hashPassword(password),
          lastSignInAt: new Date(),
        },
      })
    : await db.user.create({
        data: {
          name,
          email,
          passwordHash: hashPassword(password),
          lastSignInAt: new Date(),
          organizations: {
            create: {
              role: "OWNER",
              organization: {
                create: {
                  name: organizationName!,
                  slug,
                  plan: "FREE",
                  activities: {
                    create: { type: "MEMBER_JOINED", message: `${name} created ${organizationName}` },
                  },
                },
              },
            },
          },
        },
      });

  await createSession(user.id);

  if (invite) {
    const consumed = await consumeInvite(invite, user);
    if (!consumed.ok) {
      return {
        ok: false,
        code: "PLAN_LIMIT",
        limit: "members",
        error: `Your account was created and you are signed in, but ${invite.organization.name} is at its member limit. ${consumed.error} Ask the owner to upgrade, then reopen your invite link.`,
      };
    }
    return { ok: true, message: `Welcome, ${name} — you've joined ${invite.organization.name}` };
  }

  return { ok: true, message: `Workspace ${organizationName} is ready` };
}

export async function signOutAction(): Promise<ActionResult> {
  await clearSession();
  return { ok: true, message: "Signed out" };
}

export async function switchOrgAction(organizationId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, code: "AUTH", error: "Not signed in" };

  const membership = await db.organizationUser.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId } },
  });
  if (!membership) return { ok: false, code: "FORBIDDEN", error: "You are not a member of that organization" };

  const jar = await cookies();
  jar.set("layerstack_org", organizationId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Switched organization" };
}
