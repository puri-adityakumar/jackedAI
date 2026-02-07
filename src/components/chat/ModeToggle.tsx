"use client";

import { cn } from "@/lib/utils";

export type AgentMode = "butler" | "trainer";

interface ModeToggleProps {
  mode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <fieldset className="flex items-center bg-muted p-0.5" role="radiogroup" aria-label="Assistant mode">
      <legend className="sr-only">Select assistant mode</legend>
      <button
        type="button"
        role="radio"
        aria-checked={mode === "butler"}
        onClick={() => onModeChange("butler")}
        className={cn(
          "px-2.5 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background cursor-pointer",
          mode === "butler"
            ? "bg-card text-foreground border border-border"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Butler
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={mode === "trainer"}
        onClick={() => onModeChange("trainer")}
        className={cn(
          "px-2.5 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background cursor-pointer",
          mode === "trainer"
            ? "bg-card text-foreground border border-border"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Trainer
      </button>
    </fieldset>
  );
}
