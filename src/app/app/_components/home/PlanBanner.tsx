"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type Plan = "free" | "upgrade";

export function PlanBanner() {
  const [selected, setSelected] = useState<Plan>("free");

  return (
    <div className="flex items-center rounded-full border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
      <button
        onClick={() => setSelected("free")}
        className={cn(
          "cursor-pointer rounded-full px-3.5 py-1 text-xs font-medium transition-colors duration-150",
          selected === "free"
            ? "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
            : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        )}
      >
        Free plan
      </button>
      <button
        onClick={() => setSelected("upgrade")}
        className={cn(
          "flex cursor-pointer items-center gap-1 rounded-full px-3.5 py-1 text-xs font-medium transition-all duration-150",
          selected === "upgrade"
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        )}
      >
        <Sparkles className="size-3" />
        Upgrade
      </button>
    </div>
  );
}
