"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { BadgeCheck, CircleAlert, Database, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  getBrowserSyncInput,
  useRelivoUser,
  useSyncRelivoUser,
  useUpdateRelivoUser,
} from "@/hooks/api-hooks/userApiHooks";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  PREFERENCE_KEYS,
  type RelivoUser,
  type RelivoUserProfileInput,
  TEAM_SIZES,
  WORK_FUNCTIONS,
} from "@/types/be-server";

import { EmptyState, FormField, SettingsSection } from "./SettingsPrimitives";

/** The editable half of the profile. Clerk-owned identity is not in here. */
type ProfileFormState = {
  work_function: string;
  job_title: string;
  company_name: string;
  industry: string;
  team_size: string;
  about_you: string;
  response_preferences: string;
};

export function PersonalSettings() {
  const { isLoaded, user } = useUser();
  const { data, isPending, isError, error, refetch } = useRelivoUser();

  if (!isLoaded || !user || isPending) return <PersonalSettingsSkeleton />;

  if (isError) {
    return (
      <ErrorNote
        message={getApiErrorMessage(error, "Could not load your profile.")}
        onRetry={() => refetch()}
      />
    );
  }

  const primaryEmail = user.primaryEmailAddress?.emailAddress;

  return (
    <div className="space-y-7">
      {/* Identity — read-only, owned by Clerk */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-lg font-semibold text-muted-foreground ring-2 ring-border ring-offset-2 ring-offset-background">
          {user.hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt={user.fullName ?? "Profile photo"}
              className="size-full object-cover"
            />
          ) : (
            getInitials(user.fullName, primaryEmail)
          )}
        </span>

        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="truncate text-lg font-semibold tracking-tight text-foreground">
            {user.fullName ?? user.username ?? "Unnamed user"}
          </h3>
          <p className="truncate text-sm text-muted-foreground">
            {primaryEmail ?? "No email on file"}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {user.hasVerifiedEmailAddress && (
              <Badge variant="secondary" className="gap-1">
                <BadgeCheck className="size-3" />
                Verified
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              Managed by your sign-in provider
            </span>
          </div>
        </div>
      </div>

      {data ? (
        // Keyed on the save timestamp: the form re-seeds after a save, but a
        // background refetch returning identical data leaves edits in place.
        <ProfileForm key={data.updatedAt ?? data.id} user={data} />
      ) : (
        <NotSyncedState onSynced={() => refetch()} />
      )}
    </div>
  );
}

function ProfileForm({ user }: { user: RelivoUser }) {
  const update = useUpdateRelivoUser();
  const saved = useMemo(() => toForm(user), [user]);
  const [form, setForm] = useState<ProfileFormState>(saved);

  const dirty = (Object.keys(saved) as (keyof ProfileFormState)[]).some(
    (key) => form[key] !== saved[key]
  );

  function set(key: keyof ProfileFormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function save() {
    update.mutate(toPayload(form, saved));
  }

  return (
    <form
      className="space-y-7"
      onSubmit={(event) => {
        event.preventDefault();
        if (dirty && !update.isPending) save();
      }}
    >
      <SettingsSection
        title="About you"
        description="Helps Relivo tailor its answers to your work."
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Work function" htmlFor="settings-work-function">
              <Select
                value={form.work_function}
                onValueChange={(value) => set("work_function", value)}
              >
                <SelectTrigger
                  id="settings-work-function"
                  className="w-full cursor-pointer"
                >
                  <SelectValue placeholder="Select your work function" />
                </SelectTrigger>
                <SelectContent>
                  {WORK_FUNCTIONS.map((value) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="cursor-pointer"
                    >
                      {toTitleCase(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Team size" htmlFor="settings-team-size">
              <Select
                value={form.team_size}
                onValueChange={(value) => set("team_size", value)}
              >
                <SelectTrigger
                  id="settings-team-size"
                  className="w-full cursor-pointer"
                >
                  <SelectValue placeholder="Select team size" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_SIZES.map((value) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="cursor-pointer"
                    >
                      {value === "1" ? "Just me" : `${value} people`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Job title" htmlFor="settings-job-title">
              <Input
                id="settings-job-title"
                value={form.job_title}
                onChange={(event) => set("job_title", event.target.value)}
                placeholder="Backend Engineer"
              />
            </FormField>

            <FormField label="Company" htmlFor="settings-company">
              <Input
                id="settings-company"
                value={form.company_name}
                onChange={(event) => set("company_name", event.target.value)}
                placeholder="Relivo"
              />
            </FormField>
          </div>

          <FormField label="Industry" htmlFor="settings-industry">
            <Input
              id="settings-industry"
              value={form.industry}
              onChange={(event) => set("industry", event.target.value)}
              placeholder="Software"
            />
          </FormField>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Preferences"
        description="Applied to all conversations, within Relivo guidelines."
      >
        <div className="space-y-4">
          <FormField
            label="What should Relivo know about you?"
            description="Context it should carry into every conversation."
            htmlFor="settings-about-you"
          >
            <Textarea
              id="settings-about-you"
              value={form.about_you}
              onChange={(event) => set("about_you", event.target.value)}
              placeholder="I work on a Next.js frontend and a FastAPI backend. Prefer TypeScript examples."
              className="min-h-28 resize-y"
              maxLength={4000}
            />
          </FormField>

          <FormField
            label="How should Relivo respond?"
            description="Tone, format, and level of detail you prefer."
            htmlFor="settings-response-preferences"
          >
            <Textarea
              id="settings-response-preferences"
              value={form.response_preferences}
              onChange={(event) =>
                set("response_preferences", event.target.value)
              }
              placeholder="Be concise. Lead with the answer, then the reasoning. Use code blocks for anything runnable."
              className="min-h-28 resize-y"
              maxLength={4000}
            />
          </FormField>
        </div>
      </SettingsSection>

      {update.isError && (
        <ErrorNote
          message={getApiErrorMessage(
            update.error,
            "Could not save your profile."
          )}
          onRetry={save}
          retrying={update.isPending}
        />
      )}

      {/* Save bar — sticks to the bottom of the scrolling panel */}
      <div className="sticky bottom-0 -mx-5 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <p className="mr-auto text-xs text-muted-foreground">
          {dirty
            ? "Unsaved changes"
            : user.updatedAt
              ? `Saved ${formatRelative(user.updatedAt)}`
              : ""}
        </p>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setForm(saved)}
          disabled={!dirty || update.isPending}
          className="cursor-pointer"
        >
          Reset
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={!dirty || update.isPending}
          className="cursor-pointer"
        >
          {update.isPending && (
            <RefreshCw className="motion-safe:animate-spin" />
          )}
          {update.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

/** Shown when the user has no Relivo row yet — there is nothing to edit until they do. */
function NotSyncedState({ onSynced }: { onSynced: () => void }) {
  const sync = useSyncRelivoUser();

  function runSync() {
    sync.mutate(getBrowserSyncInput(), { onSuccess: onSynced });
  }

  if (sync.isError) {
    return (
      <ErrorNote
        message={getApiErrorMessage(
          sync.error,
          "Could not set up your profile."
        )}
        onRetry={runSync}
        retrying={sync.isPending}
      />
    );
  }

  return (
    <EmptyState
      icon={Database}
      title="Finish setting up your profile"
      description="We need to create your Relivo profile before you can personalise it."
      action={
        <Button
          size="sm"
          onClick={runSync}
          disabled={sync.isPending}
          className="cursor-pointer"
        >
          {sync.isPending && <RefreshCw className="motion-safe:animate-spin" />}
          {sync.isPending ? "Setting up…" : "Set up profile"}
        </Button>
      }
    />
  );
}

function ErrorNote({
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

function PersonalSettingsSkeleton() {
  return (
    <div className="space-y-7">
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
      </div>
    </div>
  );
}

function toForm(user: RelivoUser): ProfileFormState {
  const preferences = user.preferences ?? {};

  return {
    work_function: user.workFunction ?? "",
    job_title: user.jobTitle ?? "",
    company_name: user.companyName ?? "",
    industry: user.industry ?? "",
    team_size: user.teamSize ?? "",
    about_you: readText(preferences[PREFERENCE_KEYS.aboutYou]),
    response_preferences: readText(
      preferences[PREFERENCE_KEYS.responsePreferences]
    ),
  };
}

/** Sends only what changed, so a save never rewrites untouched fields. */
function toPayload(
  form: ProfileFormState,
  saved: ProfileFormState
): RelivoUserProfileInput {
  const payload: RelivoUserProfileInput = {};
  const preferences: Record<string, unknown> = {};

  if (form.work_function !== saved.work_function) {
    payload.work_function = form.work_function;
  }
  if (form.job_title !== saved.job_title) payload.job_title = form.job_title;
  if (form.company_name !== saved.company_name) {
    payload.company_name = form.company_name;
  }
  if (form.industry !== saved.industry) payload.industry = form.industry;
  if (form.team_size !== saved.team_size) payload.team_size = form.team_size;

  if (form.about_you !== saved.about_you) {
    preferences[PREFERENCE_KEYS.aboutYou] = form.about_you;
  }
  if (form.response_preferences !== saved.response_preferences) {
    preferences[PREFERENCE_KEYS.responsePreferences] =
      form.response_preferences;
  }

  if (Object.keys(preferences).length) payload.preferences = preferences;

  return payload;
}

function readText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toTitleCase(value: string): string {
  if (value === "hr") return "HR";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatRelative(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${formatDistanceToNow(date)} ago`;
}

function getInitials(
  fullName: string | null,
  email: string | undefined
): string {
  const source = fullName?.trim() || email?.trim() || "";
  if (!source) return "?";

  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
