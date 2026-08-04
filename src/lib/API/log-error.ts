import axios, { type AxiosError } from "axios";

const MAX_PAYLOAD_CHARS = 300;

/**
 * Logs a server-side failure as one readable line.
 *
 * Passing an `AxiosError` straight to `console.error` makes Node inspect the
 * whole object — config, the `ClientRequest` with its sockets, agents and
 * timers, and the response — which buries the cause in hundreds of lines. This
 * prints only what identifies the failure: what was called, what came back, and
 * what the backend said.
 *
 * The request body is deliberately never logged: ours carry user emails, avatar
 * URLs, and metadata that do not belong in server logs.
 */
export function logApiError(context: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(
      formatLine(`[relivo-api] ${context} — ${describeAxiosError(error)}`)
    );
    return;
  }

  // Not an HTTP failure, so this is a bug on our side — keep the stack.
  const thrown = error instanceof Error ? error : new Error(String(error));
  console.error(
    formatLine(`[relivo-api] ${context} — ${thrown.name}: ${thrown.message}`),
    thrown.stack ? `\n${thrown.stack}` : ""
  );
}

const ANSI = { red: "\x1b[31m", bold: "\x1b[1m", reset: "\x1b[0m" } as const;

/**
 * Colour is opt-out via `NO_COLOR` and opt-in via `FORCE_COLOR`, so piping logs
 * to a file or a collector leaves plain text behind rather than escape codes.
 */
const COLOR =
  typeof process !== "undefined" &&
  !process.env.NO_COLOR &&
  (Boolean(process.env.FORCE_COLOR && process.env.FORCE_COLOR !== "0") ||
    Boolean(process.stderr?.isTTY));

/** Titles the line `ERROR` so a failure is greppable and visible at a glance. */
function formatLine(message: string): string {
  if (!COLOR) return `ERROR ${message}`;

  return `${ANSI.bold}${ANSI.red}ERROR${ANSI.reset} ${ANSI.red}${message}${ANSI.reset}`;
}

function describeAxiosError(error: AxiosError): string {
  const method = error.config?.method?.toUpperCase() ?? "REQUEST";
  const url = `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`;
  const { response } = error;

  if (!response) {
    return `${method} ${url} — no response (${error.code ?? "unknown error"})`;
  }

  const payload = formatPayload(response.data);
  const statusText = response.statusText ? ` ${response.statusText}` : "";

  return `${method} ${url} — ${response.status}${statusText}${payload}`;
}

function formatPayload(data: unknown): string {
  if (data === undefined || data === null || data === "") return "";

  let text: string;
  try {
    text = typeof data === "string" ? data : JSON.stringify(data);
  } catch {
    return "";
  }

  if (!text) return "";

  const trimmed =
    text.length > MAX_PAYLOAD_CHARS
      ? `${text.slice(0, MAX_PAYLOAD_CHARS)}…`
      : text;

  return ` · ${trimmed}`;
}
