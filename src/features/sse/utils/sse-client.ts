
import { sseService } from "../services/sse-service";
import type { SSEEvent } from "../types";

/**
 * Utility functions for sending SSE events from backend modules
 */
export class SSENotifier {
  /**
   * Send a notification to a specific user
   */
  static notifyUser(userId: string, type: string, data: any): number {
    return sseService.sendToUser(userId, {
      type,
      data,
      id: `user_${userId}_${Date.now()}`,
    });
  }

  /**
   * Send a notification to a specific session
   */
  static notifySession(sessionId: string, type: string, data: any): number {
    return sseService.sendToSession(sessionId, {
      type,
      data,
      id: `session_${sessionId}_${Date.now()}`,
    });
  }

  /**
   * Send a notification to a specific client
   */
  static notifyClient(clientId: string, type: string, data: any): boolean {
    return sseService.sendToClient(clientId, {
      type,
      data,
      id: `client_${clientId}_${Date.now()}`,
    });
  }

  /**
   * Broadcast a notification to all connected clients
   */
  static broadcast(type: string, data: any): number {
    return sseService.broadcast({
      type,
      data,
      id: `broadcast_${Date.now()}`,
    });
  }

  /**
   * Send a real-time update (e.g., for webhook handlers)
   */
  static sendUpdate(target: {
    userId?: string;
    sessionId?: string;
    clientId?: string;
  }, updateType: string, payload: any): number {
    const event: SSEEvent = {
      type: updateType,
      data: payload,
      id: `update_${Date.now()}`,
    };

    if (target.clientId) {
      return sseService.sendToClient(target.clientId, event) ? 1 : 0;
    } else if (target.userId) {
      return sseService.sendToUser(target.userId, event);
    } else if (target.sessionId) {
      return sseService.sendToSession(target.sessionId, event);
    }

    return 0;
  }

  /**
   * Get the current number of active SSE connections
   */
  static getActiveConnections(): number {
    return sseService.getActiveConnections();
  }
}
