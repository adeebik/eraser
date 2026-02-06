"use client"

import { useEffect, useRef, useState } from "react";
import ToolsBtn from "./ToolsBtn";
import { Circle, Eraser, Pencil, Square, ZoomIn, ZoomOut, Maximize2, Undo2, Redo2 } from "lucide-react";
import { ShapeType } from "@/types/types";
import { Game } from "../draw/Game";

export function Canvas({ roomId, socket }: { roomId: string, socket: WebSocket  }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>()
  const [selectedTool, setSelectedTool] = useState<ShapeType>(ShapeType.RECT)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  
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
          setCanUndo(g.canUndo())
          setCanRedo(g.canRedo())
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

  const handleUndo = () => {
    game?.undo()
  }

  const handleRedo = () => {
    game?.redo()
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z (without Shift)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      } 
      // Redo: Ctrl+Shift+Z only
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [game])

  return (
    <div>
      <canvas 
        ref={canvasRef} 
        width={window.innerWidth} 
        height={window.innerHeight}>
      </canvas>

      {/* Drawing Tools */}
      <div className="fixed top-6 left-6">
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-3 shadow-2xl border border-zinc-700">
          <div className="flex flex-col gap-2">
            <ToolsBtn 
              icon={<Pencil size={18}/>} 
              onClick={() => {setSelectedTool(ShapeType.PENCIL)}}
              selected={(selectedTool === ShapeType.PENCIL)}
              tooltip="Pencil (P)"
            />

            <ToolsBtn 
              icon={<Circle size={18}/>} 
              onClick={() => {setSelectedTool(ShapeType.CIRCLE)}}
              selected={(selectedTool === ShapeType.CIRCLE)}
              tooltip="Circle (C)"
            />

            <ToolsBtn 
              icon={<Square size={18}/>} 
              onClick={() => {setSelectedTool(ShapeType.RECT)}}
              selected={(selectedTool === ShapeType.RECT)}
              tooltip="Rectangle (R)"
            />

            <ToolsBtn 
              icon={<Eraser size={18}/>} 
              onClick={() => {setSelectedTool(ShapeType.Eraser)}}
              selected={(selectedTool === ShapeType.Eraser)}
              tooltip="Eraser (E)"
            />

            <div className="border-t border-zinc-700 my-2"></div>

            <ToolsBtn 
              icon={<Undo2 size={18}/>} 
              onClick={handleUndo}
              disabled={!canUndo}
              tooltip="Undo (Ctrl+Z)"
            />

            <ToolsBtn 
              icon={<Redo2 size={18}/>} 
              onClick={handleRedo}
              disabled={!canRedo}
              tooltip="Redo (Ctrl+Shift+Z)"
            />
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="fixed bottom-6 right-6">
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-3 shadow-2xl border border-zinc-700">
          <div className="text-white text-sm font-semibold text-center mb-3">
            {zoomLevel}%
          </div>
          
          <div className="flex flex-col gap-2">
            <ToolsBtn 
              icon={<ZoomIn size={18}/>} 
              onClick={handleZoomIn}
              tooltip="Zoom In"
            />

            <ToolsBtn 
              icon={<ZoomOut size={18}/>} 
              onClick={handleZoomOut}
              tooltip="Zoom Out"
            />

            <ToolsBtn 
              icon={<Maximize2 size={18}/>} 
              onClick={handleResetZoom}
              tooltip="Reset Zoom"
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed top-6 right-6 bg-gray-900/90 backdrop-blur-sm text-white p-4 rounded-xl shadow-2xl border border-zinc-700 max-w-xs">
        <div className="font-semibold mb-3 text-sm">Keyboard Shortcuts</div>
        <div className="space-y-2 text-xs text-zinc-300">
          <div className="flex justify-between">
            <span>Scroll Vertically</span>
            <span className="text-zinc-400">Mouse Wheel</span>
          </div>
          <div className="flex justify-between">
            <span>Scroll Horizontally</span>
            <span className="text-zinc-400">Shift + Wheel</span>
          </div>
          <div className="flex justify-between">
            <span>Zoom In/Out</span>
            <span className="text-zinc-400">Ctrl + Wheel</span>
          </div>
          <div className="flex justify-between">
            <span>Pan Canvas</span>
            <span className="text-zinc-400">Shift + Drag</span>
          </div>
          <div className="flex justify-between">
            <span>Undo</span>
            <span className="text-zinc-400">Ctrl + Z</span>
          </div>
          <div className="flex justify-between">
            <span>Redo</span>
            <span className="text-zinc-400">Ctrl + Shift + Z</span>
          </div>
        </div>
      </div>
    </div>
  );
}