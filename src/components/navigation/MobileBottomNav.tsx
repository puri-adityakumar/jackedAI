"use client";

import { cn } from "@/lib/utils";
import {
  Dumbbell,
  LayoutDashboard,
  MessageSquare,
  Utensils,
  ClipboardList,
} from "lucide-react";

type Tab = "dashboard" | "exercise" | "diet" | "plans" | "reminders" | "settings";

const navItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "exercise" as const, label: "Exercise", icon: Dumbbell },
  { id: "diet" as const, label: "Diet", icon: Utensils },
  { id: "plans" as const, label: "Plans", icon: ClipboardList },
];

interface MobileBottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isChatOpen: boolean;
  onChatToggle: () => void;
}

export function MobileBottomNav({
  activeTab,
  onTabChange,
  isChatOpen,
  onChatToggle,
}: MobileBottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border md:hidden pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id && !isChatOpen;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                if (isChatOpen) onChatToggle();
              }}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] cursor-pointer transition-colors",
                "active:bg-accent/50",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Chat button */}
        <button
          onClick={onChatToggle}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] cursor-pointer transition-colors",
            "active:bg-accent/50",
            isChatOpen
              ? "text-primary"
              : "text-muted-foreground"
          )}
          aria-label="Open chat"
          aria-current={isChatOpen ? "page" : undefined}
        >
          <MessageSquare className="w-5 h-5" aria-hidden="true" />
          <span className="text-[10px] font-medium leading-none">Chat</span>
        </button>
      </div>
    </nav>
  );
}
