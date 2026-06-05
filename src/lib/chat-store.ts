import { generateId, type UIMessage } from "ai";
import { existsSync, mkdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const CHAT_DIR = path.join(process.cwd(), ".chats");

export async function createChat(): Promise<string> {
  const id = generateId();
  await saveChat({ chatId: id, messages: [] });
  return id;
}

export async function loadChat(chatId: string): Promise<UIMessage[]> {
  try {
    return sanitizeMessages(
      JSON.parse(await readFile(getChatFile(chatId), "utf8"))
    );
  } catch (error) {
    if (isMissingFile(error)) return [];
    throw error;
  }
}

export async function saveChat({
  chatId,
  messages,
}: {
  chatId: string;
  messages: UIMessage[];
}): Promise<void> {
  await writeFile(
    getChatFile(chatId),
    JSON.stringify(sanitizeMessages(messages), null, 2)
  );
}

function getChatFile(chatId: string): string {
  if (!existsSync(CHAT_DIR)) mkdirSync(CHAT_DIR, { recursive: true });
  return path.join(CHAT_DIR, `${chatId}.json`);
}

function isMissingFile(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

function sanitizeMessages(messages: unknown): UIMessage[] {
  if (!Array.isArray(messages)) return [];

  return messages.filter(isNonEmptyUIMessage);
}

function isNonEmptyUIMessage(message: unknown): message is UIMessage {
  if (typeof message !== "object" || message === null) return false;

  const candidate = message as Partial<UIMessage>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.role === "string" &&
    Array.isArray(candidate.parts) &&
    candidate.parts.length > 0
  );
}
