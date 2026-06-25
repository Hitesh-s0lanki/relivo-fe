import { BeServerClient } from "@/lib/API/api-client/be-server-client";
import {
  routeHandlerBackendError,
  routeHandlerError,
  routeHandlerSuccess,
} from "@/lib/API/route-handler-response";
import { getConversationUserId } from "@/lib/conversation-user";
import type {
  ConversationMessageCreate,
  ConversationMessagesRequest,
} from "@/types/be-server";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) => {
  try {
    const { conversationId } = await params;
    void request;
    const userId = await getConversationUserId();
    const messages = await BeServerClient.getConversationMessages({
      conversationId,
      userId,
    });
    return routeHandlerSuccess("Messages fetched successfully", 200, messages);
  } catch (error: unknown) {
    return routeHandlerBackendError(error, "Failed to fetch messages");
  }
};

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) => {
  let data: ConversationMessageCreate | ConversationMessagesRequest;
  try {
    data = await request.json();
  } catch {
    return routeHandlerError("Invalid body for conversation message", 400);
  }

  try {
    const { conversationId } = await params;
    const userId = await getConversationUserId();

    if ("role" in data) {
      const message = await BeServerClient.createConversationMessage(
        conversationId,
        data
      );
      return routeHandlerSuccess("Message created successfully", 200, message);
    }

    const messages = await BeServerClient.getConversationMessages({
      ...data,
      conversationId,
      userId,
    });
    return routeHandlerSuccess("Messages fetched successfully", 200, messages);
  } catch (error: unknown) {
    return routeHandlerBackendError(
      error,
      "Failed to handle conversation message"
    );
  }
};
