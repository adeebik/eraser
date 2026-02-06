"use client"

import { useEffect, useRef, useState } from "react";
import ToolsBtn from "./ToolsBtn";
import { Circle, Eraser, Pencil, Square, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { ShapeType } from "@/types/types";
import { Game } from "../draw/Game";

export function Canvas({ roomId, socket }: { roomId: string, socket: WebSocket  }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>()
  const [selectedTool, setSelectedTool] = useState<ShapeType>(ShapeType.RECT)
  const [zoomLevel, setZoomLevel] = useState(100)
  
  useEffect(() => {
    game?.setShape(selectedTool)
  }, [selectedTool, game])

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(canvasRef.current, roomId, socket)
      setGame(g)

      // Update zoom level display periodically
      const interval = setInterval(() => {
        if (g) {
          setZoomLevel(g.getZoomLevel())
        }
      }, 100)

      return () => {
        clearInterval(interval)
        g.destroy();
      }
    }
  }, [canvasRef, roomId, socket]);

  const handleZoomIn = () => {
    game?.zoomIn()
  }

  const handleZoomOut = () => {
    game?.zoomOut()
  }

  const handleResetZoom = () => {
    game?.resetZoom()
  }

  return (
    <div>
      <canvas 
        ref={canvasRef} 
        width={window.innerWidth} 
        height={window.innerHeight}>
      </canvas>

      {/* Drawing Tools */}
      <div className="fixed top-6 left-6">
        <div className="iconBox flex flex-col gap-3">
          <ToolsBtn 
            icon={<Pencil size={18}/>} 
            onClick={() => {setSelectedTool(ShapeType.PENCIL)}}
            selected={(selectedTool === ShapeType.PENCIL)}
          />

          <ToolsBtn 
            icon={<Circle size={18}/>} 
            onClick={() => {setSelectedTool(ShapeType.CIRCLE)}}
            selected={(selectedTool === ShapeType.CIRCLE)}
          />

          <ToolsBtn 
            icon={<Square size={18}/>} 
            onClick={() => {setSelectedTool(ShapeType.RECT)}}
            selected={(selectedTool === ShapeType.RECT)}
          />

          <ToolsBtn 
            icon={<Eraser size={18}/>} 
            onClick={() => {setSelectedTool(ShapeType.Eraser)}}
            selected={(selectedTool === ShapeType.Eraser)}
          />
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="fixed bottom-6 right-6">
        <div className="bg-gray-800 rounded-lg p-3 flex flex-col gap-2 shadow-lg">
          <div className="text-white text-sm text-center mb-1">
            {zoomLevel}%
          </div>
          
          <ToolsBtn 
            icon={<ZoomIn size={18}/>} 
            onClick={handleZoomIn}
            selected={false}
          />

          <ToolsBtn 
            icon={<ZoomOut size={18}/>} 
            onClick={handleZoomOut}
            selected={false}
          />

          <ToolsBtn 
            icon={<Maximize2 size={18}/>} 
            onClick={handleResetZoom}
            selected={false}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed top-6 right-6 bg-gray-800 text-white p-4 rounded-lg text-sm max-w-xs">
        <div className="font-semibold mb-2">Controls:</div>
        <div className="space-y-1 text-xs">
          <div>• Scroll to zoom in/out</div>
          <div>• Shift + drag to pan</div>
          <div>• Middle click + drag to pan</div>
        </div>
      </div>
    </div>
  );
}