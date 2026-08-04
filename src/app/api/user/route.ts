import { auth, currentUser } from "@clerk/nextjs/server";

import { BeServerClient } from "@/lib/API/api-client/be-server-client";
import {
  routeHandlerBackendError,
  routeHandlerError,
  routeHandlerSuccess,
} from "@/lib/API/route-handler-response";
import {
  pickProfileInput,
  pickSyncInput,
  toRelivoUserUpsert,
} from "@/lib/clerk-user-sync";

const SIGNED_OUT_MESSAGE = "You must be signed in to view your account.";

export const GET = async () => {
  const { userId } = await auth();

  if (!userId) {
    return routeHandlerError(SIGNED_OUT_MESSAGE, 401);
  }

  try {
    const user = await BeServerClient.getUser(userId);
    return routeHandlerSuccess("User fetched successfully", 200, user);
  } catch (error: unknown) {
    return routeHandlerBackendError(error, "Failed to fetch user");
  }
};

/**
 * Idempotent sync of the signed-in Clerk user into the Relivo database.
 *
 * Safe to call on every authenticated load — the backend upserts. The body may
 * only carry app-owned fields (`timezone`, `locale`, `onboarding_completed`);
 * everything else is read from Clerk server-side.
 */
export const PUT = async (request: Request) => {
  const user = await currentUser();

  if (!user) {
    return routeHandlerError(SIGNED_OUT_MESSAGE, 401);
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  try {
    const synced = await BeServerClient.upsertUser(
      user.id,
      toRelivoUserUpsert(user, pickSyncInput(body))
    );
    return routeHandlerSuccess("User synced successfully", 200, synced);
  } catch (error: unknown) {
    return routeHandlerBackendError(error, "Failed to sync user");
  }
};

/**
 * Saves the app-owned half of the profile edited in settings.
 *
 * Preferences merge first so the profile PATCH — which always runs, even with an
 * empty body — returns the complete record including them.
 */
export const PATCH = async (request: Request) => {
  const { userId } = await auth();

  if (!userId) {
    return routeHandlerError(SIGNED_OUT_MESSAGE, 401);
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const { preferences, ...profile } = pickProfileInput(body);

  try {
    if (preferences) {
      await BeServerClient.mergeUserPreferences(userId, preferences);
    }

    const updated = await BeServerClient.updateUser(userId, profile);
    return routeHandlerSuccess("Profile saved", 200, updated);
  } catch (error: unknown) {
    return routeHandlerBackendError(error, "Failed to save your profile");
  }
};
