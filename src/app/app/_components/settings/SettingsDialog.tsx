"use client";

import { useUser } from "@clerk/nextjs";
import { Blocks, User } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { McpSettings } from "./McpSettings";
import { PersonalSettings } from "./PersonalSettings";
import { SettingsLocked } from "./SettingsLocked";

type SettingsDialogProps = {
  open: boolean;
  activeTab: string;
  onOpenChange: (open: boolean) => void;
  onActiveTabChange: (tab: string) => void;
};

const SETTINGS_TABS = [
  {
    value: "personal",
    label: "Personal",
    icon: User,
    description: "Your Clerk profile and Relivo account record.",
  },
  {
    value: "mcp",
    label: "MCP servers",
    icon: Blocks,
    description: "Remote MCP servers whose tools Relivo can use.",
  },
];

const DEFAULT_TAB = SETTINGS_TABS[0];

/** The rail is dead weight with a single section; it returns as sections are added. */
const SHOW_RAIL = SETTINGS_TABS.length > 1;

export function SettingsDialog({
  open,
  activeTab,
  onOpenChange,
  onActiveTabChange,
}: SettingsDialogProps) {
  const { isLoaded, isSignedIn } = useUser();

  // Clerk reports `isSignedIn: false` until it loads — showing the lock screen
  // on that first pass would flash it at signed-in users.
  const locked = isLoaded && !isSignedIn;

  // Callers may still hold a tab value from a panel that no longer exists.
  const current =
    SETTINGS_TABS.find(({ value }) => value === activeTab) ?? DEFAULT_TAB;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "grid h-[min(680px,calc(100dvh-2rem))] w-[calc(100vw-1.5rem)] grid-rows-[auto_1fr] gap-0 overflow-hidden rounded-2xl p-0",
          // Wider only when the rail needs the room.
          SHOW_RAIL ? "max-w-4xl sm:max-w-4xl" : "max-w-2xl sm:max-w-2xl"
        )}
      >
        <DialogHeader className="border-b border-border px-5 py-3.5 pr-14">
          <DialogTitle className="text-base font-semibold tracking-tight">
            Settings
          </DialogTitle>
          <DialogDescription className="text-xs">
            {SHOW_RAIL
              ? "Manage your account, preferences, and Relivo capabilities."
              : current.description}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={current.value}
          onValueChange={onActiveTabChange}
          orientation="vertical"
          className="min-h-0 gap-0 md:flex-row"
        >
          {SHOW_RAIL && (
            <TabsList
              variant="line"
              className="h-auto w-full shrink-0 justify-start overflow-x-auto rounded-none border-b border-border px-2 py-2 md:w-52 md:flex-col md:overflow-x-visible md:border-r md:border-b-0 md:p-2.5"
            >
              {SETTINGS_TABS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="h-8 cursor-pointer justify-start px-2.5 text-[13px] transition-colors duration-150 md:w-full"
                >
                  <Icon className="size-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <TabsContent value="personal" className="m-0 px-5 py-5 sm:px-6">
              {locked ? <SettingsLocked /> : <PersonalSettings />}
            </TabsContent>

            <TabsContent value="mcp" className="m-0 px-5 py-5 sm:px-6">
              {locked ? <SettingsLocked /> : <McpSettings />}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
