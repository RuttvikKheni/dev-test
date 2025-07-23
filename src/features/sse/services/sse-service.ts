
import { createServiceContext } from "@/utils/service-utils";
import type { SSEClient, SSEEvent, SSEManagerOptions, SSEServiceType } from "../types";

const { log, handleError } = createServiceContext("SSEService");

export class SSEService implements SSEServiceType {
  private clients = new Map<string, SSEClient>();
  private heartbeatInterval: number;
  private connectionTimeout: number;
  private heartbeatTimer?: NodeJS.Timeout;

  constructor(options: SSEManagerOptions = {}) {
    this.heartbeatInterval = options.heartbeatInterval ?? 30000; // 30 seconds
    this.connectionTimeout = options.connectionTimeout ?? 60000; // 60 seconds
    
    this.startHeartbeat();
    log.info("SSE Service initialized", {
      heartbeatInterval: this.heartbeatInterval,
      connectionTimeout: this.connectionTimeout,
    });
  }

  addClient(clientId: string, userId?: string, sessionId?: string): ReadableStream {
    log.info("Adding SSE client", { clientId, userId, sessionId });

    const stream = new ReadableStream({
      start: (controller) => {
        const client: SSEClient = {
          id: clientId,
          userId,
          sessionId,
          controller,
          lastPing: Date.now(),
        };

        this.clients.set(clientId, client);

        // Send initial connection event
        this.sendEventToController(controller, {
          type: "connected",
          data: { clientId, timestamp: new Date().toISOString() },
        });

        log.info("SSE client connected", { 
          clientId, 
          totalConnections: this.clients.size 
        });
      },
      cancel: () => {
        this.removeClient(clientId);
      },
    });

    return stream;
  }

  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      try {
        client.controller.close();
      } catch (error) {
        log.warn("Error closing SSE controller", { clientId, error });
      }
      
      this.clients.delete(clientId);
      log.info("SSE client disconnected", { 
        clientId, 
        totalConnections: this.clients.size 
      });
    }
  }

  sendToClient(clientId: string, event: SSEEvent): boolean {
    const client = this.clients.get(clientId);
    if (!client) {
      log.warn("Attempted to send to non-existent client", { clientId });
      return false;
    }

    try {
      this.sendEventToController(client.controller, event);
      log.debug("Event sent to client", { clientId, eventType: event.type });
      return true;
    } catch (error) {
      log.error("Failed to send event to client", { clientId, error });
      this.removeClient(clientId);
      return false;
    }
  }

  sendToUser(userId: string, event: SSEEvent): number {
    let sentCount = 0;
    for (const [clientId, client] of this.clients) {
      if (client.userId === userId) {
        if (this.sendToClient(clientId, event)) {
          sentCount++;
        }
      }
    }
    
    log.info("Event sent to user clients", { userId, eventType: event.type, sentCount });
    return sentCount;
  }

  sendToSession(sessionId: string, event: SSEEvent): number {
    let sentCount = 0;
    for (const [clientId, client] of this.clients) {
      if (client.sessionId === sessionId) {
        if (this.sendToClient(clientId, event)) {
          sentCount++;
        }
      }
    }
    
    log.info("Event sent to session clients", { sessionId, eventType: event.type, sentCount });
    return sentCount;
  }

  broadcast(event: SSEEvent): number {
    let sentCount = 0;
    for (const clientId of this.clients.keys()) {
      if (this.sendToClient(clientId, event)) {
        sentCount++;
      }
    }
    
    log.info("Event broadcasted", { eventType: event.type, sentCount });
    return sentCount;
  }

  getActiveConnections(): number {
    return this.clients.size;
  }

  cleanup(): void {
    log.info("Cleaning up SSE service");
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    for (const clientId of this.clients.keys()) {
      this.removeClient(clientId);
    }
    
    this.clients.clear();
    log.info("SSE service cleanup completed");
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      const now = Date.now();
      const staleClients: string[] = [];

      // Send heartbeat and check for stale connections
      for (const [clientId, client] of this.clients) {
        try {
          // Check if client has timed out
          if (now - client.lastPing > this.connectionTimeout) {
            staleClients.push(clientId);
            continue;
          }

          // Send heartbeat
          this.sendEventToController(client.controller, {
            type: "heartbeat",
            data: { timestamp: new Date().toISOString() },
          });

          client.lastPing = now;
        } catch (error) {
          log.warn("Heartbeat failed for client", { clientId, error });
          staleClients.push(clientId);
        }
      }

      // Remove stale clients
      for (const clientId of staleClients) {
        this.removeClient(clientId);
      }

      if (staleClients.length > 0) {
        log.info("Removed stale SSE clients", { 
          removedCount: staleClients.length,
          activeConnections: this.clients.size 
        });
      }
    }, this.heartbeatInterval);
  }

  private sendEventToController(
    controller: ReadableStreamDefaultController,
    event: SSEEvent
  ): void {
    const sseData = this.formatSSEEvent(event);
    const encoder = new TextEncoder();
    controller.enqueue(encoder.encode(sseData));
  }

  private formatSSEEvent(event: SSEEvent): string {
    let sseString = "";
    
    if (event.id) {
      sseString += `id: ${event.id}\n`;
    }
    
    if (event.retry) {
      sseString += `retry: ${event.retry}\n`;
    }
    
    sseString += `event: ${event.type}\n`;
    sseString += `data: ${JSON.stringify(event.data)}\n\n`;
    
    return sseString;
  }
}

// Singleton instance
export const sseService = new SSEService();
