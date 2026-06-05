# Chat Request API

## Overview

`POST /chat` streams a chat response from the Relivo backend chat agent using Server-Sent Events.

Use this endpoint when a Vercel-hosted frontend sends a user message and needs response chunks as they are generated. This frontend uses plain `fetch` with `ReadableStream`; it does not use Vercel AI SDK `useChat` and does not run a local Next.js `/api/chat` generation route.

The browser UI calls a same-origin proxy:

```http
POST /api/relivo-chat
```

That proxy only forwards bytes to the Relivo backend `POST /chat`; it does not generate model responses. This avoids browser CORS failures when the backend does not answer `OPTIONS` preflight requests.

## Endpoint

```http
POST /chat
```

Local backend base URL:

```txt
http://localhost:8000
```

Full local URL:

```txt
http://localhost:8000/chat
```

Frontend/server env:

```env
RELIVO_API_URL=http://localhost:8000
NEXT_PUBLIC_RELIVO_API_URL=http://localhost:8000
```

For production:

```env
NEXT_PUBLIC_RELIVO_API_URL=https://your-relivo-api.example.com
```

## Request

Headers:

| Header         | Value              |
| -------------- | ------------------ |
| `Content-Type` | `application/json` |

Body:

| Field          | Type     | Required | Default                  | Description                                                                   |
| -------------- | -------- | -------- | ------------------------ | ----------------------------------------------------------------------------- |
| `user_message` | string   | Yes      | -                        | User message to send to the chat agent. Must be 1-8000 characters.            |
| `thread_id`    | string   | No       | `demo`                   | Conversation thread identifier used by agent memory/checkpointing.            |
| `stream_mode`  | string[] | No       | `["updates","messages"]` | Agent stream event types to include. Supported values: `updates`, `messages`. |

Example:

```json
{
  "user_message": "Help me plan my day",
  "thread_id": "user-123",
  "stream_mode": ["updates", "messages"]
}
```

Minimal example:

```json
{
  "user_message": "Hello"
}
```

## Response

The response is streamed as SSE.

Headers:

| Header                          | Value               | Purpose                                        |
| ------------------------------- | ------------------- | ---------------------------------------------- |
| `Content-Type`                  | `text/event-stream` | Indicates an SSE stream.                       |
| `x-vercel-ai-ui-message-stream` | `v1`                | Indicates AI SDK UI-message-compatible frames. |
| `Cache-Control`                 | `no-cache`          | Prevents response caching.                     |
| `Connection`                    | `keep-alive`        | Keeps the stream open.                         |
| `X-Accel-Buffering`             | `no`                | Disables buffering behind compatible proxies.  |

Each SSE frame:

```txt
data: <json_payload>
```

The stream ends with:

```txt
data: [DONE]
```

## Stream Parts

| Part `type`            | Description                               |
| ---------------------- | ----------------------------------------- |
| `start`                | Stream starts. Includes `messageId`.      |
| `text-start`           | Assistant text block starts.              |
| `text-delta`           | Assistant text chunk is available.        |
| `text-end`             | Assistant text block ends.                |
| `tool-input-available` | Agent emitted a complete tool call input. |
| `data-tool-call-chunk` | Custom streamed tool-call chunk data.     |
| `data-agent-update`    | Custom agent graph update or tool output. |
| `data-agent-event`     | Custom fallback for unknown agent events. |
| `error`                | Stream failed after opening.              |
| `finish`               | Stream closes.                            |

Example stream:

```txt
data: {"type":"start","messageId":"user-123"}

data: {"type":"text-start","id":"text-1"}

data: {"type":"text-delta","id":"text-1","delta":"Hello"}

data: {"type":"text-end","id":"text-1"}

data: {"type":"finish"}

data: [DONE]
```

## cURL

```bash
curl -N -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"user_message":"Hello","thread_id":"user-123"}'
```

## Frontend Client

Because `/chat` is a `POST` streaming endpoint, use `fetch` with `ReadableStream`. Do not use browser `EventSource`, because `EventSource` only supports `GET`.

```ts
type ChatRequest = {
  user_message: string;
  thread_id?: string;
  stream_mode?: Array<"updates" | "messages">;
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
```

Client helper:

```ts
export async function streamRelivoChat(
  request: ChatRequest,
  options: {
    signal: AbortSignal;
    onPart: (part: ChatStreamPart) => void;
  }
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_RELIVO_API_URL}/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stream_mode: ["updates", "messages"],
        ...request,
      }),
      signal: options.signal,
    }
  );

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
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

      options.onPart(JSON.parse(data) as ChatStreamPart);
    }
  }
}
```

## Current Frontend Integration

`ChatMessageScreen` calls the same-origin proxy:

```txt
/api/relivo-chat
```

The proxy forwards to:

```txt
${NEXT_PUBLIC_RELIVO_API_URL}/chat
```

with:

```json
{
  "user_message": "Hello",
  "thread_id": "relivo-main",
  "stream_mode": ["updates", "messages"]
}
```

The UI handles:

- text deltas as assistant message text
- `tool-input-available` as tool cards
- custom `data-*` parts as debug/data cards
- stream errors as visible error messages
- aborting via `AbortController`

## Validation Errors

The backend returns `422 Unprocessable Entity` when:

- `user_message` is missing
- `user_message` is empty
- `user_message` contains only whitespace
- `user_message` is longer than 8000 characters
- `thread_id` is empty or longer than 200 characters
- `stream_mode` contains unsupported values

Example:

```json
{
  "status": 422,
  "message": "user_message cannot be blank",
  "error_tag": "blank_user_message"
}
```

All client-facing error payloads use this shape:

```json
{
  "status": 500,
  "message": "chat stream failed",
  "error_tag": "chat_stream_failed"
}
```

## Runtime Behavior

Backend model behavior is controlled by the Relivo backend service:

- If `OPENAI_API_KEY` is configured on the backend, it uses `RELIVO_CHAT_MODEL`.
- Default backend model: `openai:gpt-4.1-mini`.
- If `OPENAI_API_KEY` is not configured, the backend uses a local fake chat model and streams a demo fallback response.

The Vercel frontend should only set `NEXT_PUBLIC_RELIVO_API_URL`; it should not expose provider API keys.
`RELIVO_API_URL` is preferred by the Next.js proxy route. `NEXT_PUBLIC_RELIVO_API_URL` is kept for client-side/direct integrations.
