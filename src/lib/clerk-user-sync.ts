import type { currentUser } from "@clerk/nextjs/server";

import type {
  RelivoUserProfileInput,
  RelivoUserSyncInput,
  RelivoUserUpsert,
} from "@/types/be-server";

/** Clerk's Backend `User`, as returned by `currentUser()`. */
export type ClerkBackendUser = NonNullable<
  Awaited<ReturnType<typeof currentUser>>
>;

/**
 * Builds the `PUT /users/{id}` body from Clerk's Backend user.
 *
 * Every Clerk-owned field is read from Clerk itself, so a caller cannot spoof
 * their email, verification state, or account flags. `input` may only carry the
 * app-owned fields the browser legitimately knows.
 */
export function toRelivoUserUpsert(
  user: ClerkBackendUser,
  input: RelivoUserSyncInput = {}
): RelivoUserUpsert {
  const primaryEmail = user.primaryEmailAddress;

  const payload: RelivoUserUpsert = {
    external_id: user.externalId,
    email: primaryEmail?.emailAddress ?? null,
    email_verified: primaryEmail?.verification?.status === "verified",
    phone_number: user.primaryPhoneNumber?.phoneNumber ?? null,
    username: user.username,
    first_name: user.firstName,
    last_name: user.lastName,
    full_name: user.fullName,
    image_url: user.imageUrl,
    has_image: user.hasImage,
    public_metadata: user.publicMetadata ?? {},
    unsafe_metadata: user.unsafeMetadata ?? {},
    password_enabled: user.passwordEnabled,
    two_factor_enabled: user.twoFactorEnabled,
    banned: user.banned,
    locked: user.locked,
    last_sign_in_at: toIsoString(user.lastSignInAt),
    last_active_at: toIsoString(user.lastActiveAt),
    clerk_created_at: toIsoString(user.createdAt),
    clerk_updated_at: toIsoString(user.updatedAt),
  };

  // App-owned. Only sent when known, so a re-sync never clears an existing value.
  const locale = input.locale ?? user.locale ?? undefined;
  if (locale) payload.locale = locale;
  if (input.timezone) payload.timezone = input.timezone;
  if (input.onboarding_completed !== undefined) {
    payload.onboarding_completed = input.onboarding_completed;
  }

  return payload;
}

/** Narrows an untrusted request body to the app-owned fields we accept. */
export function pickSyncInput(body: unknown): RelivoUserSyncInput {
  if (typeof body !== "object" || body === null) return {};

  const candidate = body as Record<string, unknown>;
  const input: RelivoUserSyncInput = {};

  if (typeof candidate.timezone === "string" && candidate.timezone.trim()) {
    input.timezone = candidate.timezone.trim().slice(0, 64);
  }
  if (typeof candidate.locale === "string" && candidate.locale.trim()) {
    input.locale = candidate.locale.trim().slice(0, 20);
  }
  if (typeof candidate.onboarding_completed === "boolean") {
    input.onboarding_completed = candidate.onboarding_completed;
  }

  return input;
}

/** Column widths the backend enforces; trimming here turns a 422 into a save. */
const PROFILE_FIELDS = [
  ["work_function", 100],
  ["job_title", 200],
  ["company_name", 200],
  ["industry", 100],
  ["team_size", 30],
] as const satisfies ReadonlyArray<
  readonly [keyof Omit<RelivoUserProfileInput, "preferences">, number]
>;

const MAX_PREFERENCE_TEXT = 4000;

/**
 * Narrows an untrusted request body to the app-owned profile fields.
 *
 * Clerk-owned identity and account flags are not accepted here: they are
 * refreshed from Clerk on every sync, so letting a client set them would be both
 * pointless and a spoofing hole.
 */
export function pickProfileInput(body: unknown): RelivoUserProfileInput {
  if (typeof body !== "object" || body === null) return {};

  const candidate = body as Record<string, unknown>;
  const input: RelivoUserProfileInput = {};

  for (const [field, limit] of PROFILE_FIELDS) {
    const value = candidate[field];
    if (typeof value === "string") {
      // An emptied input clears the column rather than storing "".
      const trimmed = value.trim();
      input[field] = trimmed ? trimmed.slice(0, limit) : null;
    } else if (value === null) {
      input[field] = null;
    }
  }

  const preferences = pickPreferences(candidate.preferences);
  if (preferences) input.preferences = preferences;

  return input;
}

/** Keeps string preference values only, clearing the emptied ones. */
function pickPreferences(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== "object" || value === null) return undefined;

  const patch: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof entry === "string") {
      const trimmed = entry.trim();
      patch[key] = trimmed ? trimmed.slice(0, MAX_PREFERENCE_TEXT) : null;
    } else if (entry === null) {
      patch[key] = null;
    }
  }

  return Object.keys(patch).length ? patch : undefined;
}

/** Clerk hands out epoch milliseconds; the backend wants ISO datetimes. */
function toIsoString(value: number | null): string | null {
  if (value === null || value === undefined) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
