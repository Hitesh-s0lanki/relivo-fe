import { BeServerClient } from "@/lib/API/api-client/be-server-client";
import {
  routeHandlerError,
  routeHandlerSuccess,
} from "@/lib/API/route-handler-response";
import type { CancelMessageRequest } from "@/types/be-server";

export const POST = async (request: Request) => {
  let data: CancelMessageRequest;
  try {
    data = await request.json();
  } catch {
    return routeHandlerError("Invalid body for canceling response", 400);
  }

  try {
    await BeServerClient.cancelResponse(data);
    return routeHandlerSuccess("Response canceled successfully", 200);
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { status?: number } };
    return routeHandlerError(
      err?.message ?? "Failed to cancel response",
      err?.response?.status ?? 500
    );
  }
};
