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
import { Dumbbell, LayoutDashboard, Settings, Utensils } from "lucide-react";
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
      {/* Onboarding Wizard */}
      {needsOnboarding && (
        <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
      )}

      <div className="flex h-screen bg-gray-50">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                {/* Logo */}
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Dumbbell className="w-6 h-6 text-green-600" />
                  JackedAI
                </h1>

                {/* Tabs */}
                <nav className="flex items-center gap-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                          activeTab === tab.id
                            ? "bg-green-100 text-green-700"
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Settings */}
              <button
                onClick={() => setActiveTab("settings")}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  activeTab === "settings"
                    ? "bg-green-100 text-green-700"
                    : "text-gray-500 hover:bg-gray-100"
                )}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Tab Content */}
          <main className="flex-1 overflow-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading...</div>
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
