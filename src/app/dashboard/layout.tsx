import { requireOrgContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/plans";
import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import { OrgSwitcher, UserMenu, type OrgOption } from "@/components/layout/header";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const ctx = await requireOrgContext();
  const projectCount = await db.project.count({ where: { organizationId: ctx.org.id } });
  const plan = PLANS[ctx.org.plan];

  const memberships: OrgOption[] = ctx.memberships.map((m) => ({
    organizationId: m.organizationId,
    role: m.role,
    organization: {
      id: m.organization.id,
      name: m.organization.name,
      plan: m.organization.plan,
    },
  }));

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <Sidebar
        className="hidden lg:flex"
        orgName={ctx.org.name}
        plan={ctx.org.plan}
        role={ctx.role}
        projectsUsed={projectCount}
        projectsMax={plan.maxProjects}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <OrgSwitcher memberships={memberships} activeOrgId={ctx.org.id} />
            <span className="hidden truncate text-sm text-muted-foreground md:block">
              {ctx.role === "OWNER"
                ? "You own this workspace"
                : ctx.role === "ADMIN"
                  ? "You have admin access"
                  : "Member access"}
            </span>
          </div>
          <UserMenu name={ctx.user.name} email={ctx.user.email} role={ctx.role} />
        </header>
        <MobileNav />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
