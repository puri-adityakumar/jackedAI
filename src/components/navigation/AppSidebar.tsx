"use client";

import { cn } from "@/lib/utils";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  LayoutDashboard,
  Settings,
  Utensils,
} from "lucide-react";

type Tab = "dashboard" | "exercise" | "diet" | "plans" | "reminders" | "settings";

const navItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "exercise" as const, label: "Exercise", icon: Dumbbell },
  { id: "diet" as const, label: "Diet", icon: Utensils },
  { id: "plans" as const, label: "Plans", icon: ClipboardList },
  { id: "reminders" as const, label: "Reminders", icon: Bell },
];

interface AppSidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function AppSidebar({
  activeTab,
  onTabChange,
  isExpanded,
  onToggle,
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col bg-card border-r border-border transition-all duration-300 relative shrink-0",
        isExpanded ? "w-56" : "w-16"
      )}
      aria-label="Main navigation"
    >
      {/* Toggle */}
      <div className="flex items-center justify-center border-b border-border h-14">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col py-2" role="tablist" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${item.id}-panel`}
              onClick={() => onTabChange(item.id)}
              title={!isExpanded ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 h-11 cursor-pointer transition-colors relative",
                isExpanded ? "px-4" : "justify-center px-0",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground border-l-2 border-transparent"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              {isExpanded && (
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section - Settings */}
      <div className="border-t border-border py-2">
        <button
          role="tab"
          aria-selected={activeTab === "settings"}
          aria-controls="settings-panel"
          onClick={() => onTabChange("settings")}
          title={!isExpanded ? "Settings" : undefined}
          className={cn(
            "flex items-center gap-3 h-11 w-full cursor-pointer transition-colors",
            isExpanded ? "px-4" : "justify-center px-0",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            activeTab === "settings"
              ? "bg-primary/10 text-primary border-l-2 border-primary"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground border-l-2 border-transparent"
          )}
        >
          <Settings className="w-5 h-5 shrink-0" aria-hidden="true" />
          {isExpanded && (
            <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
              Settings
            </span>
          )}
        </button>
      </div>

    </aside>
  );
}
