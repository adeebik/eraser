import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export default function ZoomControls({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: ZoomControlsProps) {
  return (
    <div className="fixed bottom-6 right-6 z-30">
      <div className="bg-zinc-900/95 backdrop-blur-sm rounded-xl border border-zinc-700/50 shadow-2xl overflow-hidden">
        <div className="flex items-center divide-x divide-zinc-700">
          <button
            onClick={onZoomOut}
            className="p-3 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          
          <button
            onClick={onResetZoom}
            className="px-4 py-3 hover:bg-zinc-800 text-white transition-all min-w-[70px] text-sm font-medium"
            title="Reset Zoom"
          >
            {zoomLevel}%
          </button>
          
          <button
            onClick={onZoomIn}
            className="p-3 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}