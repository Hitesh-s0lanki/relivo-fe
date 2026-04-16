"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronDown, HelpCircle } from "lucide-react";

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
          <button className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800">
            Relivo
            <ChevronDown className="size-4" />
          </button>
        ) : (
          <span className="px-2 py-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {pageName}
          </span>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="cursor-pointer rounded-md p-1.5 text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Help"
              >
                <HelpCircle className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Help</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="relative cursor-pointer rounded-md p-1.5 text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                {/* Notification dot */}
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-violet-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}
