
"use client";

import { Button } from "@/shared/components/ui/button";
import { useEffect, useState } from "react";

interface SSEMessage {
  type: string;
  data: any;
  timestamp: string;
}

const SSEDemoPage = () => {
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [clientId, setClientId] = useState<string>("");
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  useEffect(() => {
    const newClientId = `client_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    setClientId(newClientId);
  }, []);

  const connectSSE = () => {
    if (eventSource) {
      eventSource.close();
    }

    const newEventSource = new EventSource(`/api/sse?clientId=${clientId}`);
    
    newEventSource.onopen = () => {
      setIsConnected(true);
      addMessage("connected", { message: "SSE connection established" });
    };

    newEventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        addMessage("message", data);
      } catch (error) {
        addMessage("error", { message: "Failed to parse message", error });
      }
    };

    newEventSource.addEventListener("connected", (event) => {
      try {
        const data = JSON.parse(event.data);
        addMessage("connected", data);
      } catch (error) {
        addMessage("error", { message: "Failed to parse connected event", error });
      }
    });

    newEventSource.addEventListener("heartbeat", (event) => {
      try {
        const data = JSON.parse(event.data);
        addMessage("heartbeat", data);
      } catch (error) {
        addMessage("error", { message: "Failed to parse heartbeat", error });
      }
    });

    newEventSource.addEventListener("notification", (event) => {
      try {
        const data = JSON.parse(event.data);
        addMessage("notification", data);
      } catch (error) {
        addMessage("error", { message: "Failed to parse notification", error });
      }
    });

    newEventSource.addEventListener("broadcast", (event) => {
      try {
        const data = JSON.parse(event.data);
        addMessage("broadcast", data);
      } catch (error) {
        addMessage("error", { message: "Failed to parse broadcast", error });
      }
    });

    newEventSource.onerror = (error) => {
      setIsConnected(false);
      addMessage("error", { message: "SSE connection error", error });
    };

    setEventSource(newEventSource);
  };

  const disconnectSSE = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      setIsConnected(false);
      addMessage("disconnected", { message: "SSE connection closed" });
    }
  };

  const sendTestMessage = async () => {
    try {
      const response = await fetch("/api/sse/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "notification",
          data: {
            message: "Test notification from client",
            timestamp: new Date().toISOString(),
          },
          target: {
            clientId: clientId,
          },
        }),
      });

      const result = await response.json();
      addMessage("sent", { message: "Test message sent", result });
    } catch (error) {
      addMessage("error", { message: "Failed to send test message", error });
    }
  };

  const sendBroadcast = async () => {
    try {
      const response = await fetch("/api/sse/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "broadcast",
          data: {
            message: "Broadcast message to all clients",
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const result = await response.json();
      addMessage("sent", { message: "Broadcast sent", result });
    } catch (error) {
      addMessage("error", { message: "Failed to send broadcast", error });
    }
  };

  const addMessage = (type: string, data: any) => {
    setMessages(prev => [
      ...prev,
      {
        type,
        data,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">SSE Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
            <p className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
            <p className="text-sm text-gray-600 mt-1">Client ID: {clientId}</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Controls</h2>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={connectSSE} 
                disabled={isConnected}
                variant={isConnected ? "secondary" : "default"}
              >
                Connect SSE
              </Button>
              
              <Button 
                onClick={disconnectSSE} 
                disabled={!isConnected}
                variant="destructive"
              >
                Disconnect
              </Button>
              
              <Button 
                onClick={sendTestMessage} 
                disabled={!isConnected}
                variant="outline"
              >
                Send Test Message
              </Button>
              
              <Button 
                onClick={sendBroadcast} 
                disabled={!isConnected}
                variant="outline"
              >
                Send Broadcast
              </Button>
              
              <Button 
                onClick={clearMessages} 
                variant="outline"
              >
                Clear Messages
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Messages</h2>
          <div className="bg-black text-white p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
            {messages.length === 0 ? (
              <p className="text-gray-400">No messages yet...</p>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="mb-2">
                  <span className="text-blue-400">[{message.timestamp}]</span>
                  <span className={`ml-2 font-semibold ${
                    message.type === 'error' ? 'text-red-400' :
                    message.type === 'connected' ? 'text-green-400' :
                    message.type === 'heartbeat' ? 'text-yellow-400' :
                    message.type === 'notification' ? 'text-purple-400' :
                    message.type === 'broadcast' ? 'text-cyan-400' :
                    'text-white'
                  }`}>
                    [{message.type.toUpperCase()}]
                  </span>
                  <div className="ml-4 mt-1">
                    {JSON.stringify(message.data, null, 2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">How to Test</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click "Connect SSE" to establish a connection</li>
          <li>Watch for the initial connection event and heartbeat messages</li>
          <li>Click "Send Test Message" to send a message to this specific client</li>
          <li>Click "Send Broadcast" to send a message to all connected clients</li>
          <li>Open multiple tabs to test multiple connections</li>
          <li>Watch heartbeat messages appear every 30 seconds</li>
        </ol>
      </div>
    </div>
  );
};

export default SSEDemoPage;
