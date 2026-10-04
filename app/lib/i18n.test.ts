import { describe, expect, it } from "vitest";
import { localizePath, splitLocale, switchLocalePath } from "./i18n";

describe("localizePath", () => {
  it("leaves English addresses unprefixed", () => {
    expect(localizePath("/calculator?bill=1", "en")).toBe("/calculator?bill=1");
    expect(localizePath("/", "en")).toBe("/");
  });

  it("prefixes French addresses, including the homepage and its query", () => {
    expect(localizePath("/projects/x", "fr")).toBe("/fr/projects/x");
    expect(localizePath("/", "fr")).toBe("/fr");
    expect(localizePath("/?a=1", "fr")).toBe("/fr?a=1");
    expect(localizePath("/about#concept", "fr")).toBe("/fr/about#concept");
  });

  it("never touches links that are not site pages", () => {
    for (const href of [
      "/api/quotes",
      "/admin/leads",
      "mailto:a@b.example",
      "https://x.example",
      "#main",
      "//cdn.example/x",
    ]) {
      expect(localizePath(href, "fr")).toBe(href);
    }
  });
});

describe("splitLocale", () => {
  it("reads the language from visible and internal pathnames alike", () => {
    expect(splitLocale("/fr/faq")).toEqual({ locale: "fr", path: "/faq" });
    expect(splitLocale("/fr")).toEqual({ locale: "fr", path: "/" });
    expect(splitLocale("/faq")).toEqual({ locale: "en", path: "/faq" });
    // A prerendered English page sees its internal path on the server.
    expect(splitLocale("/en/faq")).toEqual({ locale: "en", path: "/faq" });
  });

  it("does not mistake a path that merely starts with the letters", () => {
    expect(splitLocale("/francais")).toEqual({ locale: "en", path: "/francais" });
  });
});

describe("switchLocalePath", () => {
  it("maps a page to the same page in the other language", () => {
    expect(switchLocalePath("/solutions/backup", "fr")).toBe("/fr/solutions/backup");
    expect(switchLocalePath("/fr/solutions/backup", "en")).toBe("/solutions/backup");
    expect(switchLocalePath("/en/solutions/backup", "fr")).toBe("/fr/solutions/backup");
    expect(switchLocalePath("/fr", "en")).toBe("/");
  });
});
