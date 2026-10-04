import Link from "next/link";
import type { Metadata } from "next";
import { requireAdminPage } from "@/app/server/auth/current";
import { listLeads } from "@/app/server/leads";
import { LOCATION, SEGMENT_LABEL } from "@/app/lib/solar/assumptions";
import { formatDate, formatKwp, formatXofCompact } from "@/app/lib/format";

export const metadata: Metadata = { title: "Customers" };

/**
 * Customers are won leads  a view, not a table. There is no second record
 * to keep in sync, and a customer's history is the lead's history.
 */
export default async function CustomersPage() {
  await requireAdminPage();
  const customers = await listLeads({ status: "won" });
  const kwp = customers.reduce((t, c) => t + (c.estimate?.systemKwp ?? 0), 0);
  const value = customers.reduce((t, c) => t + (c.estimate?.investmentMidXof ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="type-h1">Customers</h1>
        <p className="text-muted">
          Leads marked Won. Sizes and values are the estimates at the time of the request.
        </p>
      </header>

      <dl className="grid gap-4 sm:grid-cols-3">
        {[
          ["Customers", String(customers.length)],
          ["Estimated capacity", formatKwp(kwp)],
          ["Estimated value", formatXofCompact(value)],
        ].map(([label, v]) => (
          <div key={label} className="bg-paper ring-line rounded-[var(--radius-md)] p-5 ring-1">
            <dt className="type-small text-muted">{label}</dt>
            <dd className="type-figure-sm">{v}</dd>
          </div>
        ))}
      </dl>

      {customers.length === 0 ? (
        <div className="bg-paper ring-line rounded-[var(--radius-md)] p-8 ring-1">
          <p className="font-semibold">No customers yet.</p>
          <p className="text-muted mt-1">
            When a lead is marked Won on its page, it appears here.{" "}
            <Link
              href="/admin/leads?status=proposal"
              className="text-ink underline underline-offset-2"
            >
              See leads with a proposal sent
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {customers.map((c) => (
            <li
              key={c.id}
              className="bg-paper ring-line hover:ring-ink relative flex flex-col gap-3 rounded-[var(--radius-md)] p-5 ring-1"
            >
              <h2 className="font-semibold">
                <Link href={`/admin/leads/${c.id}`} className="after:absolute after:inset-0">
                  {c.contact.company ?? c.contact.name}
                </Link>
              </h2>
              <p className="type-small text-muted">
                {c.site.segment ? SEGMENT_LABEL[c.site.segment] : "Site type unknown"}
                {c.site.location ? `, ${LOCATION[c.site.location].label}` : ""}
              </p>
              <dl className="border-line mt-auto grid grid-cols-3 gap-3 border-t pt-3">
                <div>
                  <dt className="type-small text-muted">System</dt>
                  <dd className="tabular font-semibold">
                    {c.estimate ? formatKwp(c.estimate.systemKwp) : ""}
                  </dd>
                </div>
                <div>
                  <dt className="type-small text-muted">Value</dt>
                  <dd className="tabular font-semibold">
                    {c.estimate ? formatXofCompact(c.estimate.investmentMidXof) : ""}
                  </dd>
                </div>
                <div>
                  <dt className="type-small text-muted">Updated</dt>
                  <dd className="font-semibold">{formatDate(c.updatedAt)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
