"use client";

import { cn } from "@/lib/utils";

export type AgentMode = "butler" | "trainer";

interface ModeToggleProps {
  mode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onModeChange("butler")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
          mode === "butler"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        Butler
      </button>
      <button
        onClick={() => onModeChange("trainer")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
          mode === "trainer"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        Trainer
      </button>
    </div>
  );
}
