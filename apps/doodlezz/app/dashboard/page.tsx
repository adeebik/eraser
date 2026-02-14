"use client";

import { LogOut, Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { RoomCard } from "@repo/ui/room-card";
import { CreateRoomModal, type AlertData } from "@repo/ui/createRoom";
import { JoinRoomModal } from "@repo/ui/join-room-modal";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BE_URL } from "@/config/config";
import { useRouter } from "next/navigation";
import { getTimeAgo } from "../utils/timeFormat";

interface User {
  id: string;
  email: string;
  name: string;
}

interface Room {
  id: string;
  slug: string;
  shared: string;
  createdAt: string;
  joinedAt: string;
  isAdmin: boolean;
  admin: {
    id: string;
    name: string;
    isYou: boolean;
  };
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [roomsInfo, setRoomsInfo] = useState<Room[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [token, setToken] = useState("");
  const [alert,setAlert] = useState<AlertData | null>(null);

  const roomNameRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();

  useEffect(() => {
    getDashboard();
  }, [isCreateModalOpen,isJoinModalOpen]);

  async function getDashboard() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin");
        return;
      }
      setToken(token);
      const response = await axios.get(`${BE_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { user, rooms } = response.data.dashboardData;
      setUserInfo(user);
      setRoomsInfo(rooms);

      return response.data.dashboardData;
    } catch (error) {
      console.log(error);
      router.push("/signin");
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const createHandle = async () => {
    try {
      const roomCreateName = roomNameRef.current?.value;
      if (!roomCreateName) {
        setAlert({
          type: "error",
          title: "Required",
          message: "Please enter a room name.",
        });
        return;
      }

      const response = await axios.post(
        `${BE_URL}/room/create`,
        { name: roomCreateName },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.err === "duplicateEntry") {
        setAlert({
          type: "error",
          title: "Failed",
          message: response.data?.msg || "Something went wrong. Please try again.",
        });
      } else {
        setAlert({
          type: "success",
          title: "Success",
          message: "Room created successfully!",
        });
        // Clear input
        if (roomNameRef.current) roomNameRef.current.value = "";
        // Refresh room list
        getDashboard();
        // Close modal after a delay
        setTimeout(() => {
          setIsCreateModalOpen(false);
          setAlert(null);
        }, 1500);
      }
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Error",
        message: error.response?.data?.msg || "An unexpected error occurred.",
      });
    }
  };

  const handleJoinRoom = (link: string) => {
    console.log("Joining room:", link);
    // Logic to join room would go here
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f7f2]">
        <div className="rounded-xl border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-4 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
          </div>
          <p className="text-center font-black uppercase tracking-wider text-sm">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-[#f9f7f2] p-4 font-sans text-[#1a1a1a] grainy md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Navbar */}
        <nav className="flex items-center justify-between rounded-xl border-2 border-black bg-white px-6 py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            {/* Simple Logo Placeholder */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white font-bold text-xl">
              D
            </div>
            <h1 className="text-2xl font-black tracking-tight">doodlezz</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-blue-100 font-bold text-blue-800">
              {userInfo.name.split("")[0].toUpperCase()}
            </div>
            <Button
              onClick={handleLogout}
              variant="pastel-red"
              className="flex items-center gap-2 px-4 py-2 border-b-2 border-r-2 shadow-none"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">logout</span>
            </Button>
          </div>
        </nav>

        {/* Actions & Filters */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            <Button
              variant="pastel-green"
              className="flex items-center justify-center gap-2 px-6 py-3 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={24} />
              New Room
            </Button>

            <Button
              variant="pastel-orange"
              className="flex items-center justify-center gap-2 px-6 py-3 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              onClick={() => setIsJoinModalOpen(true)}
            >
              Join Room
            </Button>
          </div>
        </div>

        <div className="h-px w-full bg-black/10" />

        {/* Room Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black">Your Dashboard</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomsInfo.map((room) => (
              <RoomCard
                key={room.id}
                id={room.id}
                slug={room.slug}
                adminName={room.admin.name}
                createdAt={getTimeAgo(new Date(room.createdAt))}
                isAdmin={room.isAdmin}
              />
            ))}

            {/* Add New Room Card (Visual Prompt) */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white/50 p-6 text-gray-400 transition-all hover:border-black hover:text-black hover:bg-white min-h-[220px] shadow-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="mb-4 rounded-full bg-gray-100 p-4 transition-colors group-hover:bg-green-100 group-hover:text-green-700">
                <Plus size={32} />
              </div>
              <span className="font-black uppercase tracking-widest text-xs">
                Create New Room
              </span>
            </button>
          </div>
        </div>
      </div>

      <CreateRoomModal
        alert={alert}
        setAlert = {setAlert}
        ref={roomNameRef}
        createHandle={createHandle}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={handleJoinRoom}
      />
    </div>
  );
}
