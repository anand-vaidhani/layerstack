import type { Metadata } from "next";
import { requireOrgContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/plans";
import { ProjectsClient } from "@/components/projects/projects-client";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const ctx = await requireOrgContext();
  const projects = await db.project.findMany({
    where: { organizationId: ctx.org.id },
    orderBy: { createdAt: "desc" },
  });
  const plan = PLANS[ctx.org.plan];

  return (
    <div className="mx-auto max-w-7xl">
      <ProjectsClient
        projects={projects.map((p) => ({
          id: p.id,
          title: p.title,
          status: p.status,
          createdAt: p.createdAt.toISOString(),
        }))}
        canManage={ctx.role !== "MEMBER"}
        canUpgrade={ctx.role === "OWNER"}
        planLabel={plan.label}
        maxProjects={plan.maxProjects}
      />
    </div>
  );
}
