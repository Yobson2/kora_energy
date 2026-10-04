"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/app/components/primitives/button";
import { FormAlert, Spinner } from "@/app/components/forms/fields";
import { apiRequest } from "@/app/lib/api-client";
import { LEAD_STATUSES, LEAD_STATUS_LABEL, type Lead, type LeadStatus } from "@/app/lib/domain";
import { formatDateTime } from "@/app/lib/format";
import { cn } from "@/app/lib/utils";

/**
 * The working half of the lead page: move the lead along the pipeline and
 * keep notes. Both write through the admin API and then refresh the server
 * components, so the page never shows a value the server didn't confirm.
 */
export function LeadActions({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [statusPending, setStatusPending] = useState<LeadStatus | null>(null);
  const [note, setNote] = useState("");
  const [notePending, setNotePending] = useState(false);
  const [error, setError] = useState<string>();

  async function changeStatus(status: LeadStatus) {
    if (status === lead.status) return;
    setError(undefined);
    setStatusPending(status);
    const result = await apiRequest<Lead>(`/api/admin/leads/${lead.id}`, {
      method: "PATCH",
      body: { status },
    });
    setStatusPending(null);
    if (!result.ok) return setError(result.message);
    startRefresh(() => router.refresh());
  }

  async function addNote(event: React.FormEvent) {
    event.preventDefault();
    if (!note.trim()) return setError("Write a note first.");
    setError(undefined);
    setNotePending(true);
    const result = await apiRequest<Lead>(`/api/admin/leads/${lead.id}/notes`, {
      body: { text: note },
    });
    setNotePending(false);
    if (!result.ok) return setError(result.fields?.text ?? result.message);
    setNote("");
    startRefresh(() => router.refresh());
  }

  const timeline = [...lead.activity].reverse();

  return (
    <div className="flex flex-col gap-6">
      <section
        aria-labelledby="stage-title"
        className="bg-paper ring-line rounded-[var(--radius-md)] p-5 ring-1"
      >
        <h2 id="stage-title" className="mb-3 font-semibold">
          Stage
        </h2>
        <div
          role="group"
          aria-labelledby="stage-title"
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        >
          {LEAD_STATUSES.map((status) => {
            const current = status === lead.status;
            return (
              <button
                key={status}
                type="button"
                aria-pressed={current}
                disabled={statusPending !== null}
                onClick={() => changeStatus(status)}
                className={cn(
                  "type-small flex items-center justify-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 font-semibold ring-1 transition-colors ring-inset",
                  current ? "bg-ink text-paper ring-ink" : "ring-line hover:ring-ink",
                  status === "lost" && !current && "text-muted"
                )}
              >
                {statusPending === status && <Spinner className="size-3.5" />}
                {LEAD_STATUS_LABEL[status]}
              </button>
            );
          })}
        </div>
      </section>

      {error && (
        <FormAlert tone="error" title="That change wasn't saved">
          {error}
        </FormAlert>
      )}

      <section
        aria-labelledby="timeline-title"
        className="bg-paper ring-line flex flex-col gap-4 rounded-[var(--radius-md)] p-5 ring-1"
      >
        <div className="flex items-center justify-between">
          <h2 id="timeline-title" className="font-semibold">
            Activity
          </h2>
          {refreshing && (
            <span className="type-small text-muted flex items-center gap-1.5">
              <RefreshCw className="size-3.5 animate-[spin_1s_linear_infinite]" aria-hidden />{" "}
              Updating
            </span>
          )}
        </div>

        <form onSubmit={addNote} className="flex flex-col gap-2">
          <label htmlFor="note" className="type-label">
            Add a note
          </label>
          <textarea
            id="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Call summary, next step, anything the team should know"
            className="ring-line focus-visible:ring-ink rounded-[var(--radius-sm)] px-3 py-2 ring-1 ring-inset focus-visible:ring-2 focus-visible:outline-none"
          />
          <Button type="submit" variant="secondary" disabled={notePending} className="self-end">
            {notePending ? (
              <>
                <Spinner /> Saving…
              </>
            ) : (
              "Save note"
            )}
          </Button>
        </form>

        <ol className="border-line flex flex-col border-l pl-4">
          {timeline.map((item) => {
            const Icon =
              item.kind === "note" ? MessageSquare : item.kind === "status" ? RefreshCw : Sparkles;
            return (
              <li key={item.id} className="relative pb-4 last:pb-0">
                <span className="bg-paper ring-line absolute top-0.5 -left-[25px] flex size-4.5 items-center justify-center rounded-full ring-1">
                  <Icon className="text-muted size-2.5" aria-hidden />
                </span>
                <p className={cn(item.kind === "note" ? "whitespace-pre-line" : "font-semibold")}>
                  {item.text}
                </p>
                <p className="type-small text-muted">
                  {item.by}, {formatDateTime(item.at)}
                </p>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
