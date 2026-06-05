"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Layers, Plug, Settings, User, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "General", href: "/app/settings/general", icon: Settings },
  { label: "Account", href: "/app/settings/account", icon: User },
  { label: "Usage", href: "/app/settings/usage", icon: BarChart2 },
  { label: "Capabilities", href: "/app/settings/capabilities", icon: Zap },
  { label: "Connectors", href: "/app/settings/connectors", icon: Plug },
  { label: "Skills", href: "/app/settings/skills", icon: Layers },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="w-full max-w-4xl px-6 py-8">
      <div className="flex gap-8">
        {/* Sidebar nav */}
        <nav className="w-48 shrink-0">
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-semibold transition-colors duration-150",
                    pathname === href
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Page content */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
