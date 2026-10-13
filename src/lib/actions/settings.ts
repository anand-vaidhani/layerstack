"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrgContext, hashPassword, verifyPassword } from "@/lib/auth";
import { parseForm, type ActionResult } from "@/lib/result";
import { changePasswordSchema, updateOrgSchema, updateProfileSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/activity";

export async function updateOrgAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireOrgContext();
  if (ctx.role === "MEMBER") {
    return { ok: false, code: "FORBIDDEN", error: "Only owners and admins can update organization settings" };
  }
  const parsed = parseForm(updateOrgSchema, formData);
  if (!parsed.ok) return { ok: false, code: "VALIDATION", error: parsed.error };

  await db.organization.update({ where: { id: ctx.org.id }, data: { name: parsed.data.name } });
  if (parsed.data.name !== ctx.org.name) {
    await logActivity({
      organizationId: ctx.org.id,
      actorId: ctx.user.id,
      type: "ORG_RENAMED",
      message: `${ctx.user.name ?? ctx.user.email} renamed the workspace to ${parsed.data.name}`,
    });
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Organization settings saved" };
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireOrgContext();
  const parsed = parseForm(updateProfileSchema, formData);
  if (!parsed.ok) return { ok: false, code: "VALIDATION", error: parsed.error };

  await db.user.update({ where: { id: ctx.user.id }, data: { name: parsed.data.name } });
  await logActivity({
    organizationId: ctx.org.id,
    actorId: ctx.user.id,
    type: "PROFILE_UPDATED",
    message: `${ctx.user.email} updated their profile`,
  });

  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Profile saved" };
}

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireOrgContext();
  const parsed = parseForm(changePasswordSchema, formData);
  if (!parsed.ok) return { ok: false, code: "VALIDATION", error: parsed.error };

  if (!ctx.user.passwordHash || !verifyPassword(parsed.data.currentPassword, ctx.user.passwordHash)) {
    return { ok: false, code: "AUTH", error: "Current password is incorrect" };
  }

  await db.user.update({
    where: { id: ctx.user.id },
    data: { passwordHash: hashPassword(parsed.data.newPassword) },
  });
  return { ok: true, message: "Password updated" };
}
