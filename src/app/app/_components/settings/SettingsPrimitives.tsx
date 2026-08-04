"use client";

import { type ComponentType, type ReactNode, useState } from "react";
import { Check, CircleAlert, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type IconType = ComponentType<{ className?: string }>;

/** A labelled form control with optional helper text. */
export function FormField({
  label,
  description,
  htmlFor,
  children,
}: {
  label: string;
  description?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-semibold">
        {label}
      </Label>
      {description && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

/** A titled group of settings. `action` renders inline with the heading. */
export function SettingsSection({
  title,
  description,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  description?: string;
  icon?: IconType;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {Icon && <Icon className="size-3.5 text-muted-foreground" />}
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Bordered surface that groups rows or tiles. */
export function SettingsCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
    >
      {children}
    </div>
  );
}

/** A label/value row. Renders an em dash when the value is missing. */
export function DetailRow({
  label,
  value,
  badge,
  mono = false,
  copyable = false,
}: {
  label: string;
  value?: string | null;
  badge?: string;
  mono?: boolean;
  copyable?: boolean;
}) {
  return (
    <div className="group/row flex min-h-11 items-center justify-between gap-4 border-b border-border/60 px-3.5 py-2.5 last:border-b-0">
      <span className="shrink-0 text-[13px] text-muted-foreground">
        {label}
      </span>
      <span className="flex min-w-0 items-center gap-1.5">
        <span
          className={cn(
            "truncate text-[13px] font-medium text-foreground",
            mono && "font-mono text-xs",
            !value && "font-normal text-muted-foreground/60"
          )}
          title={value ?? undefined}
        >
          {value || "—"}
        </span>
        {value && badge && <StatusBadge label={badge} />}
        {value && copyable && <CopyButton value={value} label={label} />}
      </span>
    </div>
  );
}

/** Verified/Unverified style chip. Never colour-only — the text carries it too. */
export function StatusBadge({ label }: { label: string }) {
  const positive = label === "Verified" || label === "Primary";

  return (
    <Badge
      variant={positive ? "secondary" : "outline"}
      className={cn("shrink-0", !positive && "text-muted-foreground")}
    >
      {label}
    </Badge>
  );
}

/** Compact at-a-glance figure. */
export function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-3">
      <span className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3" />
        {label}
      </span>
      <p className="mt-1.5 truncate text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

/** Guidance for a section with nothing in it, with an optional next step. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: IconType;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-border px-4 py-7 text-center">
      <span className="mb-1 flex size-9 items-center justify-center rounded-full bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <p className="text-[13px] font-medium text-foreground">{title}</p>
      <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-2.5">{action}</div>}
    </div>
  );
}

/** A recoverable failure, with the way back out of it. */
export function ErrorNote({
  message,
  onRetry,
  retrying = false,
}: {
  message: string;
  onRetry: () => void;
  retrying?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5">
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500" />
      <div className="min-w-0 flex-1 space-y-2.5">
        <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
          {message}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          disabled={retrying}
          className="cursor-pointer"
        >
          <RefreshCw className={retrying ? "motion-safe:animate-spin" : ""} />
          Try again
        </Button>
      </div>
    </div>
  );
}

/** Copies a value and confirms it, inline and in a toast. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={copy}
      aria-label={`Copy ${label.toLowerCase()}`}
      className="shrink-0 cursor-pointer text-muted-foreground opacity-0 transition-opacity duration-150 group-hover/row:opacity-100 focus-visible:opacity-100"
    >
      {copied ? <Check className="text-emerald-500" /> : <Copy />}
    </Button>
  );
}
