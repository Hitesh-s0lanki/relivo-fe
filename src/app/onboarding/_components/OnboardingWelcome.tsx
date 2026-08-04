"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Check, CircleAlert, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getBrowserSyncInput,
  useSyncRelivoUser,
} from "@/hooks/api-hooks/userApiHooks";
import { getApiErrorMessage } from "@/lib/api-error";

/**
 * Landing step after Clerk sign-up. Creates the user's row in the Relivo
 * database via the idempotent upsert, then hands them off to the app.
 */
export function OnboardingWelcome() {
  const { isLoaded, isSignedIn } = useUser();
  const { mutate, isPending, isError, isSuccess, error } = useSyncRelivoUser();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasSynced.current) return;

    hasSynced.current = true;
    mutate({ ...getBrowserSyncInput(), onboarding_completed: true });
  }, [isLoaded, isSignedIn, mutate]);

  function retry() {
    mutate({ ...getBrowserSyncInput(), onboarding_completed: true });
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Welcome to Relivo
      </h1>
      <p className="mt-3 text-sm text-zinc-500">
        Your account is set up. Let&apos;s get you started.
      </p>

      {isError ? (
        <div className="mt-6 space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-left dark:border-amber-900/60 dark:bg-amber-950/30">
          <div className="flex items-start gap-2">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              {getApiErrorMessage(
                error,
                "We couldn't finish setting up your profile."
              )}{" "}
              You can continue — we&apos;ll try again later.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={retry}>
            Try again
          </Button>
        </div>
      ) : (
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-400">
          {isPending && <Loader2 className="size-3.5 animate-spin" />}
          {isSuccess && <Check className="size-3.5 text-emerald-500" />}
          {isPending
            ? "Setting up your profile…"
            : isSuccess
              ? "Profile ready"
              : " "}
        </p>
      )}

      <Button className="mt-8 w-full" size="lg" asChild>
        <Link href="/app">Go to App</Link>
      </Button>
    </div>
  );
}
