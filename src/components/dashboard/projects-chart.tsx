"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "cn";

export type ChartPoint = {
  /** ISO date (YYYY-MM-DD) */
  date: string;
  /** Display label */
  label: string;
  projects: number;
  events: number;
};

type Metric = "projects" | "events";
type Range = 7 | 30;

export function ProjectsChart({ data }: { data: ChartPoint[] }) {
  const [metric, setMetric] = useState<Metric>("projects");
  const [range, setRange] = useState<Range>(30);

  const visible = useMemo(() => data.slice(-range), [data, range]);
  const total = useMemo(() => visible.reduce((sum, point) => sum + point[metric], 0), [visible, metric]);

  return (
    <Card className="shadow-xs">
      <CardHeader className="flex-row items-start justify-between space-y-0 gap-4">
        <div>
          <CardTitle>Workspace activity</CardTitle>
          <CardDescription>
            {metric === "projects" ? "Projects created" : "Activity events"} in the last {range} days —{" "}
            <span className="font-medium text-foreground">{total}</span> total
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex rounded-lg border bg-muted/50 p-0.5">
            {(["projects", "events"] as Metric[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                  metric === m ? "bg-background shadow-xs" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border bg-muted/50 p-0.5">
            {([7, 30] as Range[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  range === r ? "bg-background shadow-xs" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visible} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="fillMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "4 4" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--popover)",
                  color: "var(--popover-foreground)",
                  fontSize: 12,
                  boxShadow: "0 4px 16px rgb(0 0 0 / 0.08)",
                }}
                labelStyle={{ color: "var(--muted-foreground)", marginBottom: 4 }}
                formatter={(value) => [Number(value), metric === "projects" ? "Projects" : "Events"]}
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#fillMetric)"
                animationDuration={400}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-right text-xs text-muted-foreground">
          <a
            href="https://recharts.org"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            Built with Recharts
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
