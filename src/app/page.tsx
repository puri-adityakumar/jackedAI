"use client";

import { PinLockScreen } from "@/components/auth/PinLockScreen";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { DietPanel } from "@/components/diet/DietPanel";
import { ExercisePanel } from "@/components/exercise/ExercisePanel";
import { Logo } from "@/components/Logo";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { PlansPanel } from "@/components/plans/PlansPanel";
import { ReminderPanel } from "@/components/reminder/ReminderPanel";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import { useQuery } from "convex/react";
import { Loader2, Menu, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";

type Tab = "dashboard" | "exercise" | "diet" | "plans" | "reminders" | "settings";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const profile = useQuery(api.userProfile.get);
  const pinStatus = useQuery(api.pinProtection.getPinStatus);

  useEffect(() => {
    const verified = sessionStorage.getItem("pinVerified") === "true";
    setIsPinVerified(verified);
  }, []);

  const isLoading = profile === undefined || pinStatus === undefined;
  const needsOnboarding = profile === null && showOnboarding;
  const showPinLock = pinStatus?.enabled && !isPinVerified && !needsOnboarding;

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
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {needsOnboarding && (
        <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
      )}

      {showPinLock && <PinLockScreen onUnlock={handlePinUnlock} />}

      <div className="flex h-screen bg-background overflow-hidden">
        {/* Left Sidebar - hidden on mobile */}
        <AppSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isExpanded={sidebarExpanded}
          onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-card border-b border-border px-4 md:px-6 h-12 md:h-14 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
              </button>
              <Logo className="w-6 h-6 text-foreground" />
              <span className="text-base md:text-lg font-bold text-foreground tracking-wide">
                JackedAI
              </span>
              <span className="text-muted-foreground text-xs md:text-sm font-medium">x</span>
              <img
                src="/Tambo-Lockup.svg"
                alt="Tambo"
                className="h-4 md:h-5 dark:invert"
              />
            </div>
            {/* Mobile settings shortcut */}
            <button
              onClick={() => {
                setActiveTab("settings");
                setMobileMenuOpen(false);
              }}
              className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" aria-hidden="true" />
            </button>
          </header>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-card border-b border-border">
              {[
                { id: "reminders" as const, label: "Reminders" },
                { id: "settings" as const, label: "Settings" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Tab Content */}
          <main
            id="main-content"
            className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6"
            role="tabpanel"
          >
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

        {/* Chat Sidebar - desktop sidebar + mobile overlay */}
        <ChatSidebar
          mobileOpen={mobileChatOpen}
          onMobileClose={() => setMobileChatOpen(false)}
        />
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isChatOpen={mobileChatOpen}
        onChatToggle={() => setMobileChatOpen(!mobileChatOpen)}
      />
    </TamboProvider>
  );
}
