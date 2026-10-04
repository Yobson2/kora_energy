"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/app/components/primitives/button";
import {
  CheckboxField,
  FormAlert,
  Honeypot,
  SelectField,
  Spinner,
  TextField,
  TextareaField,
} from "@/app/components/forms/fields";
import { CONTACT_TOPICS, CONTACT_TOPIC_LABEL, type ContactTopic } from "@/app/lib/domain";
import { contactSchema, fieldErrors, type FieldErrors } from "@/app/lib/validation";
import { apiRequest } from "@/app/lib/api-client";
import { useFocusFirstError } from "@/app/components/forms/use-focus-first-error";

type Values = {
  name: string;
  email: string;
  phone: string;
  company: string;
  topic: ContactTopic | "";
  message: string;
  consent: boolean;
  website: string;
};

const EMPTY: Values = {
  name: "",
  email: "",
  phone: "",
  company: "",
  topic: "",
  message: "",
  consent: false,
  website: "",
};

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "error"; message: string }
  | { kind: "sent"; reference: string };

export function ContactForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement | null>(null);
  const focusFirstError = useFocusFirstError(formRef);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors(({ [key]: _removed, ...rest }) => rest);
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = { ...values, topic: values.topic || undefined };

    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      focusFirstError();
      return;
    }

    setStatus({ kind: "sending" });
    const result = await apiRequest<{ reference: string }>("/api/contact", { body: payload });
    if (result.ok) {
      setStatus({ kind: "sent", reference: result.data.reference });
      setValues(EMPTY);
      return;
    }
    if (result.fields) setErrors(result.fields);
    setStatus({ kind: "error", message: result.message });
  }

  if (status.kind === "sent") {
    return (
      <div
        role="status"
        className="animate-fade-up bg-plaster flex flex-col items-start gap-4 rounded-[var(--radius-md)] p-6 md:p-8"
      >
        <CheckCircle2 className="text-success size-10" aria-hidden />
        <h2 className="type-h2">Message sent.</h2>
        <p className="text-muted max-w-[52ch]">
          Your reference is <strong className="text-ink tabular">{status.reference}</strong>. In a
          real deployment the team would reply within one working day. As this is a concept project,
          the message has been saved to the demonstration back office instead.
        </p>
        <Button variant="outline" onClick={() => setStatus({ kind: "idle" })}>
          Send another message
        </Button>
      </div>
    );
  }

  const sending = status.kind === "sending";

  return (
    <form
      ref={formRef}
      id="contact-form"
      noValidate
      onSubmit={onSubmit}
      aria-busy={sending}
      className="relative flex flex-col gap-6"
    >
      {status.kind === "error" && (
        <FormAlert tone="error" title="Your message wasn't sent">
          {status.message}
        </FormAlert>
      )}
      <Honeypot value={values.website} onChange={(v) => set("website", v)} />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="name"
          label="Full name"
          autoComplete="name"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          error={errors.name}
        />
        <TextField
          id="company"
          label="Company"
          optional
          autoComplete="organization"
          value={values.company}
          onChange={(e) => set("company", e.target.value)}
          error={errors.company}
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          error={errors.email}
        />
        <TextField
          id="phone"
          label="Phone"
          optional
          type="tel"
          autoComplete="tel"
          placeholder="+225 07 00 00 00 00"
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          error={errors.phone}
        />
      </div>
      <SelectField
        id="topic"
        label="What is your message about?"
        placeholder="Choose a topic"
        value={values.topic}
        onChange={(e) => set("topic", e.target.value as ContactTopic)}
        error={errors.topic}
        options={CONTACT_TOPICS.map((t) => ({ value: t, label: CONTACT_TOPIC_LABEL[t] }))}
      />
      <TextareaField
        id="message"
        label="Message"
        value={values.message}
        onChange={(e) => set("message", e.target.value)}
        error={errors.message}
        hint={`${values.message.trim().length} / 2000 characters`}
      />
      <CheckboxField
        id="consent"
        checked={values.consent}
        onChange={(v) => set("consent", v)}
        error={errors.consent}
      >
        Kora Energy may use these details to reply to my message, as described in the{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          privacy notice
        </Link>
        .
      </CheckboxField>
      <div>
        <Button type="submit" variant="primary" size="lg" disabled={sending}>
          {sending ? (
            <>
              <Spinner /> Sending…
            </>
          ) : (
            "Send message"
          )}
        </Button>
      </div>
    </form>
  );
}
