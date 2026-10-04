import "server-only";
import type { Lead } from "@/app/lib/domain";

/**
 * Outbound notifications when a lead arrives.
 *
 * The concept ships with a log-only notifier. The interface is what matters:
 * an email (Resend, SES) or WhatsApp Business implementation slots in here and
 * nothing that calls `notifyNewLead` changes. Failures are logged and
 * swallowed ON PURPOSE  the lead is already saved, and a visitor must never
 * see an error because the team's email provider had a bad minute.
 */
export interface Notifier {
  newLead(lead: Lead): Promise<void>;
}

const logNotifier: Notifier = {
  async newLead(lead) {
    console.info(
      `[notify] new ${lead.source} lead ${lead.reference}  ${lead.contact.company ?? lead.contact.name}`
    );
  },
};

export async function notifyNewLead(lead: Lead): Promise<void> {
  try {
    await logNotifier.newLead(lead);
  } catch (error) {
    console.error("[notify] failed", lead.reference, error);
  }
}
