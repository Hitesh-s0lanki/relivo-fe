import axios from "axios";

import { beServerClient } from "@/lib/axios-instance";
import type {
  AttachmentInput,
  CancelMessageRequest,
  Conversation,
  ConversationApiRecord,
  ConversationCreate,
  ConversationList,
  ConversationMessageApiRecord,
  ConversationMessageCreate,
  ConversationMessagesRequest,
  ConversationMessagesResponse,
  ConversationToolCallApiRecord,
  ConversationUpdate,
  GetAllConversationsRequest,
  McpAuthSummary,
  McpAuthSummaryApiRecord,
  McpServer,
  McpServerApiRecord,
  McpServerCreate,
  McpServerTestResult,
  McpServerTestResultApiRecord,
  McpServerUpdate,
  RelivoUser,
  RelivoUserApiRecord,
  RelivoUserProfileInput,
  RelivoUserUpsert,
  UIMessage,
  UIMessagePart,
} from "@/types/be-server";

export class BeServerClient {
  /**
   * Returns the Relivo account record for a Clerk user, or `null` when no row
   * exists for them yet. A 404 means "not synced", not a failure.
   */
  static async getUser(userId: string): Promise<RelivoUser | null> {
    try {
      const response = await beServerClient.get<RelivoUserApiRecord>(
        `/users/${userId}`
      );
      return mapUser(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Idempotent upsert of the Relivo account row. Creates it when missing and
   * refreshes the Clerk-owned fields otherwise, leaving app-owned fields intact
   * unless the body supplies them.
   */
  static async upsertUser(
    userId: string,
    body: RelivoUserUpsert
  ): Promise<RelivoUser> {
    const response = await beServerClient.put<RelivoUserApiRecord>(
      `/users/${userId}`,
      body
    );
    return mapUser(response.data);
  }

  /**
   * Applies a partial update to the app-owned half of a user's profile.
   *
   * An empty body is a valid no-op that simply returns the current record.
   */
  static async updateUser(
    userId: string,
    body: RelivoUserProfileInput
  ): Promise<RelivoUser> {
    const response = await beServerClient.patch<RelivoUserApiRecord>(
      `/users/${userId}`,
      body
    );
    return mapUser(response.data);
  }

  /**
   * Shallow-merges into the preference bag. Sending `null` for a key removes it,
   * and keys this app does not know about are left untouched.
   */
  static async mergeUserPreferences(
    userId: string,
    patch: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const response = await beServerClient.patch<Record<string, unknown>>(
      `/users/${userId}/preferences`,
      patch
    );
    return response.data ?? {};
  }

  static async listMcpServers(userId: string): Promise<McpServer[]> {
    const response = await beServerClient.get<{
      servers: McpServerApiRecord[];
    }>(`/users/${userId}/mcp-servers`);
    return (response.data.servers ?? []).map(mapMcpServer);
  }

  static async createMcpServer(
    userId: string,
    body: McpServerCreate
  ): Promise<McpServer> {
    const response = await beServerClient.post<McpServerApiRecord>(
      `/users/${userId}/mcp-servers`,
      body
    );
    return mapMcpServer(response.data);
  }

  static async updateMcpServer(
    userId: string,
    serverId: string,
    body: McpServerUpdate
  ): Promise<McpServer> {
    const response = await beServerClient.patch<McpServerApiRecord>(
      `/users/${userId}/mcp-servers/${serverId}`,
      body
    );
    return mapMcpServer(response.data);
  }

  static async deleteMcpServer(
    userId: string,
    serverId: string
  ): Promise<void> {
    await beServerClient.delete(`/users/${userId}/mcp-servers/${serverId}`);
  }

  /**
   * Connects to a registered server and refreshes its discovered tools.
   *
   * A failed connection still returns 200 with the reason in the body, so a
   * rejected server surfaces as a result rather than as a thrown error.
   */
  static async testMcpServer(
    userId: string,
    serverId: string
  ): Promise<McpServerTestResult> {
    const response = await beServerClient.post<McpServerTestResultApiRecord>(
      `/users/${userId}/mcp-servers/${serverId}/test`
    );
    return mapMcpServerTestResult(response.data);
  }

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

function mapUser(user: RelivoUserApiRecord): RelivoUser {
  return {
    id: user.id,
    externalId: user.external_id ?? undefined,
    email: user.email ?? undefined,
    emailVerified: user.email_verified,
    phoneNumber: user.phone_number ?? undefined,
    username: user.username ?? undefined,
    firstName: user.first_name ?? undefined,
    lastName: user.last_name ?? undefined,
    fullName: user.full_name ?? undefined,
    imageUrl: user.image_url ?? undefined,
    hasImage: user.has_image,
    workFunction: user.work_function ?? undefined,
    jobTitle: user.job_title ?? undefined,
    companyName: user.company_name ?? undefined,
    industry: user.industry ?? undefined,
    teamSize: user.team_size ?? undefined,
    timezone: user.timezone ?? undefined,
    locale: user.locale ?? undefined,
    onboardingCompleted: user.onboarding_completed,
    preferences: user.preferences ?? undefined,
    publicMetadata: user.public_metadata ?? undefined,
    unsafeMetadata: user.unsafe_metadata ?? undefined,
    passwordEnabled: user.password_enabled,
    twoFactorEnabled: user.two_factor_enabled,
    banned: user.banned,
    locked: user.locked,
    lastSignInAt: user.last_sign_in_at ?? undefined,
    lastActiveAt: user.last_active_at ?? undefined,
    clerkCreatedAt: user.clerk_created_at ?? undefined,
    clerkUpdatedAt: user.clerk_updated_at ?? undefined,
    createdAt: user.created_at ?? undefined,
    updatedAt: user.updated_at ?? undefined,
  };
}

function mapMcpServer(server: McpServerApiRecord): McpServer {
  const tools = server.tools ?? [];

  return {
    id: server.id,
    userId: server.user_id,
    name: server.name,
    displayName: server.display_name ?? undefined,
    description: server.description ?? undefined,
    url: server.url,
    transport: server.transport,
    auth: mapMcpAuthSummary(server.auth),
    enabled: server.enabled,
    status: server.status,
    statusDetail: server.status_detail ?? undefined,
    tools,
    toolCount: server.tool_count ?? tools.length,
    allowedTools: server.allowed_tools ?? [],
    timeoutSeconds: server.timeout_seconds,
    sseReadTimeoutSeconds: server.sse_read_timeout_seconds,
    lastConnectedAt: server.last_connected_at ?? undefined,
    lastErrorAt: server.last_error_at ?? undefined,
    createdAt: server.created_at ?? undefined,
    updatedAt: server.updated_at ?? undefined,
  };
}

function mapMcpAuthSummary(auth: McpAuthSummaryApiRecord): McpAuthSummary {
  return {
    type: auth?.type ?? "none",
    configured: auth?.configured ?? false,
    headerNames: auth?.header_names ?? [],
    oauthClientId: auth?.oauth_client_id ?? undefined,
    oauthRegistration: auth?.oauth_registration ?? undefined,
    scopes: auth?.scopes ?? [],
    tokenExpiresAt: auth?.token_expires_at ?? undefined,
  };
}

function mapMcpServerTestResult(
  result: McpServerTestResultApiRecord
): McpServerTestResult {
  const tools = result.tools ?? [];

  return {
    serverId: result.server_id,
    status: result.status,
    tools,
    toolCount: result.tool_count ?? tools.length,
    latencyMs: result.latency_ms ?? undefined,
    error: result.error ?? undefined,
  };
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

function mapConversationMessage(
  message: ConversationMessageApiRecord
): UIMessage {
  const attachments =
    message.attachments ?? getMetadataAttachments(message.metadata);

  return {
    id: message.id,
    role: message.role === "agent" ? "assistant" : "user",
    parts: [
      ...mapConversationAttachments(attachments),
      ...mapConversationToolCalls(message.tool_calls),
      ...(message.text ? [{ type: "text", text: message.text }] : []),
    ],
    metadata: {
      createdAt: message.created_at,
      ...(message.metadata ?? {}),
    },
  };
}

function mapConversationAttachments(
  attachments: AttachmentInput[] | undefined
): UIMessagePart[] {
  if (!attachments?.length) return [];

  return attachments
    .filter(
      (attachment) =>
        typeof attachment.url === "string" &&
        typeof attachment.mediaType === "string" &&
        typeof attachment.title === "string"
    )
    .map((attachment) => ({
      type: "file",
      id: attachment.id,
      url: attachment.url,
      mediaType: attachment.mediaType,
      filename: attachment.title,
      title: attachment.title,
      size: attachment.size,
      providerFileId: attachment.providerFileId ?? attachment.id,
    }));
}

function getMetadataAttachments(
  metadata: Record<string, unknown> | null
): AttachmentInput[] | undefined {
  const attachments = metadata?.attachments;
  if (!Array.isArray(attachments)) return undefined;

  return attachments.filter(isAttachmentInput);
}

function isAttachmentInput(value: unknown): value is AttachmentInput {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Partial<AttachmentInput>;
  return (
    typeof candidate.url === "string" &&
    typeof candidate.mediaType === "string" &&
    typeof candidate.title === "string"
  );
}

function mapConversationToolCalls(
  toolCalls: ConversationToolCallApiRecord[] | undefined
): UIMessagePart[] {
  if (!toolCalls?.length) return [];

  return [...toolCalls]
    .sort((a, b) => a.sequence - b.sequence)
    .map((toolCall) => ({
      type: `tool-${toolCall.name}`,
      toolCallId: toolCall.tool_call_id ?? toolCall.id,
      toolName: toolCall.name,
      state: mapToolCallStatus(toolCall.status),
      input: toolCall.arguments,
      output: toolCall.result,
      errorText:
        toolCall.status === "failed"
          ? getToolCallErrorText(toolCall.result)
          : undefined,
    }));
}

function mapToolCallStatus(
  status: ConversationToolCallApiRecord["status"]
): string {
  if (status === "completed") return "output-available";
  if (status === "failed") return "output-error";
  if (status === "running") return "input-available";
  return "input-streaming";
}

function getToolCallErrorText(result: unknown): string | undefined {
  if (typeof result === "string") return result;
  if (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    typeof result.error === "string"
  ) {
    return result.error;
  }

  return undefined;
}
