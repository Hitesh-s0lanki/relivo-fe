import { BeServerClient } from "@/lib/API/api-client/be-server-client";
import {
  routeHandlerError,
  routeHandlerSuccess,
} from "@/lib/API/route-handler-response";
import type { ConversationMessagesRequest } from "@/types/be-server";

export const POST = async (request: Request) => {
  let data: ConversationMessagesRequest;
  try {
    data = await request.json();
  } catch {
    return routeHandlerError("Invalid body for fetching messages", 400);
  }

  try {
    const messages = await BeServerClient.getConversationMessages(data);
    return routeHandlerSuccess("Messages fetched successfully", 200, messages);
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { status?: number } };
    return routeHandlerError(
      err?.message ?? "Failed to fetch messages",
      err?.response?.status ?? 500
    );
  }
};
