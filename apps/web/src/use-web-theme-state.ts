import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

export function useWebThemeState() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("theme-mode");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", themeMode === "dark");
    }
    try {
      localStorage.setItem("theme-mode", themeMode);
    } catch {
      // ignore
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return { themeMode, toggleTheme };
}
