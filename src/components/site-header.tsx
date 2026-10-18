"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <header className="border-b border-[#DCCFB8] bg-[#F5EFE3] text-[#2A2420]">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-lg tracking-tight">
          Kyle&apos;s <em className="font-normal text-[#8C3B2E]">Reading Room</em>
        </Link>
        <nav className="flex items-center gap-2" aria-label="Primary">
          <Link href="/add" className="px-2 py-1 text-sm text-[#5E5248]">
            Add
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
