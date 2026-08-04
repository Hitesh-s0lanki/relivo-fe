import { auth } from "@clerk/nextjs/server";

import { BeServerClient } from "@/lib/API/api-client/be-server-client";
import {
  routeHandlerBackendError,
  routeHandlerError,
  routeHandlerSuccess,
} from "@/lib/API/route-handler-response";
import type { McpServerUpdate } from "@/types/be-server";

const SIGNED_OUT_MESSAGE = "You must be signed in to manage MCP servers.";

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ serverId: string }> }
) => {
  const { userId } = await auth();

  if (!userId) return routeHandlerError(SIGNED_OUT_MESSAGE, 401);

  const { serverId } = await params;
  if (!serverId) return routeHandlerError("Server ID is required", 400);

  let body: McpServerUpdate;
  try {
    body = await request.json();
  } catch {
    return routeHandlerError("Invalid body for updating an MCP server", 400);
  }

  try {
    const server = await BeServerClient.updateMcpServer(userId, serverId, body);
    return routeHandlerSuccess("MCP server updated successfully", 200, server);
  } catch (error: unknown) {
    return routeHandlerBackendError(error, "Failed to update MCP server");
  }
};

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ serverId: string }> }
) => {
  void request;
  const { userId } = await auth();

  if (!userId) return routeHandlerError(SIGNED_OUT_MESSAGE, 401);

  const { serverId } = await params;
  if (!serverId) return routeHandlerError("Server ID is required", 400);

  try {
    await BeServerClient.deleteMcpServer(userId, serverId);
    return routeHandlerSuccess("MCP server removed successfully", 200);
  } catch (error: unknown) {
    return routeHandlerBackendError(error, "Failed to remove MCP server");
  }
};
