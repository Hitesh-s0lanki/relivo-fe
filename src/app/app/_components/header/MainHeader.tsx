"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Bell, ChevronDown } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MainHeader() {
  const pathname = usePathname();
  const segment = pathname.split("/")[2] || null;
  const pageName = segment
    ? segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : null;

  return (
    <TooltipProvider>
      <header className="flex shrink-0 items-center justify-between bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        {/* Left: dropdown on /app, title on /app/{name} */}
        {pageName === null ? (
          <button className="text-md flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800">
            Relivo
            <ChevronDown className="size-4 text-zinc-500" />
          </button>
        ) : (
          <span className="px-2 py-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {pageName}
          </span>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="relative flex size-9 cursor-pointer items-center justify-center rounded-full border border-zinc-200 text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Notifications"
              >
                <Bell className="size-4.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
          <UserButton />
        </div>
      </header>
    </TooltipProvider>
  );
}
