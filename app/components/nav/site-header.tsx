"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Container } from "@/app/components/primitives/container";
import { ButtonLink } from "@/app/components/primitives/button";
import { Logo } from "@/app/components/nav/logo";
import { primaryNav } from "@/app/content/nav";
import { cn } from "@/app/lib/utils";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Sticky header. The mobile menu is a native <dialog> opened with showModal():
 * the platform supplies the focus trap, Escape-to-close, the inert background
 * and focus return, so none of it is re-implemented here.
 *
 * Open state lives in ONE useState; the dialog is synchronised to it.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    if (!menuOpen && dialog.open) dialog.close();
  }, [menuOpen]);

  // Navigating closes the menu. Keyed on the pathname, so it also covers the
  // browser back button, not only clicks inside the menu.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  return (
    <header className="bg-paper/95 border-line sticky top-0 z-20 border-b backdrop-blur-sm">
      <Container className="flex h-[var(--spacing-header)] items-center justify-between gap-6">
        <Link href="/" aria-label="Kora Energy home" className="rounded-[var(--radius-xs)]">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative block rounded-[var(--radius-xs)] px-3 py-2 text-[0.9375rem] font-medium transition-colors",
                      active ? "text-ink" : "text-muted hover:text-ink",
                      active &&
                        "after:bg-sun after:absolute after:inset-x-3 after:-bottom-[15px] after:h-[3px]"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href="/quote" variant="primary" className="hidden sm:inline-flex">
            Request a quote
          </ButtonLink>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="hover:bg-plaster -mr-2 rounded-[var(--radius-sm)] p-2 lg:hidden"
          >
            <Menu className="size-6" aria-hidden />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
      </Container>

      <dialog
        ref={dialogRef}
        aria-label="Site menu"
        onClose={() => setMenuOpen(false)}
        className="bg-paper text-ink m-0 h-dvh max-h-none w-full max-w-none p-0 backdrop:bg-transparent lg:hidden"
      >
        <div className="flex h-full flex-col">
          <div className="border-line flex h-[var(--spacing-header)] shrink-0 items-center justify-between border-b px-4">
            <Logo />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="hover:bg-plaster -mr-2 rounded-[var(--radius-sm)] p-2"
            >
              <X className="size-6" aria-hidden />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="flex flex-col">
              {[
                { label: "Home", href: "/" },
                ...primaryNav,
                { label: "Questions", href: "/faq" },
              ].map((link) => {
                const active = link.href === "/" ? pathname === "/" : isActive(pathname, link.href);
                return (
                  <li key={link.href} className="border-line border-b">
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "type-h3 flex items-center justify-between py-4",
                        active && "text-sun-deep"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-line flex flex-col gap-2 border-t p-4">
            <ButtonLink
              href="/quote"
              variant="primary"
              size="lg"
              onClick={() => setMenuOpen(false)}
            >
              Request a quote
            </ButtonLink>
            <ButtonLink
              href="/calculator"
              variant="outline"
              size="lg"
              onClick={() => setMenuOpen(false)}
            >
              Calculate your savings
            </ButtonLink>
          </div>
        </div>
      </dialog>
    </header>
  );
}
