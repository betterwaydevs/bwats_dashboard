"use client";

import { Header } from "@/components/layout/Header";
import { ChatInterface } from "@/components/assistant/ChatInterface";

export default function AssistantPage() {
  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <Header
        title="AI Assistant"
        subtitle="Ask about specs, requirements, and tasks"
      />
      <div className="flex-1 min-h-0 mt-4">
        <ChatInterface />
      </div>
    </div>
  );
}
