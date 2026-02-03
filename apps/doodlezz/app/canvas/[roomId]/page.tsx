"use client";
import { useEffect, useRef } from "react";
import initDraw from "@/app/draw";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
        initDraw(canvasRef.current)
    }
  }, [canvasRef]);

  return (
    <div className="">
      <canvas ref={canvasRef} width={900} height={900}></canvas>
    </div>
  );
}