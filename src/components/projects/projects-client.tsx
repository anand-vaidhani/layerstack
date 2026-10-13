"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Lock, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { UpgradeDialog } from "@/components/shared/upgrade-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { createProjectAction, deleteProjectAction, updateProjectStatusAction } from "@/lib/actions/projects";
import { handleActionResult } from "@/lib/toast";
import { formatDate } from "@/lib/format";

export type ProjectCardData = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
};

const STATUSES = ["Active", "Paused", "Completed"] as const;

function hueFor(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 360;
  return hash;
}

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
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string>("Active");
  const [deleteTarget, setDeleteTarget] = useState<ProjectCardData | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const atLimit = maxProjects !== null && projects.length >= maxProjects;

  function openUpgrade(reason: string) {
    setUpgradeReason(reason);
    setUpgradeOpen(true);
  }

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
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
        formRef.current?.reset();
        setStatus("Active");
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

      {atLimit ? (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
              <Lock className="size-4 text-amber-600 dark:text-amber-400" />
            </span>
            <div>
              <p className="text-sm font-medium">You’ve reached the {planLabel} plan limit</p>
              <p className="text-sm text-muted-foreground">
                {maxProjects} of {maxProjects} projects used. Upgrade to Pro for unlimited projects.
              </p>
            </div>
          </div>
          <Button
            className="shrink-0 bg-violet-600 hover:bg-violet-700"
            onClick={() =>
              openUpgrade(`The ${planLabel} plan is limited to ${maxProjects} projects. You currently have ${projects.length}.`)
            }
          >
            Upgrade to Pro
          </Button>
        </div>
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
          {projects.map((project) => {
            const hue = hueFor(project.id);
            return (
              <Card key={project.id} className="group overflow-hidden shadow-xs transition-all hover:shadow-md">
                <div
                  className="h-1.5 w-full"
                  style={{ background: `linear-gradient(90deg, hsl(${hue} 70% 55%), hsl(${(hue + 60) % 360} 70% 60%))` }}
                />
                <CardHeader className="flex-row items-start justify-between space-y-0 gap-2">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
                      style={{ background: `hsl(${hue} 65% 45%)` }}
                    >
                      {project.title[0]?.toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">{project.title}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">Created {formatDate(new Date(project.createdAt))}</p>
                    </div>
                  </div>
                  {canManage ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" className="shrink-0" aria-label="Project actions" />
                        }
                      >
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Change status</DropdownMenuLabel>
                        </DropdownMenuGroup>
                        {STATUSES.map((s) => (
                          <DropdownMenuItem
                            key={s}
                            disabled={pending || project.status === s}
                            onClick={() => changeStatus(project, s)}
                          >
                            {s}
                            {project.status === s ? <span className="ml-auto text-xs text-muted-foreground">current</span> : null}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={pending}
                          onClick={() => setDeleteTarget(project)}
                        >
                          <Trash2 />
                          Delete project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger render={<span className="shrink-0 rounded-md p-1.5 text-muted-foreground/60" />}>
                        <Lock className="size-4" />
                      </TooltipTrigger>
                      <TooltipContent>Only owners and admins can manage projects</TooltipContent>
                    </Tooltip>
                  )}
                </CardHeader>
                <CardContent>
                  <StatusBadge status={project.status} />
                </CardContent>
                <CardFooter className="border-t bg-muted/30 px-5 py-2.5 text-xs text-muted-foreground">
                  ID · {project.id.slice(0, 8)}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create project dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>
              Create a project in this organization. Plan limits are enforced on save.
            </DialogDescription>
          </DialogHeader>
          <form ref={formRef} onSubmit={handleCreate} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="project-title">Title</Label>
              <Input id="project-title" name="title" placeholder="e.g. Q4 Marketing Site" autoFocus required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-status">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v ?? "Active")}
                items={STATUSES.map((s) => ({ label: s, value: s }))}
              >
                <SelectTrigger id="project-status" name="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="status" value={status} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Creating…" : "Create project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.title}” will be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              {pending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
