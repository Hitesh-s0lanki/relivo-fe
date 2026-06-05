"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";

import {
  CURRENT_USER_CONVERSATIONS_QUERY_KEY,
  sortConversationsByUpdatedAt,
} from "@/lib/conversation-query";
import { cn } from "@/lib/utils";
import type { Conversation, ConversationList } from "@/types/be-server";

const LOADING_ROW_IDS = [
  "loading-chat-1",
  "loading-chat-2",
  "loading-chat-3",
  "loading-chat-4",
];

export function SidebarTasks() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: conversationList,
    error,
    isLoading,
  } = useQuery({
    queryKey: CURRENT_USER_CONVERSATIONS_QUERY_KEY,
    queryFn: getAllConversations,
  });

  const conversations = useMemo(
    () => sortConversationsByUpdatedAt(conversationList?.conversations ?? []),
    [conversationList]
  );

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return conversations;

    return conversations.filter((conversation) =>
      getConversationTitle(conversation).toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-3 pt-1 pb-3">
      <Link
        href="/"
        className="flex h-9 w-full items-center gap-2.5 rounded-lg bg-zinc-100 px-3 text-[13px] font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        <Plus className="size-4 shrink-0 stroke-[2.25]" />
        <span>New chat</span>
      </Link>

      <label className="relative mt-3 block">
        <span className="sr-only">Search chats</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="h-9 w-full rounded-lg border border-zinc-200 bg-white pr-3 pl-9 text-[13px] text-zinc-900 transition-colors outline-none placeholder:text-zinc-500 focus:border-zinc-300 focus:ring-3 focus:ring-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-700 dark:focus:ring-zinc-800/70"
        />
      </label>

      <div className="my-5 h-px bg-zinc-200 dark:bg-zinc-800" />

      <p className="px-2 pb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        Chat History
      </p>

      <div className="flex flex-col gap-0.5">
        {isLoading &&
          LOADING_ROW_IDS.map((rowId) => (
            <div
              key={rowId}
              className="h-8 rounded-md bg-zinc-100 dark:bg-zinc-900"
            />
          ))}

        {!isLoading &&
          filteredConversations.map((conversation) => {
            const title = getConversationTitle(conversation);
            const href = `/${conversation.id}`;
            const isActive = pathname === href;

            return (
              <Link
                key={conversation.id}
                href={href}
                className={cn(
                  "block w-full truncate rounded-md px-2 py-1.5 text-[13px] leading-5 font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800/70",
                  isActive && "bg-zinc-100 dark:bg-zinc-800/70"
                )}
                title={title}
              >
                {title}
              </Link>
            );
          })}

        {!isLoading && error && (
          <p className="px-2 py-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            {error instanceof Error ? error.message : "Failed to load chats"}
          </p>
        )}

        {!isLoading && !error && filteredConversations.length === 0 && (
          <p className="px-2 py-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            No chats found
          </p>
        )}
      </div>
    </div>
  );
}

async function getAllConversations(): Promise<ConversationList> {
  const response = await fetch("/api/ai/conversation/get-all");
  const body = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    data?: ConversationList;
  } | null;

  if (!response.ok || body?.success === false) {
    throw new Error(
      body?.message ?? `Failed to load chats: ${response.status}`
    );
  }

  return body?.data ?? { conversations: [] };
}

function getConversationTitle(conversation: Conversation): string {
  return conversation.title?.trim() || "Untitled chat";
}
