import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type InviteCardShellProps = {
  title: ReactNode;
  description: ReactNode;
  content?: ReactNode;
  contentClassName?: string;
  footer?: ReactNode;
  footerClassName?: string;
};

/** Shared card chrome for every state of the invitation page. */
export function InviteCardShell({
  title,
  description,
  content,
  contentClassName,
  footer,
  footerClassName,
}: InviteCardShellProps) {
  return (
    <Card className="w-full shadow-sm max-w-xl">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {content ? <CardContent className={contentClassName}>{content}</CardContent> : null}
      {footer ? <CardFooter className={footerClassName}>{footer}</CardFooter> : null}
    </Card>
  );
}
