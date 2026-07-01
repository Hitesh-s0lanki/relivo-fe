"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { BookOpen, Plug, Plus, Settings, Workflow } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RELIVO_NEW_CHAT_EVENT } from "@/lib/chat-events";
import { cn } from "@/lib/utils";

import { SettingsDialog } from "../settings/SettingsDialog";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarTasks } from "./SidebarTasks";

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
}

const FOOTER_ITEMS = [
  {
    icon: Workflow,
    label: "Orchestrator",
    description: "Build and manage agent workflows",
    href: null,
  },
  {
    icon: BookOpen,
    label: "Library",
    description: "Browse saved resources and templates",
    href: null,
  },
  {
    icon: Plug,
    label: "Connectors",
    description: "Connect your tools & integrations",
    href: null,
    settingsTab: "connectors",
  },
  {
    icon: Settings,
    label: "Settings",
    description: "Manage your account & preferences",
    href: null,
    settingsTab: "general",
  },
];

const COLLAPSED_NAV = [{ icon: Plus, label: "New Chat", href: "/" }];

export function AppSidebar({ collapsed, onCollapse }: AppSidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("general");

  function handleNewChatClick() {
    window.dispatchEvent(new Event(RELIVO_NEW_CHAT_EVENT));
  }

  function openSettings(tab: string) {
    setSettingsTab(tab);
    setSettingsOpen(true);
  }

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "relative flex shrink-0 flex-col overflow-hidden border-r border-zinc-200 bg-white transition-all duration-300 ease-in-out dark:border-zinc-800 dark:bg-zinc-950",
          collapsed ? "w-12" : "w-72"
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
              {COLLAPSED_NAV.map(({ icon: Icon, label, href }) => (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    {href ? (
                      <Link
                        href={href}
                        onClick={
                          label === "New Chat" ? handleNewChatClick : undefined
                        }
                        className="cursor-pointer rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                        aria-label={label}
                      >
                        <Icon className="size-4.5" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="cursor-pointer rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                        aria-label={label}
                      >
                        <Icon className="size-4.5" />
                      </button>
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Footer icons */}
            <div className="mt-auto flex flex-col items-center gap-0.5 border-t border-zinc-200 pt-2 dark:border-zinc-800">
              {FOOTER_ITEMS.map(({ icon: Icon, label, href, settingsTab }) => (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    {href ? (
                      <Link
                        href={href}
                        className="cursor-pointer rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                        aria-label={label}
                      >
                        <Icon className="size-5" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={
                          settingsTab
                            ? () => openSettings(settingsTab)
                            : undefined
                        }
                        className="cursor-pointer rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                        aria-label={label}
                      >
                        <Icon className="size-5" />
                      </button>
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              ))}

              {/* User avatar */}
              <div className="mt-1 flex size-[1.875rem] cursor-pointer items-center justify-center rounded-full bg-primary/10 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/15 dark:bg-primary/15 dark:text-primary">
                H
              </div>
            </div>
          </div>
        )}

        {/* Expanded view */}
        {!collapsed && (
          <div className="flex h-full flex-col">
            <SidebarLogo onCollapse={onCollapse} />

            <SidebarTasks />

            {/* Footer */}
            <div className="border-t border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                {/* Utility icons */}
                <div className="flex items-center gap-0.5">
                  {FOOTER_ITEMS.map(
                    ({ icon: Icon, label, href, settingsTab }) => (
                      <Tooltip key={label}>
                        <TooltipTrigger asChild>
                          {href ? (
                            <Link
                              href={href}
                              className="cursor-pointer rounded-md p-2 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                              aria-label={label}
                            >
                              <Icon className="size-4.5" />
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={
                                settingsTab
                                  ? () => openSettings(settingsTab)
                                  : undefined
                              }
                              className="cursor-pointer rounded-md p-2 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                              aria-label={label}
                            >
                              <Icon className="size-4.5" />
                            </button>
                          )}
                        </TooltipTrigger>
                        <TooltipContent side="top">{label}</TooltipContent>
                      </Tooltip>
                    )
                  )}
                </div>

                {/* User avatar */}
                <UserButton />
              </div>
            </div>
          </div>
        )}
      </aside>
      <SettingsDialog
        open={settingsOpen}
        activeTab={settingsTab}
        onOpenChange={setSettingsOpen}
        onActiveTabChange={setSettingsTab}
      />
    </TooltipProvider>
  );
}
