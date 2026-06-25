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
  UIMessage,
  UIMessagePart,
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
