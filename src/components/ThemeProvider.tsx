"use client";

import { useQuery } from "convex/react";
import { useEffect, useLayoutEffect } from "react";
import { api } from "../../convex/_generated/api";

type Theme = "light" | "dark" | "system";

// Use layoutEffect on client, effect on server to avoid hydration mismatch
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      "content",
      isDark ? "#000000" : "#ffffff"
    );
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const profile = useQuery(api.userProfile.get);

  // Apply theme when profile loads or theme changes
  useIsomorphicLayoutEffect(() => {
    const theme: Theme = profile?.theme ?? "system";
    applyTheme(theme);
  }, [profile?.theme]);

  // Listen for system theme changes when using "system" preference
  useEffect(() => {
    const theme: Theme = profile?.theme ?? "system";

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = () => {
        applyTheme("system");
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [profile?.theme]);

  return <>{children}</>;
}
