"use client";

import { useState } from "react";

import { MainHeader } from "./_components/header/MainHeader";
import { AppSidebar } from "./_components/sidebar/AppSidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background dark:bg-zinc-950">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed((v) => !v)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MainHeader />
        <div className="flex flex-1 flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
