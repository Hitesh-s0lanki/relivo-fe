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
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationCreate {
  userId: string;
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
  userId: string;
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

export interface AttachmentInput {
  url: string;
  mediaType: string;
  title: string;
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
