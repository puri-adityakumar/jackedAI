"use client";

import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { DietPanel } from "@/components/diet/DietPanel";
import { ExercisePanel } from "@/components/exercise/ExercisePanel";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { components, tools } from "@/lib/tambo";
import { cn } from "@/lib/utils";
import { TamboProvider } from "@tambo-ai/react";
import { useQuery } from "convex/react";
import { Dumbbell, LayoutDashboard, Loader2, Settings, Utensils } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";

type Tab = "dashboard" | "exercise" | "diet" | "settings";

const tabs = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "exercise" as const, label: "Exercise Log", icon: Dumbbell },
  { id: "diet" as const, label: "Diet Log", icon: Utensils },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(true);

  const profile = useQuery(api.userProfile.get);

  // Show loading while checking profile
  const isLoading = profile === undefined;

  // Show onboarding if no profile exists
  const needsOnboarding = profile === null && showOnboarding;

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
    >
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Onboarding Wizard */}
      {needsOnboarding && (
        <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
      )}

      <div className="flex h-screen bg-background">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                {/* Logo */}
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Dumbbell className="w-6 h-6 text-primary" aria-hidden="true" />
                  JackedAI
                </h1>

                {/* Tabs */}
                <nav className="flex items-center gap-1" role="tablist" aria-label="Main navigation">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`${tab.id}-panel`}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          activeTab === tab.id
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Settings */}
              <button
                role="tab"
                aria-selected={activeTab === "settings"}
                aria-controls="settings-panel"
                aria-label="Settings"
                onClick={() => setActiveTab("settings")}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  activeTab === "settings"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Settings className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </header>

          {/* Tab Content */}
          <main id="main-content" className="flex-1 overflow-auto p-6" role="tabpanel">
            {isLoading ? (
              <div className="flex items-center justify-center h-full gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" aria-hidden="true" />
                <span className="text-muted-foreground">Loading…</span>
              </div>
            ) : (
              <>
                {activeTab === "dashboard" && <DashboardPanel />}
                {activeTab === "exercise" && <ExercisePanel />}
                {activeTab === "diet" && <DietPanel />}
                {activeTab === "settings" && <SettingsPanel />}
              </>
            )}
          </main>
        </div>

        {/* Chat Sidebar */}
        <ChatSidebar />
      </div>
    </TamboProvider>
  );
}
