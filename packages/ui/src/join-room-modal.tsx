"use client";

import { X } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { useState } from "react";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (link: string) => void;
}

export function JoinRoomModal({ isOpen, onClose, onJoin }: JoinRoomModalProps) {
  const [link, setLink] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (link.trim()) {
      onJoin(link);
      setLink("");
      onClose();
    }
  };

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
          Enter the invite link to join an existing session.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left space-y-2">
            <Input 
                autoFocus
                type="text" 
                placeholder="e.g. https://doodlezz.com/room/..." 
                value={link}
                onChange={(e) => setLink(e.target.value)}
                label="Invite Link"
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
                type="submit" 
                variant="pastel-orange" 
                className="flex-1 justify-center border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-bold"
            >
              Join Room
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
