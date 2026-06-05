import { beServerClient } from "@/lib/axios-instance";
import type {
  CancelMessageRequest,
  Conversation,
  ConversationApiRecord,
  ConversationCreate,
  ConversationList,
  ConversationMessageApiRecord,
  ConversationMessageCreate,
  ConversationMessagesRequest,
  ConversationMessagesResponse,
  ConversationUpdate,
  GetAllConversationsRequest,
} from "@/types/be-server";

export class BeServerClient {
  static async createConversation(
    body: ConversationCreate
  ): Promise<Conversation> {
    const response = await beServerClient.post<ConversationApiRecord>(
      "/conversations",
      {
        user_id: body.userId,
        title: body.title ?? null,
      }
    );
    return mapConversation(response.data);
  }

  static async getConversation(
    conversationId: string,
    _userId: string
  ): Promise<Conversation> {
    const response = await beServerClient.get<ConversationApiRecord>(
      `/conversations/${conversationId}`
    );
    return mapConversation(response.data);
  }

  static async getAllConversations(
    body: GetAllConversationsRequest
  ): Promise<ConversationList> {
    const response = await beServerClient.get<ConversationApiRecord[]>(
      "/conversations",
      { params: { user_id: body.userId } }
    );
    return { conversations: response.data.map(mapConversation) };
  }

  static async updateConversation(
    body: ConversationUpdate
  ): Promise<Conversation> {
    const response = await beServerClient.patch<ConversationApiRecord>(
      `/conversations/${body.id}`,
      {
        title: body.title ?? null,
      }
    );
    return mapConversation(response.data);
  }

  static async deleteConversation(
    conversationId: string,
    _userId: string
  ): Promise<void> {
    await beServerClient.delete(`/conversations/${conversationId}`);
  }

  static async getConversationMessages(
    body: ConversationMessagesRequest
  ): Promise<ConversationMessagesResponse> {
    const response = await beServerClient.get<ConversationMessageApiRecord[]>(
      `/conversations/${body.conversationId}/messages`
    );
    const messages = response.data.map(mapConversationMessage);

    return {
      messages,
      hasMore: false,
      nextOffset: messages.length,
      count: messages.length,
    };
  }

  static async createConversationMessage(
    conversationId: string,
    body: ConversationMessageCreate
  ): Promise<ConversationMessageApiRecord> {
    const response = await beServerClient.post<ConversationMessageApiRecord>(
      `/conversations/${conversationId}/messages`,
      body
    );
    return response.data;
  }

  static async cancelResponse(body: CancelMessageRequest): Promise<void> {
    await beServerClient.post("/conversation/cancel-response", body);
  }
}

function mapConversation(conversation: ConversationApiRecord): Conversation {
  return {
    id: conversation.id,
    userId: conversation.user_id,
    title: conversation.title ?? undefined,
    createdAt: conversation.created_at,
    updatedAt: conversation.updated_at,
  };
}

function mapConversationMessage(message: ConversationMessageApiRecord) {
  return {
    id: message.id,
    role: message.role === "agent" ? "assistant" : "user",
    parts: message.text ? [{ type: "text", text: message.text }] : [],
    metadata: {
      createdAt: message.created_at,
      ...(message.metadata ?? {}),
    },
  } as const;
}
