import type { Metadata } from "next";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Section } from "@/app/components/primitives/section";
import { pageMetadata } from "@/app/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy notice",
  description: "What this concept site stores when you use its forms, and what it doesn't.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Privacy", path: "/privacy" }]}
        title="Privacy notice"
        lead="Short, because this site collects very little. Last updated 4 October 2026."
      />
      <Section>
        <div className="prose-kora">
          <p>
            Kora Energy is a fictional company and this website is a portfolio concept. It is
            written the way a real provider&apos;s notice should be: plainly, and only about what
            actually happens.
          </p>

          <h2>What we store</h2>
          <ul>
            <li>
              <strong>Quote requests and contact messages:</strong> the details you type into those
              forms, the time of submission and the fact that you ticked the consent box. They are
              stored in the demonstration back office so the lead-management features can be shown.
            </li>
            <li>
              <strong>Calculator inputs:</strong> nothing. The calculator runs in your browser. Your
              inputs appear in the page address so you can share or bookmark an estimate, and are
              only sent to us if you then request a quote.
            </li>
            <li>
              <strong>A draft of an unfinished quote request</strong> is kept in your own
              browser&apos;s session storage, so a reload doesn&apos;t lose it. It is deleted when
              you send the request or close the tab.
            </li>
          </ul>

          <h2>What we don&apos;t do</h2>
          <ul>
            <li>No analytics, advertising or tracking scripts, and no third-party embeds.</li>
            <li>
              No cookies for visitors. The only cookie is the sign-in session for the back office.
            </li>
            <li>No sale or sharing of your details with anyone.</li>
          </ul>

          <h2>Please use example data</h2>
          <p>
            Because this is a demonstration, other people reviewing the back office may see what you
            submit. Use made-up details rather than your real phone number or email address.
          </p>

          <h2>In a real deployment</h2>
          <p>
            A real provider in Côte d&apos;Ivoire would also need to name its data controller,
            register its processing with the national data-protection authority, state how long
            leads are kept, and explain how to ask for a copy or deletion of your data.
          </p>
        </div>
      </Section>
    </>
  );
}
