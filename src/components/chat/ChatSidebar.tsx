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
      ? "Log exercise or meal... (e.g., 'I did 3 sets of bench press at 60kg')"
      : "Ask for fitness advice... (e.g., 'How do I improve my squat form?')";

  return (
    <div
      className={`${
        isOpen ? "w-96" : "w-0"
      } border-l border-gray-200 bg-white transition-all duration-300 flex flex-col relative`}
    >
      {isOpen && (
        <>
          {/* Header with mode toggle */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                {mode === "butler" ? "Butler" : "Trainer"}
              </h2>
            </div>
            <ModeToggle mode={mode} onModeChange={setMode} />
          </div>

          {/* Mode description */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-500">
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
          <div className="p-4 border-t border-gray-200">
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
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-10 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-l-lg p-2 hover:bg-gray-50 shadow-sm"
        title={isOpen ? "Collapse chat" : "Expand chat"}
      >
        {isOpen ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
