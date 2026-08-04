import { routeHandlerAxiosInstance } from "@/lib/axios-instance";
import type {
  CancelMessageRequest,
  Conversation,
  ConversationCreate,
  ConversationList,
  ConversationMessageCreate,
  ConversationMessagesRequest,
  ConversationMessagesResponse,
  ConversationUpdate,
  GetAllConversationsRequest,
  McpServer,
  McpServerCreate,
  McpServerTestResult,
  McpServerUpdate,
  RelivoUser,
  RelivoUserProfileInput,
  RelivoUserSyncInput,
} from "@/types/be-server";

interface RouteHandlerStandardResponse {
  message: string;
  success: boolean;
}

interface RouteHandlerDataResponse<T> extends RouteHandlerStandardResponse {
  data?: T;
}

export class RouteHandlerClient {
  static async getRelivoUser() {
    return routeHandlerAxiosInstance.get<
      RouteHandlerDataResponse<RelivoUser | null>
    >("/api/user");
  }

  static async syncRelivoUser(body: RelivoUserSyncInput = {}) {
    return routeHandlerAxiosInstance.put<RouteHandlerDataResponse<RelivoUser>>(
      "/api/user",
      body
    );
  }

  static async updateRelivoUser(body: RelivoUserProfileInput) {
    return routeHandlerAxiosInstance.patch<
      RouteHandlerDataResponse<RelivoUser>
    >("/api/user", body);
  }

  static async getMcpServers() {
    return routeHandlerAxiosInstance.get<RouteHandlerDataResponse<McpServer[]>>(
      "/api/user/mcp-servers"
    );
  }

  static async createMcpServer(body: McpServerCreate) {
    return routeHandlerAxiosInstance.post<RouteHandlerDataResponse<McpServer>>(
      "/api/user/mcp-servers",
      body
    );
  }

  static async updateMcpServer(serverId: string, body: McpServerUpdate) {
    return routeHandlerAxiosInstance.patch<RouteHandlerDataResponse<McpServer>>(
      `/api/user/mcp-servers/${serverId}`,
      body
    );
  }

  static async deleteMcpServer(serverId: string) {
    return routeHandlerAxiosInstance.delete<RouteHandlerStandardResponse>(
      `/api/user/mcp-servers/${serverId}`
    );
  }

  static async testMcpServer(serverId: string) {
    return routeHandlerAxiosInstance.post<
      RouteHandlerDataResponse<McpServerTestResult>
    >(`/api/user/mcp-servers/${serverId}/test`);
  }

  static async createConversation(body: ConversationCreate) {
    return routeHandlerAxiosInstance.post<
      RouteHandlerDataResponse<Conversation>
    >("/api/ai/conversation", body);
  }

  static async getAllConversations(body: GetAllConversationsRequest) {
    void body;
    return routeHandlerAxiosInstance.post<
      RouteHandlerDataResponse<ConversationList>
    >("/api/ai/conversation/get-all", {});
  }

  static async getConversation(conversationId: string, userId?: string) {
    void userId;
    return routeHandlerAxiosInstance.get<
      RouteHandlerDataResponse<Conversation>
    >(`/api/ai/conversation/${conversationId}`);
  }

  static async updateConversation(
    conversationId: string,
    body: ConversationUpdate
  ) {
    return routeHandlerAxiosInstance.put<
      RouteHandlerDataResponse<Conversation>
    >(`/api/ai/conversation/${conversationId}`, body);
  }

  static async deleteConversation(conversationId: string, userId?: string) {
    void userId;
    return routeHandlerAxiosInstance.delete<RouteHandlerStandardResponse>(
      `/api/ai/conversation/${conversationId}`
    );
  }

  static async getConversationMessages(body: ConversationMessagesRequest) {
    return routeHandlerAxiosInstance.get<
      RouteHandlerDataResponse<ConversationMessagesResponse>
    >(`/api/ai/conversation/${body.conversationId}/messages`);
  }

  static async createConversationMessage(
    conversationId: string,
    body: ConversationMessageCreate
  ) {
    return routeHandlerAxiosInstance.post<
      RouteHandlerDataResponse<ConversationMessageCreate>
    >(`/api/ai/conversation/${conversationId}/messages`, body);
  }

  static async cancelConversationResponse(body: CancelMessageRequest) {
    return routeHandlerAxiosInstance.post<RouteHandlerStandardResponse>(
      `/api/ai/conversation/${body.userMessageRequest.conversationId}/messages/cancel`,
      body
    );
  }
}
