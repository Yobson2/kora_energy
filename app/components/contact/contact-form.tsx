"use client";

import { useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/app/components/primitives/button";
import { Link } from "@/app/components/primitives/link";
import {
  CheckboxField,
  FormAlert,
  Honeypot,
  SelectField,
  Spinner,
  TextField,
  TextareaField,
} from "@/app/components/forms/fields";
import { useLocale } from "@/app/components/i18n/use-locale";
import { labels } from "@/app/content/labels";
import { CONTACT_TOPICS, type ContactTopic } from "@/app/lib/domain";
import { fieldErrors, publicSchemas, type FieldErrors } from "@/app/lib/validation";
import { apiRequest } from "@/app/lib/api-client";
import type { Locale } from "@/app/lib/i18n";
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

const COPY: Record<
  Locale,
  {
    sentTitle: string;
    refBefore: string;
    refAfter: string;
    another: string;
    notSent: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    topic: string;
    chooseTopic: string;
    message: string;
    count: (n: number) => string;
    consentBefore: string;
    privacy: string;
    sending: string;
    send: string;
  }
> = {
  en: {
    sentTitle: "Message sent.",
    refBefore: "Your reference is ",
    refAfter:
      ". In a real deployment the team would reply within one working day. As this is a concept project, the message has been saved to the demonstration back office instead.",
    another: "Send another message",
    notSent: "Your message wasn't sent",
    name: "Full name",
    company: "Company",
    email: "Email",
    phone: "Phone",
    topic: "What is your message about?",
    chooseTopic: "Choose a topic",
    message: "Message",
    count: (n) => `${n} / 2000 characters`,
    consentBefore: "Kora Energy may use these details to reply to my message, as described in the ",
    privacy: "privacy notice",
    sending: "Sending…",
    send: "Send message",
  },
  fr: {
    sentTitle: "Message envoyé.",
    refBefore: "Votre référence est ",
    refAfter:
      ". Dans un déploiement réel, l'équipe répondrait sous un jour ouvré. S'agissant d'un projet fictif, le message a été enregistré dans le back-office de démonstration.",
    another: "Envoyer un autre message",
    notSent: "Votre message n'a pas été envoyé",
    name: "Nom complet",
    company: "Entreprise",
    email: "E-mail",
    phone: "Téléphone",
    topic: "Quel est l'objet de votre message ?",
    chooseTopic: "Choisissez un objet",
    message: "Message",
    count: (n) => `${n} / 2000 caractères`,
    consentBefore:
      "Kora Energy peut utiliser ces informations pour répondre à mon message, comme décrit dans la ",
    privacy: "politique de confidentialité",
    sending: "Envoi…",
    send: "Envoyer le message",
  },
};

export function ContactForm() {
  const locale = useLocale();
  const t = COPY[locale];
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

    const parsed = publicSchemas(locale).contactSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      focusFirstError();
      return;
    }

    setStatus({ kind: "sending" });
    const result = await apiRequest<{ reference: string }>("/api/contact", {
      body: payload,
      locale,
    });
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
        <h2 className="type-h2">{t.sentTitle}</h2>
        <p className="text-muted max-w-[52ch]">
          {t.refBefore}
          <strong className="text-ink tabular">{status.reference}</strong>
          {t.refAfter}
        </p>
        <Button variant="outline" onClick={() => setStatus({ kind: "idle" })}>
          {t.another}
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
        <FormAlert tone="error" title={t.notSent}>
          {status.message}
        </FormAlert>
      )}
      <Honeypot value={values.website} onChange={(v) => set("website", v)} />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="name"
          label={t.name}
          autoComplete="name"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          error={errors.name}
        />
        <TextField
          id="company"
          label={t.company}
          optional
          autoComplete="organization"
          value={values.company}
          onChange={(e) => set("company", e.target.value)}
          error={errors.company}
        />
        <TextField
          id="email"
          label={t.email}
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          error={errors.email}
        />
        <TextField
          id="phone"
          label={t.phone}
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
        label={t.topic}
        placeholder={t.chooseTopic}
        value={values.topic}
        onChange={(e) => set("topic", e.target.value as ContactTopic)}
        error={errors.topic}
        options={CONTACT_TOPICS.map((topic) => ({
          value: topic,
          label: labels(locale).contactTopic[topic],
        }))}
      />
      <TextareaField
        id="message"
        label={t.message}
        value={values.message}
        onChange={(e) => set("message", e.target.value)}
        error={errors.message}
        hint={t.count(values.message.trim().length)}
      />
      <CheckboxField
        id="consent"
        checked={values.consent}
        onChange={(v) => set("consent", v)}
        error={errors.consent}
      >
        {t.consentBefore}
        <Link href="/privacy" className="underline underline-offset-2">
          {t.privacy}
        </Link>
        .
      </CheckboxField>
      <div>
        <Button type="submit" variant="primary" size="lg" disabled={sending}>
          {sending ? (
            <>
              <Spinner /> {t.sending}
            </>
          ) : (
            t.send
          )}
        </Button>
      </div>
    </form>
  );
}
