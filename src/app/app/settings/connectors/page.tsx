"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CONNECTORS } from "../../_data/connectors";
import { ConnectorCard } from "../../connectors/_components/ConnectorCard";

export default function SettingsConnectorsPage() {
  const [connected, setConnected] = useState<Set<string>>(new Set());

  function toggleConnector(id: string) {
    setConnected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Connectors
        </h2>
        <Link
          href="/app/connectors"
          className="flex items-center gap-1 text-[12px] text-violet-600 hover:text-violet-700 dark:text-violet-400"
        >
          Manage all connectors <ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {CONNECTORS.map((connector) => (
          <ConnectorCard
            key={connector.id}
            connector={connector}
            connected={connected.has(connector.id)}
            onToggle={toggleConnector}
          />
        ))}
      </div>
    </div>
  );
}
