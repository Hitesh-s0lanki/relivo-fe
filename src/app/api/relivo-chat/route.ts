export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiUrl =
    process.env.RELIVO_API_URL ?? process.env.NEXT_PUBLIC_RELIVO_API_URL;

  if (!apiUrl) {
    return Response.json(
      {
        error: "RELIVO_API_URL or NEXT_PUBLIC_RELIVO_API_URL is not configured",
      },
      { status: 500 }
    );
  }

  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await request.text(),
    signal: request.signal,
  });

  if (!response.body) {
    return Response.json(
      { error: "Relivo chat response body is empty" },
      { status: 502 }
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      "Content-Type":
        response.headers.get("content-type") ??
        "text/event-stream; charset=utf-8",
      "Cache-Control": response.headers.get("cache-control") ?? "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "x-vercel-ai-ui-message-stream":
        response.headers.get("x-vercel-ai-ui-message-stream") ?? "v1",
    },
  });
}
