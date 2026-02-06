"use client";

import { PinLockScreen } from "@/components/auth/PinLockScreen";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { DietPanel } from "@/components/diet/DietPanel";
import { ExercisePanel } from "@/components/exercise/ExercisePanel";
import { Logo } from "@/components/Logo";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { PlansPanel } from "@/components/plans/PlansPanel";
import { ReminderPanel } from "@/components/reminder/ReminderPanel";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";

type Tab = "dashboard" | "exercise" | "diet" | "plans" | "reminders" | "settings";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const profile = useQuery(api.userProfile.get);
  const pinStatus = useQuery(api.pinProtection.getPinStatus);

  // Check if already verified in this session
  useEffect(() => {
    const verified = sessionStorage.getItem("pinVerified") === "true";
    setIsPinVerified(verified);
  }, []);

  // Show loading while checking profile and PIN status
  const isLoading = profile === undefined || pinStatus === undefined;

  // Show onboarding if no profile exists
  const needsOnboarding = profile === null && showOnboarding;

  // Show PIN lock screen if PIN is enabled and not yet verified this session
  const showPinLock = pinStatus?.enabled && !isPinVerified && !needsOnboarding;

  // Handle PIN unlock
  const handlePinUnlock = () => {
    setIsPinVerified(true);
  };

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

      {/* PIN Lock Screen */}
      {showPinLock && <PinLockScreen onUnlock={handlePinUnlock} />}

      <div className="flex h-screen bg-background">
        {/* Left Sidebar Navigation */}
        <AppSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isExpanded={sidebarExpanded}
          onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-card border-b border-border px-6 h-14 flex items-center shrink-0">
            <div className="flex items-center gap-2">
              <Logo className="w-6 h-6 text-foreground" />
              <span className="text-lg font-bold text-foreground tracking-wide">
                JackedAI
              </span>
              <span className="text-muted-foreground text-sm font-medium">x</span>
              <img
                src="/Tambo-Lockup.svg"
                alt="Tambo"
                className="h-5 dark:invert"
              />
            </div>
          </header>

          {/* Tab Content */}
          <main id="main-content" className="flex-1 overflow-auto p-6" role="tabpanel">
            {isLoading ? (
              <div className="flex items-center justify-center h-full gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" aria-hidden="true" />
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                {activeTab === "dashboard" && <DashboardPanel />}
                {activeTab === "exercise" && <ExercisePanel />}
                {activeTab === "diet" && <DietPanel />}
                {activeTab === "plans" && <PlansPanel />}
                {activeTab === "reminders" && <ReminderPanel />}
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
