import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface BottomStylePanelProps {
  strokeColor: string;
  strokeWidth: number;
  backgroundColor: string;
  fillStyle: "none" | "solid" | "hatch" | "dots";
  onStrokeColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onBackgroundColorChange: (color: string) => void;
  onFillStyleChange: (style: "none" | "solid" | "hatch" | "dots") => void;
}

export default function BottomStylePanel({
  strokeColor,
  strokeWidth,
  backgroundColor,
  fillStyle,
  onStrokeColorChange,
  onStrokeWidthChange,
  onBackgroundColorChange,
  onFillStyleChange,
}: BottomStylePanelProps) {
  const [activePopup, setActivePopup] = useState<'stroke' | 'fill' | 'color' | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const strokeColors = [
    "#000000", "#71717a", "#ffffff", "#ef4444", "#f97316", 
    "#eab308", "#84cc16", "#22c55e", "#06b6d4", "#3b82f6", 
    "#8b5cf6", "#a855f7", "#ec4899",
  ];

  const backgroundColors = [
    "transparent", "#000000", "#71717a", "#ffffff", "#ef4444", 
    "#f97316", "#eab308", "#84cc16", "#22c55e", "#06b6d4", 
    "#3b82f6", "#8b5cf6", "#a855f7", "#ec4899",
  ];

  const strokeWidths = [
    { width: 1, label: "Thin" },
    { width: 2, label: "Regular" },
    { width: 4, label: "Medium" },
    { width: 6, label: "Thick" },
    { width: 8, label: "Extra" },
  ];

  const fillStyles = [
    { style: "none" as const, label: "None" },
    { style: "solid" as const, label: "Solid" },
    { style: "hatch" as const, label: "Hatch" },
    { style: "dots" as const, label: "Dots" },
  ];

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setActivePopup(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePopup = (popup: 'stroke' | 'fill' | 'color') => {
    setActivePopup(activePopup === popup ? null : popup);
  };

  return (
    <div ref={panelRef} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
      <div className="bg-zinc-900/95 backdrop-blur-sm rounded-xl border border-zinc-700/50 shadow-2xl p-2">
        <div className="flex items-center gap-2">
          
          {/* Stroke Button */}
          <div className="relative">
            <button
              onClick={() => togglePopup('stroke')}
              className={`h-10 px-3 rounded-lg flex items-center gap-2 transition-all ${
                activePopup === 'stroke'
                  ? "bg-zinc-700 ring-2 ring-blue-500"
                  : "hover:bg-zinc-800"
              }`}
            >
              <div
                className="rounded-full bg-white"
                style={{
                  width: `${Math.min(strokeWidth * 3, 20)}px`,
                  height: `${strokeWidth * 2}px`,
                }}
              />
              <ChevronDown size={14} className="text-zinc-400" />
            </button>

            {/* Stroke Popup */}
            {activePopup === 'stroke' && (
              <div className="absolute bottom-full mb-2 left-0 bg-zinc-900/98 backdrop-blur-sm rounded-xl border border-zinc-700/50 shadow-2xl p-3 min-w-[200px]">
                <div className="text-zinc-400 text-xs font-medium mb-2">Stroke Width</div>
                <div className="grid grid-cols-5 gap-2">
                  {strokeWidths.map(({ width, label }) => (
                    <button
                      key={width}
                      onClick={() => {
                        onStrokeWidthChange(width);
                        setActivePopup(null);
                      }}
                      className={`h-12 rounded-lg flex items-center justify-center transition-all ${
                        strokeWidth === width
                          ? "bg-zinc-700 ring-2 ring-blue-500"
                          : "bg-zinc-800/50 hover:bg-zinc-700"
                      }`}
                      title={label}
                    >
                      <div
                        className="bg-white rounded-full"
                        style={{
                          width: `${Math.min(width * 3, 20)}px`,
                          height: `${width * 2}px`,
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-zinc-700" />

          {/* Color Button */}
          <div className="relative">
            <button
              onClick={() => togglePopup('color')}
              className={`h-10 w-10 rounded-lg flex items-center justify-center transition-all ${
                activePopup === 'color'
                  ? "ring-2 ring-blue-500"
                  : "hover:ring-2 hover:ring-zinc-600"
              }`}
              style={{ backgroundColor: strokeColor }}
            >
              {strokeColor === "#ffffff" && (
                <div className="absolute inset-0 rounded-lg border border-zinc-600" />
              )}
              <ChevronDown size={14} className={strokeColor === "#000000" ? "text-white" : "text-black"} />
            </button>

            {/* Color Popup */}
            {activePopup === 'color' && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-900/98 backdrop-blur-sm rounded-xl border border-zinc-700/50 shadow-2xl p-3 min-w-75">
                <div className="text-zinc-400 text-xs font-medium mb-2">Stroke Color</div>
                <div className="grid grid-cols-7 gap-2 max-w-[280px]">
                  {strokeColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        onStrokeColorChange(color);
                        setActivePopup(null);
                      }}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        strokeColor === color
                          ? "ring-2 ring-blue-500 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {color === "#ffffff" && (
                        <div className="absolute inset-0 rounded-lg border border-zinc-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-zinc-700" />

          {/* Fill Style Button */}
          <div className="relative">
            <button
              onClick={() => togglePopup('fill')}
              className={`h-10 px-3 rounded-lg flex items-center gap-2 transition-all ${
                activePopup === 'fill'
                  ? "bg-zinc-700 ring-2 ring-blue-500"
                  : "hover:bg-zinc-800"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {fillStyle === "none" && (
                  <div className="w-5 h-5 border-2 border-white rounded" />
                )}
                {fillStyle === "solid" && (
                  <div 
                    className="w-5 h-5 rounded" 
                    style={{ 
                      backgroundColor: backgroundColor === "transparent" ? "#ffffff40" : `${backgroundColor}40`
                    }}
                  />
                )}
                {fillStyle === "hatch" && (
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <defs>
                      <pattern id="hatch-compact" width="4" height="4" patternUnits="userSpaceOnUse">
                        <path d="M0,4 L4,0" stroke="white" strokeWidth="1" opacity="0.3" />
                      </pattern>
                    </defs>
                    <rect width="20" height="20" fill="url(#hatch-compact)" />
                  </svg>
                )}
                {fillStyle === "dots" && (
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <defs>
                      <pattern id="dots-compact" width="5" height="5" patternUnits="userSpaceOnUse">
                        <circle cx="2.5" cy="2.5" r="1" fill="white" opacity="0.3" />
                      </pattern>
                    </defs>
                    <rect width="20" height="20" fill="url(#dots-compact)" />
                  </svg>
                )}
              </div>
              <ChevronDown size={14} className="text-zinc-400" />
            </button>

            {/* Fill Popup */}
            {activePopup === 'fill' && (
              <div className="absolute bottom-full mb-2 left-0 bg-zinc-900/98 backdrop-blur-sm rounded-xl border border-zinc-700/50 shadow-2xl p-3 min-w-[240px]">
                {/* Fill Style */}
                <div className="mb-3">
                  <div className="text-zinc-400 text-xs font-medium mb-2">Fill Style</div>
                  <div className="grid grid-cols-4 gap-2">
                    {fillStyles.map(({ style, label }) => (
                      <button
                        key={style}
                        onClick={() => onFillStyleChange(style)}
                        className={`h-12 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                          fillStyle === style
                            ? "bg-zinc-700 ring-2 ring-blue-500"
                            : "bg-zinc-800/50 hover:bg-zinc-700"
                        }`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          {style === "none" && (
                            <div className="w-5 h-5 border-2 border-white rounded" />
                          )}
                          {style === "solid" && (
                            <div className="w-5 h-5 bg-white rounded opacity-50" />
                          )}
                          {style === "hatch" && (
                            <svg width="20" height="20" viewBox="0 0 20 20">
                              <defs>
                                <pattern id={`hatch-${style}`} width="4" height="4" patternUnits="userSpaceOnUse">
                                  <path d="M0,4 L4,0" stroke="white" strokeWidth="1" opacity="0.5" />
                                </pattern>
                              </defs>
                              <rect width="20" height="20" fill={`url(#hatch-${style})`} />
                            </svg>
                          )}
                          {style === "dots" && (
                            <svg width="20" height="20" viewBox="0 0 20 20">
                              <defs>
                                <pattern id={`dots-${style}`} width="5" height="5" patternUnits="userSpaceOnUse">
                                  <circle cx="2.5" cy="2.5" r="1" fill="white" opacity="0.5" />
                                </pattern>
                              </defs>
                              <rect width="20" height="20" fill={`url(#dots-${style})`} />
                            </svg>
                          )}
                        </div>
                        <span className="text-[9px] text-zinc-400">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fill Color */}
                {fillStyle !== "none" && (
                  <>
                    <div className="h-px bg-zinc-700 my-2" />
                    <div>
                      <div className="text-zinc-400 text-xs font-medium mb-2">Fill Color</div>
                      <div className="grid grid-cols-7 gap-1.5">
                        {backgroundColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => onBackgroundColorChange(color)}
                            className={`w-6 h-6 rounded transition-all ${
                              backgroundColor === color
                                ? "ring-2 ring-blue-500 scale-110"
                                : "hover:scale-105"
                            } ${color === "transparent" ? "border border-zinc-600" : ""}`}
                            style={{
                              backgroundColor: color === "transparent" ? "#27272a" : color,
                            }}
                          >
                            {color === "transparent" && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg width="12" height="12" viewBox="0 0 12 12">
                                  <path
                                    d="M1 1L11 11M11 1L1 11"
                                    stroke="#ef4444"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}