import { ReactNode } from "react";

interface tools {
  icon: ReactNode;
  onClick: () => void;
  selected: boolean;
}

export default function ToolsBtn({ icon, onClick, selected }: tools) {
  return (
    <div
      className={`border border-zinc-600 hover:border-zinc-500 hover:bg-zinc-900 bg-zinc-800 cursor-pointer border-zinc-100 rounded-lg px-4 py-3 ${selected ? "text-red-400" : "text-zinc-200 hover:text-zinc-50"}`}
      onClick={onClick}
    >
      {icon}
    </div>
  );
}