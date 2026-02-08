import { ReactNode } from "react";

interface ToolsBtnProps {
  icon: ReactNode;
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
  tooltip?: string;
}

export default function ToolsBtn({
  icon,
  onClick,
  selected = false,
  disabled = false,
  tooltip,
}: ToolsBtnProps) {
  return (
    <div className="relative group">
      <button
        className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          transition-all duration-200 border
          ${
            selected
              ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/50 scale-105"
              : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white hover:border-zinc-600"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105 active:scale-95"}
        `}
        onClick={onClick}
        disabled={disabled}
      >
        {icon}
        
        {/* Selection indicator */}
        {selected && (
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r-full" />
        )}
      </button>

      {tooltip && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-zinc-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 border border-zinc-700 shadow-xl">
          {tooltip}
        </div>
      )}
    </div>
  );
}