export const WORK_FUNCTIONS = [
  "engineering",
  "product",
  "design",
  "data",
  "marketing",
  "sales",
  "finance",
  "operations",
  "hr",
  "legal",
  "founder",
  "student",
  "other",
] as const;

export type WorkFunction = (typeof WORK_FUNCTIONS)[number];

export const TEAM_SIZES = ["1", "2-10", "11-50", "51-200", "200+"] as const;

export type TeamSize = (typeof TEAM_SIZES)[number];

/**
 * Keys this app writes into the free-form `preferences` bag. Namespaced away
 * from the documented short-value keys (`response_style`, `default_model`) so
 * long-form text never collides with them.
 */
export const PREFERENCE_KEYS = {
  aboutYou: "about_you",
  responsePreferences: "response_preferences",
} as const;

/**
 * Relivo account record as returned by `GET /users/{id}`. Keyed by the Clerk
 * user id — the same value used as `user_id` on conversations, files, and
 * memories. `private_metadata` is never returned to clients.
 *
 * List responses return a subset of these fields, so everything is optional.
 */
export interface RelivoUserApiRecord {
  id: string;
  external_id?: string | null;
  email?: string | null;
  email_verified?: boolean;
  phone_number?: string | null;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  image_url?: string | null;
  has_image?: boolean;
  work_function?: string | null;
  job_title?: string | null;
  company_name?: string | null;
  industry?: string | null;
  team_size?: string | null;
  timezone?: string | null;
  locale?: string | null;
  onboarding_completed?: boolean;
  preferences?: Record<string, unknown>;
  public_metadata?: Record<string, unknown>;
  unsafe_metadata?: Record<string, unknown>;
  password_enabled?: boolean;
  two_factor_enabled?: boolean;
  banned?: boolean;
  locked?: boolean;
  last_sign_in_at?: string | null;
  last_active_at?: string | null;
  clerk_created_at?: string | null;
  clerk_updated_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RelivoUser {
  id: string;
  externalId?: string;
  email?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  hasImage?: boolean;
  workFunction?: string;
  jobTitle?: string;
  companyName?: string;
  industry?: string;
  teamSize?: string;
  timezone?: string;
  locale?: string;
  onboardingCompleted?: boolean;
  preferences?: Record<string, unknown>;
  publicMetadata?: Record<string, unknown>;
  unsafeMetadata?: Record<string, unknown>;
  passwordEnabled?: boolean;
  twoFactorEnabled?: boolean;
  banned?: boolean;
  locked?: boolean;
  lastSignInAt?: string;
  lastActiveAt?: string;
  clerkCreatedAt?: string;
  clerkUpdatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Body for `PUT /users/{id}` (idempotent upsert). Clerk-owned fields are
 * overwritten on every sync; app-owned fields are only changed when supplied.
 */
export interface RelivoUserUpsert {
  external_id?: string | null;
  email?: string | null;
  email_verified?: boolean;
  phone_number?: string | null;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  image_url?: string | null;
  has_image?: boolean;
  work_function?: string | null;
  job_title?: string | null;
  company_name?: string | null;
  industry?: string | null;
  team_size?: string | null;
  timezone?: string | null;
  locale?: string | null;
  onboarding_completed?: boolean;
  preferences?: Record<string, unknown>;
  public_metadata?: Record<string, unknown>;
  unsafe_metadata?: Record<string, unknown>;
  password_enabled?: boolean;
  two_factor_enabled?: boolean;
  banned?: boolean;
  locked?: boolean;
  last_sign_in_at?: string | null;
  last_active_at?: string | null;
  clerk_created_at?: string | null;
  clerk_updated_at?: string | null;
}

/**
 * App-owned fields the browser may contribute to a sync. Deliberately narrow —
 * every Clerk-owned field is read server-side from Clerk, never from the client.
 */
export interface RelivoUserSyncInput {
  timezone?: string;
  locale?: string;
  onboarding_completed?: boolean;
}

/**
 * App-owned profile fields the settings form may write. Clerk-owned identity is
 * deliberately absent — it is refreshed from Clerk and would be overwritten.
 */
export interface RelivoUserProfileInput {
  work_function?: string | null;
  job_title?: string | null;
  company_name?: string | null;
  industry?: string | null;
  team_size?: string | null;
  preferences?: Record<string, unknown>;
}

/* ------------------------------------------------------------------ *
 * Custom MCP servers — remote (http/sse) servers a user registers by
 * URL, whose tools are bound into their agent only. Contract:
 * `relivo-be-server/docs/user_mcp_api.md`.
 * ------------------------------------------------------------------ */

export const MCP_TRANSPORTS = ["http", "sse"] as const;
export type McpTransport = (typeof MCP_TRANSPORTS)[number];

export const MCP_AUTH_TYPES = ["none", "bearer", "header", "oauth"] as const;
export type McpAuthType = (typeof MCP_AUTH_TYPES)[number];

export type McpServerStatus = "pending" | "ready" | "error" | "unauthorized";
export type McpOAuthRegistration = "manual" | "dynamic";

/** Server name pattern the backend enforces — it becomes part of a tool name. */
export const MCP_SERVER_NAME_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;

export interface McpToolSummary {
  name: string;
  description?: string | null;
}

/** Non-secret view of a server's auth config. Never carries a secret value. */
export interface McpAuthSummaryApiRecord {
  type: McpAuthType;
  configured?: boolean;
  header_names?: string[];
  oauth_client_id?: string | null;
  oauth_registration?: McpOAuthRegistration | null;
  scopes?: string[];
  token_expires_at?: string | null;
}

export interface McpAuthSummary {
  type: McpAuthType;
  configured: boolean;
  headerNames: string[];
  oauthClientId?: string;
  oauthRegistration?: McpOAuthRegistration;
  scopes: string[];
  tokenExpiresAt?: string;
}

export interface McpServerApiRecord {
  id: string;
  user_id: string;
  name: string;
  display_name?: string | null;
  description?: string | null;
  url: string;
  transport: McpTransport;
  auth: McpAuthSummaryApiRecord;
  enabled: boolean;
  status: McpServerStatus;
  status_detail?: string | null;
  tools?: McpToolSummary[];
  tool_count?: number;
  allowed_tools?: string[];
  timeout_seconds?: number;
  sse_read_timeout_seconds?: number;
  last_connected_at?: string | null;
  last_error_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface McpServer {
  id: string;
  userId: string;
  name: string;
  displayName?: string;
  description?: string;
  url: string;
  transport: McpTransport;
  auth: McpAuthSummary;
  enabled: boolean;
  status: McpServerStatus;
  statusDetail?: string;
  tools: McpToolSummary[];
  toolCount: number;
  allowedTools: string[];
  timeoutSeconds?: number;
  sseReadTimeoutSeconds?: number;
  lastConnectedAt?: string;
  lastErrorAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Auth material on the way in. Snake-cased because it is forwarded to the
 * backend verbatim — this is the only shape that ever carries a secret.
 */
export type McpAuthInput =
  | { type: "none" }
  | { type: "bearer"; token: string }
  | { type: "header"; headers: Record<string, string> }
  | {
      type: "oauth";
      client_id?: string;
      client_secret?: string;
      authorization_url?: string;
      token_url?: string;
      registration?: McpOAuthRegistration;
      scopes?: string[];
    };

export interface McpServerCreate {
  name: string;
  display_name?: string | null;
  description?: string | null;
  url: string;
  transport?: McpTransport;
  auth?: McpAuthInput;
  enabled?: boolean;
  allowed_tools?: string[];
  timeout_seconds?: number;
  sse_read_timeout_seconds?: number;
}

/** Every field optional. Omitting `auth` keeps the stored credentials. */
export interface McpServerUpdate {
  display_name?: string | null;
  description?: string | null;
  url?: string;
  transport?: McpTransport;
  auth?: McpAuthInput;
  enabled?: boolean;
  allowed_tools?: string[];
  timeout_seconds?: number;
  sse_read_timeout_seconds?: number;
}

export interface McpServerTestResultApiRecord {
  server_id: string;
  status: McpServerStatus;
  tools?: McpToolSummary[];
  tool_count?: number;
  latency_ms?: number | null;
  error?: string | null;
}

export interface McpServerTestResult {
  serverId: string;
  status: McpServerStatus;
  tools: McpToolSummary[];
  toolCount: number;
  latencyMs?: number;
  error?: string;
}

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
