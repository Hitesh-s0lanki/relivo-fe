"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowUp,
  Calculator,
  CheckCircle2,
  CloudSun,
  Copy,
  Globe2,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Square,
  ThumbsDown,
  ThumbsUp,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CURRENT_USER_CONVERSATIONS_QUERY_KEY,
  upsertConversationInList,
} from "@/lib/conversation-query";
import { cn } from "@/lib/utils";
import type { Conversation, ConversationList } from "@/types/be-server";

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

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  parts: ChatMessagePart[];
  createdAt?: string;
};

type ChatMessagePart =
  | { type: "text"; text: string }
  | {
      type: `tool-${string}` | "dynamic-tool";
      toolCallId: string;
      toolName?: string;
      state: string;
      input?: unknown;
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
  text: string;
};

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
    if (!hasMessages) return;

    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: status === "streaming" ? "auto" : "smooth",
    });
  }, [hasMessages, messages, status]);

  const submitMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    clearError();
    setInput("");

    const userMessage: ChatMessage = {
      id: createMessageId("msgc"),
      role: "user",
      createdAt: new Date().toISOString(),
      parts: [{ type: "text", text: trimmed }],
    };
    const assistantId = createMessageId("msg");
    let activeConversationId = conversationId;
    let assistantText = "";

    setStatus("submitted");

    try {
      if (!activeConversationId) {
        const conversation = await createConversation(trimmed);
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

      setMessages((currentMessages) => [...currentMessages, userMessage]);
      await createConversationMessage(activeConversationId, {
        role: "user",
        text: trimmed,
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
      setError(
        error instanceof Error
          ? error
          : new Error("Failed to create conversation")
      );
      setStatus("ready");
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      await streamRelivoChat(
        {
          user_message: trimmed,
          thread_id: activeConversationId,
          stream_mode: ["updates", "messages"],
        },
        {
          signal: abortController.signal,
          onPart: (part) => {
            setStatus("streaming");
            if (part.type === "text-delta") {
              assistantText += part.delta;
            }

            setMessages((currentMessages) =>
              applyStreamPart(currentMessages, assistantId, part)
            );

            if (part.type === "error") {
              setError(
                new Error(part.data?.message ?? part.errorText ?? "Chat failed")
              );
            }
          },
        }
      );
    } catch (error) {
      if (abortController.signal.aborted) return;
      setError(
        error instanceof Error ? error : new Error("Chat stream failed")
      );
    } finally {
      abortControllerRef.current = null;
      setStatus("ready");

      if (!abortController.signal.aborted && activeConversationId) {
        await persistAssistantMessage(activeConversationId, assistantText);
      }
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitMessage(input);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-950">
      <div
        ref={viewportRef}
        className={cn("flex-1 overflow-y-auto", hasMessages && "pb-28")}
      >
        {hasMessages ? (
          <ConversationView
            messages={visibleMessages}
            showAssistantPlaceholder={showAssistantPlaceholder}
          />
        ) : (
          <EmptyChatView
            input={input}
            isStreaming={isStreaming}
            onInputChange={setInput}
            onPromptSelect={setInput}
            onSubmit={handleSubmit}
            onSubmitText={submitMessage}
            onStop={stop}
          />
        )}
      </div>

      {error && (
        <div className="mx-auto w-full max-w-2xl px-4 pb-3">
          <div className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            <span>{error.message}</span>
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
            onInputChange={setInput}
            onStop={stop}
            onSubmit={handleSubmit}
            onSubmitText={submitMessage}
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
  input,
  isStreaming,
  onInputChange,
  onPromptSelect,
  onSubmit,
  onSubmitText,
  onStop,
}: {
  input: string;
  isStreaming: boolean;
  onInputChange: (value: string) => void;
  onPromptSelect: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSubmitText: (text: string) => void;
  onStop: () => void;
}) {
  return (
    <div className="flex min-h-full items-start justify-center px-4 pt-[24vh] pb-10 sm:pt-[27vh]">
      <div className="flex w-4xl flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-2xl leading-tight font-medium text-zinc-950 sm:text-[28px] dark:text-zinc-50">
            Good to see you, Hitesh.
          </h1>
        </div>

        <div className="flex w-full justify-center">
          <ChatComposer
            input={input}
            isStreaming={isStreaming}
            onInputChange={onInputChange}
            onStop={onStop}
            onSubmit={onSubmit}
            onSubmitText={onSubmitText}
            variant="hero"
          />
        </div>

        <QuickActions onSelect={onPromptSelect} />
      </div>
    </div>
  );
}

function ConversationView({
  messages,
  showAssistantPlaceholder,
}: {
  messages: ChatMessage[];
  showAssistantPlaceholder: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-4 px-14 py-8">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {showAssistantPlaceholder && <StreamingAssistantBubble />}
    </div>
  );
}

function ChatMessage({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const text = getMessageText(message);
  const hasToolParts = message.parts.some(isToolPart);
  const hasErrorParts = message.parts.some(isErrorPart);

  if (!text.trim() && !hasToolParts && !hasErrorParts) {
    return null;
  }

  return (
    <div
      className={cn(
        "group flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-col",
          isUser ? "items-end" : "items-start"
        )}
      >
        <MessageTimestamp
          createdAt={message.createdAt}
          align={isUser ? "right" : "left"}
        />

        <div
          className={cn(
            "min-w-0 text-[15px] leading-7",
            isUser
              ? "max-w-[min(680px,84vw)] rounded-[18px] bg-primary px-3.5 py-1.5 text-primary-foreground shadow-sm"
              : "max-w-[min(640px,84vw)] text-zinc-950 dark:text-zinc-50"
          )}
        >
          <div className={cn("flex flex-col gap-3", !isUser && "prose-chat")}>
            {message.parts.map((part) => {
              if (part.type === "text") {
                if (!part.text.trim()) return null;

                return (
                  <div
                    key={getMessagePartKey(message.id, part)}
                    className={cn(
                      "break-words",
                      isUser ? "whitespace-pre-wrap" : "space-y-3"
                    )}
                  >
                    {isUser ? (
                      part.text
                    ) : (
                      <FormattedAssistantText text={part.text} />
                    )}
                  </div>
                );
              }

              if (isToolPart(part)) {
                return (
                  <ToolPartCard
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
          </div>
        </div>

        <MessageActions isUser={isUser} text={text} />
      </div>
    </div>
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

function MessageActions({ isUser, text }: { isUser: boolean; text: string }) {
  return (
    <div
      className={cn(
        "mt-3 flex items-center gap-3 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-600",
        isUser ? "justify-end pr-2" : "justify-start pl-1 opacity-100"
      )}
    >
      <button
        type="button"
        onClick={() => void navigator.clipboard?.writeText(text)}
        className="cursor-pointer rounded-md p-1 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
        aria-label="Copy message"
      >
        <Copy className="size-4" />
      </button>
      {!isUser && (
        <>
          <button
            type="button"
            className="cursor-pointer rounded-md p-1 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
            aria-label="Good response"
          >
            <ThumbsUp className="size-4" />
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md p-1 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
            aria-label="Bad response"
          >
            <ThumbsDown className="size-4" />
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md p-1 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
            aria-label="Regenerate response"
          >
            <RotateCcw className="size-4" />
          </button>
        </>
      )}
    </div>
  );
}

function FormattedAssistantText({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((block) => (
        <FormattedBlock key={stableTextKey(block)} block={block} />
      ))}
    </>
  );
}

function FormattedBlock({ block }: { block: string }) {
  const lines = block.split("\n").filter((line) => line.trim().length > 0);
  const isBulletList = lines.every((line) =>
    /^[-*]\s+|^\d+\.\s+/.test(line.trim())
  );

  if (isBulletList) {
    return (
      <ul className="space-y-3 pl-6">
        {lines.map((line) => (
          <li key={stableTextKey(line)} className="list-disc pl-1">
            <FormattedInline text={line.replace(/^[-*]\s+|^\d+\.\s+/, "")} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p>
      <FormattedInline text={block} />
    </p>
  );
}

function FormattedInline({ text }: { text: string }) {
  const segments = text.split(/(\*\*[^*]+\*\*)/g).map((segment) => {
    return { id: stableTextKey(segment), text: segment };
  });

  return (
    <>
      {segments.map((segment) => {
        if (segment.text.startsWith("**") && segment.text.endsWith("**")) {
          return (
            <strong key={segment.id} className="font-semibold">
              {segment.text.slice(2, -2)}
            </strong>
          );
        }

        return <span key={segment.id}>{segment.text}</span>;
      })}
    </>
  );
}

type MessagePart = ChatMessage["parts"][number];

function ToolPartCard({ part }: { part: MessagePart }) {
  if (!isToolPart(part)) return null;

  const toolName = getToolPartName(part);
  const stateLabel = getToolStateLabel(part.state);
  const input = "input" in part ? part.input : undefined;
  const output = "output" in part ? part.output : undefined;
  const errorText = "errorText" in part ? part.errorText : undefined;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
        <div className="flex min-w-0 items-center gap-2">
          {getToolIcon(toolName)}
          <span className="truncate text-xs font-semibold">
            {formatToolName(toolName)}
          </span>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-500 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800">
          {stateLabel}
        </span>
      </div>

      <div className="space-y-3 px-3 py-3">
        {toolName === "weather" && part.state === "output-available" ? (
          <WeatherToolOutput output={output} />
        ) : toolName === "calculator" && part.state === "output-available" ? (
          <CalculatorToolOutput output={output} />
        ) : (
          <ToolDebugBlock input={input} output={output} errorText={errorText} />
        )}
      </div>
    </div>
  );
}

function WeatherToolOutput({ output }: { output: unknown }) {
  const data = output as {
    location?: string;
    temperature?: number;
    unit?: string;
    condition?: string;
    humidity?: number;
    source?: string;
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">
            {data.location ?? "Unknown"}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {data.condition ?? "Demo condition"}
          </div>
        </div>
        <div className="text-2xl font-semibold">
          {data.temperature ?? "--"} deg {data.unit ?? "C"}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <CheckCircle2 className="size-3.5" />
        Humidity {data.humidity ?? "--"}% - {data.source ?? "Demo tool"}
      </div>
    </div>
  );
}

function CalculatorToolOutput({ output }: { output: unknown }) {
  const data = output as {
    operation?: string;
    a?: number;
    b?: number;
    result?: number | null;
    note?: string;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {data.operation ?? "operation"}
        </span>
        <span className="text-2xl font-semibold">{data.result ?? "N/A"}</span>
      </div>
      <div className="rounded-lg bg-white px-3 py-2 font-mono text-xs text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800">
        {data.a ?? "?"} {getOperationSymbol(data.operation)} {data.b ?? "?"}
      </div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400">
        {data.note ?? "Demo calculator result"}
      </div>
    </div>
  );
}

function ToolDebugBlock({
  input,
  output,
  errorText,
}: {
  input: unknown;
  output: unknown;
  errorText: unknown;
}) {
  return (
    <div className="space-y-2">
      {input !== undefined && (
        <pre className="max-h-40 overflow-auto rounded-lg bg-white p-2 text-xs text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800">
          {JSON.stringify(input, null, 2)}
        </pre>
      )}
      {output !== undefined && (
        <pre className="max-h-40 overflow-auto rounded-lg bg-white p-2 text-xs text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800">
          {JSON.stringify(output, null, 2)}
        </pre>
      )}
      {typeof errorText === "string" && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900/60">
          {errorText}
        </div>
      )}
      {input === undefined && output === undefined && !errorText && (
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Loader2 className="size-3.5 animate-spin" />
          Preparing tool call
        </div>
      )}
    </div>
  );
}

function StreamingAssistantBubble() {
  return (
    <div className="flex w-full justify-start">
      <div className="px-1 py-2">
        <span className="animate-pulse bg-gradient-to-r from-zinc-400 via-zinc-700 to-zinc-400 bg-[length:200%_100%] bg-clip-text text-sm font-medium text-transparent dark:from-zinc-500 dark:via-zinc-200 dark:to-zinc-500">
          Agent Streaming
        </span>
      </div>
    </div>
  );
}

function ChatComposer({
  input,
  isStreaming,
  onInputChange,
  onStop,
  onSubmit,
  onSubmitText,
  variant = "compact",
}: {
  input: string;
  isStreaming: boolean;
  onInputChange: (value: string) => void;
  onStop: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSubmitText: (text: string) => void;
  variant?: "compact" | "hero";
}) {
  const isHero = variant === "hero";

  if (isHero) {
    return (
      <HeroChatComposer
        input={input}
        isStreaming={isStreaming}
        onInputChange={onInputChange}
        onStop={onStop}
        onSubmit={onSubmit}
        onSubmitText={onSubmitText}
      />
    );
  }

  return (
    <CompactChatComposer
      input={input}
      isStreaming={isStreaming}
      onInputChange={onInputChange}
      onStop={onStop}
      onSubmit={onSubmit}
      onSubmitText={onSubmitText}
    />
  );
}

type ChatComposerVariantProps = {
  input: string;
  isStreaming: boolean;
  onInputChange: (value: string) => void;
  onStop: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSubmitText: (text: string) => void;
};

function HeroChatComposer({
  input,
  isStreaming,
  onInputChange,
  onStop,
  onSubmit,
  onSubmitText,
}: ChatComposerVariantProps) {
  const textareaMaxHeight = 120;

  function handleTextareaChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onInputChange(event.target.value);
    event.currentTarget.style.height = "auto";
    event.currentTarget.style.height = `${Math.min(
      event.currentTarget.scrollHeight,
      textareaMaxHeight
    )}px`;
  }

  return (
    <form onSubmit={onSubmit} className="min-w-4xl">
      <div className="flex min-h-14 items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-2 shadow-[0_16px_44px_rgba(15,23,42,0.08)] transition-colors focus-within:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-within:border-zinc-600">
        <IconButton label="Add task">
          <Plus className="size-4.5" />
        </IconButton>

        <textarea
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void onSubmitText(input);
            }
          }}
          placeholder="Ask anything"
          rows={1}
          className="max-h-28 min-h-10 flex-1 resize-none overflow-y-auto bg-transparent py-2 leading-6 text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />

        <div className="flex shrink-0 items-center gap-3">
          {isStreaming || input.trim() ? (
            <Button
              type={isStreaming ? "button" : "submit"}
              onClick={isStreaming ? () => void onStop() : undefined}
              size="icon-lg"
              className="cursor-pointer rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              aria-label={isStreaming ? "Stop response" : "Send message"}
            >
              {isStreaming ? (
                <Square className="size-3.5 fill-current" />
              ) : (
                <ArrowUp className="size-5" />
              )}
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!input.trim()}
              size="icon-lg"
              className="cursor-not-allowed rounded-full bg-zinc-950 text-white opacity-100 disabled:opacity-100 dark:bg-white dark:text-zinc-950"
              aria-label="Send message"
            >
              <ArrowUp className="size-5" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

function CompactChatComposer({
  input,
  isStreaming,
  onInputChange,
  onStop,
  onSubmit,
  onSubmitText,
}: ChatComposerVariantProps) {
  const textareaMaxHeight = 120;

  function handleTextareaChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onInputChange(event.target.value);
    event.currentTarget.style.height = "auto";
    event.currentTarget.style.height = `${Math.min(
      event.currentTarget.scrollHeight,
      textareaMaxHeight
    )}px`;
  }

  return (
    <form
      onSubmit={onSubmit}
      className="pointer-events-auto mx-auto w-full max-w-4xl"
    >
      <div className="flex min-h-14 items-center gap-3 rounded-full border border-zinc-200/80 bg-white/75 px-4 py-2 shadow-[0_14px_38px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-colors focus-within:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-900/75 dark:focus-within:border-zinc-600">
        <IconButton label="Add task">
          <Plus className="size-4.5" />
        </IconButton>

        <textarea
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void onSubmitText(input);
            }
          }}
          placeholder="Ask anything"
          rows={1}
          className="max-h-28 min-h-10 flex-1 resize-none overflow-y-auto bg-transparent py-2 text-[15px] leading-6 text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />

        <div className="flex shrink-0 items-center">
          {isStreaming ? (
            <Button
              type="button"
              onClick={() => void onStop()}
              size="icon-lg"
              className="cursor-pointer rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              aria-label="Stop response"
            >
              <Square className="size-3.5 fill-current" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!input.trim()}
              size="icon-lg"
              className={cn(
                "cursor-pointer rounded-full duration-150 disabled:opacity-100",
                input.trim()
                  ? "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                  : "cursor-not-allowed bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
              )}
              aria-label="Send message"
            >
              <ArrowUp className="size-5" />
            </Button>
          )}
        </div>
      </div>
    </form>
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

function IconButton({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="cursor-pointer rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      aria-label={label}
    >
      {children}
    </Button>
  );
}

function hasMessageText(message: ChatMessage): boolean {
  return getMessageText(message).trim().length > 0;
}

function hasRenderableMessageParts(message: ChatMessage): boolean {
  return (
    hasMessageText(message) ||
    message.parts.some((part) => isToolPart(part) || isErrorPart(part))
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

function getToolPartName(part: MessagePart): string {
  if (isToolPart(part) && part.type === "dynamic-tool") {
    return part.toolName ?? "tool";
  }

  return part.type.replace(/^tool-/, "");
}

function getToolIcon(toolName: string) {
  if (toolName === "weather") {
    return <CloudSun className="size-4 shrink-0 text-sky-500" />;
  }

  if (toolName === "calculator") {
    return <Calculator className="size-4 shrink-0 text-emerald-500" />;
  }

  return <Wrench className="size-4 shrink-0 text-zinc-500" />;
}

function formatToolName(toolName: string): string {
  return toolName
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getToolStateLabel(state: string): string {
  return (
    {
      "input-streaming": "Preparing",
      "input-available": "Calling",
      "output-available": "Complete",
      "output-error": "Error",
      "output-denied": "Denied",
      "approval-requested": "Approval",
    }[state] ?? state
  );
}

function getOperationSymbol(operation?: string): string {
  return (
    {
      add: "+",
      subtract: "-",
      multiply: "x",
      divide: "/",
    }[operation ?? ""] ?? "?"
  );
}

function getMessagePartKey(messageId: string, part: MessagePart): string {
  if ("toolCallId" in part)
    return `${messageId}-${part.type}-${part.toolCallId}`;
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

function normalizePart(part: unknown): ChatMessagePart[] {
  if (!isRecord(part) || typeof part.type !== "string") return [];

  if (part.type === "text" && typeof part.text === "string") {
    return [{ type: "text", text: part.text }];
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
        toolName: typeof part.toolName === "string" ? part.toolName : undefined,
        state: typeof part.state === "string" ? part.state : "output-available",
        input: "input" in part ? part.input : undefined,
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

async function streamRelivoChat(
  request: {
    user_message: string;
    thread_id: string;
    stream_mode: Array<"updates" | "messages">;
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
    throw new Error("Chat response body is empty");
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

      onPart(JSON.parse(data) as ChatStreamPart);
    }
  }
}

async function createConversation(firstMessage: string) {
  const response = await fetch("/api/ai/conversation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstMessage }),
  });

  const data = await readRouteHandlerResponse<Conversation>(response);
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
    throw new Error(body?.message ?? `Request failed: ${response.status}`);
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

  if (
    part.type === "data-agent-update" ||
    part.type === "data-agent-event" ||
    part.type === "data-tool-call-chunk"
  ) {
    return messages;
  }

  if (part.type === "error") {
    return updateAssistantMessage(messages, assistantId, (message) => ({
      ...message,
      parts: [
        ...message.parts,
        {
          type: "error",
          errorText: part.errorText,
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
  const toolPart: ChatMessagePart = {
    type: `tool-${part.toolName}`,
    toolName: part.toolName,
    toolCallId: part.toolCallId,
    state: "input-available",
    input: part.input,
  };

  const existingIndex = parts.findIndex(
    (messagePart) =>
      isToolPart(messagePart) && messagePart.toolCallId === part.toolCallId
  );

  if (existingIndex === -1) return [...parts, toolPart];

  return parts.map((messagePart, index) =>
    index === existingIndex ? toolPart : messagePart
  );
}

async function readErrorResponse(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (isRecord(data) && typeof data.message === "string") {
      return data.message;
    }
  } catch {
    // Fall through to the generic HTTP error below.
  }

  return `Chat request failed: ${response.status}`;
}

function isToolPart(
  part: ChatMessagePart
): part is Extract<ChatMessagePart, { toolCallId: string }> {
  return part.type === "dynamic-tool" || part.type.startsWith("tool-");
}

function isErrorPart(
  part: ChatMessagePart
): part is Extract<ChatMessagePart, { type: "error" }> {
  return part.type === "error";
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

function stableTextKey(text: string): string {
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  return `${hash}-${text.length}`;
}
