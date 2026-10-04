"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { apiRequest } from "@/app/lib/api-client";
import { cn } from "@/app/lib/utils";

export function SignOutButton({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await apiRequest("/api/admin/session", { method: "DELETE" });
        router.replace("/admin/login");
        router.refresh();
      }}
      className={cn(
        "type-small inline-flex w-fit items-center gap-2 font-semibold",
        tone === "dark" ? "text-paper" : "text-ink"
      )}
    >
      <LogOut className="size-4" aria-hidden />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
