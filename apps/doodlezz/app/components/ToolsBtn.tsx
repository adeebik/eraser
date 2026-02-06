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
          relative overflow-hidden
          rounded-lg px-4 py-3
          transition-all duration-200
          border
          ${
            selected
              ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/50"
              : "bg-zinc-800 border-zinc-600 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-500"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105 active:scale-95"}
          ${!selected && !disabled ? "hover:text-white hover:shadow-md" : ""}
        `}
        onClick={onClick}
        disabled={disabled}
      >
        {!disabled && !selected && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </div>
        )}

        <div className="relative z-10 flex items-center justify-center">
          {icon}
        </div>
      </button>

      {tooltip && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
          {tooltip}
        </div>
      )}
    </div>
  );
}
