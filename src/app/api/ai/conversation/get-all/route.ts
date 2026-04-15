import { BeServerClient } from "@/lib/API/api-client/be-server-client";
import {
  routeHandlerError,
  routeHandlerSuccess,
} from "@/lib/API/route-handler-response";
import type { GetAllConversationsRequest } from "@/types/be-server";

export const POST = async (request: Request) => {
  let data: GetAllConversationsRequest;
  try {
    data = await request.json();
  } catch {
    return routeHandlerError("Invalid body for fetching conversations", 400);
  }

  try {
    const conversations = await BeServerClient.getAllConversations(data);
    return routeHandlerSuccess(
      "Conversations fetched successfully",
      200,
      conversations
    );
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { status?: number } };
    return routeHandlerError(
      err?.message ?? "Failed to fetch conversations",
      err?.response?.status ?? 500
    );
  }
};
