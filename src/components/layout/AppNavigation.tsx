"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { BrandLogo } from "./BrandLogo";
import { LocalDataNote } from "./LocalDataNote";
import { NAV_ITEMS } from "./nav-items";

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Header ponsel */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur md:hidden">
        <BrandLogo />
      </header>

      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface p-5 md:flex">
        <BrandLogo />
        <nav aria-label="Menu utama" className="mt-8 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  active ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-primary-light hover:text-ink",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <LocalDataNote />
      </aside>

      {/* Navigasi bawah ponsel */}
      <nav
        aria-label="Menu utama"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-4">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2 text-xs font-semibold",
                    active ? "text-primary" : "text-muted",
                  )}
                >
                  <span className={cn("rounded-full px-4 py-1 transition-colors", active && "bg-primary-light")}>
                    <Icon className="size-5" />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}