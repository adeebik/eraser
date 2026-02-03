"use client";

import { useEffect, useState } from "react";

import { WS_URL } from "@/config/config";
import { Canvas } from "./Canvas";

export function CanvasPage({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setSocket(ws);
    };
  });

  if (!socket) {
    return <div> Connecting to server ... </div>;
  }

  return (
    <div>
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}
