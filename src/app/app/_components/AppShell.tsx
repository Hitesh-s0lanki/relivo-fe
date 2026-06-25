"use client";

import { useState } from "react";

import { MainHeader } from "./header/MainHeader";
import { AppSidebar } from "./sidebar/AppSidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background dark:bg-zinc-950">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed((value) => !value)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MainHeader />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
