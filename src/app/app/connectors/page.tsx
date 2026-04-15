"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ConnectorCard } from "../_components/ConnectorCard";
import { CONNECTORS } from "../_data/connectors";

export default function ConnectorsPage() {
  const [query, setQuery] = useState("");
  const [showConnected, setShowConnected] = useState(false);
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

  const filtered = CONNECTORS.filter((c) => {
    const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = showConnected ? connected.has(c.id) : true;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Connectors
        </h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Connect your tools to supercharge Relivo.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search connectors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 text-[13px]"
          />
        </div>
        <Button
          variant={showConnected ? "default" : "outline"}
          size="sm"
          onClick={() => setShowConnected((v) => !v)}
        >
          Connected
        </Button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-zinc-400">
            No connectors found.
          </p>
        ) : (
          filtered.map((connector) => (
            <ConnectorCard
              key={connector.id}
              connector={connector}
              connected={connected.has(connector.id)}
              onToggle={toggleConnector}
            />
          ))
        )}
      </div>
    </div>
  );
}
