import { after } from "next/server";

import { BeServerClient } from "@/lib/API/api-client/be-server-client";
import {
  routeHandlerError,
  routeHandlerSuccess,
} from "@/lib/API/route-handler-response";
import {
  createFallbackConversationTitle,
  generateConversationTitle,
} from "@/lib/conversation-title";
import { getConversationUserId } from "@/lib/conversation-user";
import type { ConversationCreate } from "@/types/be-server";

type ConversationCreateRequest = ConversationCreate & {
  firstMessage?: string;
};

export const POST = async (request: Request) => {
  let data: ConversationCreateRequest;
  try {
    data = await request.json();
  } catch {
    return routeHandlerError("Invalid body for creating conversation", 400);
  }

  try {
    const userId = await getConversationUserId();
    const firstMessage = data.firstMessage?.trim();
    const { firstMessage: _firstMessage, ...conversationCreate } = data;
    const conversation = await BeServerClient.createConversation({
      ...conversationCreate,
      userId,
      title: data.title ?? createFallbackConversationTitle(firstMessage),
    });

    if (firstMessage) {
      after(async () => {
        try {
          const generatedTitle = await generateConversationTitle(firstMessage);
          await BeServerClient.updateConversation({
            id: conversation.id,
            userId,
            title: generatedTitle,
          });
        } catch (error) {
          console.error("Failed to generate conversation title", error);
        }
      });
    }

    return routeHandlerSuccess(
      "Conversation created successfully",
      200,
      conversation
    );
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { status?: number } };
    return routeHandlerError(
      err?.message ?? "Failed to create conversation",
      err?.response?.status ?? 500
    );
  }
};
