import { Download, Monitor } from "lucide-react";

export function DownloadCard() {
  return (
    <div className="flex w-full max-w-2xl items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Text */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Monitor className="size-4 text-zinc-400" />
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Download Relivo for desktop
          </p>
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Access local files and work seamlessly on Windows or macOS.
        </p>
        <button className="mt-2 flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
          <Download className="size-3" />
          Download
        </button>
      </div>

      {/* App preview thumbnail */}
      <div className="flex h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700/50 dark:bg-zinc-800">
        <div className="flex w-full flex-col">
          <div className="flex items-center gap-1 border-b border-zinc-200 bg-zinc-200/60 px-2 py-1 dark:border-zinc-700/50 dark:bg-zinc-700/40">
            <span className="size-2 rounded-full bg-red-400" />
            <span className="size-2 rounded-full bg-amber-400" />
            <span className="size-2 rounded-full bg-green-400" />
          </div>
          <div className="flex flex-1 gap-1 p-1.5">
            <div className="h-full w-8 rounded-md bg-zinc-200 dark:bg-zinc-700/70" />
            <div className="flex flex-1 flex-col gap-1">
              <div className="h-2 w-full rounded bg-zinc-200 dark:bg-zinc-700/70" />
              <div className="h-2 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700/70" />
              <div className="h-2 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700/70" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
