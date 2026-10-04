"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/primitives/button";
import { FormAlert, Spinner, TextField } from "@/app/components/forms/fields";
import { apiRequest } from "@/app/lib/api-client";
import { fieldErrors, loginSchema, type FieldErrors } from "@/app/lib/validation";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFailure(undefined);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setPending(true);
    const result = await apiRequest<{ name: string }>("/api/admin/session", { body: parsed.data });
    if (result.ok) {
      router.replace(next);
      router.refresh();
      return;
    }
    setPending(false);
    setPassword("");
    setFailure(result.message);
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5" aria-busy={pending}>
      {failure && (
        <FormAlert tone="error" title="Couldn't sign in">
          {failure}
        </FormAlert>
      )}
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <TextField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
      <Button type="submit" variant="secondary" size="lg" disabled={pending}>
        {pending ? (
          <>
            <Spinner /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
