export enum ConversationStatus {
  UNKNOWN = 0,
  ACTIVE = 1,
  ARCHIVED = 2,
  CLOSED = 3,
  DELETED = 4,
  STREAMING = 5,
}

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  status?: ConversationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationCreate {
  userId?: string;
  title?: string;
  status?: ConversationStatus;
}

export interface ConversationUpdate {
  id: string;
  userId: string;
  title?: string;
  status?: ConversationStatus;
}

export interface ConversationList {
  conversations: Conversation[];
}

export interface GetAllConversationsRequest {
  userId: string;
}

export interface ConversationMessagesRequest {
  conversationId: string;
  userId?: string;
  limit?: number;
  offset?: number;
}

export interface TextPart {
  type: "text";
  text: string;
  state: string;
}

export interface UIMessagePart {
  type: string;
  text?: string;
  [key: string]: unknown;
}

export interface UIMessageMetadata {
  createdAt: string;
  tokens?: number;
}

export interface UIMessage {
  id: string;
  role: "user" | "assistant";
  parts: UIMessagePart[];
  metadata?: UIMessageMetadata;
  status?: string;
}

export interface ConversationMessagesResponse {
  messages: UIMessage[];
  hasMore: boolean;
  nextOffset: number;
  count: number;
}

export interface ConversationMessageCreate {
  role: "user" | "agent";
  text?: string | null;
  attachments?: AttachmentInput[];
  metadata?: Record<string, unknown> | null;
  tool_calls?: ConversationToolCallCreate[];
  reasoning_entries?: ConversationReasoningEntryCreate[];
}

export interface ConversationToolCallCreate {
  tool_call_id?: string | null;
  name: string;
  arguments?: unknown;
  result?: unknown;
  status?: "pending" | "running" | "completed" | "failed";
  sequence?: number;
}

export interface ConversationReasoningEntryCreate {
  content: string;
  summary?: string | null;
  metadata?: Record<string, unknown> | null;
  sequence?: number;
}

export interface ConversationApiRecord {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessageApiRecord {
  id: string;
  conversation_id: string;
  role: "user" | "agent";
  text: string | null;
  metadata: Record<string, unknown> | null;
  attachments?: AttachmentInput[];
  created_at: string;
  updated_at: string;
  tool_calls?: ConversationToolCallApiRecord[];
  reasoning_entries?: ConversationReasoningEntryApiRecord[];
}

export interface ConversationToolCallApiRecord {
  id: string;
  message_id: string;
  tool_call_id: string | null;
  name: string;
  arguments: unknown;
  result: unknown;
  status: "pending" | "running" | "completed" | "failed";
  sequence: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationReasoningEntryApiRecord {
  id: string;
  message_id: string;
  content: string;
  summary: string | null;
  metadata: Record<string, unknown> | null;
  sequence: number;
  created_at: string;
  updated_at: string;
}

export interface AttachmentInput {
  id?: string;
  url: string;
  mediaType: string;
  title: string;
  size?: number;
  providerFileId?: string;
}

export interface UserMessageRequest {
  conversationId: string;
  userId: string;
  userMessage: string;
  userMessageTimestamp: number;
  attachments: AttachmentInput[];
}

export interface CancelMessageRequest {
  responseId: string;
  userMessageRequest: UserMessageRequest;
}
