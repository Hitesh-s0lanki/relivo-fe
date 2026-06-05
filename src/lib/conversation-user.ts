import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

import { ANONYMOUS_SESSION_COOKIE } from "@/lib/conversation-session";

export async function getConversationUserId(): Promise<string> {
  const { userId } = await auth();
  if (userId) return userId;

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(ANONYMOUS_SESSION_COOKIE)?.value;
  if (sessionId) return sessionId;

  throw new Error("Anonymous session is missing");
}
