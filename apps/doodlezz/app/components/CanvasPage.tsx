"use client";

import { useEffect, useState } from "react";
import { WS_URL } from "@/config/config";
import { Canvas } from "./Canvas";
import { useRouter } from "next/navigation";

export function CanvasPage({ roomId, slug }: { roomId: string; slug: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const router = useRouter();

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_URL}?token=${localStorage.getItem("token")}`,
    );

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

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      router.push("/dashboard");
    };
    ws.onclose = () => {
      console.log("WebSocket connection closed");
      router.push("/dashboard");
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomId]);

  if (!socket) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" h-screen w-screen overflow-hidden">
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}