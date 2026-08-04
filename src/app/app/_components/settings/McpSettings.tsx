"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Blocks,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Copy,
  Ellipsis,
  Link2,
  Lock,
  Plug,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useDeleteMcpServer,
  useMcpServers,
  useTestMcpServer,
  useUpdateMcpServer,
} from "@/hooks/api-hooks/mcpApiHooks";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import type { McpServer, McpServerStatus } from "@/types/be-server";

import { AddMcpServerDialog } from "./AddMcpServerDialog";
import { EmptyState, ErrorNote, SettingsSection } from "./SettingsPrimitives";

export function McpSettings() {
  const { data, isPending, isError, error, refetch } = useMcpServers();
  const [addOpen, setAddOpen] = useState(false);

  const servers = data ?? [];
  const connected = servers.filter(
    ({ enabled, status }) => enabled && status === "ready"
  ).length;
  const toolCount = servers.reduce(
    (total, server) => total + (server.enabled ? server.toolCount : 0),
    0
  );

  return (
    <div className="space-y-7">
      <SettingsSection
        title="Custom MCP servers"
        icon={Blocks}
        description="Remote servers whose tools Relivo can call in your chats."
        action={
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            className="cursor-pointer"
          >
            <Plus />
            Add server
          </Button>
        }
      >
        {isPending ? (
          <div className="space-y-2">
            {[0, 1].map((row) => (
              <Skeleton key={row} className="h-[86px] rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <ErrorNote
            message={getApiErrorMessage(
              error,
              "Could not load your MCP servers."
            )}
            onRetry={() => refetch()}
          />
        ) : servers.length === 0 ? (
          <EmptyState
            icon={Plug}
            title="No MCP servers yet"
            description="Add a remote MCP server by URL and its tools become available to Relivo in every chat."
            action={
              <Button
                size="sm"
                onClick={() => setAddOpen(true)}
                className="cursor-pointer"
              >
                <Plus />
                Add MCP server
              </Button>
            }
          />
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              {connected} of {servers.length}{" "}
              {servers.length === 1 ? "server" : "servers"} connected ·{" "}
              {toolCount} {toolCount === 1 ? "tool" : "tools"} available
            </p>
            <div className="space-y-2">
              {servers.map((server) => (
                <McpServerCard key={server.id} server={server} />
              ))}
            </div>
          </>
        )}
      </SettingsSection>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Only use connectors from developers you trust. Relivo does not control
        which tools developers make available and cannot verify that they will
        work as intended or that they won&apos;t change.
      </p>

      <AddMcpServerDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        existingNames={servers.map(({ name }) => name)}
      />
    </div>
  );
}

function McpServerCard({ server }: { server: McpServer }) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const update = useUpdateMcpServer();
  const test = useTestMcpServer();
  const remove = useDeleteMcpServer();

  const label = server.displayName || server.name;
  const busy = update.isPending || test.isPending || remove.isPending;

  async function toggleEnabled(enabled: boolean) {
    try {
      await update.mutateAsync({ serverId: server.id, body: { enabled } });
      toast.success(enabled ? `${label} enabled` : `${label} disabled`);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, `Could not update ${label}.`));
    }
  }

  async function runTest() {
    try {
      const result = await test.mutateAsync(server.id);

      if (result?.status === "ready") {
        toast.success(`${label} connected`, {
          description: `${result.toolCount} ${
            result.toolCount === 1 ? "tool" : "tools"
          } discovered${result.latencyMs ? ` in ${result.latencyMs} ms` : ""}.`,
        });
        return;
      }

      toast.warning(`${label} did not connect`, {
        description: result?.error ?? "Relivo could not reach the server.",
      });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, `Could not test ${label}.`));
    }
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(server.url);
      toast.success("Server URL copied");
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }

  async function confirmRemove() {
    try {
      await remove.mutateAsync(server.id);
      toast.success(`${label} removed`);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, `Could not remove ${label}.`));
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card transition-opacity duration-150",
        !server.enabled && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3 px-3.5 py-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Plug className="size-4 text-muted-foreground" />
        </span>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-[13px] font-medium text-foreground">
              {label}
            </span>
            <McpStatusBadge status={server.status} />
            {server.auth.type !== "none" && (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <Lock className="size-3" />
                {authLabel(server)}
              </Badge>
            )}
          </div>

          <p
            className="truncate font-mono text-[11px] text-muted-foreground"
            title={server.url}
          >
            {server.url}
          </p>

          <p className="truncate text-[11px] text-muted-foreground">
            <span className="font-mono">mcp__{server.name}__*</span> ·{" "}
            {server.transport === "sse" ? "SSE" : "HTTP"} ·{" "}
            {server.lastConnectedAt
              ? `connected ${formatRelative(server.lastConnectedAt)}`
              : "never connected"}
          </p>

          {server.statusDetail && server.status !== "ready" && (
            <p className="flex items-start gap-1.5 pt-0.5 text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
              <CircleAlert className="mt-px size-3 shrink-0" />
              <span className="min-w-0">{server.statusDetail}</span>
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Switch
            checked={server.enabled}
            onCheckedChange={toggleEnabled}
            disabled={busy}
            aria-label={`${server.enabled ? "Disable" : "Enable"} ${label}`}
            className="cursor-pointer"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={busy}
                aria-label={`Actions for ${label}`}
                className="cursor-pointer text-muted-foreground"
              >
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onSelect={() => void runTest()}
                className="cursor-pointer"
              >
                <Link2 />
                Test connection
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => void copyUrl()}
                className="cursor-pointer"
              >
                <Copy />
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setConfirmDelete(true)}
                className="cursor-pointer"
              >
                <Trash2 />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {server.tools.length > 0 && (
        <Collapsible open={toolsOpen} onOpenChange={setToolsOpen}>
          <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-1.5 border-t border-border/60 px-3.5 py-2 text-[11px] font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground">
            <Wrench className="size-3" />
            {server.toolCount} {server.toolCount === 1 ? "tool" : "tools"}
            <ChevronDown
              className={cn(
                "size-3 transition-transform duration-150",
                toolsOpen && "rotate-180"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1.5 border-t border-border/60 px-3.5 py-2.5">
            {server.tools.map((tool) => (
              <div key={tool.name} className="min-w-0">
                <p className="truncate font-mono text-[11px] text-foreground">
                  {tool.name}
                </p>
                {tool.description && (
                  <p className="truncate text-[11px] text-muted-foreground">
                    {tool.description}
                  </p>
                )}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {label}?</AlertDialogTitle>
            <AlertDialogDescription>
              Its stored credentials are deleted and its tools stop appearing in
              your chats. You can add the server again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => void confirmRemove()}
            >
              {remove.isPending ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const STATUS_META: Record<
  McpServerStatus,
  {
    label: string;
    icon: typeof CircleCheck;
    variant: "secondary" | "outline" | "destructive";
    className?: string;
  }
> = {
  ready: { label: "Connected", icon: CircleCheck, variant: "secondary" },
  pending: { label: "Not tested", icon: CircleDashed, variant: "outline" },
  error: { label: "Error", icon: CircleAlert, variant: "destructive" },
  unauthorized: {
    label: "Needs auth",
    icon: Lock,
    variant: "outline",
    className:
      "border-amber-500/40 text-amber-700 dark:border-amber-500/30 dark:text-amber-400",
  },
};

/** Status chip. Colour is never the only signal — the label carries it too. */
function McpStatusBadge({ status }: { status: McpServerStatus }) {
  const { label, icon: Icon, variant, className } = STATUS_META[status];

  return (
    <Badge variant={variant} className={cn("gap-1", className)}>
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}

function authLabel(server: McpServer): string {
  if (server.auth.type === "bearer") return "Bearer token";
  if (server.auth.type === "oauth") return "OAuth";
  return server.auth.headerNames.join(", ") || "Header";
}

function formatRelative(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";

  return `${formatDistanceToNow(date)} ago`;
}
