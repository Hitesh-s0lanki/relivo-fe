"use client";

import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Calculator,
  CheckCircle2,
  ChevronDown,
  Copy,
  FileIcon,
  Globe2,
  ImageIcon,
  Paperclip,
  Pencil,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  Wrench,
  XCircle,
} from "lucide-react";

import {
  Conversation as AIConversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Image as GeneratedImage } from "@/components/ai-elements/image";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { type ToolPart } from "@/components/ai-elements/tool";
import { ImageGallery } from "@/components/chat/image-gallery/ImageGallery";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { RELIVO_NEW_CHAT_EVENT } from "@/lib/chat-events";
import {
  CURRENT_USER_CONVERSATIONS_QUERY_KEY,
  upsertConversationInList,
} from "@/lib/conversation-query";
import { cn } from "@/lib/utils";
import type {
  AttachmentInput,
  Conversation as BeConversation,
  ConversationList,
} from "@/types/be-server";

const QUICK_ACTIONS = [
  {
    label: "Create an image",
    icon: ImageIcon,
    prompt: "Create an image prompt for",
  },
  {
    label: "Write or edit",
    icon: Pencil,
    prompt: "Help me write or edit",
  },
  {
    label: "Look something up",
    icon: Globe2,
    prompt: "Look something up about",
  },
  {
    label: "Analyze data",
    icon: Calculator,
    prompt: "Analyze this data for",
  },
];

const GENERIC_CHAT_ERROR_MESSAGE =
  "Something went wrong while sending your message. Please try again.";
const RELIVO_AI_UNAVAILABLE_MESSAGE =
  "Relivo AI is temporarily unavailable. Please try again in a moment.";
const CONVERSATION_ERROR_MESSAGE =
  "Unable to start this conversation. Please try again.";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  parts: ChatMessagePart[];
  createdAt?: string;
};

type ChatMessagePart =
  | { type: "text"; text: string }
  | ChatAttachmentPart
  | {
      type: `tool-${string}` | "dynamic-tool";
      toolCallId: string;
      toolCallIndex?: number;
      toolName?: string;
      state: string;
      input?: unknown;
      streamedInput?: string;
      output?: unknown;
      errorText?: string;
    }
  | {
      type: `data-${string}`;
      data: unknown;
      title?: string;
    }
  | {
      type: "error";
      errorText: string;
      data?: unknown;
    };

type ChatStreamPart =
  | { type: "start"; messageId: string }
  | { type: "text-start"; id: string }
  | { type: "text-delta"; id: string; delta: string }
  | { type: "text-end"; id: string }
  | {
      type: "tool-input-available";
      toolCallId: string;
      toolName: string;
      input: unknown;
    }
  | { type: "data-tool-call-chunk"; data: unknown }
  | { type: "data-agent-update"; data: unknown }
  | { type: "data-agent-event"; data: unknown }
  | {
      type: "error";
      errorText: string;
      data?: {
        status: number;
        message: string;
        error_tag: string;
      };
    }
  | { type: "finish" };

type ConversationMessageRequest = {
  role: "user" | "agent";
  text?: string | null;
  attachments?: ChatAttachmentPayload[];
};

type ChatAttachment = AttachmentInput;

type ChatAttachmentPayload = Pick<
  ChatAttachment,
  "url" | "mediaType" | "title" | "providerFileId"
>;

type ChatAttachmentPart = ChatAttachment & {
  type: "file";
  filename?: string;
  previewUrl?: string;
};

type UploadAttachmentsResponse = {
  attachments?: unknown[];
};

type RefreshAttachmentPresignedUrlResponse = {
  attachment?: unknown;
  expiresInSeconds?: number;
};

type ChatSubmitMessage = PromptInputMessage & {
  uploadedAttachments?: ChatAttachment[];
};

type PromptAttachmentFile = PromptInputMessage["files"][number] & {
  id?: string;
};

type AttachmentUploadState =
  | { status: "uploading" }
  | { status: "uploaded"; attachment: ChatAttachment }
  | { status: "error"; error: string };

type AttachmentUploadStateMap = Record<string, AttachmentUploadState>;

export function ChatMessageScreen({
  id,
  initialMessages,
  redirectToChatOnFirstMessage = false,
}: {
  id?: string;
  initialMessages: unknown[];
  redirectToChatOnFirstMessage?: boolean;
}) {
  const queryClient = useQueryClient();
  const [conversationId, setConversationId] = useState(id);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    normalizeInitialMessages(initialMessages)
  );
  const [status, setStatus] = useState<"ready" | "submitted" | "streaming">(
    "ready"
  );
  const [error, setError] = useState<Error | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const shouldRedirectToChatRef = useRef(redirectToChatOnFirstMessage);

  const isStreaming = status === "streaming" || status === "submitted";
  const visibleMessages = messages.filter(hasRenderableMessageParts);
  const hasMessages = visibleMessages.length > 0;
  const showAssistantPlaceholder =
    isStreaming && !lastAssistantMessageHasText(messages);

  useEffect(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    shouldRedirectToChatRef.current = redirectToChatOnFirstMessage;
    setConversationId(id);
    setInput("");
    setMessages(normalizeInitialMessages(initialMessages));
    setStatus("ready");
    setError(null);
  }, [id, initialMessages, redirectToChatOnFirstMessage]);

  useEffect(() => {
    function handleNewChat() {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      shouldRedirectToChatRef.current = true;
      setConversationId(undefined);
      setInput("");
      setMessages([]);
      setStatus("ready");
      setError(null);
    }

    window.addEventListener(RELIVO_NEW_CHAT_EVENT, handleNewChat);

    return () => {
      window.removeEventListener(RELIVO_NEW_CHAT_EVENT, handleNewChat);
    };
  }, []);

  useEffect(() => {
    if (!hasMessages) return;

    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: status === "streaming" ? "auto" : "smooth",
    });
  }, [hasMessages, messages, status]);

  const submitMessage = async (message: ChatSubmitMessage) => {
    const trimmed = message.text.trim();
    const files = message.files;
    if ((!trimmed && files.length === 0) || isStreaming) return;

    clearError();
    setInput("");

    const assistantId = createMessageId("msg");
    let activeConversationId = conversationId;
    let attachments: ChatAttachment[] = [];
    let attachmentPayloads: ChatAttachmentPayload[] = [];
    let assistantText = "";
    let receivedToolData = false;

    setStatus("submitted");

    try {
      if (!activeConversationId) {
        const conversation = await createConversation(
          getConversationTitleSeed(trimmed, files)
        );
        activeConversationId = conversation.id;
        setConversationId(activeConversationId);
        queryClient.setQueryData<ConversationList>(
          CURRENT_USER_CONVERSATIONS_QUERY_KEY,
          (conversationList) =>
            upsertConversationInList(conversationList, conversation)
        );
        window.setTimeout(() => {
          void queryClient.invalidateQueries({
            queryKey: CURRENT_USER_CONVERSATIONS_QUERY_KEY,
          });
        }, 3000);
      }

      if (!activeConversationId) {
        throw new Error("Conversation was not created");
      }

      attachments =
        message.uploadedAttachments ??
        (await uploadConversationAttachments(files, activeConversationId));
      attachmentPayloads = attachments.map(createAttachmentPayload);

      const userMessage: ChatMessage = {
        id: createMessageId("msgc"),
        role: "user",
        createdAt: new Date().toISOString(),
        parts: [
          ...attachments.map((attachment, index) =>
            createAttachmentPart(attachment, getFilePreviewUrl(files[index]))
          ),
          ...(trimmed ? [{ type: "text" as const, text: trimmed }] : []),
        ],
      };

      setMessages((currentMessages) => [...currentMessages, userMessage]);
      await createConversationMessage(activeConversationId, {
        role: "user",
        text: trimmed,
        attachments: attachmentPayloads,
      });

      if (shouldRedirectToChatRef.current) {
        shouldRedirectToChatRef.current = false;
        window.history.replaceState(
          null,
          "",
          `/${encodeURIComponent(activeConversationId)}`
        );
      }
    } catch (error) {
      const userFacingError = toUserFacingError(
        error,
        CONVERSATION_ERROR_MESSAGE
      );
      setError(userFacingError);
      setInput(message.text);
      setStatus("ready");
      throw userFacingError;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      await streamRelivoChat(
        {
          user_message: trimmed,
          thread_id: activeConversationId,
          stream_mode: ["updates", "messages"],
          attachments: attachmentPayloads,
        },
        {
          signal: abortController.signal,
          onPart: (part) => {
            setStatus("streaming");
            if (part.type === "text-delta") {
              assistantText += part.delta;
            }
            if (
              part.type === "tool-input-available" ||
              part.type === "data-tool-call-chunk" ||
              isToolOutputAgentUpdate(part)
            ) {
              receivedToolData = true;
            }

            setMessages((currentMessages) =>
              applyStreamPart(currentMessages, assistantId, part)
            );

            if (part.type === "error") {
              setError(new Error(getStreamErrorMessage(part)));
            }
          },
        }
      );
    } catch (error) {
      if (abortController.signal.aborted) return;
      setError(toUserFacingError(error, RELIVO_AI_UNAVAILABLE_MESSAGE));
    } finally {
      abortControllerRef.current = null;
      setStatus("ready");

      if (
        !abortController.signal.aborted &&
        activeConversationId &&
        !receivedToolData
      ) {
        await persistAssistantMessage(activeConversationId, assistantText);
      }
    }
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-950">
      <div ref={viewportRef} className="flex min-h-0 flex-1">
        {hasMessages ? (
          <ConversationView
            isStreaming={isStreaming}
            messages={visibleMessages}
            showAssistantPlaceholder={showAssistantPlaceholder}
          />
        ) : (
          <EmptyChatView
            conversationId={conversationId}
            input={input}
            isStreaming={isStreaming}
            onInputChange={setInput}
            onPromptSelect={setInput}
            onSubmitMessage={submitMessage}
            onStop={stop}
          />
        )}
      </div>

      {error && (
        <div className="mx-auto w-full max-w-2xl px-4 pb-3">
          <div className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            <span className="min-w-0 break-words">
              {error.message || GENERIC_CHAT_ERROR_MESSAGE}
            </span>
            <button
              type="button"
              onClick={clearError}
              className="shrink-0 cursor-pointer rounded px-2 py-1 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {hasMessages && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-white/85 via-white/45 to-transparent px-4 pt-2 pb-4 backdrop-blur-md dark:from-zinc-950/85 dark:via-zinc-950/45">
          <ChatComposer
            input={input}
            isStreaming={isStreaming}
            conversationId={conversationId}
            onInputChange={setInput}
            onStop={stop}
            onSubmitMessage={submitMessage}
          />
        </div>
      )}
    </div>
  );

  function clearError() {
    setError(null);
  }

  function stop() {
    abortControllerRef.current?.abort();
    setStatus("ready");
  }
}

function EmptyChatView({
  conversationId,
  input,
  isStreaming,
  onInputChange,
  onPromptSelect,
  onSubmitMessage,
  onStop,
}: {
  conversationId?: string;
  input: string;
  isStreaming: boolean;
  onInputChange: (value: string) => void;
  onPromptSelect: (value: string) => void;
  onSubmitMessage: (message: PromptInputMessage) => Promise<void>;
  onStop: () => void;
}) {
  return (
    <div className="flex h-full min-h-full w-full flex-1 items-center justify-center px-6 py-8">
      <div className="flex w-full max-w-3xl flex-col items-center">
        <div className="flex w-full -translate-y-8 flex-col items-center gap-7">
          <div className="text-center">
            <h1 className="text-2xl leading-tight font-medium text-zinc-950 sm:text-[28px] dark:text-zinc-50">
              Good to see you, Hitesh.
            </h1>
          </div>

          <div className="flex w-full justify-center">
            <ChatComposer
              input={input}
              isStreaming={isStreaming}
              conversationId={conversationId}
              onInputChange={onInputChange}
              onStop={onStop}
              onSubmitMessage={onSubmitMessage}
              variant="hero"
            />
          </div>

          <QuickActions onSelect={onPromptSelect} />
        </div>
      </div>
    </div>
  );
}

function ConversationView({
  isStreaming,
  messages,
  showAssistantPlaceholder,
}: {
  isStreaming: boolean;
  messages: ChatMessage[];
  showAssistantPlaceholder: boolean;
}) {
  const latestAssistantMessageId = getLatestAssistantMessageId(messages);

  return (
    <AIConversation className="size-full">
      <ConversationContent className="mx-auto w-full max-w-5xl gap-4 px-4 py-8 pb-72 sm:px-8 lg:px-14">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            isLatestAssistantMessage={message.id === latestAssistantMessageId}
            isStreaming={isStreaming}
            message={message}
          />
        ))}
        {showAssistantPlaceholder && <StreamingAssistantBubble />}
      </ConversationContent>
      <ConversationScrollButton className="bottom-60" />
    </AIConversation>
  );
}

function ChatMessage({
  isLatestAssistantMessage,
  isStreaming,
  message,
}: {
  isLatestAssistantMessage: boolean;
  isStreaming: boolean;
  message: ChatMessage;
}) {
  const isUser = message.role === "user";
  const text = getMessageText(message);
  const fileParts = message.parts.filter(isFilePart);
  const hasFileParts = message.parts.some(isFilePart);
  const hasToolParts = message.parts.some(isToolPart);
  const hasDataParts = message.parts.some(isDataPart);
  const hasErrorParts = message.parts.some(isErrorPart);
  const shouldRenderMessageContent = message.parts.some(
    (part) =>
      !isFilePart(part) && (part.type !== "text" || part.text.trim().length > 0)
  );

  if (
    !text.trim() &&
    !hasFileParts &&
    !hasToolParts &&
    !hasDataParts &&
    !hasErrorParts
  ) {
    return null;
  }

  return (
    <Message
      from={message.role}
      className={cn(isUser ? "max-w-[min(720px,90%)]" : "max-w-full")}
    >
      <MessageTimestamp
        createdAt={message.createdAt}
        align={isUser ? "right" : "left"}
      />

      {isUser && fileParts.length > 0 && (
        <UserAttachmentGrid parts={fileParts} />
      )}

      {shouldRenderMessageContent && (
        <MessageContent
          className={cn(
            "text-sm",
            isUser
              ? "rounded-[18px] bg-zinc-100 px-4 py-3 text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
              : "w-full max-w-[760px] overflow-visible leading-[1.55]"
          )}
        >
          {groupMessageParts(message.parts).map((group) => {
            if (group.type === "tools") {
              return (
                <ToolCallsStepper
                  key={`${message.id}-tools-${group.parts.map((part) => part.toolCallId).join("-")}`}
                  parts={group.parts}
                />
              );
            }

            const part = group.part;
            if (isFilePart(part)) {
              if (isUser) return null;

              return (
                <AttachmentPart
                  key={getMessagePartKey(message.id, part)}
                  part={part}
                />
              );
            }

            if (part.type === "text") {
              if (!part.text.trim()) return null;

              return isUser ? (
                <div
                  key={getMessagePartKey(message.id, part)}
                  className="break-words whitespace-pre-wrap"
                >
                  {part.text}
                </div>
              ) : (
                <MessageResponse
                  key={getMessagePartKey(message.id, part)}
                  className={cn(
                    "max-w-none text-sm leading-[1.55]",
                    "[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
                    "[&_ol]:my-2 [&_ol]:space-y-1 [&_ul]:my-2 [&_ul]:space-y-1",
                    "[&_li]:pl-1 [&_ol]:pl-5 [&_ul]:pl-5",
                    "[&_li::marker]:text-zinc-500 [&_li>p]:my-0",
                    "[&_h1]:mt-5 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold",
                    "[&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold",
                    "[&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold",
                    "[&_code]:text-[13px] [&_pre]:my-3 [&_pre]:max-w-full [&_pre]:overflow-x-auto"
                  )}
                >
                  {part.text}
                </MessageResponse>
              );
            }

            if (isDataPart(part)) {
              return (
                <DataPartCard
                  key={getMessagePartKey(message.id, part)}
                  part={part}
                />
              );
            }

            if (isErrorPart(part)) {
              return (
                <div
                  key={getMessagePartKey(message.id, part)}
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900/60"
                >
                  {part.errorText}
                </div>
              );
            }

            return null;
          })}
        </MessageContent>
      )}

      <ChatMessageActions
        isLatestAssistantMessage={isLatestAssistantMessage}
        isStreaming={isStreaming}
        isUser={isUser}
        text={text}
      />
    </Message>
  );
}

function MessageTimestamp({
  createdAt,
  align,
}: {
  createdAt?: string;
  align: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-500",
        align === "right" ? "pr-2 text-right" : "pl-1 text-left"
      )}
    >
      {formatMessageTime(createdAt)}
    </div>
  );
}

function ChatMessageActions({
  isLatestAssistantMessage,
  isStreaming,
  isUser,
  text,
}: {
  isLatestAssistantMessage: boolean;
  isStreaming: boolean;
  isUser: boolean;
  text: string;
}) {
  if (isUser || isStreaming || !isLatestAssistantMessage) {
    return null;
  }

  return (
    <MessageActions className="justify-start pl-1 text-zinc-400 opacity-100 transition-opacity dark:text-zinc-600">
      <MessageAction
        onClick={() => void navigator.clipboard?.writeText(text)}
        tooltip="Copy"
      >
        <Copy className="size-4" />
      </MessageAction>
      <MessageAction tooltip="Good response">
        <ThumbsUp className="size-4" />
      </MessageAction>
      <MessageAction tooltip="Bad response">
        <ThumbsDown className="size-4" />
      </MessageAction>
      <MessageAction tooltip="Regenerate response">
        <RotateCcw className="size-4" />
      </MessageAction>
    </MessageActions>
  );
}

type MessagePart = ChatMessage["parts"][number];

type MessagePartGroup =
  | { type: "single"; part: MessagePart }
  | { type: "tools"; parts: Extract<MessagePart, { toolCallId: string }>[] };

function ToolCallsStepper({
  parts,
}: {
  parts: Extract<MessagePart, { toolCallId: string }>[];
}) {
  const completedCount = parts.filter(
    (part) => normalizeToolState(part.state) === "output-available"
  ).length;
  const hasActive = parts.some((part) =>
    ["input-streaming", "input-available"].includes(
      normalizeToolState(part.state)
    )
  );

  return (
    <Collapsible className="my-1 w-full max-w-xl rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-2.5 py-1.5 text-left">
        <div className="flex min-w-0 items-center gap-2">
          <Wrench className="size-3.5 shrink-0 text-zinc-500" />
          <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Tool calls
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            {completedCount}/{parts.length} completed
          </span>
          {hasActive && (
            <Shimmer className="text-xs font-medium" duration={1.4}>
              Running
            </Shimmer>
          )}
        </div>
        <ChevronDown className="size-4 shrink-0 text-zinc-500 transition-transform data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-zinc-100 px-2.5 py-2 dark:border-zinc-900">
        <div className="space-y-1">
          {parts.map((part, index) => (
            <ToolStepItem
              isLast={index === parts.length - 1}
              key={part.toolCallId}
              part={part}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ToolStepItem({
  isLast,
  part,
}: {
  isLast: boolean;
  part: Extract<MessagePart, { toolCallId: string }>;
}) {
  const state = normalizeToolState(part.state);
  const hasInput = "input" in part && part.input !== undefined;
  const hasOutput = "output" in part && part.output !== undefined;
  const hasError = "errorText" in part && typeof part.errorText === "string";
  const isDone = state === "output-available";
  const isError = state === "output-error";
  const isOpenByDefault = !isDone || isError;

  return (
    <Collapsible defaultOpen={isOpenByDefault}>
      <div className="grid grid-cols-[16px_minmax(0,1fr)] gap-2">
        <div className="flex h-full flex-col items-center pt-0.5">
          <ToolStepIcon state={state} />
          {!isLast && (
            <div className="mt-1 min-h-4 flex-1 bg-zinc-200 px-px dark:bg-zinc-800" />
          )}
        </div>
        <div className="min-w-0 pb-1">
          <CollapsibleTrigger className="group inline-flex max-w-full items-center gap-2 rounded px-1 py-0.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900">
            <span className="min-w-0 truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {formatToolName(getToolPartName(part))}
            </span>
            <span className="shrink-0 text-xs text-zinc-500">
              {getCompactToolStatus(state)}
            </span>
            <ChevronDown className="size-3 shrink-0 text-zinc-400 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1 space-y-1.5 px-1 pb-1">
            {hasInput && <CompactJsonBlock label="Input" value={part.input} />}
            {hasOutput && (
              <CompactJsonBlock label="Output" value={part.output} />
            )}
            {hasError && (
              <div className="rounded bg-red-50 px-2 py-1 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
                {part.errorText}
              </div>
            )}
            {!hasInput && !hasOutput && !hasError && (
              <Shimmer className="text-xs font-medium" duration={1.4}>
                Preparing tool call
              </Shimmer>
            )}
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  );
}

function ToolStepIcon({ state }: { state: ToolPart["state"] }) {
  if (state === "output-available") {
    return <CheckCircle2 className="size-3.5 text-emerald-600" />;
  }

  if (state === "output-error") {
    return <XCircle className="size-3.5 text-red-600" />;
  }

  return (
    <span className="mt-0.5 size-3 rounded-full border-2 border-zinc-400" />
  );
}

function CompactJsonBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <details className="rounded bg-zinc-50 px-2 py-1 text-xs dark:bg-zinc-900">
      <summary className="cursor-pointer font-medium text-zinc-600 dark:text-zinc-300">
        {label}
      </summary>
      <pre className="mt-1 max-h-48 overflow-auto text-[11px] leading-5 break-words whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
        {stringifyUnknown(value)}
      </pre>
    </details>
  );
}

function UserAttachmentGrid({ parts }: { parts: ChatAttachmentPart[] }) {
  const imageParts = parts.filter((part) =>
    isImageLikeFile(part.mediaType, part.title || part.filename)
  );
  const fileParts = parts.filter(
    (part) => !isImageLikeFile(part.mediaType, part.title || part.filename)
  );

  return (
    <div className="ml-auto flex max-w-full flex-col items-end gap-3">
      {imageParts.length > 0 && (
        <AttachmentImageGallery
          key={`message-attachments-${imageParts.map((part) => part.providerFileId ?? part.url).join("-")}`}
          keyProp={`message-attachments-${imageParts.map((part) => part.providerFileId ?? part.url).join("-")}`}
          parts={imageParts}
        />
      )}
      {fileParts.length > 0 && (
        <div className="flex max-w-full flex-wrap justify-end gap-3">
          {fileParts.map((part) => (
            <AttachmentFileTile
              key={getMessagePartKey("attachment", part)}
              part={part}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AttachmentPart({ part }: { part: ChatAttachmentPart }) {
  if (isImageLikeFile(part.mediaType, part.title || part.filename)) {
    return (
      <AttachmentImageGallery
        key={`message-attachment-${part.providerFileId ?? part.url}`}
        keyProp={`message-attachment-${part.providerFileId ?? part.url}`}
        parts={[part]}
      />
    );
  }

  return <AttachmentFileTile part={part} />;
}

function AttachmentImageGallery({
  keyProp,
  parts,
}: {
  keyProp: string;
  parts: ChatAttachmentPart[];
}) {
  const [images, setImages] = useState(() =>
    parts.map((part) => part.previewUrl ?? part.url)
  );
  const [isRefreshingPreview, setIsRefreshingPreview] = useState(() =>
    parts.some((part) => !part.previewUrl && !!part.providerFileId)
  );

  useEffect(() => {
    let ignore = false;

    const refreshableParts = parts
      .map((part, index) => ({ index, part }))
      .filter(({ part }) => !part.previewUrl && !!part.providerFileId);

    if (refreshableParts.length === 0) return;

    void Promise.all(
      refreshableParts.flatMap(({ index, part }) => {
        if (!part.providerFileId) return [];

        return [
          refreshAttachmentPresignedUrl(part.providerFileId).then(
            (attachment) => ({ attachment, index })
          ),
        ];
      })
    )
      .then((refreshed) => {
        if (ignore) return;
        setImages((currentImages) => {
          const nextImages = [...currentImages];
          for (const { attachment, index } of refreshed) {
            nextImages[index] = attachment.url;
          }
          return nextImages;
        });
      })
      .finally(() => {
        if (ignore) return;
        setIsRefreshingPreview(false);
      });

    return () => {
      ignore = true;
    };
  }, [parts]);

  return (
    <div className="relative">
      <ImageGallery
        disableDownload
        images={images}
        isThumbnailMode
        keyProp={keyProp}
      />
      {isRefreshingPreview && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-[18px] bg-black/20 text-white">
          <Spinner className="size-5" />
        </div>
      )}
    </div>
  );
}

function AttachmentFileTile({ part }: { part: ChatAttachmentPart }) {
  const title = part.title || part.filename || "Attachment";
  return (
    <a
      className="group relative grid size-32 shrink-0 place-items-center overflow-hidden rounded-[18px] bg-zinc-100 text-zinc-500 shadow-sm ring-1 ring-zinc-200/70 transition hover:bg-zinc-50 sm:size-40 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800"
      href={part.url}
      rel="noreferrer"
      target="_blank"
      title={title}
    >
      <div className="flex min-w-0 flex-col items-center gap-2 px-3 text-center">
        <FileIcon className="size-8 text-zinc-500 dark:text-zinc-400" />
        <span className="line-clamp-2 max-w-full text-xs font-medium text-zinc-600 dark:text-zinc-300">
          {title}
        </span>
      </div>
      {typeof part.size === "number" && (
        <span className="absolute right-2 bottom-2 rounded bg-white/85 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 shadow-sm dark:bg-zinc-950/80 dark:text-zinc-300">
          {formatFileSize(part.size)}
        </span>
      )}
    </a>
  );
}

function isImageLikeFile(mediaType?: string, filename?: string): boolean {
  if (mediaType?.startsWith("image/")) return true;
  if (!filename) return false;

  return /\.(avif|gif|jpe?g|png|webp|svg)$/i.test(filename);
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function DataPartCard({
  part,
}: {
  part: Extract<MessagePart, { type: `data-${string}` }>;
}) {
  const image = getGeneratedImage(part.data);

  if (image) {
    return (
      <GeneratedImage
        alt={image.alt}
        base64={image.base64}
        className="max-h-[420px] rounded-lg border border-border object-contain"
        mediaType={image.mediaType}
        uint8Array={new Uint8Array()}
      />
    );
  }

  return (
    <div className="max-w-2xl rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
      <div className="mb-2 font-medium text-foreground">
        {formatDataPartTitle(part.type)}
      </div>
      <pre className="max-h-56 overflow-auto whitespace-pre-wrap">
        {stringifyUnknown(part.data)}
      </pre>
    </div>
  );
}

function StreamingAssistantBubble() {
  return (
    <div className="px-1 py-0.5">
      <Shimmer className="text-sm font-medium" duration={1.4}>
        Agent streaming
      </Shimmer>
    </div>
  );
}

function ChatComposer({
  conversationId,
  input,
  isStreaming,
  onInputChange,
  onStop,
  onSubmitMessage,
  variant = "compact",
}: {
  conversationId?: string;
  input: string;
  isStreaming: boolean;
  onInputChange: (value: string) => void;
  onStop: () => void;
  onSubmitMessage: (message: ChatSubmitMessage) => Promise<void>;
  variant?: "compact" | "hero";
}) {
  const status = isStreaming ? "streaming" : "ready";
  const [uploadStates, setUploadStates] = useState<AttachmentUploadStateMap>(
    {}
  );
  const uploadStatesRef = useRef<AttachmentUploadStateMap>({});
  const fileIdsRef = useRef<string[]>([]);

  useEffect(() => {
    uploadStatesRef.current = uploadStates;
  }, [uploadStates]);

  function handleSubmit(message: PromptInputMessage) {
    const fileIds = fileIdsRef.current;
    const states = uploadStatesRef.current;
    const hasUploading = fileIds.some(
      (id) => states[id]?.status === "uploading"
    );
    const hasError = fileIds.some((id) => states[id]?.status === "error");

    if (hasUploading) {
      throw new Error("Files are still uploading. Please wait.");
    }

    if (hasError) {
      throw new Error("Remove failed uploads before sending.");
    }

    const uploadedAttachments = fileIds.flatMap((id) => {
      const state = states[id];
      return state?.status === "uploaded" ? [state.attachment] : [];
    });

    if (fileIds.length > 0 && uploadedAttachments.length !== fileIds.length) {
      throw new Error("Files are not ready yet. Please wait.");
    }

    return onSubmitMessage({
      ...message,
      uploadedAttachments:
        uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
    });
  }

  return (
    <PromptInput
      className={cn(
        "pointer-events-auto mx-auto w-full rounded-xl border border-zinc-300 bg-white shadow-lg shadow-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-950 dark:shadow-black/30",
        variant === "hero" ? "max-w-3xl" : "max-w-4xl"
      )}
      globalDrop
      maxFiles={4}
      maxFileSize={25 * 1024 * 1024}
      multiple
      onSubmit={handleSubmit}
    >
      <PromptInputAttachmentUploadSync
        conversationId={conversationId}
        fileIdsRef={fileIdsRef}
        setUploadStates={setUploadStates}
      />
      <PromptInputAttachmentPreview uploadStates={uploadStates} />
      <PromptInputTextarea
        className={cn(
          "min-h-12 text-[15px] leading-6 placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
          variant === "hero" ? "px-3 py-3" : "px-3 py-2"
        )}
        onChange={(event) => onInputChange(event.currentTarget.value)}
        placeholder="Ask anything"
        value={input}
      />
      <PromptInputFooter className="px-2 pb-2">
        <PromptInputTools>
          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger tooltip="Add file or image">
              <Paperclip className="size-4" />
            </PromptInputActionMenuTrigger>
            <PromptInputActionMenuContent
              align="start"
              className="min-w-56"
              side="top"
              sideOffset={8}
            >
              <PromptInputActionAddAttachments
                className="whitespace-nowrap"
                label="Add file"
              />
            </PromptInputActionMenuContent>
          </PromptInputActionMenu>
        </PromptInputTools>

        <ChatComposerSubmit
          input={input}
          isStreaming={isStreaming}
          onStop={onStop}
          status={status}
          uploadStates={uploadStates}
        />
      </PromptInputFooter>
    </PromptInput>
  );
}

function ChatComposerSubmit({
  input,
  isStreaming,
  onStop,
  status,
  uploadStates,
}: {
  input: string;
  isStreaming: boolean;
  onStop: () => void;
  status: "ready" | "streaming";
  uploadStates: AttachmentUploadStateMap;
}) {
  const attachments = usePromptInputAttachments();
  const hasBlockingUpload = attachments.files.some((file) => {
    const state = uploadStates[file.id];
    return state?.status === "uploading" || state?.status === "error";
  });

  return (
    <PromptInputSubmit
      className="rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
      disabled={
        hasBlockingUpload ||
        (!input.trim() && attachments.files.length === 0 && !isStreaming)
      }
      onStop={onStop}
      status={status}
    />
  );
}

function PromptInputAttachmentUploadSync({
  conversationId,
  fileIdsRef,
  setUploadStates,
}: {
  conversationId?: string;
  fileIdsRef: MutableRefObject<string[]>;
  setUploadStates: Dispatch<SetStateAction<AttachmentUploadStateMap>>;
}) {
  const attachments = usePromptInputAttachments();
  const startedUploadIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentIds = attachments.files.map((file) => file.id);
    fileIdsRef.current = currentIds;
    startedUploadIdsRef.current.forEach((id) => {
      if (!currentIds.includes(id)) {
        startedUploadIdsRef.current.delete(id);
      }
    });

    setUploadStates((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([id]) => currentIds.includes(id))
      ) as AttachmentUploadStateMap;

      for (const file of attachments.files) {
        if (!next[file.id]) {
          next[file.id] = { status: "uploading" };
        }
      }

      return next;
    });

    for (const file of attachments.files) {
      if (startedUploadIdsRef.current.has(file.id)) continue;
      startedUploadIdsRef.current.add(file.id);

      void uploadConversationAttachments([file], conversationId)
        .then((uploadedAttachments) => {
          const attachment = uploadedAttachments[0];
          if (!attachment || !fileIdsRef.current.includes(file.id)) return;

          setUploadStates((current) => ({
            ...current,
            [file.id]: { status: "uploaded", attachment },
          }));
        })
        .catch((error) => {
          if (!fileIdsRef.current.includes(file.id)) return;

          setUploadStates((current) => ({
            ...current,
            [file.id]: {
              status: "error",
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to upload this file.",
            },
          }));
        });
    }
  }, [attachments.files, conversationId, fileIdsRef, setUploadStates]);

  return null;
}

function PromptInputAttachmentPreview({
  uploadStates,
}: {
  uploadStates: AttachmentUploadStateMap;
}) {
  const attachments = usePromptInputAttachments();
  if (attachments.files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 border-b border-border/60 px-3 py-2">
      {attachments.files.map((file) => {
        const isImage = file.mediaType?.startsWith("image/");
        const uploadState = uploadStates[file.id];
        const isUploading = uploadState?.status === "uploading";
        const isUploaded = uploadState?.status === "uploaded";
        const uploadError =
          uploadState?.status === "error" ? uploadState.error : undefined;

        return (
          <div
            key={file.id}
            className={cn(
              "group relative overflow-hidden rounded-md border border-border bg-muted",
              uploadError && "border-red-300 ring-1 ring-red-200"
            )}
            title={uploadError}
          >
            {isImage && file.url ? (
              <img
                alt={file.filename ?? "Attached image"}
                className="size-16 object-cover"
                src={file.url}
              />
            ) : (
              <div className="flex size-16 items-center justify-center px-2 text-center text-[10px] text-muted-foreground">
                {file.filename ?? "Attachment"}
              </div>
            )}
            {(isUploading || isUploaded || uploadError) && (
              <div
                className={cn(
                  "absolute inset-0 grid place-items-center bg-black/35 text-white",
                  isUploaded && "bg-emerald-700/35",
                  uploadError && "bg-red-700/45"
                )}
              >
                {isUploading ? (
                  <Spinner className="size-5" />
                ) : uploadError ? (
                  <XCircle className="size-5" />
                ) : (
                  <CheckCircle2 className="size-5" />
                )}
              </div>
            )}
            <button
              aria-label="Remove attachment"
              className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-black/65 text-[11px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => attachments.remove(file.id)}
              type="button"
            >
              x
            </button>
          </div>
        );
      })}
    </div>
  );
}

function QuickActions({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="flex max-w-2xl flex-wrap items-center justify-center gap-2">
      {QUICK_ACTIONS.map(({ label, icon: Icon, prompt }) => (
        <Button
          key={label}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSelect(prompt)}
          className="h-9 cursor-pointer rounded-full border-zinc-200 bg-white px-3.5 text-[13px] font-medium text-zinc-600 shadow-none hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <Icon className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
          {label}
        </Button>
      ))}
    </div>
  );
}

function hasMessageText(message: ChatMessage): boolean {
  return getMessageText(message).trim().length > 0;
}

function hasRenderableMessageParts(message: ChatMessage): boolean {
  return (
    hasMessageText(message) ||
    message.parts.some(
      (part) =>
        isFilePart(part) ||
        isToolPart(part) ||
        isDataPart(part) ||
        isErrorPart(part)
    )
  );
}

function getMessageText(message: ChatMessage): string {
  return message.parts
    .filter(
      (part): part is Extract<ChatMessagePart, { type: "text" }> =>
        part.type === "text"
    )
    .map((part) => part.text)
    .join("");
}

function lastAssistantMessageHasText(messages: ChatMessage[]): boolean {
  const lastAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");

  return lastAssistantMessage ? hasMessageText(lastAssistantMessage) : false;
}

function getLatestAssistantMessageId(messages: ChatMessage[]): string | null {
  return (
    [...messages].reverse().find((message) => message.role === "assistant")
      ?.id ?? null
  );
}

function groupMessageParts(parts: ChatMessagePart[]): MessagePartGroup[] {
  const groups: MessagePartGroup[] = [];

  for (const part of parts) {
    if (isToolPart(part)) {
      const lastGroup = groups.at(-1);
      if (lastGroup?.type === "tools") {
        lastGroup.parts.push(part);
      } else {
        groups.push({ type: "tools", parts: [part] });
      }
      continue;
    }

    groups.push({ type: "single", part });
  }

  return groups;
}

function getToolPartName(part: MessagePart): string {
  if (isToolPart(part) && part.type === "dynamic-tool") {
    return part.toolName ?? "tool";
  }

  return part.type.replace(/^tool-/, "");
}

function formatToolName(toolName: string): string {
  return toolName
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeToolState(state: string): ToolPart["state"] {
  const validStates = new Set<ToolPart["state"]>([
    "approval-requested",
    "approval-responded",
    "input-available",
    "input-streaming",
    "output-available",
    "output-denied",
    "output-error",
  ]);

  return validStates.has(state as ToolPart["state"])
    ? (state as ToolPart["state"])
    : "input-available";
}

function getCompactToolStatus(state: ToolPart["state"]): string {
  return (
    {
      "approval-requested": "approval",
      "approval-responded": "responded",
      "input-available": "running",
      "input-streaming": "pending",
      "output-available": "completed",
      "output-denied": "denied",
      "output-error": "error",
    }[state] ?? state
  );
}

function formatDataPartTitle(type: string): string {
  return formatToolName(type.replace(/^data-/, "agent-"));
}

function stringifyUnknown(value: unknown): string {
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function getGeneratedImage(data: unknown): {
  alt: string;
  base64: string;
  mediaType: string;
} | null {
  const candidate = unwrapDataRecord(data);
  if (!candidate) return null;

  const base64 = getFirstString(candidate, ["base64", "b64_json", "data"]);
  const mediaType =
    getFirstString(candidate, ["mediaType", "mimeType", "mime_type"]) ??
    "image/png";

  if (!base64 || !mediaType.startsWith("image/")) return null;

  return {
    alt:
      getFirstString(candidate, ["alt", "prompt", "title"]) ??
      "Generated image",
    base64: base64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, ""),
    mediaType,
  };
}

function unwrapDataRecord(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) return null;
  if (isRecord(value.image)) return value.image;
  if (Array.isArray(value.images) && isRecord(value.images[0])) {
    return value.images[0];
  }

  return value;
}

function getFirstString(
  value: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    if (typeof value[key] === "string") return value[key];
  }

  return undefined;
}

function getMessagePartKey(messageId: string, part: MessagePart): string {
  if ("toolCallId" in part)
    return `${messageId}-${part.type}-${part.toolCallId}`;
  if (isFilePart(part)) {
    return `${messageId}-file-${part.id ?? part.providerFileId ?? part.url}`;
  }
  if (part.type === "text")
    return `${messageId}-text-${part.text.slice(0, 40)}`;

  return `${messageId}-${part.type}`;
}

function normalizeInitialMessages(messages: unknown[]): ChatMessage[] {
  return messages.flatMap((message) => {
    if (!isRecord(message)) return [];
    if (message.role !== "user" && message.role !== "assistant") return [];
    if (!Array.isArray(message.parts)) return [];

    const parts = message.parts.flatMap(normalizePart);
    if (parts.length === 0) return [];

    return [
      {
        id:
          typeof message.id === "string" ? message.id : createMessageId("msg"),
        role: message.role,
        createdAt:
          typeof message.createdAt === "string"
            ? message.createdAt
            : getMetadataCreatedAt(message.metadata),
        parts,
      },
    ];
  });
}

function getMetadataCreatedAt(metadata: unknown): string | undefined {
  if (!isRecord(metadata) || typeof metadata.createdAt !== "string") {
    return undefined;
  }

  return metadata.createdAt;
}

function createAttachmentPart(
  attachment: ChatAttachment,
  previewUrl?: string
): ChatAttachmentPart {
  return {
    ...attachment,
    type: "file",
    filename: attachment.title,
    previewUrl,
  };
}

function getFilePreviewUrl(
  file: PromptInputMessage["files"][number] | undefined
): string | undefined {
  if (!file?.url || !isImageLikeFile(file.mediaType, file.filename)) {
    return undefined;
  }

  return file.url;
}

function createAttachmentPayload(
  attachment: ChatAttachment
): ChatAttachmentPayload {
  const providerFileId = attachment.providerFileId ?? attachment.id;

  return {
    url: attachment.url,
    mediaType: attachment.mediaType,
    title: attachment.title,
    ...(providerFileId ? { providerFileId } : {}),
  };
}

function normalizeAttachment(value: unknown): ChatAttachment | null {
  if (!isRecord(value)) return null;

  const url = getFirstString(value, ["url"]);
  const id = getFirstString(value, ["id"]);
  const mediaType = getFirstString(value, [
    "mediaType",
    "media_type",
    "mimeType",
    "mime_type",
  ]);
  const title =
    getFirstString(value, ["title", "filename", "name"]) ?? "Attachment";
  const providerFileId =
    getFirstString(value, [
      "providerFileId",
      "provider_file_id",
      "fileId",
      "file_id",
    ]) ?? id;

  if (!url || !mediaType) return null;

  return {
    id,
    url,
    mediaType,
    title,
    providerFileId,
    size: typeof value.size === "number" ? value.size : undefined,
  };
}

function getConversationTitleSeed(
  trimmedMessage: string,
  files: PromptInputMessage["files"]
): string {
  if (trimmedMessage) return trimmedMessage;

  const firstFilename = files.find((file) => file.filename)?.filename;
  return firstFilename ? `Uploaded ${firstFilename}` : "Uploaded attachment";
}

function normalizePart(part: unknown): ChatMessagePart[] {
  if (!isRecord(part) || typeof part.type !== "string") return [];

  if (part.type === "text" && typeof part.text === "string") {
    return [{ type: "text", text: part.text }];
  }

  if (part.type === "file") {
    const attachment = normalizeAttachment(part);
    return attachment ? [createAttachmentPart(attachment)] : [];
  }

  if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
    const toolCallId =
      typeof part.toolCallId === "string"
        ? part.toolCallId
        : createMessageId("tool");

    return [
      {
        type: part.type as `tool-${string}` | "dynamic-tool",
        toolCallId,
        toolCallIndex:
          typeof part.toolCallIndex === "number"
            ? part.toolCallIndex
            : undefined,
        toolName: typeof part.toolName === "string" ? part.toolName : undefined,
        state: typeof part.state === "string" ? part.state : "output-available",
        input: "input" in part ? part.input : undefined,
        streamedInput:
          typeof part.streamedInput === "string"
            ? part.streamedInput
            : undefined,
        output: "output" in part ? part.output : undefined,
        errorText:
          typeof part.errorText === "string" ? part.errorText : undefined,
      },
    ];
  }

  if (part.type.startsWith("data-")) {
    return [
      {
        type: part.type as `data-${string}`,
        data: "data" in part ? part.data : part,
      },
    ];
  }

  return [];
}

async function uploadConversationAttachments(
  files: PromptAttachmentFile[],
  conversationId?: string
): Promise<ChatAttachment[]> {
  if (files.length === 0) return [];

  const formData = new FormData();
  if (conversationId) {
    formData.append("conversationId", conversationId);
  }

  const uploadFiles = await Promise.all(files.map(createUploadFile));
  for (const file of uploadFiles) {
    formData.append("files[]", file);
  }

  const response = await fetch("/api/ai/uploads", {
    method: "POST",
    body: formData,
  });

  const data =
    await readRouteHandlerResponse<UploadAttachmentsResponse>(response);
  const attachments =
    data?.attachments?.map(normalizeAttachment).filter(isChatAttachment) ?? [];

  if (attachments.length === 0) {
    throw new Error("Files were not uploaded. Please try again.");
  }

  return attachments;
}

async function createUploadFile(file: PromptAttachmentFile): Promise<File> {
  const filename = file.filename || "attachment";
  const mediaType = file.mediaType || "application/octet-stream";

  if (!file.url) {
    throw new Error(`Unable to read ${filename}. Please try again.`);
  }

  const response = await fetch(file.url);
  if (!response.ok) {
    throw new Error(`Unable to read ${filename}. Please try again.`);
  }

  const blob = await response.blob();
  return new File([blob], filename, {
    type: blob.type || mediaType,
  });
}

function isChatAttachment(value: unknown): value is ChatAttachment {
  if (!isRecord(value)) return false;

  return (
    typeof value.url === "string" &&
    typeof value.mediaType === "string" &&
    typeof value.title === "string"
  );
}

async function refreshAttachmentPresignedUrl(
  providerFileId: string
): Promise<ChatAttachment> {
  const response = await fetch(
    `/api/ai/uploads/${encodeURIComponent(providerFileId)}/presigned-url`
  );
  const data =
    await readRouteHandlerResponse<RefreshAttachmentPresignedUrlResponse>(
      response
    );
  const attachment = normalizeAttachment(data?.attachment);

  if (!attachment) {
    throw new Error("Unable to refresh this file preview.");
  }

  return attachment;
}

async function streamRelivoChat(
  request: {
    user_message: string;
    thread_id: string;
    stream_mode: Array<"updates" | "messages">;
    attachments?: ChatAttachmentPayload[];
  },
  {
    signal,
    onPart,
  }: {
    signal: AbortSignal;
    onPart: (part: ChatStreamPart) => void;
  }
) {
  const response = await fetch("/api/relivo-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    const error = await readErrorResponse(response);
    throw new Error(error);
  }

  if (!response.body) {
    throw new Error("Relivo AI returned an empty response. Please try again.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const dataLine = frame
        .split("\n")
        .find((line) => line.startsWith("data: "));

      if (!dataLine) continue;

      const data = dataLine.slice("data: ".length);
      if (data === "[DONE]") return;

      try {
        onPart(JSON.parse(data) as ChatStreamPart);
      } catch {
        throw new Error(
          "Relivo AI returned an unreadable response. Please try again."
        );
      }
    }
  }
}

async function createConversation(firstMessage: string) {
  const response = await fetch("/api/ai/conversation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstMessage }),
  });

  const data = await readRouteHandlerResponse<BeConversation>(response);
  if (!data) throw new Error("Conversation was not created");

  return data;
}

async function createConversationMessage(
  conversationId: string,
  message: ConversationMessageRequest
) {
  const response = await fetch(
    `/api/ai/conversation/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    }
  );

  await readRouteHandlerResponse(response);
}

async function persistAssistantMessage(conversationId: string, text: string) {
  const trimmedText = text.trim();
  if (!trimmedText) return;

  try {
    await createConversationMessage(conversationId, {
      role: "agent",
      text: trimmedText,
    });
  } catch (error) {
    console.error("Failed to persist assistant message", error);
  }
}

async function readRouteHandlerResponse<T = unknown>(
  response: Response
): Promise<T | undefined> {
  const body = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    data?: T;
  } | null;

  if (!response.ok || body?.success === false) {
    throw new Error(
      normalizeErrorMessage(
        body?.message,
        getStatusErrorMessage(response.status, "Request failed")
      )
    );
  }

  return body?.data;
}
function applyStreamPart(
  messages: ChatMessage[],
  assistantId: string,
  part: ChatStreamPart
): ChatMessage[] {
  if (part.type === "start") {
    return ensureAssistantMessage(messages, assistantId);
  }

  if (part.type === "text-start") {
    return ensureAssistantMessage(messages, assistantId);
  }

  if (part.type === "text-delta") {
    return updateAssistantMessage(messages, assistantId, (message) => ({
      ...message,
      parts: appendTextDelta(message.parts, part.delta),
    }));
  }

  if (part.type === "tool-input-available") {
    return updateAssistantMessage(messages, assistantId, (message) => ({
      ...message,
      parts: upsertToolInput(message.parts, part),
    }));
  }

  if (part.type === "data-tool-call-chunk") {
    return updateAssistantMessage(messages, assistantId, (message) => ({
      ...message,
      parts: upsertToolCallChunk(message.parts, part.data),
    }));
  }

  if (part.type === "data-agent-update") {
    return updateAssistantMessage(messages, assistantId, (message) => ({
      ...message,
      parts: applyAgentUpdate(message.parts, part.data),
    }));
  }

  if (part.type === "data-agent-event" && hasRenderableDataPayload(part.data)) {
    return updateAssistantMessage(messages, assistantId, (message) => ({
      ...message,
      parts: [
        ...message.parts,
        {
          type: part.type,
          data: part.data,
        },
      ],
    }));
  }

  if (part.type === "error") {
    return updateAssistantMessage(messages, assistantId, (message) => ({
      ...message,
      parts: [
        ...message.parts,
        {
          type: "error",
          errorText: getStreamErrorMessage(part),
          data: part.data,
        },
      ],
    }));
  }

  return messages;
}

function ensureAssistantMessage(
  messages: ChatMessage[],
  assistantId: string
): ChatMessage[] {
  if (messages.some((message) => message.id === assistantId)) return messages;

  return [
    ...messages,
    {
      id: assistantId,
      role: "assistant",
      createdAt: new Date().toISOString(),
      parts: [],
    },
  ];
}

function updateAssistantMessage(
  messages: ChatMessage[],
  assistantId: string,
  update: (message: ChatMessage) => ChatMessage
): ChatMessage[] {
  const hasAssistant = messages.some((message) => message.id === assistantId);
  const nextMessages = hasAssistant
    ? messages
    : ensureAssistantMessage(messages, assistantId);

  return nextMessages.map((message) =>
    message.id === assistantId ? update(message) : message
  );
}

function appendTextDelta(
  parts: ChatMessagePart[],
  delta: string
): ChatMessagePart[] {
  const lastPart = parts[parts.length - 1];

  if (lastPart?.type === "text") {
    return [
      ...parts.slice(0, -1),
      {
        type: "text",
        text: lastPart.text + delta,
      },
    ];
  }

  return [...parts, { type: "text", text: delta }];
}

function upsertToolInput(
  parts: ChatMessagePart[],
  part: Extract<ChatStreamPart, { type: "tool-input-available" }>
): ChatMessagePart[] {
  const existingIndex = parts.findIndex(
    (messagePart) =>
      isToolPart(messagePart) && messagePart.toolCallId === part.toolCallId
  );
  const existingPart =
    existingIndex >= 0 && isToolPart(parts[existingIndex])
      ? parts[existingIndex]
      : undefined;
  const toolPart: ChatMessagePart = {
    type: `tool-${part.toolName}`,
    toolName: part.toolName,
    toolCallId: part.toolCallId,
    toolCallIndex: existingPart?.toolCallIndex,
    state: "input-available",
    input: part.input,
    streamedInput: existingPart?.streamedInput,
    output: existingPart?.output,
    errorText: existingPart?.errorText,
  };

  if (existingIndex === -1) return [...parts, toolPart];

  return parts.map((messagePart, index) =>
    index === existingIndex ? toolPart : messagePart
  );
}

function upsertToolCallChunk(
  parts: ChatMessagePart[],
  data: unknown
): ChatMessagePart[] {
  const chunks = getToolCallChunks(data);
  if (chunks.length === 0) return parts;

  return chunks.reduce((currentParts, chunk) => {
    const index = getToolCallChunkIndex(chunk);
    const id = getToolCallChunkId(chunk);
    const existingIndex = currentParts.findIndex(
      (part) =>
        isToolPart(part) &&
        ((id && part.toolCallId === id) ||
          (index !== undefined && part.toolCallIndex === index))
    );
    const existingPart =
      existingIndex >= 0 && isToolPart(currentParts[existingIndex])
        ? currentParts[existingIndex]
        : undefined;
    const streamedInput = `${existingPart?.streamedInput ?? ""}${getToolCallChunkArgs(chunk)}`;
    const toolName =
      getToolCallChunkName(chunk) ??
      existingPart?.toolName ??
      (existingPart ? getToolPartName(existingPart) : undefined) ??
      "tool";
    const toolCallId =
      id ?? existingPart?.toolCallId ?? `tool-call-${index ?? "streaming"}`;
    const parsedInput = parseJsonObject(streamedInput);
    const nextPart: ChatMessagePart = {
      type: `tool-${toolName}`,
      toolCallId,
      toolCallIndex: index ?? existingPart?.toolCallIndex,
      toolName,
      state: parsedInput ? "input-available" : "input-streaming",
      streamedInput,
      input: parsedInput ?? existingPart?.input,
      output: existingPart?.output,
      errorText: existingPart?.errorText,
    };

    if (existingIndex === -1) return [...currentParts, nextPart];

    return currentParts.map((part, partIndex) =>
      partIndex === existingIndex ? nextPart : part
    );
  }, parts);
}

function applyAgentUpdate(
  parts: ChatMessagePart[],
  data: unknown
): ChatMessagePart[] {
  const output = getToolOutputFromAgentUpdate(data);
  if (output === undefined) {
    return hasRenderableDataPayload(data)
      ? [...parts, { type: "data-agent-update", data }]
      : parts;
  }

  const toolIndex = findLastToolPartIndex(parts);
  if (toolIndex === -1) {
    return [
      ...parts,
      {
        type: "dynamic-tool",
        toolCallId: createMessageId("tool"),
        toolName: getAgentUpdateName(data) ?? "tool",
        state: "output-available",
        output,
      },
    ];
  }

  return parts.map((part, index) =>
    index === toolIndex && isToolPart(part)
      ? {
          ...part,
          state: "output-available",
          output,
        }
      : part
  );
}

function getToolCallChunks(data: unknown): Record<string, unknown>[] {
  if (!isRecord(data) || !Array.isArray(data.tool_call_chunks)) return [];

  return data.tool_call_chunks.filter(isRecord);
}

function getToolCallChunkId(
  chunk: Record<string, unknown>
): string | undefined {
  return typeof chunk.id === "string" && chunk.id ? chunk.id : undefined;
}

function getToolCallChunkName(
  chunk: Record<string, unknown>
): string | undefined {
  return typeof chunk.name === "string" && chunk.name ? chunk.name : undefined;
}

function getToolCallChunkArgs(chunk: Record<string, unknown>): string {
  return typeof chunk.args === "string" ? chunk.args : "";
}

function getToolCallChunkIndex(
  chunk: Record<string, unknown>
): number | undefined {
  if (typeof chunk.index === "number") return chunk.index;
  if (typeof chunk.index === "string") {
    const index = Number.parseInt(chunk.index, 10);
    return Number.isNaN(index) ? undefined : index;
  }

  return undefined;
}

function parseJsonObject(value: string): unknown | undefined {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function getToolOutputFromAgentUpdate(data: unknown): unknown | undefined {
  if (!isRecord(data)) return undefined;

  const node = getStringValue(data, "node") ?? getStringValue(data, "step");
  if (node !== "tools" && node !== "tool") return undefined;

  if ("content" in data) {
    return parseMaybeJson(data.content);
  }

  if ("output" in data) {
    return parseMaybeJson(data.output);
  }

  return data;
}

function isToolOutputAgentUpdate(part: ChatStreamPart): boolean {
  return (
    part.type === "data-agent-update" &&
    getToolOutputFromAgentUpdate(part.data) !== undefined
  );
}

function getAgentUpdateName(data: unknown): string | undefined {
  if (!isRecord(data)) return undefined;

  return getStringValue(data, "name") ?? getStringValue(data, "node");
}

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  return parseJsonObject(value) ?? value;
}

function findLastToolPartIndex(parts: ChatMessagePart[]): number {
  for (let index = parts.length - 1; index >= 0; index -= 1) {
    if (isToolPart(parts[index])) return index;
  }

  return -1;
}

function hasRenderableDataPayload(data: unknown): boolean {
  if (!isRecord(data)) return false;
  if (getGeneratedImage(data)) return true;

  const node = getStringValue(data, "node") ?? getStringValue(data, "step");
  if (node === "model" || node === "tools" || node === "tool") return false;

  return !("content" in data && typeof data.content === "string");
}

function getStringValue(
  data: Record<string, unknown>,
  key: string
): string | undefined {
  return typeof data[key] === "string" ? data[key] : undefined;
}

function toUserFacingError(
  error: unknown,
  fallback = GENERIC_CHAT_ERROR_MESSAGE
): Error {
  return new Error(
    normalizeErrorMessage(getUnknownErrorMessage(error), fallback)
  );
}

function getUnknownErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return getErrorMessageFromPayload(error);
}

function getStreamErrorMessage(
  part: Extract<ChatStreamPart, { type: "error" }>
): string {
  return normalizeErrorMessage(
    part.data?.message ??
      part.errorText ??
      getErrorMessageFromPayload(part.data),
    getStatusErrorMessage(part.data?.status, "Chat request failed")
  );
}

function getErrorMessageFromPayload(payload: unknown): string | undefined {
  if (!isRecord(payload)) return undefined;

  for (const key of ["message", "error", "detail", "title"]) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  const errors = payload.errors;
  if (Array.isArray(errors)) {
    const firstMessage = errors
      .map((error) =>
        typeof error === "string" ? error : getErrorMessageFromPayload(error)
      )
      .find((message) => typeof message === "string" && message.trim());

    if (firstMessage) return firstMessage.trim();
  }

  return undefined;
}

function normalizeErrorMessage(
  message: string | undefined,
  fallback: string
): string {
  const trimmed = message?.trim();
  if (!trimmed || isTransportNoiseError(trimmed)) return fallback;

  return trimmed;
}

function isTransportNoiseError(message: string): boolean {
  const normalized = message.toLowerCase();

  return (
    normalized === "failed to fetch" ||
    normalized === "fetch failed" ||
    normalized === "load failed" ||
    normalized === "network error" ||
    normalized === "internal server error" ||
    normalized.startsWith("request failed with status code") ||
    normalized.includes("networkerror") ||
    normalized.includes("econnrefused") ||
    normalized.includes("enotfound") ||
    normalized.includes("econnreset") ||
    normalized.includes("etimedout") ||
    normalized.includes("socket hang up")
  );
}

function getReadableTextError(text: string): string | undefined {
  const trimmed = text.trim();
  if (
    !trimmed ||
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<html")
  ) {
    return undefined;
  }

  return trimmed.length > 240 ? `${trimmed.slice(0, 237)}...` : trimmed;
}

function getStatusErrorMessage(
  status: number | undefined,
  fallbackPrefix: string
): string {
  if (!status) return GENERIC_CHAT_ERROR_MESSAGE;

  if (status === 400 || status === 422) {
    return "Relivo AI could not process that request. Please revise it and try again.";
  }

  if (status === 401 || status === 403) {
    return "Your session is not authorized for Relivo AI. Please sign in again.";
  }

  if (status === 404) {
    return "Relivo AI endpoint was not found. Please check the server configuration.";
  }

  if (status === 408 || status === 504) {
    return "Relivo AI took too long to respond. Please try again.";
  }

  if (status === 429) {
    return "Relivo AI is receiving too many requests right now. Please try again shortly.";
  }

  if (status === 499) {
    return "Chat request was cancelled.";
  }

  if (status >= 500) return RELIVO_AI_UNAVAILABLE_MESSAGE;

  return `${fallbackPrefix}: ${status}`;
}

async function readErrorResponse(response: Response): Promise<string> {
  const fallback = getStatusErrorMessage(
    response.status,
    "Chat request failed"
  );
  let text = "";

  try {
    text = await response.text();
  } catch {
    return fallback;
  }

  const payload = parseJsonObject(text);
  const payloadMessage = getErrorMessageFromPayload(payload);
  if (payloadMessage) return normalizeErrorMessage(payloadMessage, fallback);

  return normalizeErrorMessage(getReadableTextError(text), fallback);
}

function isToolPart(
  part: ChatMessagePart
): part is Extract<ChatMessagePart, { toolCallId: string }> {
  return part.type === "dynamic-tool" || part.type.startsWith("tool-");
}

function isFilePart(
  part: ChatMessagePart
): part is Extract<ChatMessagePart, { type: "file" }> {
  return part.type === "file";
}

function isErrorPart(
  part: ChatMessagePart
): part is Extract<ChatMessagePart, { type: "error" }> {
  return part.type === "error";
}

function isDataPart(
  part: ChatMessagePart
): part is Extract<ChatMessagePart, { type: `data-${string}` }> {
  return part.type.startsWith("data-");
}

function createMessageId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function formatMessageTime(createdAt?: string): string {
  const date = createdAt ? new Date(createdAt) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}
