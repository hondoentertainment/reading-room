"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const THEME_KEY = "krr-theme";

export function ThemeToggle() {
  function toggle() {
    const next = document.documentElement.classList.toggle("dark");
    localStorage.setItem(THEME_KEY, next ? "dark" : "light");
  }

  return (
    <Button type="button" variant="outline" size="icon" onClick={toggle} aria-label="Switch color theme">
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  );
}
