import { BeServerClient } from "@/lib/API/api-client/be-server-client";
import {
  routeHandlerError,
  routeHandlerSuccess,
} from "@/lib/API/route-handler-response";
import { getConversationUserId } from "@/lib/conversation-user";
import type { ConversationUpdate } from "@/types/be-server";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) => {
  try {
    const { conversationId } = await params;
    void request;
    const userId = await getConversationUserId();

    if (!conversationId)
      return routeHandlerError("Conversation ID is required", 400);

    const conversation = await BeServerClient.getConversation(
      conversationId,
      userId
    );
    return routeHandlerSuccess(
      "Conversation fetched successfully",
      200,
      conversation
    );
  } catch {
    return routeHandlerError("Failed to fetch conversation", 500);
  }
};

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) => {
  const { conversationId } = await params;
  let data: ConversationUpdate;
  try {
    data = await request.json();
  } catch {
    return routeHandlerError("Invalid body for updating conversation", 400);
  }

  try {
    const userId = await getConversationUserId();
    const conversation = await BeServerClient.updateConversation({
      ...data,
      id: data.id || conversationId,
      userId,
    });
    return routeHandlerSuccess(
      "Conversation updated successfully",
      200,
      conversation
    );
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { status?: number } };
    return routeHandlerError(
      err?.message ?? "Failed to update conversation",
      err?.response?.status ?? 500
    );
  }
};

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) => {
  try {
    const { conversationId } = await params;
    void request;
    const userId = await getConversationUserId();

    if (!conversationId)
      return routeHandlerError("Conversation ID is required", 400);

    await BeServerClient.deleteConversation(conversationId, userId);
    return routeHandlerSuccess("Conversation deleted successfully", 200);
  } catch {
    return routeHandlerError("Failed to delete conversation", 500);
  }
};
