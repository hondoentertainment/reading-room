"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Shelf" },
  { href: "/add", label: "Add" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="min-w-0">
          <span className="block text-[0.65rem] tracking-[0.22em] text-muted-foreground uppercase">
            Personal shelf
          </span>
          <span className="font-display block truncate text-xl leading-none tracking-tight sm:text-2xl">
            Kyle&apos;s Reading Room
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/" || pathname.startsWith("/reading")
                : pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  active && "text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
