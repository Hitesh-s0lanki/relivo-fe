"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { RouteHandlerClient } from "@/lib/API/api-client/route-handler-client";
import getQueryClient from "@/lib/query-client";
import type {
  RelivoUser,
  RelivoUserProfileInput,
  RelivoUserSyncInput,
} from "@/types/be-server";

export const RELIVO_USER_QUERY_KEY = ["relivo-user"];

/**
 * Relivo account record for the signed-in Clerk user.
 *
 * Resolves to `null` when the backend holds no record for them — the caller
 * renders that as "not synced" rather than an error.
 */
export const useRelivoUser = (enabled = true) => {
  return useQuery<RelivoUser | null>({
    queryKey: RELIVO_USER_QUERY_KEY,
    queryFn: async () => {
      const response = await RouteHandlerClient.getRelivoUser();
      return response.data?.data ?? null;
    },
    enabled,
    retry: false,
    staleTime: 60_000,
  });
};

/**
 * Creates or refreshes the signed-in user's row in the Relivo database.
 *
 * Idempotent, so it is safe to retry or to call on every authenticated load.
 */
export const useSyncRelivoUser = () => {
  const qc = getQueryClient();

  return useMutation({
    mutationFn: async (body: RelivoUserSyncInput = {}) => {
      const response = await RouteHandlerClient.syncRelivoUser(body);
      return response.data?.data;
    },
    onSuccess: (user) => {
      if (!user) return;
      qc.setQueryData(RELIVO_USER_QUERY_KEY, user);
    },
  });
};

/** Saves the app-owned profile fields edited in settings. */
export const useUpdateRelivoUser = () => {
  const qc = getQueryClient();

  return useMutation({
    mutationFn: async (body: RelivoUserProfileInput) => {
      const response = await RouteHandlerClient.updateRelivoUser(body);
      return response.data?.data;
    },
    onSuccess: (user) => {
      if (!user) return;
      qc.setQueryData(RELIVO_USER_QUERY_KEY, user);
    },
  });
};

/** Browser-known, app-owned fields worth attaching to a sync. */
export function getBrowserSyncInput(): RelivoUserSyncInput {
  const input: RelivoUserSyncInput = {};

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) input.timezone = timezone;
  } catch {
    // Intl is unavailable or the zone cannot be resolved — skip it.
  }

  if (typeof navigator !== "undefined" && navigator.language) {
    input.locale = navigator.language;
  }

  return input;
}
