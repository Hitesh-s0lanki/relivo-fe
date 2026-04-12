import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function SidebarNavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: SidebarNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-150",
        active
          ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
          : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
      )}
    >
      <Icon className={cn("size-4 shrink-0")} />
      <span className="truncate font-semibold">{label}</span>
    </button>
  );
}
