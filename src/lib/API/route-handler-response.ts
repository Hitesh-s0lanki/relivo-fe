import { NextResponse } from "next/server";

const BACKEND_UNAVAILABLE_MESSAGE =
  "Relivo backend is temporarily unavailable. Please try again in a moment.";

type RouteHandlerSuccessResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

type RouteHandlerErrorResponse = {
  success: boolean;
  message: string;
};

export const routeHandlerSuccess = <T>(
  message: string,
  status: number,
  data?: T
): NextResponse<RouteHandlerSuccessResponse<T>> => {
  return NextResponse.json(
    {
      success: true,
      message,
      data: (data as T) ?? null,
    },
    { status }
  );
};

export const routeHandlerError = (
  message: string,
  status: number
): NextResponse<RouteHandlerErrorResponse> => {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
};

export const routeHandlerBackendError = (
  error: unknown,
  fallbackMessage: string
): NextResponse<RouteHandlerErrorResponse> => {
  const status = getErrorStatus(error);

  console.error(fallbackMessage, error);

  return routeHandlerError(
    getBackendErrorMessage(error, status, fallbackMessage),
    status
  );
};

function getBackendErrorMessage(
  error: unknown,
  status: number,
  fallbackMessage: string
): string {
  if (status === 401 || status === 403) {
    return "You are not authorized to complete this action. Please sign in again.";
  }

  if (status === 404) return fallbackMessage;

  if (status === 408 || status === 504) {
    return "Relivo backend took too long to respond. Please try again.";
  }

  if (status === 429) {
    return "Relivo backend is receiving too many requests right now. Please try again shortly.";
  }

  if (status >= 500) return BACKEND_UNAVAILABLE_MESSAGE;

  return getBackendPayloadMessage(error) ?? fallbackMessage;
}

function getErrorStatus(error: unknown): number {
  const status = getNestedNumber(error, ["response", "status"]);

  if (status && status >= 400 && status <= 599) return status;
  if (isNetworkError(error)) return 503;

  return 500;
}

function getBackendPayloadMessage(error: unknown): string | undefined {
  const responseData = getNestedValue(error, ["response", "data"]);
  const responseMessage = getMessageFromPayload(responseData);
  if (responseMessage) return responseMessage;

  if (error instanceof Error && !isGenericErrorMessage(error.message)) {
    return error.message.trim();
  }

  return undefined;
}

function getMessageFromPayload(payload: unknown): string | undefined {
  if (!isRecord(payload)) return undefined;

  for (const key of ["message", "error", "detail", "title"]) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return undefined;
}

function isNetworkError(error: unknown): boolean {
  const code = getNestedValue(error, ["code"]);
  if (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT"
  ) {
    return true;
  }

  return (
    error instanceof Error &&
    (error.message.includes("Network Error") ||
      error.message.includes("connect ECONNREFUSED") ||
      error.message.includes("fetch failed"))
  );
}

function isGenericErrorMessage(message: string): boolean {
  const normalized = message.trim().toLowerCase();

  return (
    !normalized ||
    normalized === "network error" ||
    normalized === "internal server error" ||
    normalized === "fetch failed" ||
    normalized.startsWith("request failed with status code") ||
    normalized.includes("econnrefused") ||
    normalized.includes("enotfound") ||
    normalized.includes("econnreset") ||
    normalized.includes("etimedout")
  );
}

function getNestedNumber(value: unknown, path: string[]): number | undefined {
  const nestedValue = getNestedValue(value, path);

  return typeof nestedValue === "number" ? nestedValue : undefined;
}

function getNestedValue(value: unknown, path: string[]): unknown {
  return path.reduce<unknown>((current, key) => {
    if (!isRecord(current)) return undefined;

    return current[key];
  }, value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
