import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_API_KEY } from "@/lib/config";
import { findSpecFile } from "@/lib/parser";
import fs from "fs";

const SYSTEM_PROMPT_BASE =
  "You are a product requirements assistant for BWATS, a recruiting/HR platform. You help analyze specs, suggest improvements, identify edge cases, and break down tasks.";

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();

    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array is required and must not be empty" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build system prompt with optional spec context
    let systemPrompt = SYSTEM_PROMPT_BASE;

    if (Array.isArray(context) && context.length > 0) {
      const specContents: string[] = [];

      for (const specId of context) {
        const filePath = findSpecFile(specId);
        if (filePath && fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, "utf-8");
          specContents.push(`--- Spec: ${specId} ---\n${content}`);
        }
      }

      if (specContents.length > 0) {
        systemPrompt += "\n\nHere are the relevant specs for context:\n\n" + specContents.join("\n\n");
      }
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    });

    // Create a ReadableStream that emits SSE events
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const data = JSON.stringify({ text: event.delta.text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          const errorData = JSON.stringify({ error: "Stream interrupted" });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
