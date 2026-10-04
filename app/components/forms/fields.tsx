"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { useLocale } from "@/app/components/i18n/use-locale";
import { cn } from "@/app/lib/utils";

/**
 * Form controls. Each field owns its label, hint and error, and wires them
 * together with ids and aria-describedby so a screen reader announces the
 * error with the field  no form can forget to.
 *
 * Callers pass translated labels and messages; the few words the controls add
 * themselves follow the page language.
 */

const OPTIONAL = { en: "(optional)", fr: "(facultatif)" };
const HONEYPOT = { en: "Leave this field empty", fr: "Laissez ce champ vide" };

const control =
  "w-full rounded-[var(--radius-sm)] bg-paper text-ink ring-1 ring-inset ring-line " +
  "placeholder:text-muted/70 transition-shadow duration-150 hover:ring-muted " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink " +
  "aria-invalid:ring-2 aria-invalid:ring-danger disabled:bg-plaster disabled:text-muted";

type FieldShellProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

export function describedBy(id: string, hint?: unknown, error?: string) {
  return (
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") ||
    undefined
  );
}

function FieldShell({ id, label, hint, error, optional, className, children }: FieldShellProps) {
  const locale = useLocale();
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="type-label">
        {label}
        {optional && <span className="text-muted font-normal"> {OPTIONAL[locale]}</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="type-small text-muted -mt-0.5">
          {hint}
        </p>
      )}
      {children}
      <FieldError id={id} error={error} />
    </div>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} className="type-small text-danger flex items-start gap-1.5">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      {error}
    </p>
  );
}

type InputProps = Omit<ComponentPropsWithoutRef<"input">, "id"> & {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  /** Unit shown inside the field, e.g. "FCFA" or "kWh". */
  suffix?: string;
  shellClassName?: string;
};

export function TextField({
  id,
  label,
  hint,
  error,
  optional,
  suffix,
  shellClassName,
  className,
  ...rest
}: InputProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      className={shellClassName}
    >
      <div className="relative">
        <input
          id={id}
          name={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(control, "h-12 px-3.5", suffix && "pr-16", className)}
          {...rest}
        />
        {suffix && (
          <span
            aria-hidden
            className="type-small text-muted pointer-events-none absolute inset-y-0 right-3.5 flex items-center"
          >
            {suffix}
          </span>
        )}
      </div>
    </FieldShell>
  );
}

type TextareaProps = Omit<ComponentPropsWithoutRef<"textarea">, "id"> & {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
};

export function TextareaField({
  id,
  label,
  hint,
  error,
  optional,
  className,
  ...rest
}: TextareaProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <textarea
        id={id}
        name={id}
        rows={5}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(control, "min-h-32 resize-y px-3.5 py-3", className)}
        {...rest}
      />
    </FieldShell>
  );
}

type SelectProps = Omit<ComponentPropsWithoutRef<"select">, "id"> & {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  placeholder?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
};

export function SelectField({
  id,
  label,
  hint,
  error,
  optional,
  placeholder,
  options,
  className,
  ...rest
}: SelectProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <div className="relative">
        <select
          id={id}
          name={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(control, "h-12 appearance-none pr-10 pl-3.5", className)}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="text-muted pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2"
        />
      </div>
    </FieldShell>
  );
}

type ChoiceProps<T extends string> = {
  name: string;
  legend: string;
  hint?: ReactNode;
  error?: string;
  value: T | undefined;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ value: T; label: string; description?: string }>;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
};

/**
 * Radio buttons drawn as selectable tiles. Real <input type="radio"> inside a
 * <fieldset>, so arrow keys, form semantics and screen readers all work
 * natively; the tile is only styling of the checked state.
 */
export function ChoiceGroup<T extends string>({
  name,
  legend,
  hint,
  error,
  value,
  onChange,
  options,
  columns = 2,
  className,
}: ChoiceProps<T>) {
  const grid = {
    1: "",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];
  return (
    <fieldset
      className={cn("flex flex-col gap-2", className)}
      aria-describedby={describedBy(name, hint, error)}
      aria-invalid={error ? true : undefined}
    >
      <legend className="type-label mb-1.5">{legend}</legend>
      {hint && (
        <p id={`${name}-hint`} className="type-small text-muted -mt-1.5 mb-1">
          {hint}
        </p>
      )}
      <div className={cn("grid gap-2", grid)}>
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={cn(
                "relative flex cursor-pointer flex-col gap-0.5 rounded-[var(--radius-sm)] px-3.5 py-3 ring-1 ring-inset",
                "transition-[box-shadow,background-color] duration-150",
                "has-[:focus-visible]:outline-sun has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2",
                checked ? "bg-ink text-paper ring-ink" : "bg-paper ring-line hover:ring-muted",
                error && !checked && "ring-danger/60"
              )}
            >
              <input
                type="radio"
                id={id}
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className="font-semibold">{option.label}</span>
              {option.description && (
                <span className={cn("type-small", checked ? "text-on-ink-muted" : "text-muted")}>
                  {option.description}
                </span>
              )}
            </label>
          );
        })}
      </div>
      <FieldError id={name} error={error} />
    </fieldset>
  );
}

export function CheckboxField({
  id,
  checked,
  onChange,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="type-small flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          id={id}
          name={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="accent-ink mt-0.5 size-4.5 shrink-0"
        />
        <span>{children}</span>
      </label>
      <FieldError id={id} error={error} />
    </div>
  );
}

/**
 * Bots fill every input; people never see this one. Off-screen rather than
 * display:none, because some bots skip fields that are display:none.
 */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const locale = useLocale();
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="website">{HONEYPOT[locale]}</label>
      <input
        id="website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function FormAlert({
  tone,
  title,
  children,
}: {
  tone: "error" | "success";
  title: string;
  children?: ReactNode;
}) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-[var(--radius-sm)] p-4",
        tone === "error" ? "bg-danger-soft text-danger" : "bg-success-soft text-success"
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="flex flex-col gap-1">
        <p className="font-semibold">{title}</p>
        {children && <div className="type-small text-ink">{children}</div>}
      </div>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-4 animate-[spin_700ms_linear_infinite] rounded-full border-2 border-current border-r-transparent",
        className
      )}
    />
  );
}
