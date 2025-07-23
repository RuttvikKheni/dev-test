
# Server-Sent Events (SSE) Feature

This feature provides a centralized SSE manager for real-time, server-to-client notifications across the app.

## Overview

The SSE layer manages client connections, handles event dispatching, and provides a clean interface for backend features to push updates to connected clients.

## Features

- ✅ Centralized SSE manager to track active client connections
- ✅ Send named events with payloads to specific clients or broadcast to multiple clients
- ✅ Handle client connection lifecycle (connect, disconnect, errors)
- ✅ API and utility functions for backend modules to send notifications
- ✅ Heartbeat/ping messages to keep connections alive
- ✅ Proper cleanup of client connections on disconnect or errors
- ✅ Error handling and logging

## API Endpoints

### Connect to SSE
```
GET /api/sse?clientId=<optional>&userId=<optional>&sessionId=<optional>
```

### Send Events (for testing)
```
POST /api/sse/send
{
  "type": "notification",
  "data": { "message": "Hello!" },
  "target": {
    "clientId": "client_123",  // optional
    "userId": "user_456",      // optional
    "sessionId": "session_789" // optional
  }
}
```

## Usage Examples

### Frontend (Client)
```typescript
// Connect to SSE
const eventSource = new EventSource('/api/sse?clientId=my-client-id');

// Listen for events
eventSource.addEventListener('notification', (event) => {
  const data = JSON.parse(event.data);
  console.log('Received notification:', data);
});

// Handle connection events
eventSource.onopen = () => console.log('Connected');
eventSource.onerror = () => console.log('Connection error');
```

### Backend (Server)
```typescript
import { SSENotifier } from '@/features/sse';

// Send to specific user
SSENotifier.notifyUser('user123', 'new-message', {
  message: 'You have a new message!',
  timestamp: new Date().toISOString()
});

// Broadcast to all clients
SSENotifier.broadcast('system-announcement', {
  message: 'System maintenance in 5 minutes'
});

// Send to specific client
SSENotifier.notifyClient('client456', 'status-update', {
  status: 'processing',
  progress: 75
});
```

### Webhook Integration
```typescript
// In webhook handlers
import { SSENotifier } from '@/features/sse';

export async function handleWebhook(payload: any) {
  // Process webhook...
  
  // Notify relevant users
  SSENotifier.notifyUser(payload.userId, 'webhook-processed', {
    type: payload.type,
    status: 'completed',
    data: payload.result
  });
}
```

## Configuration

The SSE service can be configured with the following options:

```typescript
import { SSEService } from '@/features/sse';

const sseService = new SSEService({
  heartbeatInterval: 30000,  // 30 seconds (default)
  connectionTimeout: 60000,  // 60 seconds (default)
});
```

## Demo

Visit `/sse-demo` to see the SSE functionality in action with a live demo interface.

## Implementation Details

- Uses Web Streams API for efficient connection management
- Automatic heartbeat to prevent connection timeouts
- Cleanup of stale connections
- Type-safe event handling
- Comprehensive logging and error handling
- Memory efficient with proper resource cleanup
