import { BeServerClient } from "@/lib/API/api-client/be-server-client";
import {
  routeHandlerError,
  routeHandlerSuccess,
} from "@/lib/API/route-handler-response";
import { getConversationUserId } from "@/lib/conversation-user";
import type { GetAllConversationsRequest } from "@/types/be-server";

export const GET = async () => {
  try {
    const userId = await getConversationUserId();
    const conversations = await BeServerClient.getAllConversations({ userId });
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

export const POST = async (request: Request) => {
  let data: GetAllConversationsRequest;
  try {
    data = await request.json();
  } catch {
    data = { userId: "" };
  }

  try {
    const userId = await getConversationUserId();
    const conversations = await BeServerClient.getAllConversations({
      ...data,
      userId,
    });
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
