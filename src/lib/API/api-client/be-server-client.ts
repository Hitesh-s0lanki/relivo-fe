import { beServerClient } from "@/lib/axios-instance";
import type {
  CancelMessageRequest,
  Conversation,
  ConversationCreate,
  ConversationList,
  ConversationMessagesRequest,
  ConversationMessagesResponse,
  ConversationUpdate,
  GetAllConversationsRequest,
} from "@/types/be-server";

export class BeServerClient {
  static async createConversation(
    body: ConversationCreate
  ): Promise<Conversation> {
    const response = await beServerClient.post<Conversation>(
      "/conversation/create",
      body
    );
    return response.data;
  }

  static async getConversation(
    conversationId: string,
    userId: string
  ): Promise<Conversation> {
    const response = await beServerClient.get<Conversation>(
      `/conversation/get/${conversationId}?user_id=${userId}`
    );
    return response.data;
  }

  static async getAllConversations(
    body: GetAllConversationsRequest
  ): Promise<ConversationList> {
    const response = await beServerClient.post<ConversationList>(
      "/conversation/get-all",
      body
    );
    return response.data;
  }

  static async updateConversation(
    body: ConversationUpdate
  ): Promise<Conversation> {
    const response = await beServerClient.put<Conversation>(
      "/conversation/update",
      body
    );
    return response.data;
  }

  static async deleteConversation(
    conversationId: string,
    userId: string
  ): Promise<void> {
    await beServerClient.delete(
      `/conversation/delete/${conversationId}?user_id=${userId}`
    );
  }

  static async getConversationMessages(
    body: ConversationMessagesRequest
  ): Promise<ConversationMessagesResponse> {
    const response = await beServerClient.post<ConversationMessagesResponse>(
      "/conversation/messages",
      body
    );
    return response.data;
  }

  static async cancelResponse(body: CancelMessageRequest): Promise<void> {
    await beServerClient.post("/conversation/cancel-response", body);
  }
}
