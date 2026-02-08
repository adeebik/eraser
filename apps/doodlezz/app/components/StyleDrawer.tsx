import { X } from "lucide-react";

interface StyleDrawerProps {
  isOpen: boolean;
  strokeColor: string;
  strokeWidth: number;
  backgroundColor: string;
  fillStyle: "none" | "solid" | "hatch" | "dots";
  opacity: number;
  onStrokeColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onBackgroundColorChange: (color: string) => void;
  onFillStyleChange: (style: "none" | "solid" | "hatch" | "dots") => void;
  onOpacityChange: (opacity: number) => void;
}

export default function StyleDrawer({
  isOpen,
  strokeColor,
  strokeWidth,
  backgroundColor,
  fillStyle,
  opacity,
  onStrokeColorChange,
  onStrokeWidthChange,
  onBackgroundColorChange,
  onFillStyleChange,
  onOpacityChange,
}: StyleDrawerProps) {
  const strokeColors = [
    { color: "#000000", name: "Black" },
    { color: "#ffffff", name: "White" },
    { color: "#ef4444", name: "Red" },
    { color: "#f97316", name: "Orange" },
    { color: "#eab308", name: "Yellow" },
    { color: "#84cc16", name: "Lime" },
    { color: "#06b6d4", name: "Cyan" },
    { color: "#3b82f6", name: "Blue" },
    { color: "#a855f7", name: "Purple" },
    { color: "#ec4899", name: "Pink" },
  ];

  const backgroundColors = [
    { color: "transparent", name: "None" },
    { color: "#18181b", name: "Dark" },
    { color: "#ffffff", name: "White" },
    { color: "#fef2f2", name: "Light Red" },
    { color: "#fff7ed", name: "Light Orange" },
    { color: "#fefce8", name: "Light Yellow" },
    { color: "#f0fdf4", name: "Light Green" },
    { color: "#ecfeff", name: "Light Cyan" },
    { color: "#eff6ff", name: "Light Blue" },
    { color: "#faf5ff", name: "Light Purple" },
  ];

  const strokeWidths = [
    { width: 1, label: "Thin" },
    { width: 2, label: "Regular" },
    { width: 4, label: "Medium" },
    { width: 8, label: "Thick" },
    { width: 12, label: "Extra" },
  ];

  const fillStyles = [
    { style: "none" as const, label: "None" },
    { style: "solid" as const, label: "Solid" },
    { style: "hatch" as const, label: "Hatch" },
    { style: "dots" as const, label: "Dots" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => {}}
      />

      {/* Drawer */}
      <div
        className={`fixed left-20 top-1/2 -translate-y-1/2 z-50 w-72 transition-all duration-300 ${
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-zinc-900/98 backdrop-blur-sm rounded-2xl border border-zinc-700/50 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Style Properties</h3>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="p-5 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
            
            {/* Stroke Color */}
            <div>
              <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3 block">
                Stroke Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {strokeColors.map(({ color, name }) => (
                  <button
                    key={color}
                    onClick={() => onStrokeColorChange(color)}
                    className={`group relative w-full aspect-square rounded-lg transition-all duration-200 ${
                      strokeColor === color
                        ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    title={name}
                  >
                    {color === "#ffffff" && (
                      <div className="absolute inset-0 rounded-lg border border-zinc-700" />
                    )}
                    {strokeColor === color && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Stroke Width */}
            <div>
              <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3 block">
                Stroke Width
              </label>
              <div className="grid grid-cols-5 gap-2">
                {strokeWidths.map(({ width, label }) => (
                  <button
                    key={width}
                    onClick={() => onStrokeWidthChange(width)}
                    className={`h-12 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                      strokeWidth === width
                        ? "border-blue-500 bg-blue-600/20"
                        : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                    }`}
                    title={label}
                  >
                    <div
                      className="bg-white rounded-full"
                      style={{
                        width: `${Math.min(width * 3, 24)}px`,
                        height: `${width}px`,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Fill Style */}
            <div>
              <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3 block">
                Fill Style
              </label>
              <div className="grid grid-cols-4 gap-2">
                {fillStyles.map(({ style, label }) => (
                  <button
                    key={style}
                    onClick={() => onFillStyleChange(style)}
                    className={`h-14 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                      fillStyle === style
                        ? "border-blue-500 bg-blue-600/20"
                        : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                    }`}
                    title={label}
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      {style === "none" && (
                        <div className="w-5 h-5 border-2 border-white rounded" />
                      )}
                      {style === "solid" && (
                        <div className="w-5 h-5 bg-white rounded" />
                      )}
                      {style === "hatch" && (
                        <svg width="20" height="20" viewBox="0 0 20 20">
                          <defs>
                            <pattern id={`hatch-preview`} width="4" height="4" patternUnits="userSpaceOnUse">
                              <path d="M0,4 L4,0" stroke="white" strokeWidth="1" />
                            </pattern>
                          </defs>
                          <rect width="20" height="20" fill={`url(#hatch-preview)`} />
                        </svg>
                      )}
                      {style === "dots" && (
                        <svg width="20" height="20" viewBox="0 0 20 20">
                          <defs>
                            <pattern id={`dots-preview`} width="5" height="5" patternUnits="userSpaceOnUse">
                              <circle cx="2.5" cy="2.5" r="1" fill="white" />
                            </pattern>
                          </defs>
                          <rect width="20" height="20" fill={`url(#dots-preview)`} />
                        </svg>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3 block">
                Fill Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {backgroundColors.map(({ color, name }) => (
                  <button
                    key={color}
                    onClick={() => onBackgroundColorChange(color)}
                    className={`group relative w-full aspect-square rounded-lg transition-all duration-200 ${
                      backgroundColor === color
                        ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900 scale-110"
                        : "hover:scale-105"
                    } ${color === "transparent" ? "border border-zinc-700" : ""}`}
                    style={{
                      backgroundColor: color === "transparent" ? "#27272a" : color,
                    }}
                    title={name}
                  >
                    {color === "transparent" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 16 16">
                          <path
                            d="M2 2L14 14M14 2L2 14"
                            stroke="#ef4444"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    )}
                    {backgroundColor === color && color !== "transparent" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full shadow-lg" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider">
                  Opacity
                </label>
                <span className="text-white text-sm font-medium">{opacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => onOpacityChange(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(39, 39, 42, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(113, 113, 122, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(113, 113, 122, 0.7);
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  );
}