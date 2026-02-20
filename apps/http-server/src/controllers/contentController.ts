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

    // Get messages with full shape data including path points and erase points
    const chats = await prisma.chat.findMany({
      where: {
        roomId: roomId?.toString(),
      },
      include: {
        shape: {
          include: {
            pathPoints: {
              orderBy: {
                order: "asc", // Ensure points are in correct order
              },
            },
            erasePoints: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        id: "asc", // CRITICAL: Oldest first for proper canvas reconstruction
      },
      take: 1000, // Get last 1000 shapes
    });

    // Transform the data to match frontend format
    const response = chats.map((chat) => {
      // If there's a Shape relation, reconstruct the full shape object
      if (chat.shape) {
        const shape = chat.shape;
        const shapeData: any = {
          type: shape.type,
        };

        // Add geometric properties
        if (shape.x !== null) shapeData.x = shape.x;
        if (shape.y !== null) shapeData.y = shape.y;
        if (shape.width !== null) shapeData.width = shape.width;
        if (shape.height !== null) shapeData.height = shape.height;
        if (shape.rotation !== null) shapeData.rotation = shape.rotation;
        if (shape.centerX !== null) shapeData.centerX = shape.centerX;
        if (shape.centerY !== null) shapeData.centerY = shape.centerY;

        // Add style
        shapeData.style = {
          strokeColor: shape.strokeColor,
          strokeWidth: shape.strokeWidth,
          backgroundColor: shape.backgroundColor,
          fillStyle: shape.fillStyle.toLowerCase(), // Convert ENUM back to lowercase
        };

        // Add path points if they exist (for PENCIL)
        if (shape.pathPoints && shape.pathPoints.length > 0) {
          shapeData.path = shape.pathPoints.map((p) => ({
            x: p.x,
            y: p.y,
          }));
        }

        // Add erase points if they exist (for Eraser)
        if (shape.erasePoints && shape.erasePoints.length > 0) {
          shapeData.erasePoints = shape.erasePoints.map((p) => ({
            x: p.x,
            y: p.y,
          }));
        }

        return {
          id: chat.id,
          message: JSON.stringify(shapeData),
          createdAt: chat.createdAt,
        };
      } else {
        // Fallback: If no Shape relation, return the JSON message as-is
        return {
          id: chat.id,
          message: chat.message,
          createdAt: chat.createdAt,
        };
      }
    });

    res.json({
      response,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ msg: "Error fetching messages" });
  }
};