import type { Metadata } from "next";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Section } from "@/app/components/primitives/section";
import { pageMetadata } from "@/app/lib/metadata";
import { pageLocale } from "@/app/lib/route-locale";
import type { Locale } from "@/app/lib/i18n";

const META: Record<Locale, { title: string; description: string; crumb: string; lead: string }> = {
  en: {
    title: "Privacy notice",
    description: "What this concept site stores when you use its forms, and what it doesn't.",
    crumb: "Privacy",
    lead: "Short, because this site collects very little. Last updated 4 October 2024.",
  },
  fr: {
    title: "Politique de confidentialité",
    description:
      "Ce que ce site fictif enregistre quand vous utilisez ses formulaires, et ce qu'il n'enregistre pas.",
    crumb: "Confidentialité",
    lead: "Courte, parce que ce site collecte très peu de choses. Dernière mise à jour : 4 octobre 2024.",
  },
};

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  const locale = await pageLocale(params);
  const t = META[locale];
  return pageMetadata({ title: t.title, description: t.description, path: "/privacy", locale });
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy">) {
  const locale = await pageLocale(params);
  const t = META[locale];
  return (
    <>
      <PageHeader
        locale={locale}
        crumbs={[{ name: t.crumb, path: "/privacy" }]}
        title={t.title}
        lead={t.lead}
      />
      <Section>
        <div className="prose-kora">{locale === "fr" ? <French /> : <English />}</div>
      </Section>
    </>
  );
}

function English() {
  return (
    <>
      <p>
        Kora Energy is a fictional company and this website is a portfolio concept. It is written
        the way a real provider&apos;s notice should be: plainly, and only about what actually
        happens.
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
          inputs appear in the page address so you can share or bookmark an estimate, and are only
          sent to us if you then request a quote.
        </li>
        <li>
          <strong>A draft of an unfinished quote request</strong> is kept in your own browser&apos;s
          session storage, so a reload doesn&apos;t lose it. It is deleted when you send the request
          or close the tab.
        </li>
      </ul>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>No analytics, advertising or tracking scripts, and no third-party embeds.</li>
        <li>
          No cookies for visitors. The only cookie is the sign-in session for the back office. Your
          choice of language is part of the page address, not a cookie.
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
        A real provider in Côte d&apos;Ivoire would also need to name its data controller, register
        its processing with the national data-protection authority, state how long leads are kept,
        and explain how to ask for a copy or deletion of your data.
      </p>
    </>
  );
}

function French() {
  return (
    <>
      <p>
        Kora Energy est une entreprise fictive et ce site est un projet de portfolio. Cette
        politique est rédigée comme devrait l&apos;être celle d&apos;un vrai fournisseur :
        simplement, et uniquement sur ce qui se passe réellement.
      </p>

      <h2>Ce que nous enregistrons</h2>
      <ul>
        <li>
          <strong>Demandes de devis et messages de contact :</strong> les informations saisies dans
          ces formulaires, l&apos;heure d&apos;envoi et le fait que vous avez coché la case de
          consentement. Elles sont enregistrées dans le back-office de démonstration pour montrer
          les fonctions de gestion des prospects.
        </li>
        <li>
          <strong>Données du simulateur :</strong> rien. Le simulateur fonctionne dans votre
          navigateur. Vos saisies apparaissent dans l&apos;adresse de la page pour que vous puissiez
          partager ou enregistrer une estimation, et ne nous sont envoyées que si vous demandez
          ensuite un devis.
        </li>
        <li>
          <strong>Le brouillon d&apos;une demande de devis inachevée</strong> est conservé dans le
          stockage de session de votre propre navigateur, pour qu&apos;un rechargement ne le perde
          pas. Il est supprimé quand vous envoyez la demande ou fermez l&apos;onglet.
        </li>
      </ul>

      <h2>Ce que nous ne faisons pas</h2>
      <ul>
        <li>
          Aucun script d&apos;analyse, de publicité ou de pistage, et aucun contenu tiers intégré.
        </li>
        <li>
          Aucun cookie pour les visiteurs. Le seul cookie est la session de connexion au
          back-office. Votre choix de langue fait partie de l&apos;adresse de la page, ce n&apos;est
          pas un cookie.
        </li>
        <li>Aucune vente ni aucun partage de vos informations, avec qui que ce soit.</li>
      </ul>

      <h2>Merci d&apos;utiliser des données d&apos;exemple</h2>
      <p>
        S&apos;agissant d&apos;une démonstration, d&apos;autres personnes consultant le back-office
        peuvent voir ce que vous envoyez. Utilisez des informations inventées plutôt que votre vrai
        numéro de téléphone ou votre vraie adresse e-mail.
      </p>

      <h2>Dans un déploiement réel</h2>
      <p>
        Un vrai fournisseur en Côte d&apos;Ivoire devrait aussi désigner son responsable de
        traitement, déclarer ses traitements auprès de l&apos;autorité nationale de protection des
        données, indiquer combien de temps les prospects sont conservés, et expliquer comment
        demander une copie ou la suppression de vos données.
      </p>
    </>
  );
}
