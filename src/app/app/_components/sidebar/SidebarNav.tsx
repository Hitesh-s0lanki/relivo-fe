import { SquarePen } from "lucide-react";

import { SidebarNavItem } from "./SidebarNavItem";

export function SidebarNav() {
  return (
    <nav className="flex flex-col gap-0.5 px-2 py-1.5">
      <SidebarNavItem icon={SquarePen} label="New Chat" href="/" />
    </nav>
  );
}
