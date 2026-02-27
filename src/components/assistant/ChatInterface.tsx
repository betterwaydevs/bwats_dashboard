"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/assistant/ChatMessage";
import { ContextSelector } from "@/components/assistant/ContextSelector";
import type { ChatMessage as ChatMessageType } from "@/lib/types";

const SUGGESTED_PROMPTS = [
  "Review this spec",
  "Identify edge cases",
  "Suggest test scenarios",
  "Break down into subtasks",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [selectedContext, setSelectedContext] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [availableSpecs, setAvailableSpecs] = useState<
    { id: string; title: string }[]
  >([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch available specs on mount
  useEffect(() => {
    async function fetchSpecs() {
      try {
        const res = await fetch("/api/backlog");
        if (res.ok) {
          const data = await res.json();
          const tasks = data.tasks ?? data ?? [];
          const specs = Array.from(
            new Map(
              tasks.map((t: { id: string; title: string }) => [
                t.id,
                { id: t.id, title: t.title },
              ])
            ).values()
          ) as { id: string; title: string }[];
          setAvailableSpecs(specs);
        }
      } catch {
        // silently fail
      }
    }
    fetchSpecs();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMessage: ChatMessageType = { role: "user", content: text.trim() };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setIsStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages,
            context: selectedContext,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to send message");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let assistantContent = "";

        // Add empty assistant message
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "" },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Parse SSE format
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const token =
                  parsed.text ??
                  parsed.choices?.[0]?.delta?.content ??
                  parsed.content ??
                  parsed.token ??
                  "";
                if (token) {
                  assistantContent += token;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                      role: "assistant",
                      content: assistantContent,
                    };
                    return newMessages;
                  });
                }
              } catch {
                // If not JSON, treat the data as raw text token
                assistantContent += data;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return newMessages;
                });
              }
            }
          }
        }
      } catch {
        setMessages((prev) => [
          ...prev.filter((m) => m.role !== "assistant" || m.content !== ""),
          {
            role: "assistant",
            content: "Sorry, an error occurred. Please try again.",
          },
        ]);
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming, selectedContext]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-3">
      {/* Context selector */}
      <ContextSelector
        selectedIds={selectedContext}
        onChange={setSelectedContext}
        availableSpecs={availableSpecs}
      />

      {/* Messages area */}
      <ScrollArea className="flex-1 rounded-md border">
        <div ref={scrollRef} className="flex flex-col gap-3 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 py-12">
              <p className="text-sm text-muted-foreground">
                Start a conversation with the BWATS assistant
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    className="h-auto whitespace-normal py-2 text-xs"
                    onClick={() => sendMessage(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => <ChatMessage key={i} message={msg} />)
          )}

          {isStreaming && messages[messages.length - 1]?.content === "" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Thinking...
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your specs, tasks, or project..."
          className="min-h-10 resize-none"
          rows={1}
          disabled={isStreaming}
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isStreaming}
          size="icon"
        >
          {isStreaming ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Send />
          )}
        </Button>
      </div>
    </div>
  );
}
