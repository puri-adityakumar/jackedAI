"use client";

import { useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const profile = useQuery(api.userProfile.get);

  // Apply theme when profile loads or theme changes
  useEffect(() => {
    const theme: Theme = profile?.theme ?? "system";
    applyTheme(theme);
  }, [profile?.theme]);

  // Listen for system theme changes when using "system" preference
  useEffect(() => {
    const theme: Theme = profile?.theme ?? "system";
    
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [profile?.theme]);

  return <>{children}</>;
}
