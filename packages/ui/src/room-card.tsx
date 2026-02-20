"use client";

import { Share2, Trash2, LogOut } from "lucide-react";
import { Button } from "./button";
import { AlertData } from "./createRoom";
import { Alert } from "./alert";

interface RoomCardProps {
  id: string;
  slug: string;
  adminName: string;
  createdAt: string;
  isAdmin: boolean;
  onShare?: (id: string) => void;
  onDelete?: (id: string) => void;
  onLeave?: (id: string) => void;
  onJoin?: () => void;
  alert: AlertData | null;
  setAlert: (alert: AlertData | null) => void;
}

export function RoomCard({
  id,
  slug,
  adminName,
  createdAt,
  isAdmin,
  onShare,
  onDelete,
  onLeave,
  alert,
  setAlert,
}: RoomCardProps) {
  return (
    <div className="group relative flex flex-col justify-between rounded-xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-[#1a1a1a]">
            {slug}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-bold opacity-70">
              By <span className="text-black opacity-100">{adminName}</span>
            </span>
            {isAdmin && (
              <span className="inline-flex items-center rounded-md border border-black bg-green-200 px-3 py-1.5  text-[10px] font-black uppercase tracking-tighter shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                Admin
              </span>
            )}
          </div>

          <div className="mt-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {createdAt}
            </span>
          </div>
        </div>
      </div>

      {alert &&
        alert.context === "room" &&
        (!alert.roomId || alert.roomId === id) && (
          <div className="mb-6">
            <Alert
              type={alert.type}
              title={alert.title}
              message={alert.message}
              onClose={() => setAlert(null)}
              onConfirm={alert.onConfirm}
              onCancel={alert.onCancel}
            />
          </div>
        )}

      <div className="mt-8 flex items-center gap-4">
        <Button
          variant="pastel-green"
          className="flex-1 py-2 hover:bg-green-300"
          onClick={() => onShare?.(id)}
        >
          <Share2 size={18} />
          Share
        </Button>

        {isAdmin ? (
          <Button
            variant="pastel-red"
            className="flex-1 py-2"
            onClick={() => onDelete?.(id)}
          >
            <Trash2 size={18} />
            Delete
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="flex-1 py-2"
            onClick={() => onLeave?.(id)}
          >
            <LogOut size={18} />
            Leave
          </Button>
        )}
      </div>
    </div>
  );
}