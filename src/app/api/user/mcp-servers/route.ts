import { auth } from "@clerk/nextjs/server";

import { BeServerClient } from "@/lib/API/api-client/be-server-client";
import {
  routeHandlerBackendError,
  routeHandlerError,
  routeHandlerSuccess,
} from "@/lib/API/route-handler-response";
import type { McpServerCreate } from "@/types/be-server";

const SIGNED_OUT_MESSAGE = "You must be signed in to manage MCP servers.";

export const GET = async () => {
  const { userId } = await auth();

  if (!userId) return routeHandlerError(SIGNED_OUT_MESSAGE, 401);

  try {
    const servers = await BeServerClient.listMcpServers(userId);
    return routeHandlerSuccess(
      "MCP servers fetched successfully",
      200,
      servers
    );
  } catch (error: unknown) {
    return routeHandlerBackendError(error, "Failed to fetch MCP servers");
  }
};

/**
 * Registers one remote MCP server for the signed-in user.
 *
 * The body is forwarded untouched — name, URL, header, and OAuth validation all
 * live in the backend schema, and duplicating it here would let the two drift.
 */
export const POST = async (request: Request) => {
  const { userId } = await auth();

  if (!userId) return routeHandlerError(SIGNED_OUT_MESSAGE, 401);

  let body: McpServerCreate;
  try {
    body = await request.json();
  } catch {
    return routeHandlerError("Invalid body for creating an MCP server", 400);
  }

  try {
    const server = await BeServerClient.createMcpServer(userId, body);
    return routeHandlerSuccess("MCP server added successfully", 201, server);
  } catch (error: unknown) {
    return routeHandlerBackendError(error, "Failed to add MCP server");
  }
};
