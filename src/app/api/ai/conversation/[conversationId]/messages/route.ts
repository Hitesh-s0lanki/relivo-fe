import { BeServerClient } from "@/lib/API/api-client/be-server-client";
import {
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
    const err = error as { message?: string; response?: { status?: number } };
    return routeHandlerError(
      err?.message ?? "Failed to fetch messages",
      err?.response?.status ?? 500
    );
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
    const err = error as { message?: string; response?: { status?: number } };
    return routeHandlerError(
      err?.message ?? "Failed to handle conversation message",
      err?.response?.status ?? 500
    );
  }
};
