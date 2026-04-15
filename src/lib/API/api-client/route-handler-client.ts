import { routeHandlerAxiosInstance } from "@/lib/axios-instance";
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

interface RouteHandlerStandardResponse {
  message: string;
  success: boolean;
}

interface RouteHandlerDataResponse<T> extends RouteHandlerStandardResponse {
  data?: T;
}

export class RouteHandlerClient {
  static async createConversation(body: ConversationCreate) {
    return routeHandlerAxiosInstance.post<
      RouteHandlerDataResponse<Conversation>
    >("/api/ai/conversation", body);
  }

  static async getAllConversations(body: GetAllConversationsRequest) {
    return routeHandlerAxiosInstance.post<
      RouteHandlerDataResponse<ConversationList>
    >("/api/ai/conversation/get-all", body);
  }

  static async getConversation(conversationId: string, userId: string) {
    return routeHandlerAxiosInstance.get<
      RouteHandlerDataResponse<Conversation>
    >(`/api/ai/conversation/${conversationId}?userId=${userId}`);
  }

  static async updateConversation(
    conversationId: string,
    body: ConversationUpdate
  ) {
    return routeHandlerAxiosInstance.put<
      RouteHandlerDataResponse<Conversation>
    >(`/api/ai/conversation/${conversationId}`, body);
  }

  static async deleteConversation(conversationId: string, userId: string) {
    return routeHandlerAxiosInstance.delete<RouteHandlerStandardResponse>(
      `/api/ai/conversation/${conversationId}?userId=${userId}`
    );
  }

  static async getConversationMessages(body: ConversationMessagesRequest) {
    return routeHandlerAxiosInstance.post<
      RouteHandlerDataResponse<ConversationMessagesResponse>
    >(`/api/ai/conversation/${body.conversationId}/messages`, body);
  }

  static async cancelConversationResponse(body: CancelMessageRequest) {
    return routeHandlerAxiosInstance.post<RouteHandlerStandardResponse>(
      `/api/ai/conversation/${body.userMessageRequest.conversationId}/messages/cancel`,
      body
    );
  }
}
