import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AccountSettingsPage() {
  return (
    <div className="space-y-8">
      {/* Plan */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Plan
        </h2>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                  Free Plan
                </span>
                <Badge variant="secondary" className="text-[11px]">
                  Current
                </Badge>
              </div>
              <p className="text-[12px] text-zinc-500">
                100 messages/month · 2 connectors · Basic skills
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/pricing">Upgrade to Pro</Link>
            </Button>
          </div>
        </Card>
      </section>

      {/* Account details */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Account Details
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <span className="text-[13px] text-zinc-500">Email</span>
            <span className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
              hitesh.solanki@strique.io
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <span className="text-[13px] text-zinc-500">Member since</span>
            <span className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
              April 2026
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-zinc-500">Account ID</span>
            <span className="font-mono text-[12px] text-zinc-400">
              usr_relivo_001
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
