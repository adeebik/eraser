"use client";

import { X } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Alert } from "./alert";
import { RefObject } from "react";

export interface AlertData {
  type: "success" | "error" | "info" | "delete";
  title: string;
  message: string;
  context?: "create" | "join" | "room";
  roomId?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface CreateRoomModalProps {
  alert: AlertData | null;
  setAlert: (alert: AlertData | null) => void;
  isOpen: boolean;
  onClose: () => void;
  createHandle: () => void;
  ref: RefObject<HTMLInputElement | null>;
}

export function CreateRoomModal({
  alert,
  setAlert,
  isOpen,
  onClose,
  createHandle,
  ref,
}: CreateRoomModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative animate-in fade-in zoom-in duration-300">
        <div className="absolute right-0 top-0 p-3">
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <h2 className="mb-2 text-2xl font-black">Create New Room</h2>
        <p className="mb-8 text-gray-500">
          Start a new drawing session! Give it a name.
        </p>

        {alert && alert.context === "create" && (
          <div className="mb-6">
            <Alert
              type={alert.type}
              title={alert.title}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        <div className="space-y-6">
          <div className="text-left space-y-2">
            <Input
              ref={ref}
              autoFocus
              type="text"
              placeholder="e.g. Design Sync, Wireframes..."
              label="Room Name"
            />
          </div>

          <div className="flex justify-between gap-8 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 w-full justify-center border-2 border-black rounded-xl hover:bg-gray-100 font-bold"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={createHandle}
              type="submit"
              variant="pastel-green"
              className="flex-1 w-full justify-center border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-bold"
            >
              Create Room
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
