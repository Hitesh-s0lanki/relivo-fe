"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";

const PREVIEW_SECTIONS = [
  { title: "Profile", rows: ["first", "last", "username", "id"] },
  { title: "Contact", rows: ["email", "phone"] },
];

/**
 * Signed-out state for the settings panels: an inert, blurred impression of the
 * real content behind a lock card. No user data is rendered here.
 */
export function SettingsLocked() {
  return (
    <div className="relative min-h-full">
      <div
        aria-hidden
        className="pointer-events-none space-y-7 blur-[6px] select-none"
      >
        {/* Identity */}
        <div className="flex items-center gap-4">
          <div className="size-16 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-44 rounded-md bg-muted" />
            <div className="h-4 w-56 rounded-md bg-muted/70" />
            <div className="h-4 w-28 rounded-md bg-muted/50" />
          </div>
        </div>

        {/* At a glance */}
        <div className="grid gap-2.5 sm:grid-cols-3">
          {[0, 1, 2].map((tile) => (
            <div
              key={tile}
              className="h-16 rounded-xl border border-border bg-muted/40"
            />
          ))}
        </div>

        {PREVIEW_SECTIONS.map(({ title, rows }) => (
          <section key={title} className="space-y-2.5">
            <div className="h-4 w-24 rounded-md bg-muted" />
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              {rows.map((row) => (
                <div
                  key={row}
                  className="flex min-h-11 items-center justify-between border-b border-border/60 px-3.5 py-2.5 last:border-b-0"
                >
                  <div className="h-3 w-24 rounded bg-muted/80" />
                  <div className="h-3 w-32 rounded bg-muted" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="absolute inset-0 flex items-start justify-center bg-background/50 pt-16">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 text-center shadow-xl">
          <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-muted">
            <Lock className="size-5 text-muted-foreground" />
          </span>
          <h3 className="mt-4 text-sm font-semibold text-foreground">
            Sign in to view your profile
          </h3>
          <p className="mx-auto mt-1.5 max-w-[36ch] text-xs leading-relaxed text-muted-foreground">
            Your account details, connected apps, and Relivo record are only
            available when you&apos;re signed in.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <Button size="sm" asChild className="cursor-pointer">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              asChild
              className="cursor-pointer"
            >
              <Link href="/sign-up">Create account</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
