"use client";

import { useEffect, useState } from "react";
import { WS_URL } from "@/config/config";
import { Canvas } from "./Canvas";

export function CanvasPage({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjI0YjFjNjBkLTY3YmUtNDY4NC04YWZkLTVjZTJlMjY0MGNiOCIsImlhdCI6MTc2OTk3OTI1OH0.0CMwV8ybdQbX453Jg4wRtrgVBi3qSlD3YlP8i1wyIpA`);

    ws.onopen = () => {
      setSocket(ws);
      ws.send(
        JSON.stringify({
          type: "join",
          payload: {
            name: "server-1",
            roomId: roomId,
          },
        }),
      );
    };
  }, [roomId]);

  if (!socket) {
    return <div> Connecting to server ... </div>;
  }

  return (
    <div className=" h-screen w-screen overflow-hidden">
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}
