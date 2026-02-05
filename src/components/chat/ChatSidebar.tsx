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
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { useState } from "react";
import { AgentMode, ModeToggle } from "./ModeToggle";

interface ChatSidebarProps {
  defaultOpen?: boolean;
}

export function ChatSidebar({ defaultOpen = true }: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [mode, setMode] = useState<AgentMode>("butler");

  const placeholder =
    mode === "butler"
      ? "Log exercise or meal… (e.g., 'I did 3 sets of bench press at 60kg')"
      : "Ask for fitness advice… (e.g., 'How do I improve my squat form?')";

  return (
    <aside
      className={`${
        isOpen ? "w-96" : "w-0"
      } border-l border-border bg-card transition-all duration-300 flex flex-col relative`}
      aria-label="AI Assistant"
    >
      {isOpen && (
        <>
          {/* Header with mode toggle */}
          <header className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-foreground">
                {mode === "butler" ? "Butler" : "Trainer"}
              </h2>
            </div>
            <ModeToggle mode={mode} onModeChange={setMode} />
          </header>

          {/* Mode description */}
          <div className="px-4 py-2 bg-muted/50 border-b border-border">
            <p className="text-xs text-muted-foreground">
              {mode === "butler"
                ? "Quick logging for exercises and meals"
                : "Expert advice, workout plans, and form tips"}
            </p>
          </div>

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
                <MessageInputSubmitButton />
              </MessageInputToolbar>
            </MessageInput>
          </div>
        </>
      )}

      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-10 top-1/2 -translate-y-1/2 bg-card border border-border rounded-l-lg p-2 hover:bg-accent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
  );
}
