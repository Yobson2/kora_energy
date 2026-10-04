"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, Inbox, LayoutDashboard, Users } from "lucide-react";
import { cn } from "@/app/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Back office">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col">
        {ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 font-medium whitespace-nowrap transition-colors",
                  active ? "bg-ink-soft text-paper" : "text-on-ink-muted hover:text-paper"
                )}
              >
                <Icon className={cn("size-4.5", active && "text-sun")} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
