import {
  routeHandlerError,
  routeHandlerSuccess,
} from "@/lib/API/route-handler-response";

const BACKEND_UNAVAILABLE_MESSAGE =
  "Relivo backend is temporarily unavailable. Please try again in a moment.";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ providerFileId: string }> }
) {
  const apiUrl =
    process.env.RELIVO_API_URL ??
    process.env.NEXT_PUBLIC_RELIVO_API_URL ??
    process.env.NEXT_PUBLIC_BE_SERVER_URL;

  if (!apiUrl) {
    return routeHandlerError("Relivo backend URL is not configured.", 500);
  }

  const { providerFileId } = await params;
  if (!providerFileId) {
    return routeHandlerError("Missing provider file id.", 400);
  }

  let response: Response;
  try {
    response = await fetch(
      `${apiUrl.replace(/\/$/, "")}/ai/uploads/${encodeURIComponent(
        providerFileId
      )}/presigned-url`,
      {
        method: "GET",
        signal: request.signal,
      }
    );
  } catch (error) {
    if (request.signal.aborted) {
      return routeHandlerError("Presigned URL request was cancelled.", 499);
    }

    console.error("Failed to refresh upload presigned URL", error);
    return routeHandlerError(BACKEND_UNAVAILABLE_MESSAGE, 503);
  }

  const body = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    data?: unknown;
  } | null;

  if (!response.ok || body?.success === false) {
    return routeHandlerError(
      normalizePresignedUrlError(body?.message, response.status),
      response.status
    );
  }

  return routeHandlerSuccess(
    body?.message ?? "Presigned URL refreshed successfully",
    response.status,
    body?.data
  );
}

function normalizePresignedUrlError(
  message: string | undefined,
  status: number
): string {
  const trimmed = message?.trim();
  if (trimmed && !isGenericServerError(trimmed)) return trimmed;

  if (status === 401 || status === 403) {
    return "You are not authorized to access this file. Please sign in again.";
  }

  if (status === 404) return "Uploaded file was not found.";

  if (status === 429) {
    return "Relivo backend is receiving too many file requests right now. Please try again shortly.";
  }

  if (status >= 500) return BACKEND_UNAVAILABLE_MESSAGE;

  return "Unable to refresh this file preview. Please try again.";
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
