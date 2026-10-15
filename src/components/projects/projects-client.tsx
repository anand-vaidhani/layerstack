"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { UpgradeDialog } from "@/components/shared/upgrade-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { createProjectAction, deleteProjectAction, updateProjectStatusAction } from "@/lib/actions/projects";
import { handleActionResult } from "@/lib/toast";
import { CreateProjectDialog } from "./create-project-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { PlanLimitBanner } from "./plan-limit-banner";
import { ProjectCard } from "./project-card";
import type { ProjectCardData } from "./types";

export type { ProjectCardData } from "./types";

type ProjectsClientProps = {
  projects: ProjectCardData[];
  canManage: boolean;
  canUpgrade: boolean;
  planLabel: string;
  maxProjects: number | null;
};

export function ProjectsClient({ projects, canManage, canUpgrade, planLabel, maxProjects }: ProjectsClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [createFormKey, setCreateFormKey] = useState(0);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<ProjectCardData | null>(null);

  const atLimit = maxProjects !== null && projects.length >= maxProjects;

  function openUpgrade(reason: string) {
    setUpgradeReason(reason);
    setUpgradeOpen(true);
  }

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createProjectAction(formData);
      handleActionResult(result, {
        onPlanLimit: (message) => {
          setCreateOpen(false);
          openUpgrade(message);
        },
      });
      if (result.ok) {
        setCreateOpen(false);
        // Remount the form so title + status start fresh (cancel keeps input).
        setCreateFormKey((key) => key + 1);
        router.refresh();
      }
    });
  }

  function changeStatus(project: ProjectCardData, nextStatus: string) {
    startTransition(async () => {
      const result = await updateProjectStatusAction(project.id, nextStatus);
      handleActionResult(result, { onPlanLimit: openUpgrade });
      if (result.ok) router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startTransition(async () => {
      const result = await deleteProjectAction(target.id);
      handleActionResult(result, { onPlanLimit: openUpgrade });
      setDeleteTarget(null);
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description={`${projects.length} of ${maxProjects === null ? "unlimited" : maxProjects} used on the ${planLabel} plan`}
        actions={
          <Button onClick={() => setCreateOpen(true)} disabled={pending}>
            <Plus />
            New project
          </Button>
        }
      />

      {atLimit && maxProjects !== null ? (
        <PlanLimitBanner
          planLabel={planLabel}
          maxProjects={maxProjects}
          onUpgrade={() =>
            openUpgrade(`The ${planLabel} plan is limited to ${maxProjects} projects. You currently have ${projects.length}.`)
          }
        />
      ) : null}

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description={
            canManage
              ? "Create your first project to start tracking work for this organization."
              : "Projects created by owners and admins will appear here."
          }
          action={
            canManage ? (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus />
                New project
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              canManage={canManage}
              pending={pending}
              onStatusChange={changeStatus}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        pending={pending}
        formKey={createFormKey}
        onSubmit={handleCreate}
      />

      <DeleteProjectDialog
        target={deleteTarget}
        pending={pending}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      {/* Upgrade modal (shown on plan-limit errors) */}
      <UpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        reason={upgradeReason}
        canUpgrade={canUpgrade}
      />
    </div>
  );
}
