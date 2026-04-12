import Image from "next/image";
import { PanelLeft } from "lucide-react";

interface SidebarLogoProps {
  onCollapse?: () => void;
}

export function SidebarLogo({ onCollapse }: SidebarLogoProps) {
  return (
    <div className="flex items-center justify-between px-3 py-3">
      <div className="flex items-center gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg">
          <Image
            src="/logo.svg"
            alt="Relivo"
            width={28}
            height={28}
            className="object-contain"
          />
        </div>
        {/* <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Relivo
        </span> */}
      </div>

      <button
        onClick={onCollapse}
        className="cursor-pointer rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        aria-label="Collapse sidebar"
      >
        <PanelLeft className="size-4" />
      </button>
    </div>
  );
}
