"use client";

import { X } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { useRef } from "react";
import { AlertData } from "./createRoom";
import { Alert } from "./alert";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (link: string) => void;
  alert: AlertData | null;
  setAlert: (alert: AlertData | null) => void;
}

export function JoinRoomModal({
  isOpen,
  onClose,
  onJoin,
  alert,
  setAlert,
}: JoinRoomModalProps) {
  const joinRoomRef = useRef<HTMLInputElement | null>(null);

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

        <h2 className="mb-2 text-2xl font-black">Join Room</h2>
        <p className="mb-8 text-gray-500">
          Enter the invite code to join an existing session.
        </p>

        {alert && alert.context === "join" && (
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
              ref={joinRoomRef}
              autoFocus
              type="text"
              placeholder="14 Digit Room Code"
              label="Invite Code"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 justify-center border-2 border-black rounded-xl hover:bg-gray-100 font-bold"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={() => onJoin(joinRoomRef.current?.value || "")}
              type="submit"
              variant="pastel-orange"
              className="flex-1 justify-center border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-bold"
            >
              Join Room
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
