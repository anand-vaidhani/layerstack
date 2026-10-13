"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signInAction, signUpAction } from "@/lib/actions/auth";
import { handleActionResult } from "@/lib/toast";

function Field({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  defaultValue,
  required = true,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required={required}
      />
    </div>
  );
}

export function SignInForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await signInAction(formData);
      handleActionResult(result);
      if (result.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  function fillDemo(email: string, password: string) {
    const form = formRef.current;
    if (!form) return;
    const emailInput = form.elements.namedItem("email") as HTMLInputElement | null;
    const passwordInput = form.elements.namedItem("password") as HTMLInputElement | null;
    if (emailInput) emailInput.value = email;
    if (passwordInput) passwordInput.value = password;
  }

  return (
    <Card className="w-full shadow-sm max-w-xl">
      <CardHeader>
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your workspace to continue</CardDescription>
      </CardHeader>
      <form ref={formRef} action={handleSubmit}>
        <CardContent className="grid gap-4">
          <Field id="email" label="Email" type="email" placeholder="you@company.com" autoComplete="email" />
          <Field id="password" label="Password" type="password" placeholder="••••••••" autoComplete="current-password" />
          <DemoCredentials onFill={fillDemo} />
        </CardContent>
        <CardFooter className="mt-2 flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/sign-up" className="font-medium text-foreground underline-offset-4 hover:underline">
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await signUpAction(formData);
      handleActionResult(result);
      if (result.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Create your workspace</CardTitle>
        <CardDescription>Start on the Free plan — no credit card required</CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="grid gap-4">
          <Field id="name" label="Your name" placeholder="Ada Lovelace" autoComplete="name" />
          <Field id="email" label="Work email" type="email" placeholder="you@company.com" autoComplete="email" />
          <Field
            id="password"
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
          <Field id="organizationName" label="Organization name" placeholder="Acme Inc" autoComplete="organization" />
        </CardContent>
        <CardFooter className="mt-2 flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating workspace…" : "Create workspace"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

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
