
import { sseService } from "@/features/sse";
import { createServiceContext } from "@/utils/service-utils";
import { NextRequest, NextResponse } from "next/server";

const { log, handleError } = createServiceContext("SSESendEndpoint");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, target } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: "Missing required fields: type, data" },
        { status: 400 }
      );
    }

    const event = {
      type,
      data,
      id: `event_${Date.now()}`,
    };

    let result = 0;

    if (target?.clientId) {
      const success = sseService.sendToClient(target.clientId, event);
      result = success ? 1 : 0;
    } else if (target?.userId) {
      result = sseService.sendToUser(target.userId, event);
    } else if (target?.sessionId) {
      result = sseService.sendToSession(target.sessionId, event);
    } else {
      result = sseService.broadcast(event);
    }

    log.info("SSE event sent", { type, target, sentToClients: result });

    return NextResponse.json({
      success: true,
      sentToClients: result,
      activeConnections: sseService.getActiveConnections(),
    });
  } catch (error) {
    handleError("sending SSE event", error, {
      customMessage: "Failed to send SSE event",
      includeStack: true,
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
