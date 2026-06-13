import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const TITLE_MODEL = "gemini-2.5-flash-lite";

export function createFallbackConversationTitle(firstMessage?: string): string {
  const words = firstMessage?.trim().replace(/\s+/g, " ").split(" ") ?? [];
  const title = words.slice(0, 4).join(" ");

  return title || "New chat";
}

export async function generateConversationTitle(
  firstMessage: string
): Promise<string> {
  const trimmedMessage = firstMessage.trim();
  if (!trimmedMessage) return "New chat";

  const { text } = await generateText({
    model: google(TITLE_MODEL),
    system:
      "You write concise chat titles. Return only the title, no quotes, no punctuation, no markdown.",
    prompt: [
      "Create a clear 2 to 3 word title for this chat.",
      "Use title case.",
      "Do not use filler words like Help, Chat, Question, Request, or Discussion unless essential.",
      "",
      `First user message: ${trimmedMessage}`,
    ].join("\n"),
    temperature: 0.2,
    maxOutputTokens: 16,
  });

  return normalizeGeneratedTitle(text, trimmedMessage);
}

function normalizeGeneratedTitle(title: string, firstMessage: string): string {
  const normalized = title
    .replace(/^["'`]+|["'`.!?]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return createFallbackConversationTitle(firstMessage);

  const words = normalized.split(" ").slice(0, 3);
  return words.join(" ");
}
