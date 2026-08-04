"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { RouteHandlerClient } from "@/lib/API/api-client/route-handler-client";
import getQueryClient from "@/lib/query-client";
import type {
  McpServer,
  McpServerCreate,
  McpServerTestResult,
  McpServerUpdate,
} from "@/types/be-server";

export const MCP_SERVERS_QUERY_KEY = ["mcp-servers"];

/** Every remote MCP server the signed-in user has registered. */
export const useMcpServers = (enabled = true) => {
  return useQuery<McpServer[]>({
    queryKey: MCP_SERVERS_QUERY_KEY,
    queryFn: async () => {
      const response = await RouteHandlerClient.getMcpServers();
      return response.data?.data ?? [];
    },
    enabled,
    retry: false,
    staleTime: 60_000,
  });
};

export const useCreateMcpServer = () => {
  const qc = getQueryClient();

  return useMutation({
    mutationFn: async (body: McpServerCreate) => {
      const response = await RouteHandlerClient.createMcpServer(body);
      return response.data?.data;
    },
    onSuccess: (server) => {
      if (!server) return;
      qc.setQueryData<McpServer[]>(MCP_SERVERS_QUERY_KEY, (servers) => [
        ...(servers ?? []).filter(({ id }) => id !== server.id),
        server,
      ]);
    },
  });
};

export const useUpdateMcpServer = () => {
  const qc = getQueryClient();

  return useMutation({
    mutationFn: async ({
      serverId,
      body,
    }: {
      serverId: string;
      body: McpServerUpdate;
    }) => {
      const response = await RouteHandlerClient.updateMcpServer(serverId, body);
      return response.data?.data;
    },
    onSuccess: (server) => {
      if (!server) return;
      qc.setQueryData<McpServer[]>(MCP_SERVERS_QUERY_KEY, (servers) =>
        (servers ?? []).map((existing) =>
          existing.id === server.id ? server : existing
        )
      );
    },
  });
};

export const useDeleteMcpServer = () => {
  const qc = getQueryClient();

  return useMutation({
    mutationFn: async (serverId: string) => {
      await RouteHandlerClient.deleteMcpServer(serverId);
      return serverId;
    },
    onSuccess: (serverId) => {
      qc.setQueryData<McpServer[]>(MCP_SERVERS_QUERY_KEY, (servers) =>
        (servers ?? []).filter(({ id }) => id !== serverId)
      );
    },
  });
};

/**
 * Connects to a server now and refreshes its tools.
 *
 * A refused connection resolves rather than rejects — `result.status` carries
 * the outcome — so callers must read the status, not just the promise.
 */
export const useTestMcpServer = () => {
  const qc = getQueryClient();

  return useMutation({
    mutationFn: async (serverId: string) => {
      const response = await RouteHandlerClient.testMcpServer(serverId);
      return response.data?.data;
    },
    onSuccess: (result?: McpServerTestResult) => {
      if (!result) return;
      qc.setQueryData<McpServer[]>(MCP_SERVERS_QUERY_KEY, (servers) =>
        (servers ?? []).map((server) =>
          server.id === result.serverId
            ? {
                ...server,
                status: result.status,
                statusDetail: result.error,
                tools: result.tools,
                toolCount: result.toolCount,
              }
            : server
        )
      );
    },
  });
};
