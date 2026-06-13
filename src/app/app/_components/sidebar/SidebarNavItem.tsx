import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}

export function SidebarNavItem({
  icon: Icon,
  label,
  active,
  href,
  onClick,
}: SidebarNavItemProps) {
  const className = cn(
    "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-150",
    active
      ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary"
      : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
  );
  const content = (
    <>
      <Icon className={cn("size-4 shrink-0")} />
      <span className="truncate font-semibold">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
