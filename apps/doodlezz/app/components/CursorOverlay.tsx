import React, { useEffect, useState } from "react";
import { Game } from "../draw/Game";
import { CursorData } from "../../types/types";

// SVG Cursor Icon matching the general design
const CursorIcon = ({ color }: { color: string }) => (
  <svg
    width="24"
    height="36"
    viewBox="0 0 24 36"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-md"
    style={{ transform: "translate(-2px, -2px)" }}
  >
    <path
      d="M5.65376 33.1598L2.39499 3.01211C2.16428 0.878931 4.54922 -0.669818 6.43899 0.443048L32.2536 15.632C34.2016 16.7788 34.0264 19.6644 31.9168 20.5367L22.9902 24.2274C22.4277 24.4599 21.9806 24.897 21.7374 25.4534L17.7556 34.562C16.8291 36.6811 13.881 36.756 12.8428 34.6932L9.58402 28.2255C9.3644 27.7895 8.93206 27.4851 8.44111 27.4208L5.65376 33.1598Z"
      fill={color}
    />
  </svg>
);

// Helper to deterministically pick a color based on user name/ID
const getColorForUser = (str: string) => {
  const colors = [
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#10b981", // emerald
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#d946ef", // fuchsia
    "#f43f5e", // rose
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

interface CursorOverlayProps {
  game: Game | null;
}

export default function CursorOverlay({ game }: CursorOverlayProps) {
  const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map());
  
  // Use state to trigger re-renders even if map contents change but reference doesn't
  const [updateTick, setUpdateTick] = useState(0);

  useEffect(() => {
    if (!game) return;

    const handleCursorUpdate = (updatedCursors: Map<string, CursorData>) => {
      setCursors(updatedCursors);
      setUpdateTick((t) => t + 1); // Force re-render
    };

    const handleStateChange = () => {
      // Force re-render on pan/zoom so cursors stay stickied to the canvas
      setUpdateTick((t) => t + 1);
    };

    game.onCursorChange(handleCursorUpdate);
    game.onStateChange(handleStateChange);

    return () => {
      // Cleanups conceptually if we added remove listeners
    };
  }, [game]);

  if (!game || cursors.size === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {Array.from(cursors.values()).map((cursor) => {
        // Convert canvas coordinates (where they drew) into our absolute screen coordinates
        const screenCoords = game.canvasToScreen(cursor.x, cursor.y);
        const color = getColorForUser(cursor.userId);

        return (
          <div
            key={cursor.userId}
            className="absolute top-0 left-0 transition-all duration-75 ease-linear flex flex-col items-start select-none"
            style={{
              transform: `translate(${screenCoords.x}px, ${screenCoords.y}px)`,
            }}
          >
            <CursorIcon color={color} />
            <div
              className="mt-1 ml-4 px-2 py-0.5 rounded-md text-xs text-white font-medium whitespace-nowrap shadow-sm"
              style={{ backgroundColor: color }}
            >
              {cursor.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
