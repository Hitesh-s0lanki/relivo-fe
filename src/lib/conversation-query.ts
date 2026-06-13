import type { Conversation, ConversationList } from "@/types/be-server";

export const CURRENT_USER_CONVERSATIONS_QUERY_KEY = [
  "conversations",
  "current-user",
] as const;

export function sortConversationsByUpdatedAt(
  conversations: Conversation[]
): Conversation[] {
  return conversations.toSorted(
    (first, second) =>
      new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
  );
}

export function upsertConversationInList(
  conversationList: ConversationList | undefined,
  conversation: Conversation
): ConversationList {
  const conversations = conversationList?.conversations ?? [];
  const nextConversations = [
    conversation,
    ...conversations.filter((current) => current.id !== conversation.id),
  ];

  return {
    conversations: sortConversationsByUpdatedAt(nextConversations),
  };
}
