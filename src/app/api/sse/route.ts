
import { sseService } from "@/features/sse";
import { createServiceContext } from "@/utils/service-utils";
import { NextRequest } from "next/server";

const { log } = createServiceContext("SSEEndpoint");

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clientId = searchParams.get("clientId") || `client_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const userId = searchParams.get("userId") || undefined;
  const sessionId = searchParams.get("sessionId") || undefined;

  log.info("SSE connection request", { clientId, userId, sessionId });

  const stream = sseService.addClient(clientId, userId, sessionId);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
