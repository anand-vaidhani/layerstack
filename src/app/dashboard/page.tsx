import Link from "next/link";
import { Activity, FolderKanban, Layers, Users } from "lucide-react";
import { requireOrgContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/plans";
import { shortDay, timeAgo } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { InfoCard, PlanBadge } from "@/components/shared/badges";
import { ProjectsChart, type ChartPoint } from "@/components/dashboard/projects-chart";
import { ActivityFeed, type ActivityItem } from "@/components/dashboard/activity-feed";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata = { title: "Overview" };

const WINDOW_DAYS = 30;

function buildChartPoints(projects: { createdAt: Date }[], activities: { createdAt: Date }[]): ChartPoint[] {
  const points: ChartPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const projectCounts = new Map<string, number>();
  for (const p of projects) {
    const key = p.createdAt.toISOString().slice(0, 10);
    projectCounts.set(key, (projectCounts.get(key) ?? 0) + 1);
  }
  const eventCounts = new Map<string, number>();
  for (const a of activities) {
    const key = a.createdAt.toISOString().slice(0, 10);
    eventCounts.set(key, (eventCounts.get(key) ?? 0) + 1);
  }

  for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    points.push({
      date: key,
      label: shortDay(d),
      projects: projectCounts.get(key) ?? 0,
      events: eventCounts.get(key) ?? 0,
    });
  }
  return points;
}

export default async function DashboardPage() {
  const ctx = await requireOrgContext();
  const orgId = ctx.org.id;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - WINDOW_DAYS);
  cutoff.setHours(0, 0, 0, 0);

  const [projects, recentActivities, memberCount, inviteCount] = await Promise.all([
    db.project.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: "asc" } }),
    db.activity.findMany({
      where: { organizationId: orgId },
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    db.organizationUser.count({ where: { organizationId: orgId } }),
    db.invitation.count({ where: { organizationId: orgId, expiresAt: { gt: new Date() } } }),
  ]);

  const plan = PLANS[ctx.org.plan];
  const windowProjects = projects.filter((p) => p.createdAt >= cutoff);
  const windowActivities = recentActivities.filter((a) => a.createdAt >= cutoff);
  const chartPoints = buildChartPoints(windowProjects, windowActivities);
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const createdThisMonth = windowProjects.length;

  const feedItems: ActivityItem[] = recentActivities.map((a) => ({
    id: a.id,
    type: a.type,
    message: a.message,
    createdAt: a.createdAt,
    actorName: a.actor?.name ?? null,
    actorEmail: a.actor?.email ?? null,
  }));

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={`${greeting}, ${ctx.user.name?.split(" ")[0] ?? ctx.user.email.split("@")[0]}`}
        description={`Here’s what’s happening in ${ctx.org.name} over the last ${WINDOW_DAYS} days.`}
        actions={
          <>
            <Button variant="outline" nativeButton={false} render={<Link href="/dashboard/team" />}>
              Invite teammate
            </Button>
            <Button nativeButton={false} render={<Link href="/dashboard/projects" />}>New project</Button>
          </>
        }
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          icon={<FolderKanban className="size-4" />}
          label="Total projects"
          value={projects.length}
          hint={`+${createdThisMonth} in the last ${WINDOW_DAYS} days`}
        />
        <InfoCard
          icon={<Layers className="size-4" />}
          label="Active projects"
          value={activeProjects}
          hint={
            projects.length > 0
              ? `${Math.round((activeProjects / projects.length) * 100)}% of portfolio is active`
              : "No projects yet"
          }
        />
        <InfoCard
          icon={<Users className="size-4" />}
          label="Team members"
          value={memberCount}
          hint={`${plan.maxMembers === null ? "Unlimited" : `${plan.maxMembers} max`} · ${inviteCount} pending invite${inviteCount === 1 ? "" : "s"}`}
        />
        <InfoCard
          icon={<Activity className="size-4" />}
          label="Activity (30d)"
          value={windowActivities.length}
          hint={
            recentActivities[0] ? (
              <>
                Last event {timeAgo(recentActivities[0].createdAt)}
              </>
            ) : (
              "No events yet"
            )
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ProjectsChart data={chartPoints} />
        </div>

        <Card className="shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Activity feed</CardTitle>
                <CardDescription>Latest events in this workspace</CardDescription>
              </div>
              <PlanBadge plan={ctx.org.plan} />
            </div>
          </CardHeader>
          <CardContent>
            {feedItems.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No activity yet"
                description="Actions like creating projects or inviting teammates will show up here."
              />
            ) : (
              <ActivityFeed items={feedItems} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
