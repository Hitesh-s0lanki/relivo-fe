import { BeServerClient } from "@/lib/API/api-client/be-server-client";
import {
  routeHandlerBackendError,
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
    return routeHandlerBackendError(error, "Failed to fetch conversations");
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
    return routeHandlerBackendError(error, "Failed to fetch conversations");
  }
};
