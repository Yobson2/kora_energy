"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/app/components/primitives/button";
import {
  CheckboxField,
  FormAlert,
  SelectField,
  Spinner,
  TextField,
  TextareaField,
} from "@/app/components/forms/fields";
import { RoofPlan } from "@/app/components/visuals/roof-plan";
import { apiRequest } from "@/app/lib/api-client";
import type { Project } from "@/app/lib/domain";
import {
  GRID_KG_CO2_PER_KWH,
  LOCATION,
  LOCATIONS,
  SEGMENTS,
  SEGMENT_LABEL,
  type Location,
  type Segment,
} from "@/app/lib/solar/assumptions";
import { layoutPanels, panelCount } from "@/app/lib/solar/panel-layout";
import { fieldErrors, projectSchema, type FieldErrors } from "@/app/lib/validation";
import { parseAmount } from "@/app/lib/parse";
import { formatNumber } from "@/app/lib/format";
import { useFocusFirstError } from "@/app/components/forms/use-focus-first-error";

type Draft = {
  slug: string;
  title: string;
  client: string;
  segment: Segment;
  location: Location;
  area: string;
  year: string;
  systemKwp: string;
  batteryKwh: string;
  annualProductionKwh: string;
  solarSharePercent: string;
  co2TonnesPerYear: string;
  summary: string;
  challenge: string;
  approach: string;
  results: Array<{ label: string; value: string }>;
  roofWidth: string;
  roofDepth: string;
  published: boolean;
  featured: boolean;
};

function toDraft(p?: Project): Draft {
  return {
    slug: p?.slug ?? "",
    title: p?.title ?? "",
    client: p?.client ?? "",
    segment: p?.segment ?? "office",
    location: p?.location ?? "abidjan",
    area: p?.area ?? "",
    year: String(p?.year ?? new Date().getFullYear()),
    systemKwp: p ? String(p.systemKwp) : "",
    batteryKwh: p ? String(p.batteryKwh) : "0",
    annualProductionKwh: p ? String(p.annualProductionKwh) : "",
    solarSharePercent: p ? String(Math.round(p.solarShare * 100)) : "",
    co2TonnesPerYear: p ? String(p.co2TonnesPerYear) : "",
    summary: p?.summary ?? "",
    challenge: p?.challenge ?? "",
    approach: p?.approach ?? "",
    results: p?.results ?? [],
    roofWidth: p ? String(p.roof.width) : "",
    roofDepth: p ? String(p.roof.depth) : "",
    published: p?.published ?? false,
    featured: p?.featured ?? false,
  };
}

const num = (v: string) => parseAmount(v) ?? NaN;

function toPayload(d: Draft) {
  return {
    slug: d.slug,
    title: d.title,
    client: d.client,
    segment: d.segment,
    location: d.location,
    area: d.area,
    year: num(d.year),
    systemKwp: num(d.systemKwp),
    batteryKwh: num(d.batteryKwh || "0"),
    annualProductionKwh: num(d.annualProductionKwh),
    solarShare: num(d.solarSharePercent) / 100,
    co2TonnesPerYear: num(d.co2TonnesPerYear),
    summary: d.summary,
    challenge: d.challenge,
    approach: d.approach,
    results: d.results.filter((r) => r.label.trim() || r.value.trim()),
    roof: { width: num(d.roofWidth), depth: num(d.roofDepth) },
    published: d.published,
    featured: d.published && d.featured,
  };
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => toDraft(project));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(project));
  const formRef = useRef<HTMLFormElement | null>(null);
  const focusFirstError = useFocusFirstError(formRef);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setSaved(false);
    setDraft((d) => {
      const next = { ...d, [key]: value };
      // Suggest an address from the client and area until the slug is edited by hand.
      if (!slugTouched && (key === "client" || key === "area"))
        next.slug = slugify(`${next.client} ${next.area}`);
      return next;
    });
  };

  // Helpers that derive figures with the same constants as the estimator.
  function deriveFigures() {
    const kwp = num(draft.systemKwp);
    if (!Number.isFinite(kwp)) return setErrors({ systemKwp: "Enter the system size first." });
    const production = Math.round(kwp * LOCATION[draft.location].yieldKwhPerKwp);
    setDraft((d) => ({
      ...d,
      annualProductionKwh: String(production),
      co2TonnesPerYear: String(Math.round((production * 0.95 * GRID_KG_CO2_PER_KWH) / 1000)),
    }));
  }

  const kwp = num(draft.systemKwp);
  const roof = { width: num(draft.roofWidth), depth: num(draft.roofDepth) };
  const previewable = kwp > 0 && roof.width >= 4 && roof.depth >= 4;
  const fit = previewable ? layoutPanels(roof, panelCount(kwp)) : undefined;
  const overflow = fit && fit.capacity < panelCount(kwp);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setFailure(undefined);
    const payload = toPayload(draft);
    const parsed = projectSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(mapErrors(fieldErrors(parsed.error)));
      focusFirstError();
      return;
    }
    setErrors({});
    setPending(true);
    const result = project
      ? await apiRequest<Project>(`/api/admin/projects/${project.id}`, {
          method: "PATCH",
          body: parsed.data,
        })
      : await apiRequest<Project>("/api/admin/projects", { body: parsed.data });
    setPending(false);

    if (!result.ok) {
      if (result.fields) setErrors(mapErrors(result.fields));
      return setFailure(result.message);
    }
    if (!project) {
      router.replace(`/admin/projects/${result.data.id}`);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  async function remove() {
    if (!project) return;
    setPending(true);
    const result = await apiRequest(`/api/admin/projects/${project.id}`, { method: "DELETE" });
    setPending(false);
    if (!result.ok) return setFailure(result.message);
    router.replace("/admin/projects");
    router.refresh();
  }

  return (
    <form ref={formRef} noValidate onSubmit={save} className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div className="flex flex-col gap-6">
        {failure && (
          <FormAlert tone="error" title="The project wasn't saved">
            {failure}
          </FormAlert>
        )}
        {saved && (
          <FormAlert tone="success" title="Saved">
            The public pages update on their next visit.
          </FormAlert>
        )}

        <Panel title="Identity">
          <TextField
            id="client"
            label="Client description"
            hint="Never a real name: “Business hotel, 84 rooms”."
            value={draft.client}
            onChange={(e) => set("client", e.target.value)}
            error={errors.client}
          />
          <TextField
            id="title"
            label="Headline"
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            error={errors.title}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="segment"
              label="Type of site"
              value={draft.segment}
              onChange={(e) => set("segment", e.target.value as Segment)}
              options={SEGMENTS.map((s) => ({ value: s, label: SEGMENT_LABEL[s] }))}
            />
            <SelectField
              id="location"
              label="Location"
              value={draft.location}
              onChange={(e) => set("location", e.target.value as Location)}
              options={LOCATIONS.map((l) => ({ value: l, label: LOCATION[l].label }))}
            />
            <TextField
              id="area"
              label="District or area"
              value={draft.area}
              onChange={(e) => set("area", e.target.value)}
              error={errors.area}
            />
            <TextField
              id="year"
              label="Year"
              inputMode="numeric"
              value={draft.year}
              onChange={(e) => set("year", e.target.value)}
              error={errors.year}
            />
          </div>
          <TextField
            id="slug"
            label="Web address"
            hint={`kora-energy.example/projects/${draft.slug || "…"}`}
            value={draft.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", e.target.value);
            }}
            error={errors.slug}
          />
        </Panel>

        <Panel title="System and figures">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id="systemKwp"
              label="Solar array"
              suffix="kWp"
              inputMode="decimal"
              value={draft.systemKwp}
              onChange={(e) => set("systemKwp", e.target.value)}
              error={errors.systemKwp}
            />
            <TextField
              id="batteryKwh"
              label="Battery"
              suffix="kWh"
              inputMode="decimal"
              value={draft.batteryKwh}
              onChange={(e) => set("batteryKwh", e.target.value)}
              error={errors.batteryKwh}
            />
            <TextField
              id="annualProductionKwh"
              label="Annual production"
              suffix="kWh"
              inputMode="numeric"
              value={draft.annualProductionKwh}
              onChange={(e) => set("annualProductionKwh", e.target.value)}
              error={errors.annualProductionKwh}
            />
            <TextField
              id="solarSharePercent"
              label="Share of load from solar"
              suffix="%"
              inputMode="numeric"
              value={draft.solarSharePercent}
              onChange={(e) => set("solarSharePercent", e.target.value)}
              error={errors.solarShare}
            />
            <TextField
              id="co2TonnesPerYear"
              label="CO₂ avoided"
              suffix="t / yr"
              inputMode="numeric"
              value={draft.co2TonnesPerYear}
              onChange={(e) => set("co2TonnesPerYear", e.target.value)}
              error={errors.co2TonnesPerYear}
            />
          </div>
          <Button variant="outline" onClick={deriveFigures} className="self-start">
            Derive production and CO₂ from size and location
          </Button>
        </Panel>

        <Panel title="Story">
          <TextareaField
            id="summary"
            label="Summary"
            rows={3}
            hint="One or two sentences, shown on cards."
            value={draft.summary}
            onChange={(e) => set("summary", e.target.value)}
            error={errors.summary}
          />
          <TextareaField
            id="challenge"
            label="The challenge"
            value={draft.challenge}
            onChange={(e) => set("challenge", e.target.value)}
            error={errors.challenge}
          />
          <TextareaField
            id="approach"
            label="The design"
            value={draft.approach}
            onChange={(e) => set("approach", e.target.value)}
            error={errors.approach}
          />
        </Panel>

        <Panel title="Results">
          {draft.results.length === 0 && (
            <p className="text-muted type-small">No results yet. Add up to six headline figures.</p>
          )}
          {draft.results.map((r, i) => (
            <div key={i} className="grid items-end gap-3 sm:grid-cols-[1fr_10rem_auto]">
              <TextField
                id={`result-${i}-label`}
                label="Label"
                value={r.label}
                onChange={(e) =>
                  set(
                    "results",
                    draft.results.map((x, j) => (j === i ? { ...x, label: e.target.value } : x))
                  )
                }
                error={errors[`results.${i}.label`]}
              />
              <TextField
                id={`result-${i}-value`}
                label="Value"
                value={r.value}
                onChange={(e) =>
                  set(
                    "results",
                    draft.results.map((x, j) => (j === i ? { ...x, value: e.target.value } : x))
                  )
                }
                error={errors[`results.${i}.value`]}
              />
              <Button
                variant="ghost"
                onClick={() =>
                  set(
                    "results",
                    draft.results.filter((_, j) => j !== i)
                  )
                }
                aria-label={`Remove result ${i + 1}`}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>
          ))}
          {draft.results.length < 6 && (
            <Button
              variant="outline"
              onClick={() => set("results", [...draft.results, { label: "", value: "" }])}
              className="self-start"
            >
              <Plus className="size-4" aria-hidden /> Add a result
            </Button>
          )}
        </Panel>
      </div>

      <div className="flex flex-col gap-6 xl:sticky xl:top-10 xl:self-start">
        <Panel title="Roof plan">
          <div className="grid grid-cols-2 gap-4">
            <TextField
              id="roofWidth"
              label="Width"
              suffix="m"
              inputMode="decimal"
              value={draft.roofWidth}
              onChange={(e) => set("roofWidth", e.target.value)}
              error={errors["roof.width"]}
            />
            <TextField
              id="roofDepth"
              label="Depth"
              suffix="m"
              inputMode="decimal"
              value={draft.roofDepth}
              onChange={(e) => set("roofDepth", e.target.value)}
              error={errors["roof.depth"]}
            />
          </div>
          {previewable ? (
            <>
              <div className="bg-plaster rounded-[var(--radius-sm)] p-3">
                <RoofPlan
                  roof={roof}
                  systemKwp={kwp}
                  label="Preview of the roof plan"
                  caption={false}
                />
              </div>
              <p
                className={overflow ? "type-small text-danger" : "type-small text-muted"}
                role="status"
              >
                {overflow
                  ? `This roof fits ${formatNumber(fit!.capacity)} panels, but ${formatKwp0(kwp)} needs ${formatNumber(panelCount(kwp))}. Enlarge the roof or reduce the system.`
                  : `${formatNumber(panelCount(kwp))} panels fit, with walkways.`}
              </p>
            </>
          ) : (
            <p className="type-small text-muted">
              Enter the system size and roof dimensions to preview the plan.
            </p>
          )}
        </Panel>

        <Panel title="Visibility">
          <CheckboxField
            id="published"
            checked={draft.published}
            onChange={(v) => set("published", v)}
          >
            Published on the public site
          </CheckboxField>
          <CheckboxField
            id="featured"
            checked={draft.featured && draft.published}
            onChange={(v) => set("featured", v)}
          >
            Featured on the homepage{" "}
            {!draft.published && <span className="text-muted">(publish first)</span>}
          </CheckboxField>
        </Panel>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="primary" size="lg" disabled={pending}>
            {pending ? (
              <>
                <Spinner /> Saving…
              </>
            ) : project ? (
              "Save changes"
            ) : (
              "Create project"
            )}
          </Button>
          {project &&
            (confirmDelete ? (
              <span className="flex items-center gap-2" role="group" aria-label="Confirm deletion">
                <span className="type-small">Delete permanently?</span>
                <Button variant="ghost" onClick={remove} disabled={pending} className="text-danger">
                  Delete
                </Button>
                <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Keep
                </Button>
              </span>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setConfirmDelete(true)}
                className="text-danger"
              >
                <Trash2 className="size-4" aria-hidden /> Delete project
              </Button>
            ))}
        </div>
      </div>
    </form>
  );
}

/** Schema errors use payload names; map the few that differ back to field ids. */
function mapErrors(errors: FieldErrors): FieldErrors {
  const out: FieldErrors = { ...errors };
  if (errors.solarShare) out.solarShare = "Enter a percentage between 0 and 100.";
  return out;
}

function formatKwp0(kwp: number) {
  return `${formatNumber(kwp, 1)} kWp`;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="bg-paper ring-line flex flex-col gap-5 rounded-[var(--radius-md)] p-5 ring-1">
      <legend className="sr-only">{title}</legend>
      <h2 aria-hidden className="font-semibold">
        {title}
      </h2>
      {children}
    </fieldset>
  );
}
