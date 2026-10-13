"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrgContext } from "@/lib/auth";
import { parseForm, type ActionResult } from "@/lib/result";
import { createProjectSchema } from "@/lib/schemas";
import { canCreateProject, PLANS } from "@/lib/plans";
import { logActivity } from "@/lib/activity";

export async function createProjectAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireOrgContext();
  const parsed = parseForm(createProjectSchema, formData);
  if (!parsed.ok) return { ok: false, code: "VALIDATION", error: parsed.error };

  const count = await db.project.count({ where: { organizationId: ctx.org.id } });
  if (!canCreateProject(ctx.org.plan, count)) {
    return {
      ok: false,
      code: "PLAN_LIMIT",
      limit: "projects",
      error: `The ${PLANS[ctx.org.plan].label} plan is limited to ${PLANS[ctx.org.plan].maxProjects} projects. Upgrade to Pro for unlimited projects.`,
    };
  }

  const project = await db.project.create({
    data: {
      title: parsed.data.title,
      status: parsed.data.status,
      organizationId: ctx.org.id,
    },
  });

  await logActivity({
    organizationId: ctx.org.id,
    actorId: ctx.user.id,
    type: "PROJECT_CREATED",
    message: `${ctx.user.name ?? ctx.user.email} created project “${project.title}”`,
  });

  revalidatePath("/dashboard", "layout");
  return { ok: true, message: `Project “${project.title}” created`, data: { id: project.id } };
}

export async function updateProjectStatusAction(projectId: string, status: string): Promise<ActionResult> {
  const ctx = await requireOrgContext();
  if (ctx.role === "MEMBER") {
    return { ok: false, code: "FORBIDDEN", error: "Only owners and admins can change project status" };
  }

  const project = await db.project.findFirst({ where: { id: projectId, organizationId: ctx.org.id } });
  if (!project) return { ok: false, code: "NOT_FOUND", error: "Project not found" };
  if (!["Active", "Paused", "Completed"].includes(status)) {
    return { ok: false, code: "VALIDATION", error: "Invalid status" };
  }

  await db.project.update({ where: { id: project.id }, data: { status } });
  await logActivity({
    organizationId: ctx.org.id,
    actorId: ctx.user.id,
    type: "PROJECT_STATUS_CHANGED",
    message: `${ctx.user.name ?? ctx.user.email} marked “${project.title}” as ${status}`,
  });

  revalidatePath("/dashboard", "layout");
  return { ok: true, message: `“${project.title}” is now ${status}` };
}

export async function deleteProjectAction(projectId: string): Promise<ActionResult> {
  const ctx = await requireOrgContext();
  if (ctx.role === "MEMBER") {
    return { ok: false, code: "FORBIDDEN", error: "Only owners and admins can delete projects" };
  }

  const project = await db.project.findFirst({ where: { id: projectId, organizationId: ctx.org.id } });
  if (!project) return { ok: false, code: "NOT_FOUND", error: "Project not found" };

  await db.project.delete({ where: { id: project.id } });
  await logActivity({
    organizationId: ctx.org.id,
    actorId: ctx.user.id,
    type: "PROJECT_DELETED",
    message: `${ctx.user.name ?? ctx.user.email} deleted project “${project.title}”`,
  });

  revalidatePath("/dashboard", "layout");
  return { ok: true, message: `Project “${project.title}” deleted` };
}
