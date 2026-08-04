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
import {
  DetailRow,
  EmptyState,
  ErrorNote,
  SettingsSection,
} from "./SettingsPrimitives";

export function McpSettings() {
  const { data, isPending, isError, error, refetch } = useMcpServers();
  const [addOpen, setAddOpen] = useState(false);

  const servers = data ?? [];

  return (
    <div className="space-y-7">
      <SettingsSection
        title="Custom MCP servers"
        icon={Blocks}
        description="Tools Relivo can call in your chats."
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
              <Skeleton key={row} className="h-14 rounded-xl" />
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
            description="Add a server by URL to use its tools in every chat."
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
          <div className="space-y-2">
            {servers.map((server) => (
              <McpServerCard key={server.id} server={server} />
            ))}
          </div>
        )}
      </SettingsSection>

      <p className="text-xs text-muted-foreground">
        Only add servers from developers you trust — Relivo can&apos;t verify
        the tools they expose.
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
  const [detailsOpen, setDetailsOpen] = useState(false);
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
      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
        <div className="flex items-center gap-2 px-3.5 py-2.5">
          {/* The switch and menu sit outside the trigger — nesting controls
              inside a button would be invalid and unreachable by keyboard. */}
          <CollapsibleTrigger className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Plug className="size-4 text-muted-foreground" />
            </span>
            <span className="min-w-0 truncate text-[13px] font-medium text-foreground">
              {label}
            </span>
            <McpStatusBadge status={server.status} />
            <ChevronDown
              className={cn(
                "size-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
                detailsOpen && "rotate-180"
              )}
            />
          </CollapsibleTrigger>

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

        <CollapsibleContent>
          {server.statusDetail && server.status !== "ready" && (
            <p className="flex items-start gap-1.5 border-t border-border/60 px-3.5 py-2.5 text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
              <CircleAlert className="mt-px size-3 shrink-0" />
              <span className="min-w-0">{server.statusDetail}</span>
            </p>
          )}

          <div className="border-t border-border/60">
            <DetailRow label="URL" value={server.url} mono copyable />
            <DetailRow
              label="Transport"
              value={server.transport === "sse" ? "SSE" : "HTTP"}
            />
            <DetailRow
              label="Last connected"
              value={
                server.lastConnectedAt
                  ? formatRelative(server.lastConnectedAt)
                  : null
              }
            />
            <DetailRow
              label="Auth"
              value={server.auth.type === "none" ? null : authLabel(server)}
            />
          </div>

          {server.tools.length > 0 && (
            <div className="space-y-1.5 border-t border-border/60 px-3.5 py-2.5">
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Wrench className="size-3" />
                {server.toolCount} {server.toolCount === 1 ? "tool" : "tools"}
              </p>
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
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

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
