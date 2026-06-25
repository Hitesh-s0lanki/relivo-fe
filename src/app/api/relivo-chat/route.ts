export const runtime = "nodejs";

const RELIVO_AI_UNAVAILABLE_MESSAGE =
  "Relivo AI is temporarily unavailable. Please try again in a moment.";

export async function POST(request: Request) {
  const apiUrl =
    process.env.RELIVO_API_URL ?? process.env.NEXT_PUBLIC_RELIVO_API_URL;

  if (!apiUrl) {
    return Response.json(
      {
        success: false,
        message: "Relivo AI server URL is not configured.",
      },
      { status: 500 }
    );
  }

  let requestBody: string;
  try {
    requestBody = await request.text();
  } catch {
    return Response.json(
      {
        success: false,
        message: "Unable to read the chat request. Please try again.",
      },
      { status: 400 }
    );
  }

  let response: Response;
  try {
    response = await fetch(`${apiUrl.replace(/\/$/, "")}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
      signal: request.signal,
    });
  } catch (error) {
    if (request.signal.aborted) {
      return Response.json(
        {
          success: false,
          message: "Chat request was cancelled.",
        },
        { status: 499 }
      );
    }

    console.error("Failed to reach Relivo AI server", error);
    return Response.json(
      {
        success: false,
        message: RELIVO_AI_UNAVAILABLE_MESSAGE,
      },
      { status: 503 }
    );
  }

  if (!response.ok) {
    return Response.json(
      {
        success: false,
        message: await readUpstreamErrorResponse(response),
      },
      { status: response.status }
    );
  }

  if (!response.body) {
    return Response.json(
      {
        success: false,
        message: "Relivo AI returned an empty response. Please try again.",
      },
      { status: 502 }
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      "Content-Type":
        response.headers.get("content-type") ??
        "text/event-stream; charset=utf-8",
      "Cache-Control": response.headers.get("cache-control") ?? "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "x-vercel-ai-ui-message-stream":
        response.headers.get("x-vercel-ai-ui-message-stream") ?? "v1",
    },
  });
}

async function readUpstreamErrorResponse(response: Response): Promise<string> {
  const fallback = getFallbackMessageForStatus(response.status);
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const data = (await response.json()) as unknown;
      return normalizeErrorMessage(getErrorMessageFromPayload(data), fallback);
    } catch {
      return fallback;
    }
  }

  try {
    return getReadableTextError(await response.text()) ?? fallback;
  } catch {
    return fallback;
  }
}

function getErrorMessageFromPayload(payload: unknown): string | undefined {
  if (!isRecord(payload)) return undefined;

  for (const key of ["message", "error", "detail", "title"]) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return undefined;
}

function normalizeErrorMessage(
  message: string | undefined,
  fallback: string
): string {
  const trimmed = message?.trim();
  if (!trimmed || isGenericServerError(trimmed)) return fallback;

  return trimmed;
}

function getReadableTextError(text: string): string | undefined {
  const trimmed = text.trim();
  if (
    !trimmed ||
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<html") ||
    isGenericServerError(trimmed)
  ) {
    return undefined;
  }

  return trimmed.length > 240 ? `${trimmed.slice(0, 237)}...` : trimmed;
}

function isGenericServerError(message: string): boolean {
  const normalized = message.toLowerCase();

  return (
    normalized === "internal server error" ||
    normalized === "fetch failed" ||
    normalized === "failed to fetch" ||
    normalized.includes("econnrefused") ||
    normalized.includes("enotfound") ||
    normalized.includes("socket hang up")
  );
}

function getFallbackMessageForStatus(status: number): string {
  if (status === 401 || status === 403) {
    return "You are not authorized to use Relivo AI. Please sign in again.";
  }

  if (status === 408 || status === 504) {
    return "Relivo AI took too long to respond. Please try again.";
  }

  if (status === 429) {
    return "Relivo AI is receiving too many requests right now. Please try again shortly.";
  }

  if (status >= 500) {
    return RELIVO_AI_UNAVAILABLE_MESSAGE;
  }

  return "Relivo AI could not process that request. Please try again.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
