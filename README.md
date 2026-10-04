# Kora Energy

**A product concept: the website and back office of a West African commercial-solar company.**

> Kora Energy is fictional. This is a portfolio project. No services are offered,
> the case studies are design studies, and every contact detail is a placeholder.
> The site says so on every page.

Kora helps businesses in Côte d'Ivoire — hotels, schools, clinics, shops, offices,
factories — work out whether solar makes sense for them, and turns that interest into a
qualified lead the sales team can act on.

## What to look at

|                     |                                                                                                                                                                                                                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The estimator**   | [`app/lib/solar/`](app/lib/solar) — an hour-by-hour simulation of a site's day against the sun, sized by an economic rule rather than a rule of thumb. Pure TypeScript; the same code runs in the browser, in the API and in the seed data.                                                                |
| **The calculator**  | `/calculator` — results update as you type, assumptions are shown under the result, inputs live in the URL, and the estimate carries into the quote form.                                                                                                                                                  |
| **The quote flow**  | `/quote` — four steps, validated per step against the same Zod schema the API uses, with focus management, a draft that survives a reload, and explicit loading / error / success states.                                                                                                                  |
| **The API**         | [`app/api/`](app/api) — consistent `{ data }` / `{ error: { code, message, fields } }` contract, same-origin checks, rate limiting, a honeypot, and the estimate recomputed server-side so stored figures can't be forged.                                                                                 |
| **The back office** | `/admin` — a pipeline dashboard where every figure is derived from records, lead triage with filters and CSV export, a status workflow with an activity timeline, and a case-study editor whose changes regenerate the public pages.                                                                       |
| **The design**      | Data drawn as the imagery — the day curve, roof plans generated from each project's numbers, the district map — plus credited free-licence photography and one ambient film (pausable, reduced-motion aware, loaded only when near the viewport). Case studies carry no photos, because they are concepts. |

Demo sign-in for the back office is shown on `/admin/login`.

## Running it

```bash
npm install
npm run dev            # http://localhost:3000
```

Checks:

```bash
npm run typecheck
npm run lint
npm test               # estimator, panel layout and input parsing (vitest)
npm run build

# End-to-end, against a running server, with the installed Chrome:
node scripts/e2e.mjs --url=http://localhost:3000
```

`npm run check` runs typecheck, lint, unit tests and build in sequence.

## Deploying

Set the variables in [`.env.example`](.env.example). In production the server refuses to
sign sessions without `KORA_SESSION_SECRET`. On a read-only or serverless host, set
`KORA_STORE=memory` (data resets on restart) or implement the Postgres adapter described
in [`docs/schema.sql`](docs/schema.sql).

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — structure, decisions and trade-offs.
- [docs/schema.sql](docs/schema.sql) — the relational model behind the store interface.

## Stack

Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS 4, Zod 4, Vitest,
Playwright. No UI kit, no chart library, no animation library.
