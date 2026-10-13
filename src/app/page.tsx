import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Check,
  CreditCard,
  BarChart3,
  ShieldCheck,
  Users,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/plans";

const FEATURES = [
  {
    icon: Layers,
    title: "Multi-tenant workspaces",
    description:
      "Every project, member and setting belongs to an organization. Data is isolated per tenant with zero leakage between workspaces.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access control",
    description:
      "OWNER, ADMIN and MEMBER roles gate every action — in the UI and again at the server action layer.",
  },
  {
    icon: CreditCard,
    title: "Stripe billing built in",
    description:
      "Checkout, customer portal and webhooks. Upgrade from Free to Pro and manage the subscription end to end.",
  },
  {
    icon: BarChart3,
    title: "Plan limit enforcement",
    description:
      "Free plan limits (3 projects, 2 members) are enforced in the API. Hitting a limit opens a polished upgrade modal.",
  },
  {
    icon: BarChart3,
    title: "Live analytics dashboard",
    description:
      "KPI cards, an interactive Recharts timeline and a real-time activity feed for everything happening in your org.",
  },
  {
    icon: Users,
    title: "Team management",
    description:
      "Invite teammates by email, promote admins, change roles from a dropdown and revoke pending invitations.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.7_0.18_290/0.35),transparent)]">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
              <Boxes className="size-4.5" />
            </span>
            LayerStack
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" nativeButton={false} render={<Link href="/sign-in" />}>
              Sign in
            </Button>
            <Button nativeButton={false} render={<Link href="/sign-up" />}>
              Get started
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 pb-24 pt-16 text-center sm:px-6 sm:pt-24">
          <Badge variant="outline" className="mb-5 gap-1.5 px-3 py-1">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Now with Stripe Checkout &amp; webhooks
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            The workspace your B2B team actually grows into
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-muted-foreground">
            Multi-tenant organizations, role-based permissions, plan gating and billing — a production-grade SaaS
            dashboard built with Next.js, Prisma and Stripe.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/sign-up" />}>
              Start free
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/sign-in" />}>
              Sign in to demo
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Demo login: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">ava@acme.test</code> ·{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">password123</code>
          </p>

          {/* Product preview */}
          <div className="relative mx-auto mt-14 max-w-4xl">
            <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-violet-500/10">
              <div className="flex items-center gap-1.5 border-b bg-muted/50 px-4 py-2.5">
                <span className="size-2.5 rounded-full bg-red-400" />
                <span className="size-2.5 rounded-full bg-amber-400" />
                <span className="size-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 rounded-md bg-background px-2 py-0.5 text-xs text-muted-foreground">
                  app.layerstack.dev/dashboard
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4 p-5 text-left sm:grid-cols-4">
                {[
                  { label: "Projects", value: "12" },
                  { label: "Active", value: "8" },
                  { label: "Members", value: "6" },
                  { label: "Plan", value: "Pro" },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-lg border bg-background p-3">
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="mt-1 text-xl font-semibold tabular-nums">{kpi.value}</p>
                  </div>
                ))}
                <div className="col-span-4 rounded-lg border bg-background p-4 sm:col-span-4">
                  <div className="flex h-28 items-end gap-1.5">
                    {[35, 55, 30, 70, 45, 85, 60, 95, 50, 75, 40, 90, 65, 80].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className="flex-1 rounded-sm bg-gradient-to-t from-violet-500/70 to-indigo-400/90"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t bg-background/60 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight">Everything a SaaS needs, nothing it doesn&apos;t</h2>
              <p className="mt-3 text-muted-foreground">
                From tenancy to billing, the hard parts of a B2B product are already wired up.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border bg-card p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 transition-colors group-hover:bg-violet-500 group-hover:text-white dark:text-violet-400">
                    <feature.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight">Simple, transparent pricing</h2>
              <p className="mt-3 text-muted-foreground">Start free. Upgrade when your team outgrows it.</p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {(Object.keys(PLANS) as (keyof typeof PLANS)[]).map((key) => {
                const plan = PLANS[key];
                const highlighted = plan.key === "PRO";
                return (
                  <div
                    key={plan.key}
                    className={
                      highlighted
                        ? "relative rounded-2xl border-2 border-violet-500 bg-card p-7 shadow-xl shadow-violet-500/10"
                        : "rounded-2xl border bg-card p-7 shadow-xs"
                    }
                  >
                    {highlighted ? (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white">
                        Most popular
                      </Badge>
                    ) : null}
                    <h3 className="font-semibold">{plan.label}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>
                    <p className="mt-5 text-4xl font-semibold tracking-tight">
                      {plan.priceMonthly === null ? "Custom" : plan.priceMonthly === 0 ? "$0" : `$${plan.priceMonthly}`}
                      {plan.priceMonthly !== null ? (
                        <span className="text-base font-normal text-muted-foreground">/mo</span>
                      ) : null}
                    </p>
                    <ul className="mt-6 grid gap-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                            <Check className="size-2.5 text-emerald-600 dark:text-emerald-400" />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-7 w-full"
                      variant={highlighted ? "default" : "outline"}
                      nativeButton={false}
                      render={<Link href="/sign-up" />}
                    >
                      {plan.key === "FREE" ? "Start free" : plan.key === "PRO" ? "Upgrade to Pro" : "Contact sales"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight">Ready to build on solid ground?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Spin up your workspace in under a minute. No credit card required on the Free plan.
            </p>
            <Button size="lg" className="mt-7" nativeButton={false} render={<Link href="/sign-up" />}>
              Create your workspace
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Boxes className="size-4" />
            <span>LayerStack — B2B SaaS dashboard demo</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="hover:text-foreground">
              Pricing
            </a>
            <Link href="/sign-in" className="hover:text-foreground">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
