"use client"

import { useEffect, useRef, useState } from "react";
import ToolsBtn from "./ToolsBtn";
import { Circle, Eraser, Pencil, Square, ZoomIn, ZoomOut, Maximize2, Undo2, Redo2, MousePointer2 } from "lucide-react";
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

      // Event-based state updates instead of polling
      const handleStateChange = () => {
        setZoomLevel(g.getZoomLevel())
        setCanUndo(g.canUndo())
        setCanRedo(g.canRedo())
      }

      // Subscribe to game state changes
      g.onStateChange(handleStateChange)

      // Initial state
      handleStateChange()

      return () => {
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

  // Keyboard shortcuts - includes tool selection shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Undo: Ctrl+Z (without Shift)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
        return;
      } 
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      else if (
        ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault()
        handleRedo()
        return;
      }

      // Tool shortcuts (only if no modifier keys are pressed)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch(e.key.toLowerCase()) {
          case 'v':
            e.preventDefault()
            setSelectedTool(ShapeType.SELECT)
            break;
          case 'p':
            e.preventDefault()
            setSelectedTool(ShapeType.PENCIL)
            break;
          case 'c':
            e.preventDefault()
            setSelectedTool(ShapeType.CIRCLE)
            break;
          case 'r':
            e.preventDefault()
            setSelectedTool(ShapeType.RECT)
            break;
          case 'e':
            e.preventDefault()
            setSelectedTool(ShapeType.Eraser)
            break;
        }
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
          <div className="text-zinc-400 text-xs font-medium mb-3 px-1">Drawing Tools</div>
          <div className="flex flex-col gap-2">
            <ToolsBtn 
              icon={<MousePointer2 size={18}/>} 
              onClick={() => {setSelectedTool(ShapeType.SELECT)}}
              selected={(selectedTool === ShapeType.SELECT)}
              tooltip="Select & Move (V)"
            />

            <div className="border-t border-zinc-700 my-1"></div>

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

    
    </div>
  );
}