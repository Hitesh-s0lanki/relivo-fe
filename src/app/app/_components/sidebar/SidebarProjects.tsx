import { Plus } from "lucide-react";

export function SidebarProjects() {
  return (
    <div className="mt-4 flex flex-col gap-0.5 px-2">
      <div className="flex items-center justify-between px-2.5 py-1">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Projects
        </p>
        <button
          className="cursor-pointer rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-200/60 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          aria-label="New project"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      <button className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-200/50 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-300">
        <Plus className="size-3.5" />
        <span>New project</span>
      </button>
    </div>
  );
}
