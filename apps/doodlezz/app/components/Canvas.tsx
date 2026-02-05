"use client"

import { useEffect, useRef, useState } from "react";
import { initDraw } from "../draw";
import ToolsBtn from "./ToolsBtn";
import { Circle, Eraser, Pencil, Square } from "lucide-react";
import { ShapeType } from "@/types/types";
import { Game } from "../draw/Game";


export function Canvas({ roomId, socket }: { roomId: string, socket: WebSocket  }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>()
  const [selectedTool , setSelectedTool] = useState<ShapeType>(ShapeType.RECT)
  
  useEffect(()=>{
    game?.setShape(selectedTool)
  },[selectedTool,game])

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(canvasRef.current, roomId, socket)
      setGame(g)
    }
  }, [canvasRef]);


  return (
    <div>
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
      <div className="fixed top-6 left-6">

        <div className="iconBox flex flex-col gap-3">
          <ToolsBtn icon={<Pencil size={18}/>} 
          onClick={()=>{setSelectedTool(ShapeType.PENCIL)}}
          selected={(selectedTool === ShapeType.PENCIL)}/>

          <ToolsBtn icon={<Circle size={18}/>} 
          onClick={()=>{setSelectedTool(ShapeType.CIRCLE)}}
          selected={(selectedTool === ShapeType.CIRCLE)}/>

          <ToolsBtn icon={<Square size={18}/>} 
          onClick={()=>{setSelectedTool(ShapeType.RECT)}}
          selected={(selectedTool === ShapeType.RECT)}/>

          <ToolsBtn icon={<Eraser size={18}/>} 
          onClick={()=>{setSelectedTool(ShapeType.Eraser)}}
          selected={(selectedTool === ShapeType.Eraser)}/>

        </div>
      </div>
    </div>
  );
}
