import { useState } from "react";

export function DemoCredentials({ onFill }: { onFill?: (email: string, password: string) => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-4 w-full rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
      <p className="mb-1.5 font-medium text-foreground">Demo accounts (password: password123)</p>
      <div className="flex flex-wrap gap-2">
        {["ava@acme.test", "cara@globex.test"].map((email) => (
          <button
            key={email}
            type="button"
            onClick={() => {
              onFill?.(email, "password123");
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="rounded-md border bg-background px-2 py-1 font-mono transition-colors hover:bg-accent"
          >
            {email}
          </button>
        ))}
      </div>
      {copied ? <p className="mt-1.5 text-emerald-600">Filled — press Sign in</p> : null}
    </div>
  );
}
