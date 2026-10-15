import { Lock, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/shared/badges";
import { formatDate } from "@/lib/format";
import { STATUSES, hueFor } from "./constants";
import type { ProjectCardData } from "./types";

type ProjectCardProps = {
  project: ProjectCardData;
  canManage: boolean;
  pending: boolean;
  onStatusChange: (project: ProjectCardData, status: string) => void;
  onDelete: (project: ProjectCardData) => void;
};

export function ProjectCard({ project, canManage, pending, onStatusChange, onDelete }: ProjectCardProps) {
  const hue = hueFor(project.id);

  return (
    <Card className="group overflow-hidden shadow-xs transition-all hover:shadow-md">
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
              render={<Button variant="ghost" size="icon-sm" className="shrink-0" aria-label="Project actions" />}
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
                  onClick={() => onStatusChange(project, s)}
                >
                  {s}
                  {project.status === s ? <span className="ml-auto text-xs text-muted-foreground">current</span> : null}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" disabled={pending} onClick={() => onDelete(project)}>
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
}
