"use client"

import { useEffect, useRef, useState } from "react";
import ToolsPanel from "./ToolsPanel";
import BottomStylePanel from "./BottomStylePanel";
import ZoomControls from "./ZoomControls";
import TopToolbar from "./TopToolbar";
import { ShapeType } from "@/types/types";
import { Game } from "../draw/Game";
import { useRouter } from "next/navigation";
import CursorOverlay from "./CursorOverlay";

export function Canvas({ roomId, socket }: { roomId: string, socket: WebSocket }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const [initError, setInitError] = useState<string | null>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<ShapeType>(ShapeType.PENCIL);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  // Style states
  const [strokeColor, setStrokeColor] = useState("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [backgroundColor, setBackgroundColor] = useState("transparent");
  const [fillStyle, setFillStyle] = useState<"none" | "solid" | "hatch" | "dots">("none");
  
  useEffect(() => {
    game?.setShape(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    if (game) {
      game.setStrokeColor(strokeColor);
      game.setStrokeWidth(strokeWidth);
      game.setBackgroundColor(backgroundColor);
      game.setFillStyle(fillStyle);
      
      // Update selected shape's style if one is selected
      game.updateSelectedShapeStyle({
        strokeColor,
        strokeWidth,
        backgroundColor,
        fillStyle,
      });
    }
  }, [strokeColor, strokeWidth, backgroundColor, fillStyle, game]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (canvasRef.current) {
      const g = new Game(canvasRef.current, roomId, socket);
      
      const handleStateChange = () => {
        setZoomLevel(g.getZoomLevel());
        setCanUndo(g.canUndo());
        setCanRedo(g.canRedo());
        
        // Update style controls when a shape is selected
        const selectedStyle = g.getSelectedShapeStyle();
        if (selectedStyle) {
          setStrokeColor(selectedStyle.strokeColor);
          setStrokeWidth(selectedStyle.strokeWidth);
          setBackgroundColor(selectedStyle.backgroundColor);
          setFillStyle(selectedStyle.fillStyle);
        }
      };

      const handleResize = () => {
        if (canvasRef.current) {
          canvasRef.current.width = window.innerWidth;
          canvasRef.current.height = window.innerHeight;
          g.clearCanvas();
        }
      };

      window.addEventListener('resize', handleResize);
      g.onStateChange(handleStateChange);
      
      timeoutId = setTimeout(() => {
        setInitError("Failed to initialize canvas after 10 seconds. Please try again.");
      }, 30000);

      g.init().then(() => {
        clearTimeout(timeoutId);
        setGame(g);
        handleStateChange();
      }).catch((e) => {
        clearTimeout(timeoutId);
        setInitError("Failed to load canvas data.");
        console.error("Canvas init error:", e);
      });

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', handleResize);
        g.destroy();
      };
    }
  }, [canvasRef, roomId, socket]);

  const handleZoomIn = () => game?.zoomIn();
  const handleZoomOut = () => game?.zoomOut();
  const handleResetZoom = () => game?.resetZoom();
  const handleUndo = () => game?.undo();
  const handleRedo = () => game?.redo();
  
  const handleClearCanvas = () => {
    if (confirm("Clear entire canvas? This cannot be undone.")) {
      game?.clearAllShapes();
    }
  };

  const handleDeleteSelected = () => game?.deleteSelected();
  const handleDuplicate = () => game?.duplicateSelected();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleDeleteSelected();
        return;
      }

      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      } 
      
      // Redo
      if (((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) ||
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleDuplicate();
        return;
      }

      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch(e.key) {
          case 'v':
          case '1':
            e.preventDefault();
            setSelectedTool(ShapeType.SELECT);
            break;
          case 'p':
          case '2':
            e.preventDefault();
            setSelectedTool(ShapeType.PENCIL);
            break;
          case 'o':
          case '3':
            e.preventDefault();
            setSelectedTool(ShapeType.CIRCLE);
            break;
          case 'r':
          case '4':
            e.preventDefault();
            setSelectedTool(ShapeType.RECT);
            break;
          case 'e':
          case '5':
            e.preventDefault();
            setSelectedTool(ShapeType.Eraser);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [game]);

  if (initError) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{initError}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {game && <CursorOverlay game={game} />}
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="absolute inset-0"
      />

      {!game && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-white text-lg">Loading canvas...</p>
          </div>
        </div>
      )}

      {game && (
        <>
          {/* Top Toolbar */}
          <TopToolbar
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClearCanvas}
          />

          {/* Left Tools Panel */}
          <ToolsPanel selectedTool={selectedTool} onToolChange={setSelectedTool} />

          {/* Bottom Style Panel */}
          <BottomStylePanel
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            backgroundColor={backgroundColor}
            fillStyle={fillStyle}
            onStrokeColorChange={setStrokeColor}
            onStrokeWidthChange={setStrokeWidth}
            onBackgroundColorChange={setBackgroundColor}
            onFillStyleChange={setFillStyle}
          />

          {/* Zoom Controls - Bottom Right */}
          <ZoomControls
            zoomLevel={zoomLevel}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
          />
        </>
      )}
    </div>
  );
}