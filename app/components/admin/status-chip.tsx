import { LEAD_STATUS_LABEL, type LeadStatus } from "@/app/lib/domain";
import { cn } from "@/app/lib/utils";

/** Pipeline stages read left to right in tone: open (sun) → active (lagoon) → closed. */
const TONE: Record<LeadStatus, string> = {
  new: "bg-sun-soft text-ink",
  contacted: "bg-lagoon-soft text-ink",
  "site-visit": "bg-lagoon-soft text-ink",
  proposal: "bg-lagoon text-paper",
  won: "bg-success-soft text-success",
  lost: "bg-plaster-deep text-muted",
};

export function StatusChip({ status, className }: { status: LeadStatus; className?: string }) {
  return (
    <span
      className={cn(
        "type-small inline-flex items-center rounded-[var(--radius-pill)] px-2.5 py-0.5 font-semibold whitespace-nowrap",
        TONE[status],
        className
      )}
    >
      {LEAD_STATUS_LABEL[status]}
    </span>
  );
}
