"use client";

import { LogOut, Plus, Search } from "lucide-react";
import { Button } from "@repo/ui/button";
import { RoomCard } from "@repo/ui/room-card";
import { CreateRoomModal } from "@repo/ui/create-room-modal";
import { JoinRoomModal } from "@repo/ui/join-room-modal";
import { useState } from "react";

const MOCK_ROOMS = [
  {
    id: "1",
    slug: "design-sync-2024",
    admin: "sarah_k",
    createdAt: "2 mins ago",
    isAdmin: false,
  },
  {
    id: "2",
    slug: "brainstorming-session",
    admin: "You",
    createdAt: "1 hour ago",
    isAdmin: true,
  },
  {
    id: "3",
    slug: "q1-planning-board",
    admin: "mike_r",
    createdAt: "3 days ago",
    isAdmin: false,
  },
  {
    id: "4",
    slug: "wireframes-v2",
    admin: "You",
    createdAt: "1 week ago",
    isAdmin: true,
  },
  {
      id: "5",
      slug: "marketing-assets",
      admin: "jessica_p",
      createdAt: "2 weeks ago",
      isAdmin: false
  }
];

export default function DashboardPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const handleCreateRoom = (name: string) => {
    console.log("Creating room:", name);
    // Logic to create room would go here
  };

  const handleJoinRoom = (link: string) => {
    console.log("Joining room:", link);
    // Logic to join room would go here
  };

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
              U
            </div>
            <Button variant="pastel-red" className="flex items-center gap-2 px-4 py-2 border-b-2 border-r-2 shadow-none">
              <LogOut size={16} />
              <span className="hidden md:inline">logout</span>
            </Button>
          </div>
        </nav>

        {/* Actions & Filters */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
           <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search your rooms..." 
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-black/10 bg-white focus:border-black focus:outline-none transition-all shadow-sm"
                />
            </div>

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
            {MOCK_ROOMS.map((room) => (
              <RoomCard 
                key={room.id} 
                id={room.id}
                slug={room.slug}
                adminName={room.admin}
                createdAt={room.createdAt}
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
                <span className="font-black uppercase tracking-widest text-xs">Create New Room</span>
            </button>
          </div>
        </div>
      </div>

      <CreateRoomModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateRoom}
      />

      <JoinRoomModal 
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={handleJoinRoom}
      />
    </div>
  );
}
