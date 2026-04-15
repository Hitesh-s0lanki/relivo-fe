import { BeServerClient } from "@/lib/API/api-client/be-server-client";
import {
  routeHandlerError,
  routeHandlerSuccess,
} from "@/lib/API/route-handler-response";
import type { ConversationUpdate } from "@/types/be-server";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) => {
  try {
    const { conversationId } = await params;
    const userId = new URL(request.url).searchParams.get("userId");

    if (!conversationId)
      return routeHandlerError("Conversation ID is required", 400);
    if (!userId) return routeHandlerError("User ID is required", 400);

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
  // params is available but conversationId comes from body (ConversationUpdate.id)
  void params;
  let data: ConversationUpdate;
  try {
    data = await request.json();
  } catch {
    return routeHandlerError("Invalid body for updating conversation", 400);
  }

  try {
    const conversation = await BeServerClient.updateConversation(data);
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
    const userId = new URL(request.url).searchParams.get("userId");

    if (!conversationId)
      return routeHandlerError("Conversation ID is required", 400);
    if (!userId) return routeHandlerError("User ID is required", 400);

    await BeServerClient.deleteConversation(conversationId, userId);
    return routeHandlerSuccess("Conversation deleted successfully", 200);
  } catch {
    return routeHandlerError("Failed to delete conversation", 500);
  }
};
