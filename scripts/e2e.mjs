// End-to-end smoke test against a running server, using the installed Chrome.
//
//   node scripts/e2e.mjs --url=http://localhost:3000 [--shots=./e2e-shots]
//
// Walks the journeys that matter: every public page renders, the calculator
// computes, the quote flow validates and submits, the contact form submits,
// and the back office signs in, finds the new lead and moves it along the
// pipeline. Exits non-zero on the first failure. Every Playwright action is
// awaited and allowed to throw — a swallowed timeout reports a false pass.
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const BASE = (args.url ?? "http://localhost:3000").replace(/\/$/, "");
const SHOTS = args.shots;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];

async function step(name, fn) {
  const started = Date.now();
  try {
    await fn();
    results.push({ name, ok: true, ms: Date.now() - started });
    console.log(`  ✓ ${name}`);
  } catch (error) {
    results.push({ name, ok: false });
    console.error(`  ✗ ${name}\n    ${error.message.split("\n").slice(0, 8).join("\n    ")}`);
    throw error;
  }
}

async function shot(page, name) {
  if (!SHOTS) return;
  await mkdir(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: true });
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

const stamp = Date.now().toString(36);

try {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));

  console.log(`Kora e2e against ${BASE}`);

  await step("public pages render with one h1 each", async () => {
    for (const route of [
      "/",
      "/solutions",
      "/solutions/commercial",
      "/calculator",
      "/projects",
      "/projects/business-hotel-cocody",
      "/about",
      "/financing",
      "/faq",
      "/contact",
      "/quote",
      "/privacy",
    ]) {
      const response = await page.goto(BASE + route, { waitUntil: "networkidle" });
      expect(response?.status() === 200, `${route} returned ${response?.status()}`);
      const h1 = await page.locator("h1").count();
      expect(h1 === 1, `${route} has ${h1} h1 elements`);
      await shot(page, `page${route.replace(/\//g, "_") || "_home"}`);
    }
    const missing = await page.goto(BASE + "/projects/does-not-exist");
    expect(missing?.status() === 404, `unknown project returned ${missing?.status()}`);
  });

  await step("calculator updates as the visitor types", async () => {
    await page.goto(`${BASE}/calculator`, { waitUntil: "networkidle" });
    await page.getByLabel("Average monthly bill").fill("2 500 000");
    await page.getByText("Estimated saving", { exact: true }).waitFor();
    const saving = await page.locator("text=/ month").first().locator("..").innerText();
    expect(/FCFA/.test(saving), "no saving shown");
    expect(page.url().includes("bill=2500000"), `inputs not mirrored in the URL: ${page.url()}`);
    await shot(page, "calculator-result");
  });

  await step("quote flow validates each step and submits", async () => {
    await page.getByRole("link", { name: "Request a quote with this estimate" }).click();
    await page.waitForURL(/\/quote\?/);
    await page.locator("#step-title").waitFor();

    // Step 1: segment is prefilled from the calculator; the rest is required.
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByText("Choose the solution closest to what you need.").waitFor();
    expect(
      (await page.evaluate(() => document.activeElement?.id)) === "solution",
      "focus did not move to the first invalid field"
    );
    await page.getByLabel("Which solution is closest to what you need?").selectOption("business");
    await page.getByText("Within 6 months").click();
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 2: the bill came from the calculator.
    await page.getByRole("heading", { name: "Your energy use" }).waitFor();
    expect(
      (await page.getByLabel("Average monthly electricity bill").inputValue()).length > 0,
      "bill not prefilled"
    );
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 3: contact details, with a bad email first.
    await page.getByRole("heading", { name: "Your details" }).waitFor();
    await page.getByLabel("Full name").fill("E2E Reviewer");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Phone").fill("+225 07 00 00 00 02");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByText("Enter an email address like name@company.com.").waitFor();
    await page.getByLabel("Email").fill(`e2e-${stamp}@example.com`);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 4: review, then send.
    await page.getByRole("heading", { name: "Review and send" }).waitFor();
    await shot(page, "quote-review");
    await page.getByRole("button", { name: "Send quote request" }).click();
    await page.getByRole("heading", { name: /Request received/ }).waitFor();
    await shot(page, "quote-success");
  });

  await step("contact form validates and submits", async () => {
    await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Send message" }).click();
    await page.getByText("Tell us a little more — at least 20 characters.").waitFor();
    await page.getByLabel("Full name").fill("E2E Contact");
    await page.getByLabel("Email").fill(`contact-${stamp}@example.com`);
    await page.getByLabel("What is your message about?").selectOption("support");
    await page
      .getByLabel("Message", { exact: true })
      .fill("Checking that the contact form reaches the back office.");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Send message" }).click();
    await page.getByRole("heading", { name: "Message sent." }).waitFor();
  });

  await step("back office: sign in, find the lead, move it along", async () => {
    await page.goto(`${BASE}/admin/leads`);
    await page.waitForURL(/\/admin\/login/);
    await page.getByLabel("Email").fill("demo@kora-energy.example");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.getByText("That email and password do not match an account.").waitFor();
    await page.getByLabel("Password").fill("kora-demo-2026");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL(/\/admin\/leads$/);

    await page.getByLabel("Search").fill(`e2e-${stamp}`);
    await page.getByRole("button", { name: "Apply" }).click();
    await page.getByText("1 lead match these filters").waitFor();
    await shot(page, "admin-leads");
    await page.getByRole("link", { name: "E2E Reviewer" }).click();
    await page.getByRole("heading", { name: "Estimate at submission" }).waitFor();

    await page.getByRole("button", { name: "Contacted" }).click();
    await page.getByText("Moved from New to Contacted").waitFor();
    await page.getByLabel("Add a note").fill("Called from the e2e suite.");
    await page.getByRole("button", { name: "Save note" }).click();
    await page.getByText("Called from the e2e suite.").waitFor();
    await shot(page, "admin-lead");

    await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
    await shot(page, "admin-overview");
  });

  await step("mobile: menu opens as a dialog and closes on Escape", async () => {
    const mobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
    });
    const m = await mobile.newPage();
    await m.goto(`${BASE}/solutions`, { waitUntil: "networkidle" });
    const width = await m.evaluate(() => document.documentElement.scrollWidth);
    expect(width <= 390, `horizontal overflow on mobile: ${width}px`);
    await m.getByRole("button", { name: "Open menu" }).click();
    await m.getByRole("dialog", { name: "Site menu" }).waitFor();
    await shot(m, "mobile-menu");
    await m.keyboard.press("Escape");
    await m.getByRole("dialog", { name: "Site menu" }).waitFor({ state: "hidden" });
    await m.goto(`${BASE}/calculator?bill=900000&segment=restaurant`, { waitUntil: "networkidle" });
    await shot(m, "mobile-calculator");
    await mobile.close();
  });

  await step("no uncaught errors in the browser console", async () => {
    // 401/404/422 are deliberate in the flows above. caret-color mismatches
    // come from Playwright hiding the caret for screenshots, not from the app.
    const real = consoleErrors.filter(
      (e) => !/Failed to load resource.*(401|404|422)/.test(e) && !/caret-color/.test(e)
    );
    expect(real.length === 0, `console errors:\n${real.join("\n")}`);
  });

  console.log(`\n${results.length} checks passed.`);
} catch {
  process.exitCode = 1;
} finally {
  await browser.close();
}
