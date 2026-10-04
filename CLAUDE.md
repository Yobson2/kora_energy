# CLAUDE.md

Guidance for working in this repository.

## Commands

```bash
npm run dev          # dev server on :3000 (a server may already hold it; use -p 3100)
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
npm test             # vitest: estimator, panel layout, parsing
npm run check        # all of the above
node scripts/e2e.mjs --url=http://localhost:3000 [--shots=dir]   # Playwright, installed Chrome
```

A production server needs `KORA_SESSION_SECRET` (32+ chars); add `KORA_DEMO_LOGIN=true`
to sign in with the demo account outside development.

## What this is

Kora Energy: a FICTIONAL West African commercial-solar company  a portfolio concept with a
public site, a solar estimator, a lead-capture API and a back office. Read
[ARCHITECTURE.md](ARCHITECTURE.md) before structural changes.

Honesty rules that must survive any edit:

- The concept banner (`components/nav/concept-banner.tsx`) stays on every public page.
- Case studies are labelled as concept projects; contact details stay unusable
  (`.example` domains, placeholder numbers, district not street).
- Photos and film come only from `app/content/media.ts` (free licence, credited, captioned
  "illustrative"). Never put a photo on a case study  they are concepts, illustrated by
  generated roof plans. Re-encode new video with ffmpeg (~1.5 MB, muted, H.264, faststart).
- Never claim Kora offers financing or that figures are anything but estimates.

## Rules of the codebase

- **`app/lib` must not import from `app/server`** and must stay free of Node APIs  it
  runs in the browser. Server modules start with `import "server-only"`.
- **Validation lives in `app/lib/validation.ts`** and is used by both forms and routes.
  Never validate a request body by hand.
- **Routes are thin.** Parse with `parseBody`, guard with `requireAdmin` / `sameOrigin` /
  `rateLimit`, call a repository, respond with `ok` / `fail`. Business rules belong in
  `app/server/*.ts`.
- **Admin pages call `requireAdminPage()` themselves**, even though the layout and
  `proxy.ts` also check. Do not rely on the proxy alone.
- **Never accept computed figures from the client.** Estimates are recomputed server-side.
- **Design values come from `app/globals.css`.** A hex value or magic size in a component
  is a bug; add a token. `Container` is the only place page width and gutters are expressed.
- **Changing `app/lib/solar/assumptions.ts` changes every number on the site**  run the
  tests and update the explanation on the calculator page if the method changes.
- If you change a seeded project's size or roof, update `panel-layout.test.ts`; it proves
  each roof can hold its array.

## Two languages

The public site is in English (unprefixed: `/about`) and French (`/fr/about`). The back
office and the API are English and never prefixed. See ARCHITECTURE.md, "Languages".

- **Every visible string on a public page exists in both languages.** Page copy sits in a
  `COPY: Record<Locale, …>` (or `const fr: typeof en`) next to the component, so a
  missing French string fails the type check. Shared vocabulary is in
  `app/content/labels.ts`, solutions and FAQ carry French alongside English.
- **Write language-free paths** (`href="/calculator"`) and use `Link` /
  `ButtonLink` from `app/components/primitives`, never `next/link` directly on public
  pages: they add `/fr` for you. Code that writes the address itself goes through
  `localizePath`.
- **Public pages read the language with `pageLocale(params)`**; client components with
  `useLocale()`. Pass `locale` to server components that render text.
- **Forms validate with `publicSchemas(locale)`** and send `locale` to `apiRequest`;
  public routes answer in `requestLocale(request)`.
- **The concept banner and the honesty rules apply in French too.**

## Traps already hit

- A file named `layout.ts` anywhere under `app/` is treated as a route layout.
- `useSearchParams` needs a `<Suspense>` boundary or the page stops being static.
- In a hidden or background browser tab, `requestAnimationFrame` never fires, so React's
  batched Suspense reveal never happens  automated checks must use headless Playwright.
- On Windows, renaming over a file another request is reading fails with EPERM; the store
  retries (`renameWithRetry`).
- On Windows, a dev server killed abruptly leaves its `.next\dev\build\*.js` Turbopack
  workers running. Hundreds piled up once and exhausted the page file ("Fatal JavaScript
  out of memory", "paging file is too small", and a misleading "Can't resolve
  'tailwindcss'"). `predev` runs `scripts/kill-orphan-workers.mjs` to clear them.
- Calculator URL sync uses `history.replaceState`; `router.replace` refetches per keystroke.

- English pages are prerendered at `/en/…` and served at `/…` by a proxy rewrite, so
  `usePathname()` can read either form. Go through `splitLocale`, which accepts both,
  or hydration fails. Revalidate the internal `/en/…` and `/fr/…` paths.

## Data

`.data/kora.json` (gitignored) is created and seeded on first read. Delete it to reset the
demo data.
