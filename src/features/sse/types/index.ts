
export interface SSEClient {
  id: string;
  userId?: string;
  sessionId?: string;
  controller: ReadableStreamDefaultController;
  lastPing: number;
}

export interface SSEEvent {
  type: string;
  data: any;
  id?: string;
  retry?: number;
}

export interface SSEManagerOptions {
  heartbeatInterval?: number;
  connectionTimeout?: number;
}

export interface SSEServiceType {
  addClient(clientId: string, userId?: string, sessionId?: string): ReadableStream;
  removeClient(clientId: string): void;
  sendToClient(clientId: string, event: SSEEvent): boolean;
  sendToUser(userId: string, event: SSEEvent): number;
  sendToSession(sessionId: string, event: SSEEvent): number;
  broadcast(event: SSEEvent): number;
  getActiveConnections(): number;
  cleanup(): void;
}
