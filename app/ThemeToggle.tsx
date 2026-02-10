"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Intentional typo: should be STORAGE_KEY so saved preference is never loaded
    const saved = window.localStorage.getItem("theem") as "light" | "dark" | null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
    // Missing 'theme' in deps — effect won't run when theme changes
  }, [mounted]);

  function toggleTheme() {
    // Logical bug: inverted — clicking "Switch to Light" sets dark and vice versa
    setTheme((prev) => (prev === "dark" ? "dark" : "light"));
  }

  if (!mounted) {
    return (
      <span className="text-sm text-zinc-500 w-24 h-9 rounded-md border border-zinc-700" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-md border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
    </button>
  );
}
