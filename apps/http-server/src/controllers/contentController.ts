import { prisma } from "@repo/db";
import { Request, Response } from "express";

export const getChats = async (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const userId = req.userId;

  try {
    // Verify user has access to this room
    const room = await prisma.room.findFirst({
      where: {
        id: roomId?.toString(),
      },
      include: {
        members: {
          where: {
            userId: userId,
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ msg: "Room not found" });
    }

    // Check if user is admin OR member
    const isMember = room.adminId === userId || room.members.length > 0;

    if (!isMember) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Get messages with full shape data from the JSON string
    const chats = await prisma.chat.findMany({
      where: {
        roomId: roomId?.toString(),
      },
      orderBy: {
        id: "asc", // CRITICAL: Oldest first for proper canvas reconstruction
      },
      take: 1000, // Get last 1000 shapes
    });

    // Transform the data to match frontend format
    const response = chats.map((chat) => {
      return {
        id: chat.id,
        message: chat.message,
        createdAt: chat.createdAt,
      };
    });

    res.json({
      response,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ msg: "Error fetching messages" });
  }
};