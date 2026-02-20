"use client";

import { CanvasPage } from "@/app/components/CanvasPage";
import { BE_URL } from "@/config/config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";

export default function Canvas({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [roomId, setRoomId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }

    axios.get(`${BE_URL}/room/roomId/${slug}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => {
      setRoomId(res.data.roomId);
    }).catch(error => {
      console.error("Failed to fetch roomId:", error.response?.data || error.message);
      router.push("/dashboard");
    });
  }, [slug, router]);

  if (!roomId) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Joining room...</p>
        </div>
      </div>
    );
  }

  return <CanvasPage slug={slug} roomId={roomId} />;
}
