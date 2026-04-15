"use client";

import {
  useMutation,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { RouteHandlerClient } from "@/lib/API/api-client/route-handler-client";
import getQueryClient from "@/lib/query-client";
import type {
  CancelMessageRequest,
  Conversation,
  ConversationCreate,
  ConversationList,
  ConversationMessagesRequest,
  ConversationMessagesResponse,
  ConversationUpdate,
} from "@/types/be-server";

export const useAllConversations = (userId: string) => {
  return useQuery({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      const response = await RouteHandlerClient.getAllConversations({ userId });
      return response.data?.data;
    },
    enabled: !!userId,
  });
};

export const useGetConversation = (
  conversationId: string | null,
  userId: string,
  options?: Omit<
    UseQueryOptions<Conversation | undefined, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["conversation", conversationId, userId],
    queryFn: async () => {
      if (!conversationId) return undefined;
      const response = await RouteHandlerClient.getConversation(
        conversationId,
        userId
      );
      return response.data?.data;
    },
    enabled: options?.enabled !== false && !!conversationId && !!userId,
    staleTime: 0,
    ...options,
  });
};

export const useMessagesByConversationId = (
  body: ConversationMessagesRequest,
  options?: Omit<
    UseQueryOptions<ConversationMessagesResponse | undefined, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["conversation-messages", body.conversationId, body],
    queryFn: async () => {
      const response = await RouteHandlerClient.getConversationMessages(body);
      return response.data?.data;
    },
    enabled: options?.enabled !== false && !!body.conversationId,
    staleTime: 0,
    ...options,
  });
};

export const useCreateConversation = ({ userId }: { userId: string }) => {
  const qc = getQueryClient();

  return useMutation({
    mutationFn: async (body: ConversationCreate) => {
      const response = await RouteHandlerClient.createConversation(body);
      return response.data?.data;
    },
    onSuccess: (newConversation) => {
      qc.setQueryData(
        ["conversations", userId],
        (oldData: ConversationList | undefined) => {
          if (!oldData)
            return { conversations: newConversation ? [newConversation] : [] };
          return {
            conversations: [newConversation!, ...(oldData.conversations ?? [])],
          };
        }
      );
      qc.invalidateQueries({ queryKey: ["conversations", userId] });
    },
  });
};

export const useUpdateConversation = () => {
  return useMutation({
    mutationFn: async ({
      conversationId,
      body,
    }: {
      conversationId: string;
      body: ConversationUpdate;
    }) => {
      const response = await RouteHandlerClient.updateConversation(
        conversationId,
        body
      );
      return response.data?.data;
    },
    onSuccess: (updatedConversation) => {
      if (!updatedConversation) return;
      const qc = getQueryClient();
      qc.setQueryData(
        ["conversations", updatedConversation.userId],
        (oldData: ConversationList | undefined) => {
          if (!oldData) return { conversations: [updatedConversation] };
          return {
            conversations: (oldData.conversations ?? []).map((conv) =>
              conv.id === updatedConversation.id ? updatedConversation : conv
            ),
          };
        }
      );
      qc.invalidateQueries({
        queryKey: ["conversations", updatedConversation.userId],
      });
    },
  });
};

export const useDeleteConversation = ({ userId }: { userId: string }) => {
  const qc = getQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      await RouteHandlerClient.deleteConversation(conversationId, userId);
      return conversationId;
    },
    onSuccess: (conversationId) => {
      qc.setQueryData(
        ["conversations", userId],
        (oldData: ConversationList | undefined) => {
          if (!oldData) return { conversations: [] };
          return {
            conversations: (oldData.conversations ?? []).filter(
              (conv) => conv.id !== conversationId
            ),
          };
        }
      );
      qc.invalidateQueries({ queryKey: ["conversations", userId] });
    },
  });
};

export const useCancelConversationResponse = () => {
  return useMutation({
    mutationFn: async (body: CancelMessageRequest) => {
      return RouteHandlerClient.cancelConversationResponse(body);
    },
  });
};
