"use client";

import {
  MessageInput,
  MessageInputSubmitButton,
  MessageInputTextarea,
  MessageInputToolbar,
} from "@/components/tambo/message-input";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import {
  ThreadContent,
  ThreadContentMessages,
} from "@/components/tambo/thread-content";
import { cn } from "@/lib/utils";
import { useTamboThread, useTamboThreadList } from "@tambo-ai/react";
import { ChevronLeft, ChevronRight, ExternalLink, History, MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AgentMode, ModeToggle } from "./ModeToggle";

interface ChatSidebarProps {
  defaultOpen?: boolean;
  /** Mobile full-screen mode controlled by parent */
  mobileOpen?: boolean;
  /** Callback to close mobile chat */
  onMobileClose?: () => void;
}

export function ChatSidebar({
  defaultOpen = true,
  mobileOpen = false,
  onMobileClose,
}: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [mode, setMode] = useState<AgentMode>("butler");
  const { data: threads } = useTamboThreadList();
  const { switchCurrentThread, thread: currentThread } = useTamboThread();

  const recentThreads = useMemo(() => {
    if (!threads?.items) return [];
    return threads.items
      .filter((t) => t.id !== currentThread?.id)
      .slice(0, 3);
  }, [threads, currentThread?.id]);

  const placeholder =
    mode === "butler"
      ? "Log exercise or meal..."
      : "Ask for fitness advice...";

  return (
    <>
      {/* Mobile full-screen chat overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-background flex flex-col md:hidden"
          role="dialog"
          aria-label="Chat"
          aria-modal="true"
        >
          {/* Mobile header */}
          <header className="px-4 h-14 border-b border-border flex items-center justify-between shrink-0 bg-card">
            <div className="flex items-center gap-2">
              <button
                onClick={onMobileClose}
                className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
              <MessageSquare className="w-5 h-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-foreground">
                {mode === "butler" ? "Butler" : "Trainer"}
              </h2>
            </div>
            <Link
              href="/chat"
              className="p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              title="Open full chat"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </Link>
          </header>

          {/* Recent threads */}
          {recentThreads.length > 0 && (
            <div className="px-4 py-2 border-b border-border bg-card/50">
              <div className="flex items-center gap-1.5 mb-1.5">
                <History className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="text-xs font-medium text-muted-foreground">Recent</span>
              </div>
              <div className="space-y-0.5">
                {recentThreads.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => switchCurrentThread(t.id)}
                    className="w-full text-left px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors truncate cursor-pointer"
                  >
                    {t.name ?? `Thread ${t.id.substring(0, 8)}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mobile messages */}
          <ScrollableMessageContainer className="flex-1 p-4">
            <ThreadContent variant="default">
              <ThreadContentMessages />
            </ThreadContent>
          </ScrollableMessageContainer>

          {/* Mobile input */}
          <div className="p-3 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
            <MessageInput variant="bordered">
              <MessageInputTextarea placeholder={placeholder} />
              <MessageInputToolbar>
                <ModeToggle mode={mode} onModeChange={setMode} />
                <MessageInputSubmitButton />
              </MessageInputToolbar>
            </MessageInput>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex border-l border-border bg-card transition-all duration-300 flex-col relative",
          isOpen ? "md:w-96" : "md:w-0"
        )}
        aria-label="AI Assistant"
      >
        {isOpen && (
          <>
            {/* Header */}
            <header className="px-4 h-14 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-foreground">
                  {mode === "butler" ? "Butler" : "Trainer"}
                </h2>
              </div>
              <Link
                href="/chat"
                className="p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                title="Open full chat with history"
              >
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </Link>
            </header>

            {/* Recent threads */}
            {recentThreads.length > 0 && (
              <div className="px-4 py-2 border-b border-border">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <History className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                  <span className="text-xs font-medium text-muted-foreground">Recent</span>
                </div>
                <div className="space-y-0.5">
                  {recentThreads.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => switchCurrentThread(t.id)}
                      className="w-full text-left px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors truncate cursor-pointer"
                    >
                      {t.name ?? `Thread ${t.id.substring(0, 8)}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            <ScrollableMessageContainer className="flex-1 p-4">
              <ThreadContent variant="default">
                <ThreadContentMessages />
              </ThreadContent>
            </ScrollableMessageContainer>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <MessageInput variant="bordered">
                <MessageInputTextarea placeholder={placeholder} />
                <MessageInputToolbar>
                  <ModeToggle mode={mode} onModeChange={setMode} />
                  <MessageInputSubmitButton />
                </MessageInputToolbar>
              </MessageInput>
            </div>
          </>
        )}

        {/* Desktop Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -left-10 top-1/2 -translate-y-1/2 bg-card border border-border p-2 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={isOpen ? "Collapse chat panel" : "Expand chat panel"}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          )}
        </button>
      </aside>
    </>
  );
}
