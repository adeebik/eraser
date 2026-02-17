"use client";

import { ReactNode } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "./button";

type AlertType = "success" | "error" | "info" | "delete";

interface AlertProps {
  title?: string;
  message: string | ReactNode;
  type?: AlertType;
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const Alert = ({
  title,
  message,
  type = "info",
  onClose,
  onConfirm,
  onCancel,
  className = "",
}: AlertProps) => {
  const styles = {
    success: {
      bg: "bg-green-200",
      border: "border-black",
      icon: <CheckCircle2 className="text-[#166534]" size={24} />,
      titleColor: "text-[#166534]",
    },
    error: {
      bg: "bg-red-200",
      border: "border-black",
      icon: <AlertCircle className="text-[#991b1b]" size={24} />,
      titleColor: "text-[#991b1b]",
    },
    info: {
      bg: "bg-blue-200",
      border: "border-black",
      icon: <Info className="text-[#1e40af]" size={24} />,
      titleColor: "text-[#1e40af]",
    },
    delete: {
      bg: "bg-orange-200",
      border: "border-black",
      icon: <AlertTriangle className="text-[#9a3412]" size={24} />,
      titleColor: "text-[#9a3412]",
    },
  };

  const currentStyle = styles[type];

  return (
    <div
      className={`relative flex flex-col gap-4 rounded-xl border-2 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${currentStyle.bg} ${currentStyle.border} ${className}`}
      role="alert"
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute p-2 right-0 top-0 rounded-lg p-1 transition-colors hover:bg-black/5"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      )}

      <div className="flex gap-4">
        <div className="mt-0.5 shrink-0">{currentStyle.icon}</div>
        <div className="flex flex-col gap-1">
          {title && (
            <h4
              className={`text-lg font-black tracking-tight ${currentStyle.titleColor}`}
            >
              {title}
            </h4>
          )}
          <div className="text-sm font-bold text-black/80">{message}</div>
        </div>
      </div>

      {type === "delete" && (
        <div className="mt-2 flex items-center gap-3">
          <Button
            variant="secondary"
            className="w-full py-2 text-sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="pastel-red"
            className="w-full py-2 text-sm"
            onClick={onConfirm}
          >
            Confirm Delete
          </Button>
        </div>
      )}
    </div>
  );
};
