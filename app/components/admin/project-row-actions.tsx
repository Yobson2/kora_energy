"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/app/lib/api-client";
import { Spinner } from "@/app/components/forms/fields";
import { cn } from "@/app/lib/utils";

/** Publish / feature switches for one project row. */
export function ProjectRowActions({
  id,
  slug,
  published,
  featured,
}: {
  id: string;
  slug: string;
  published: boolean;
  featured: boolean;
}) {
  const router = useRouter();
  const [, startRefresh] = useTransition();
  const [pending, setPending] = useState<"published" | "featured" | null>(null);
  const [error, setError] = useState<string>();

  async function toggle(field: "published" | "featured", value: boolean) {
    setPending(field);
    setError(undefined);
    const result = await apiRequest(`/api/admin/projects/${id}`, {
      method: "PATCH",
      body: { [field]: value },
    });
    setPending(null);
    if (!result.ok) return setError(result.message);
    startRefresh(() => router.refresh());
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Switch
          label="Published"
          checked={published}
          pending={pending === "published"}
          onChange={(v) => toggle("published", v)}
        />
        <Switch
          label="Featured"
          checked={featured}
          pending={pending === "featured"}
          disabled={!published}
          onChange={(v) => toggle("featured", v)}
        />
        {published && (
          <Link
            href={`/projects/${slug}`}
            target="_blank"
            className="type-small underline underline-offset-2"
          >
            View<span className="sr-only"> on the public site (opens in a new tab)</span>
          </Link>
        )}
      </div>
      {error && (
        <p role="alert" className="type-small text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function Switch({
  label,
  checked,
  pending,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  pending: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={pending || disabled}
      onClick={() => onChange(!checked)}
      className="type-small inline-flex items-center gap-2 disabled:opacity-50"
    >
      <span
        aria-hidden
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors",
          checked ? "bg-ink" : "bg-plaster-deep"
        )}
      >
        <span
          className={cn(
            "bg-paper absolute top-0.5 flex size-4 items-center justify-center rounded-full transition-[left]",
            checked ? "left-[18px]" : "left-0.5"
          )}
        >
          {pending && <Spinner className="size-2.5 border" />}
        </span>
      </span>
      {label}
    </button>
  );
}
