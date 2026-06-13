"use client";

import { Button } from "@/components/ui/button";

import type { Connector } from "../../_data/connectors";

interface ConnectorCardProps {
  connector: Connector;
  connected: boolean;
  onToggle: (id: string) => void;
}

export function ConnectorCard({
  connector,
  connected,
  onToggle,
}: ConnectorCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <span className="text-2xl leading-none">{connector.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
          {connector.name}
        </p>
        <p className="mt-0.5 text-[12px] text-zinc-500">
          {connector.description}
        </p>
      </div>
      <Button
        size="sm"
        variant={connected ? "outline" : "default"}
        onClick={() => onToggle(connector.id)}
        className="shrink-0"
        aria-label={
          connected
            ? `Disconnect ${connector.name}`
            : `Connect ${connector.name}`
        }
      >
        {connected ? "Disconnect" : "Connect"}
      </Button>
    </div>
  );
}
