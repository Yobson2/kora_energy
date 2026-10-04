# Architecture

## 1. The product in one paragraph

A commercial-solar company's website has one business job: turn a visitor who is curious
about solar into a qualified lead, and give the sales team what they need to call that
lead back. Everything here serves that funnel — **calculator → quote request → lead →
pipeline → customer** — with the public case studies managed from the same back office.

## 2. Layers

```
app/
  (site)/             public pages — one route group, one layout (banner, header, footer)
  admin/              back office — login + (console) route group with its own shell
  api/                JSON API — route handlers only; no business logic lives here
  components/         UI, grouped by role: primitives/ forms/ nav/ visuals/ home/
                      calculator/ quote/ contact/ projects/ admin/ seo/
  content/            copy that isn't data: solutions, FAQ, navigation
  lib/                shared by browser and server — must stay free of Node APIs
    solar/            the estimator (pure), assumptions, panel layout
    domain.ts         the business vocabulary: lead statuses, sources, Project, Lead
    validation.ts     Zod schemas used by forms AND routes
    format.ts parse.ts estimate-query.ts api-client.ts
  server/             server-only (import "server-only"): store, repositories, auth, http
proxy.ts              first auth gate for /admin and /api/admin
```

Dependencies point one way: `components → lib`, `api → server → lib`. Nothing in `lib`
imports from `server`; nothing in `server` imports React.

## 3. Decisions

**One estimator, three callers.** [`estimate()`](app/lib/solar/estimate.ts) is pure and
synchronous. The calculator runs it in the browser for instant feedback; `/api/estimates`
exposes it to other clients; `/api/quotes` re-runs it on the raw inputs and stores the
result, so the estimate attached to a lead is never a number the browser supplied.

**The estimator sizes economically, not by rule of thumb.** It simulates an average day
hour by hour (load shape × consumption against the sun, with a battery carrying state of
charge across a warm-up day), weighted across clear, hazy and overcast day types. It then
grows the array until less than a set share of its output would be used on site. That rule
encodes a local fact: Côte d'Ivoire has no general export tariff, so surplus energy is
wasted money. Unit tests pin energy conservation, monotonic behaviour and plausible
payback ranges.

**Shared schemas.** Every form validates with the same Zod schema its API route uses. The
quote form validates per step using slices of the request schema, then the whole schema
before sending, then the server validates again. Error keys are paths
(`contact.email`), so server-side field errors map straight back onto the right step and
field.

**Storage behind an interface.** Routes call repositories (`server/leads.ts`,
`server/projects.ts`); repositories call `Store`. The shipped adapter is one JSON document
with serialised, atomic (write-then-rename) mutations, plus an in-memory adapter for
read-only hosts. The Postgres shape is in [docs/schema.sql](docs/schema.sql). Customers are
not a table: a customer is a lead marked Won, so the two can't drift apart.

**Derived, not stored, statistics.** The dashboard's figures — overdue replies, pipeline
kWp and value, win rate, source mix — are computed from the leads on every request.
There is no counter that can disagree with the records.

**Two auth gates.** `proxy.ts` redirects or 401s unauthenticated admin traffic. Every
admin page (`requireAdminPage`) and route (`requireAdmin`) verifies the session again, so a
matcher mistake can't expose data. Sessions are HMAC-signed tokens built on Web Crypto,
so the same code runs in the proxy and in routes. The server fails closed in production
without a secret. Passwords are scrypt-hashed and compared in constant time, and sign-in
errors don't reveal which emails exist.

**Defence in depth on public endpoints.** Same-origin check on every state-changing
request, per-IP rate limits (tight on sign-in), 32 KB body cap, honeypot field (bots get a
normal-looking success and nothing is stored), CSV export neutralises formula injection,
JSON-LD escapes `<`, and security headers (CSP, frame-ancestors, Permissions-Policy) are
set globally.

**Static where possible.** Public pages, solution pages and case studies are prerendered.
Publishing, editing or deleting a project in the back office calls `revalidatePath` for
the homepage, the index and the affected slugs.

**URL as state.** Calculator inputs are mirrored into the query string with
`history.replaceState` — shareable and bookmarkable, with no server round trip per
keystroke. The same parameters prefill the quote form. Back-office lead filters are a plain
GET form, so a filtered view is a link.

## 4. Design system

Tokens live in one `@theme` block in [app/globals.css](app/globals.css). The palette is
drawn from place, not motif: **ink** (lagoon at dusk), **plaster** (Abidjan's modernist
render), **sun**. **Laterite** and **lagoon** are data colours with fixed meanings: grid
energy and stored energy. One typeface, Archivo, uses its width axis for display versus
body. Semantic type classes (`.type-h1`, `.type-figure` …) carry whole responsive specs.
`Container` is the only place the page width is expressed.

Photography is free-licence stock (Unsplash, Mixkit), registered once in
[app/content/media.ts](app/content/media.ts) with alt text and credit, and used only where it
shows a kind of equipment or work — solution pages, the process, About. It never appears
on case studies: those are concepts, and are illustrated with roof plans generated from
each project's capacity
and footprint, and a unit test guarantees every seeded roof physically fits its array.

Motion is a single orchestrated moment (the day curve drawing in), gated on
`@media (scripting: enabled)` and disabled under `prefers-reduced-motion`.

## 5. Accessibility

Semantic landmarks and a skip link; one `h1` per page (checked by the e2e suite); native
`<details>` and `<dialog>` for disclosures and the mobile menu; real radio inputs behind
tile choices; every field wires its hint and error through `aria-describedby`; focus moves
to the first invalid field after validation, and to the step heading on step change; live
regions announce results and submission state; charts carry text alternatives; text colours
meet WCAG AA on their surfaces.

## 6. Known limits and next steps

- Rate limiting is per process. Multi-instance deployments need Redis/Upstash behind the
  same function.
- The JSON store is fine for a demo and small volumes; production should use Postgres.
- One back-office role. `admin_users` with roles is sketched in the schema.
- Notifications are log-only; an email or WhatsApp `Notifier` slots into `server/notify.ts`.
- The estimator doesn't model tariff escalation or panel degradation, and the page says so.
