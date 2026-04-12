"use client";

import { useState } from "react";
import { Link2, X } from "lucide-react";

const TOOLS = [
  { label: "Slack",  bg: "bg-[#611f69]", text: "S" },
  { label: "GitHub", bg: "bg-[#24292e]", text: "G" },
  { label: "Notion", bg: "bg-zinc-800",  text: "N" },
  { label: "Jira",   bg: "bg-[#0052cc]", text: "J" },
  { label: "Figma",  bg: "bg-[#a259ff]", text: "F" },
  { label: "Gmail",  bg: "bg-[#ea4335]", text: "G" },
  { label: "Linear", bg: "bg-[#5e6ad2]", text: "L" },
  { label: "Drive",  bg: "bg-[#1a73e8]", text: "D" },
];

export function ToolsConnectBar() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex w-full max-w-2xl items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
      <Link2 className="size-4 shrink-0 text-zinc-400" />

      <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
        Connect your tools
      </span>

      <div className="flex flex-1 items-center gap-1.5 overflow-hidden">
        {TOOLS.map((tool) => (
          <button
            key={tool.label}
            title={tool.label}
            className={`flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full ${tool.bg} text-[10px] font-bold text-white opacity-75 transition-opacity hover:opacity-100`}
          >
            {tool.text}
          </button>
        ))}
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="ml-auto shrink-0 cursor-pointer rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        aria-label="Dismiss"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
