"use client";

import { X, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "./button";
import { useState, useEffect } from "react";

interface ShareRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  roomSlug: string;
  initialLink?: string;
  onGenerate?: () => Promise<string | void>;
}

export function ShareRoomModal({
  isOpen,
  onClose,
  isAdmin,
  roomSlug,
  initialLink,
  onGenerate,
}: ShareRoomModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLink, setShowLink] = useState(!!initialLink || !isAdmin);
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(initialLink || "");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsGenerating(false);
      setShowLink(!!initialLink || !isAdmin);
      setCopied(false);
      setGeneratedLink(initialLink || "");
    }
  }, [isOpen, initialLink, isAdmin]);

  if (!isOpen) return null;


  const shareLink = generatedLink 
    ? `${window.location.origin}/join/${generatedLink}`
    : initialLink 
      ? `${window.location.origin}/join/${initialLink}`
      : "";

  const handleGenerate = async () => {
    if (!onGenerate) return;
    
    setIsGenerating(true);
    try {
      const link = await onGenerate();
      if (link) {
        setGeneratedLink(link);
      }
      setShowLink(true);
    } catch (error) {
      console.error("Failed to generate link", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
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

        <h2 className="mb-2 text-2xl font-black italic">Share Room</h2>
        
        {!showLink && isAdmin ? (
          <div className="space-y-6">
            <p className="text-gray-600 font-medium">
              Do you really want to share this room with others?
            </p>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              variant="pastel-green"
              className="w-full justify-center border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-black uppercase tracking-wider py-4 text-lg"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Generating...</span>
                </div>
              ) : (
                "Yes, Generate Link!"
              )}
            </Button>
          </div>
        ) : !shareLink ? (
            <div className="space-y-6">
                <p className="text-gray-600 font-medium">
                    This room has not been shared by the admin yet.
                </p>
                <Button
                    onClick={onClose}
                    variant="secondary"
                    className="w-full justify-center border-2 border-black rounded-xl font-bold py-3"
                >
                    Close
                </Button>
            </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-gray-600 font-medium">
              Anyone with this code can join your room.
            </p>
            <div className="relative group flex items-center justify-between w-full gap-4">
              <input 
                readOnly
                value={shareLink}
                className="w-full rounded-xl border-2 border-black bg-gray-50 px-4 py-3 pr-12 font-bold text-sm focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="rounded-lg bg-black p-2 text-white transition-transform hover:scale-110 active:scale-95 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]"
                title="Copy to clipboard"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            {copied && (
              <p className="text-green-600 font-black text-xs uppercase tracking-widest animate-bounce">
                Copied to clipboard!
              </p>
            )}
            <Button
              onClick={onClose}
              variant="secondary"
              className="w-full justify-center border-2 border-black rounded-xl font-bold py-3"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
