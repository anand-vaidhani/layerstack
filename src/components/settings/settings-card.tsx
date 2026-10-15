"use client";

import type { ComponentType, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type SettingsCardProps = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  className?: string;
  /** Disables the submit button (e.g. missing permission) */
  disabled?: boolean;
  pending: boolean;
  submitLabel: string;
  pendingLabel: string;
  /** Receives the live <form> element after the browser's submit is prevented */
  onSubmit: (form: HTMLFormElement) => void;
  /** Classes for the form content grid (defaults to "grid gap-4") */
  contentClassName?: string;
  children: ReactNode;
};

/** Card chrome + form wrapper shared by the three settings cards. */
export function SettingsCard({
  icon: Icon,
  title,
  description,
  className,
  disabled = false,
  pending,
  submitLabel,
  pendingLabel,
  onSubmit,
  contentClassName = "grid gap-4",
  children,
}: SettingsCardProps) {
  return (
    <Card className={className ?? "shadow-xs"}>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-4.5 text-muted-foreground" />
          </span>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e.currentTarget);
        }}
      >
        <CardContent className={contentClassName}>{children}</CardContent>
        <CardFooter className="justify-end border-t pt-4">
          <Button type="submit" disabled={disabled || pending}>
            {pending ? pendingLabel : submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
