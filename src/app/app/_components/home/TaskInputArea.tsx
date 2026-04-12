"use client";

import { useState } from "react";
import { ArrowUp, Mic, Paperclip, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export function TaskInputArea() {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* Heading */}
      <h1 className="text-center text-[2rem] font-medium text-zinc-900 dark:text-zinc-50 sm:text-[2rem]">
        What can I help with?
      </h1>

      {/* Input box */}
      <div
        className={cn(
          "w-full max-w-2xl rounded-2xl border bg-white transition-colors dark:bg-zinc-900",
          focused
            ? "border-zinc-300 dark:border-zinc-600"
            : "border-zinc-200 dark:border-zinc-800",
        )}
      >
        {/* Textarea */}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Message Relivo..."
          rows={3}
          className="w-full resize-none rounded-t-2xl bg-transparent px-4 pb-2 pt-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-600"
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <div className="flex items-center gap-0.5">
            <IconBtn label="Add">
              <Plus className="size-4" />
            </IconBtn>
            <IconBtn label="Attach file">
              <Paperclip className="size-4" />
            </IconBtn>
            <IconBtn label="Voice input">
              <Mic className="size-4" />
            </IconBtn>
          </div>

          {/* Submit */}
          <button
            disabled={!value.trim()}
            className={cn(
              "flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-150",
              value.trim()
                ? "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                : "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600",
            )}
            aria-label="Submit"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      className="cursor-pointer rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      aria-label={label}
    >
      {children}
    </button>
  );
}
