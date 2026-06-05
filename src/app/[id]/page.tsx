import { notFound } from "next/navigation";

import { BeServerClient } from "@/lib/API/api-client/be-server-client";
import { getConversationUserId } from "@/lib/conversation-user";

import { AppShell } from "../app/_components/AppShell";
import { ChatMessageScreen } from "../app/_components/chat/ChatMessageScreen";

type ChatPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;

  if (!isValidChatId(id)) {
    notFound();
  }

  const userId = await getConversationUserId();
  const conversation = await BeServerClient.getConversation(id, userId);
  if (conversation.userId !== userId) {
    notFound();
  }

  const messages = await BeServerClient.getConversationMessages({
    conversationId: id,
    userId,
  });

  return (
    <AppShell>
      <ChatMessageScreen id={id} initialMessages={messages.messages} />
    </AppShell>
  );
}

function isValidChatId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,200}$/.test(id);
}
