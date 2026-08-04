import axios from "axios";

/**
 * Pulls the human-readable message out of a failed route-handler call.
 *
 * Route handlers respond with `{ success, message }` and a non-2xx status, which
 * axios turns into an error whose own `message` is just "Request failed with
 * status code 404". The useful text lives in the payload.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message.trim();

    if (!error.response)
      return "Could not reach the server. Check your connection.";
  }

  if (error instanceof Error && error.message.trim()) {
    if (/^request failed with status code \d+$/i.test(error.message.trim())) {
      return fallback;
    }
    return error.message.trim();
  }

  return fallback;
}
