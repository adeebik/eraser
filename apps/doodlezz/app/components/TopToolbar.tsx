import { Undo2, Redo2, Trash2 } from "lucide-react";

interface TopToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

export default function TopToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
}: TopToolbarProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left - History Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1 bg-zinc-900/95 backdrop-blur-sm rounded-lg p-1.5 border border-zinc-700/50 shadow-xl">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-2 rounded-md transition-all ${
                canUndo
                  ? "hover:bg-zinc-700 text-white"
                  : "text-zinc-600 cursor-not-allowed"
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={18} />
            </button>
            
            <div className="w-px h-6 bg-zinc-700" />
            
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-2 rounded-md transition-all ${
                canRedo
                  ? "hover:bg-zinc-700 text-white"
                  : "text-zinc-600 cursor-not-allowed"
              }`}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 size={18} />
            </button>
            
            <div className="w-px h-6 bg-zinc-700" />
            
            <button
              onClick={onClear}
              className="p-2 rounded-md hover:bg-red-600/20 text-red-400 hover:text-red-300 transition-all"
              title="Clear Canvas"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Center - App Name */}
        <div className="pointer-events-auto">
          <div className="bg-zinc-900/95 backdrop-blur-sm rounded-lg px-4 py-2 border border-zinc-700/50 shadow-xl">
            <h1 className="text-white font-semibold text-sm">Doodlzz</h1>
          </div>
        </div>

      
      </div>
    </div>
  );
}