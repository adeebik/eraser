import { MousePointer2, Pencil, Circle, Square, Eraser } from "lucide-react";
import { ShapeType } from "@/types/types";

interface ToolsPanelProps {
  selectedTool: ShapeType;
  onToolChange: (tool: ShapeType) => void;
}

export default function ToolsPanel({
  selectedTool,
  onToolChange,
}: ToolsPanelProps) {
  const tools = [
    { type: ShapeType.SELECT, icon: MousePointer2, label: "Select", shortcut: "V" },
    { type: ShapeType.PENCIL, icon: Pencil, label: "Pen", shortcut: "P" },
    { type: ShapeType.CIRCLE, icon: Circle, label: "Circle", shortcut: "O" },
    { type: ShapeType.RECT, icon: Square, label: "Rectangle", shortcut: "R" },
    { type: ShapeType.Eraser, icon: Eraser, label: "Eraser", shortcut: "E" },
  ];

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-30">
      <div className="bg-zinc-900/95 backdrop-blur-sm rounded-2xl p-2 border border-zinc-700/50 shadow-2xl">
        <div className="flex flex-col gap-1">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.type;
            
            return (
              <div key={tool.type} className="relative group">
                <button
                  onClick={() => onToolChange(tool.type)}
                  className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                  title={`${tool.label} (${tool.shortcut})`}
                >
                  <Icon size={20} />
                  
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r-full" />
                  )}
                </button>
                
                {/* Tooltip */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-zinc-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap shadow-xl border border-zinc-700">
                  <div className="font-medium">{tool.label}</div>
                  <div className="text-zinc-400 text-[10px] mt-0.5">{tool.shortcut}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}