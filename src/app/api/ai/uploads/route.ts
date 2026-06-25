import {
  routeHandlerError,
  routeHandlerSuccess,
} from "@/lib/API/route-handler-response";
import { getConversationUserId } from "@/lib/conversation-user";

const BACKEND_UNAVAILABLE_MESSAGE =
  "Relivo backend is temporarily unavailable. Please try again in a moment.";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiUrl =
    process.env.RELIVO_API_URL ??
    process.env.NEXT_PUBLIC_RELIVO_API_URL ??
    process.env.NEXT_PUBLIC_BE_SERVER_URL;

  if (!apiUrl) {
    return routeHandlerError("Relivo backend URL is not configured.", 500);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return routeHandlerError("Invalid upload request.", 400);
  }

  if (!formData.has("conversationId") && !formData.has("userId")) {
    try {
      formData.append("userId", await getConversationUserId());
    } catch (error) {
      console.error("Failed to resolve upload user", error);
      return routeHandlerError("Unable to resolve upload user.", 401);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${apiUrl.replace(/\/$/, "")}/ai/uploads`, {
      method: "POST",
      body: formData,
      signal: request.signal,
    });
  } catch (error) {
    if (request.signal.aborted) {
      return routeHandlerError("Upload request was cancelled.", 499);
    }

    console.error("Failed to reach Relivo upload server", error);
    return routeHandlerError(BACKEND_UNAVAILABLE_MESSAGE, 503);
  }

  const body = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    data?: unknown;
  } | null;

  if (!response.ok || body?.success === false) {
    return routeHandlerError(
      normalizeUploadError(body?.message, response.status),
      response.status
    );
  }

  return routeHandlerSuccess(
    body?.message ?? "Files uploaded successfully",
    response.status,
    body?.data
  );
}

function normalizeUploadError(
  message: string | undefined,
  status: number
): string {
  const trimmed = message?.trim();
  if (trimmed && !isGenericServerError(trimmed)) return trimmed;

  if (status === 401 || status === 403) {
    return "You are not authorized to upload files. Please sign in again.";
  }

  if (status === 413) {
    return "One or more files are too large to upload.";
  }

  if (status === 429) {
    return "Relivo backend is receiving too many uploads right now. Please try again shortly.";
  }

  if (status >= 500) return BACKEND_UNAVAILABLE_MESSAGE;

  return "Unable to upload files. Please try again.";
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
