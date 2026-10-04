import type { ReactNode } from "react";
import { Plus } from "lucide-react";

/**
 * Native <details>/<summary>: keyboard support, expanded state and
 * find-in-page work without JavaScript. Items sharing a `name` behave as an
 * exclusive accordion, natively.
 */
export function Disclosure({
  summary,
  name,
  defaultOpen = false,
  children,
}: {
  summary: string;
  name?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details name={name} open={defaultOpen} className="group border-line border-t">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 font-semibold [&::-webkit-details-marker]:hidden">
        <span className="text-[1.0625rem]">{summary}</span>
        <Plus
          aria-hidden
          className="mt-0.5 size-5 shrink-0 transition-transform duration-200 group-open:rotate-45"
        />
      </summary>
      <div className="text-muted max-w-[68ch] pb-6">{children}</div>
    </details>
  );
}
