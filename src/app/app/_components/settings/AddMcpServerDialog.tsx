"use client";

import { type FormEvent, useState } from "react";
import {
  ChevronDown,
  CircleAlert,
  Link2,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateMcpServer,
  useTestMcpServer,
} from "@/hooks/api-hooks/mcpApiHooks";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import {
  MCP_SERVER_NAME_PATTERN,
  type McpAuthInput,
  type McpAuthType,
  type McpServerCreate,
  type McpTransport,
} from "@/types/be-server";

type AddMcpServerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Slugs already registered — a collision is a 409 from the backend. */
  existingNames: string[];
};

type HeaderRow = { id: number; name: string; value: string };

const AUTH_OPTIONS: { value: McpAuthType; label: string; hint: string }[] = [
  { value: "none", label: "None", hint: "The server is public." },
  {
    value: "header",
    label: "API key header",
    hint: "Sent verbatim on every request, e.g. x-api-key.",
  },
  {
    value: "bearer",
    label: "Bearer token",
    hint: "Sent as Authorization: Bearer <token>.",
  },
  {
    value: "oauth",
    label: "OAuth",
    hint: "Client credentials; endpoints are discovered from the server.",
  },
];

const MAX_HEADERS = 10;

let headerRowId = 0;

function emptyHeaderRow(): HeaderRow {
  headerRowId += 1;
  return { id: headerRowId, name: "", value: "" };
}

/**
 * The form lives in a child so the dialog's own unmount resets it — a second
 * visit always starts clean, without an effect that clears state on open.
 */
export function AddMcpServerDialog({
  open,
  onOpenChange,
  existingNames,
}: AddMcpServerDialogProps) {
  const [busy, setBusy] = useState(false);

  return (
    <Dialog
      open={open}
      // Closing mid-request would strand the create/test pair half-done.
      onOpenChange={busy ? () => {} : onOpenChange}
    >
      <DialogContent className="grid max-h-[min(680px,calc(100dvh-2rem))] grid-rows-[auto_1fr_auto] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <AddMcpServerForm
          existingNames={existingNames}
          busy={busy}
          onBusyChange={setBusy}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function AddMcpServerForm({
  existingNames,
  busy,
  onBusyChange,
  onClose,
}: {
  existingNames: string[];
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
  onClose: () => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [url, setUrl] = useState("");
  const [transport, setTransport] = useState<McpTransport>("http");
  const [authType, setAuthType] = useState<McpAuthType>("none");
  const [headers, setHeaders] = useState<HeaderRow[]>(() => [emptyHeaderRow()]);
  const [token, setToken] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCreateMcpServer();
  const test = useTestMcpServer();

  const slug = slugify(displayName);
  const publishing = test.isPending;

  function updateHeader(id: number, patch: Partial<HeaderRow>) {
    setHeaders((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  }

  async function submit(publish: boolean) {
    const validation = buildPayload({
      displayName,
      slug,
      url,
      transport,
      authType,
      headers,
      token,
      clientId,
      clientSecret,
      existingNames,
    });

    if ("error" in validation) {
      setError(validation.error);
      if (validation.advanced) setAdvancedOpen(true);
      return;
    }

    setError(null);
    onBusyChange(true);

    try {
      const server = await create.mutateAsync(validation.payload);
      const label =
        server?.displayName || server?.name || validation.payload.name;

      if (!publish || !server) {
        toast.success(`${label} added`, {
          description: "Saved without connecting. Test it when you're ready.",
        });
        onClose();
        return;
      }

      // Publishing is create + connect: the server only reaches the agent once
      // a live connection has confirmed its tools.
      const result = await test.mutateAsync(server.id);

      if (result?.status === "ready") {
        toast.success(`${label} connected`, {
          description: `${result.toolCount} ${
            result.toolCount === 1 ? "tool" : "tools"
          } available to Relivo.`,
        });
      } else {
        toast.warning(`${label} saved, but not connected`, {
          description:
            result?.error ??
            "Relivo could not reach the server. Test it again.",
        });
      }

      onClose();
    } catch (mutationError: unknown) {
      setError(
        getApiErrorMessage(mutationError, "Could not add this MCP server.")
      );
    } finally {
      onBusyChange(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(true);
  }

  return (
    <>
      <DialogHeader className="border-b border-border px-5 py-3.5 pr-14">
        <DialogTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
          Add MCP by URL
          <Badge variant="outline" className="text-muted-foreground">
            Beta
          </Badge>
        </DialogTitle>
        <DialogDescription className="text-xs">
          Connect a remote MCP server so its tools are available in your chats.
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={onSubmit}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="mcp-name" className="text-[13px]">
            Server name <RequiredMark />
          </Label>
          <Input
            id="mcp-name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="e.g., My Custom Server"
            autoComplete="off"
            disabled={busy}
            className="h-9"
          />
          <p className="text-[11px] text-muted-foreground">
            {slug ? (
              <>
                Its tools appear as{" "}
                <span className="font-mono">mcp__{slug}__*</span>
              </>
            ) : (
              "Used to namespace the server's tools."
            )}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="mcp-url" className="text-[13px]">
            Server URL <RequiredMark />
          </Label>
          <div className="relative">
            <Link2 className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="mcp-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://mcp.yourserver.com/mcp"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              disabled={busy}
              className="h-9 pl-8 font-mono text-xs"
            />
          </div>
        </div>

        <Collapsible
          open={advancedOpen}
          onOpenChange={setAdvancedOpen}
          className="rounded-xl border border-border"
        >
          <CollapsibleTrigger
            disabled={busy}
            className="flex w-full cursor-pointer items-center justify-between gap-2 px-3.5 py-2.5 text-left"
          >
            <span className="flex items-center gap-2 text-[13px] font-medium text-foreground">
              <Settings2 className="size-3.5 text-muted-foreground" />
              Advanced settings
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </span>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform duration-150",
                advancedOpen && "rotate-180"
              )}
            />
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-3.5 border-t border-border px-3.5 py-3.5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="mcp-auth" className="text-[13px]">
                  Authentication
                </Label>
                <Select
                  value={authType}
                  onValueChange={(value) => setAuthType(value as McpAuthType)}
                  disabled={busy}
                >
                  <SelectTrigger id="mcp-auth" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUTH_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mcp-transport" className="text-[13px]">
                  Transport
                </Label>
                <Select
                  value={transport}
                  onValueChange={(value) => setTransport(value as McpTransport)}
                  disabled={busy}
                >
                  <SelectTrigger id="mcp-transport" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="http">Streamable HTTP</SelectItem>
                    <SelectItem value="sse">SSE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              {AUTH_OPTIONS.find(({ value }) => value === authType)?.hint}
            </p>

            {authType === "header" && (
              <div className="space-y-2">
                {headers.map((header, index) => (
                  <div key={header.id} className="flex items-center gap-2">
                    <Input
                      value={header.name}
                      onChange={(event) =>
                        updateHeader(header.id, { name: event.target.value })
                      }
                      placeholder="Header name"
                      autoComplete="off"
                      spellCheck={false}
                      disabled={busy}
                      className="font-mono text-xs"
                      aria-label={`Header ${index + 1} name`}
                    />
                    <Input
                      value={header.value}
                      onChange={(event) =>
                        updateHeader(header.id, { value: event.target.value })
                      }
                      placeholder="Value"
                      type="password"
                      autoComplete="off"
                      spellCheck={false}
                      disabled={busy}
                      className="font-mono text-xs"
                      aria-label={`Header ${index + 1} value`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={busy || headers.length === 1}
                      onClick={() =>
                        setHeaders((rows) =>
                          rows.filter((row) => row.id !== header.id)
                        )
                      }
                      aria-label={`Remove header ${index + 1}`}
                      className="shrink-0 cursor-pointer text-muted-foreground"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  disabled={busy || headers.length >= MAX_HEADERS}
                  onClick={() =>
                    setHeaders((rows) => [...rows, emptyHeaderRow()])
                  }
                  className="cursor-pointer text-muted-foreground"
                >
                  <Plus />
                  Add header
                </Button>
              </div>
            )}

            {authType === "bearer" && (
              <div className="space-y-1.5">
                <Label htmlFor="mcp-token" className="text-[13px]">
                  Token
                </Label>
                <Input
                  id="mcp-token"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="Bearer token"
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={busy}
                  className="font-mono text-xs"
                />
              </div>
            )}

            {authType === "oauth" && (
              <div className="space-y-2">
                <Input
                  value={clientId}
                  onChange={(event) => setClientId(event.target.value)}
                  placeholder="OAuth client ID"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={busy}
                  aria-label="OAuth client ID"
                  className="font-mono text-xs"
                />
                <Input
                  value={clientSecret}
                  onChange={(event) => setClientSecret(event.target.value)}
                  placeholder="OAuth client secret"
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={busy}
                  aria-label="OAuth client secret"
                  className="font-mono text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Leave both blank to register this client dynamically.
                </p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs leading-relaxed text-destructive"
          >
            <CircleAlert className="mt-px size-3.5 shrink-0" />
            {error}
          </p>
        )}

        <p className="text-xs leading-relaxed text-muted-foreground">
          Only use connectors from developers you trust. Relivo does not control
          which tools developers make available and cannot verify that they will
          work as intended or that they won&apos;t change.
        </p>

        {/* Submits the form so Enter publishes, matching the primary button. */}
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>

      <DialogFooter className="m-0 gap-2 rounded-none border-t border-border px-5 py-3.5 sm:justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={onClose}
          className="cursor-pointer"
        >
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => void submit(false)}
            className="cursor-pointer"
          >
            {create.isPending && !publishing ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            disabled={busy}
            onClick={() => void submit(true)}
            className="cursor-pointer"
          >
            {publishing ? "Connecting…" : "Save and publish"}
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}

function RequiredMark() {
  return (
    <span aria-hidden className="text-destructive">
      *
    </span>
  );
}

type PayloadResult =
  | { payload: McpServerCreate }
  | { error: string; advanced?: boolean };

/**
 * Mirrors the backend's schema rules closely enough to fail fast in the form.
 * The backend stays the authority — anything that slips through comes back as
 * an inline error rather than being caught twice.
 */
function buildPayload({
  displayName,
  slug,
  url,
  transport,
  authType,
  headers,
  token,
  clientId,
  clientSecret,
  existingNames,
}: {
  displayName: string;
  slug: string;
  url: string;
  transport: McpTransport;
  authType: McpAuthType;
  headers: HeaderRow[];
  token: string;
  clientId: string;
  clientSecret: string;
  existingNames: string[];
}): PayloadResult {
  const name = displayName.trim();

  if (!name) return { error: "Give the server a name." };
  if (!MCP_SERVER_NAME_PATTERN.test(slug)) {
    return {
      error:
        "That name can't be turned into a server ID. Use letters, numbers, dashes, or underscores.",
    };
  }
  if (existingNames.includes(slug)) {
    return { error: `A server named "${slug}" already exists.` };
  }

  const trimmedUrl = url.trim();
  if (!trimmedUrl) return { error: "Add the server's URL." };
  if (!trimmedUrl.startsWith("https://")) {
    return { error: "The URL must be an absolute https:// address." };
  }
  if (trimmedUrl.includes("#")) {
    return { error: "The URL must not contain a fragment (#)." };
  }
  if (/\s/.test(trimmedUrl)) {
    return { error: "The URL must not contain spaces." };
  }

  const auth = buildAuth({
    authType,
    headers,
    token,
    clientId,
    clientSecret,
  });

  if ("error" in auth) return { error: auth.error, advanced: true };

  return {
    payload: {
      name: slug,
      display_name: name === slug ? null : name,
      url: trimmedUrl,
      transport,
      auth: auth.value,
    },
  };
}

function buildAuth({
  authType,
  headers,
  token,
  clientId,
  clientSecret,
}: {
  authType: McpAuthType;
  headers: HeaderRow[];
  token: string;
  clientId: string;
  clientSecret: string;
}): { value: McpAuthInput } | { error: string } {
  if (authType === "bearer") {
    const trimmed = token.trim();
    if (!trimmed) return { error: "Add the bearer token, or pick None." };
    return { value: { type: "bearer", token: trimmed } };
  }

  if (authType === "header") {
    const entries = headers
      .map(({ name, value }) => [name.trim(), value.trim()] as const)
      .filter(([name, value]) => name || value);

    if (!entries.length) {
      return { error: "Add at least one header, or pick None." };
    }

    const incomplete = entries.find(([name, value]) => !name || !value);
    if (incomplete) {
      return { error: "Every header needs both a name and a value." };
    }

    const names = entries.map(([name]) => name.toLowerCase());
    if (new Set(names).size !== names.length) {
      return { error: "Header names must be unique." };
    }

    return {
      value: {
        type: "header",
        headers: Object.fromEntries(entries),
      },
    };
  }

  if (authType === "oauth") {
    const id = clientId.trim();
    const secret = clientSecret.trim();

    if (!id && secret) {
      return { error: "Add the OAuth client ID that goes with this secret." };
    }

    // No client id means the client is registered on the fly (RFC 7591).
    return {
      value: id
        ? {
            type: "oauth",
            registration: "manual",
            client_id: id,
            ...(secret ? { client_secret: secret } : {}),
          }
        : { type: "oauth", registration: "dynamic" },
    };
  }

  return { value: { type: "none" } };
}

/** Same normalization the backend applies to a pasted server key. */
function slugify(value: string): string {
  const trimmed = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .slice(0, 64);

  return trimmed.replace(/^[-_]+/, "").replace(/[-_]+$/, "");
}
