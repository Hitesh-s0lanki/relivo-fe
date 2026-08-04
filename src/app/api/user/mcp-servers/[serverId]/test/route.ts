import { auth } from "@clerk/nextjs/server";

import { BeServerClient } from "@/lib/API/api-client/be-server-client";
import {
  routeHandlerBackendError,
  routeHandlerError,
  routeHandlerSuccess,
} from "@/lib/API/route-handler-response";

const SIGNED_OUT_MESSAGE = "You must be signed in to manage MCP servers.";

/**
 * Connects to a registered server now and refreshes its discovered tools.
 *
 * A connection failure comes back as a 200 with `status: "error"` — the caller
 * renders the reason instead of a generic request failure.
 */
export const POST = async (
  request: Request,
  { params }: { params: Promise<{ serverId: string }> }
) => {
  void request;
  const { userId } = await auth();

  if (!userId) return routeHandlerError(SIGNED_OUT_MESSAGE, 401);

  const { serverId } = await params;
  if (!serverId) return routeHandlerError("Server ID is required", 400);

  try {
    const result = await BeServerClient.testMcpServer(userId, serverId);
    return routeHandlerSuccess("MCP server tested successfully", 200, result);
  } catch (error: unknown) {
    return routeHandlerBackendError(error, "Failed to test MCP server");
  }
};
