"use client";

import Image from "next/image";
import { BookOpen, Plug, Plus, Search,Settings, Workflow } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { SidebarLogo } from "./SidebarLogo";
import { SidebarNav } from "./SidebarNav";
import { SidebarTasks } from "./SidebarTasks";

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
}

const FOOTER_ITEMS = [
  {
    icon: Search,
    label: "Search",
    description: "Search across your tasks & agents",
  },
  {
    icon: Plug,
    label: "Connectors",
    description: "Connect your tools & integrations",
  },
  {
    icon: Settings,
    label: "Settings",
    description: "Manage your account & preferences",
  },
];

const COLLAPSED_NAV = [
  { icon: Plus, label: "New Chat" },
  { icon: Workflow, label: "Orchestrator" },
  { icon: BookOpen, label: "Library" },
];

export function AppSidebar({ collapsed, onCollapse }: AppSidebarProps) {
  return (
    <TooltipProvider>
      <aside
        className={cn(
          "relative flex shrink-0 flex-col overflow-hidden border-r border-zinc-200 bg-white transition-all duration-300 ease-in-out dark:border-zinc-800 dark:bg-zinc-950",
          collapsed ? "w-12" : "w-60",
        )}
      >
        {/* Collapsed view */}
        {collapsed && (
          <div className="flex h-full flex-col items-center py-3">
            {/* Logo */}
            <button
              onClick={onCollapse}
              className="cursor-pointer rounded-md p-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Expand sidebar"
            >
              <Image src="/logo.svg" alt="Relivo" width={22} height={22} />
            </button>

            {/* Nav icons */}
            <div className="mt-3 flex flex-col items-center gap-0.5">
              {COLLAPSED_NAV.map(({ icon: Icon, label }) => (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    <button
                      className="cursor-pointer rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                      aria-label={label}
                    >
                      <Icon className="size-4.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Footer icons */}
            <div className="mt-auto flex flex-col items-center gap-0.5 border-t border-zinc-200 pt-2 dark:border-zinc-800">
              {FOOTER_ITEMS.map(({ icon: Icon, label }) => (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    <button
                      className="cursor-pointer rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                      aria-label={label}
                    >
                      <Icon className="size-4.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              ))}

              {/* User avatar */}
              <div className="mt-1 flex size-7 cursor-pointer items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-200 dark:bg-violet-900/40 dark:text-violet-300">
                H
              </div>
            </div>
          </div>
        )}

        {/* Expanded view */}
        {!collapsed && (
          <div className="flex h-full flex-col">
            <SidebarLogo onCollapse={onCollapse} />

            <SidebarNav />
            <SidebarTasks />

            {/* Footer */}
            <div className="border-t border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                {/* Utility icons */}
                <div className="flex items-center gap-0.5">
                  {FOOTER_ITEMS.map(({ icon: Icon, label }) => (
                    <Tooltip key={label}>
                      <TooltipTrigger asChild>
                        <button
                          className="cursor-pointer rounded-md p-1.5 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                          aria-label={label}
                        >
                          <Icon className="size-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">{label}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>

                {/* User avatar */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700 ring-2 ring-white transition-all hover:bg-violet-200 hover:ring-violet-100 dark:bg-violet-900/40 dark:text-violet-300 dark:ring-zinc-950"
                      aria-label="Account"
                    >
                      H
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Account</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
