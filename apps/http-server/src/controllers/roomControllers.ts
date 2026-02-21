import { roomSchema } from "@repo/common/zod";
import { prisma } from "@repo/db";
import { Request, Response } from "express";
import slugify from "slugify";
import generateShareLink from "../utils/linkGenerator";

export const createRoom = async (req: Request, res: Response) => {
  const parseData = roomSchema.safeParse(req.body);
  if (!parseData.success) {
    return res.status(400).json({
      msg: "Incorrect Format",
    });
  }
  const userId = req.userId as string;
  const name = slugify(parseData.data.name);

  try {
    const room = await prisma.room.create({
      data: {
        slug: name,
        adminId: userId,
      },
    });

    await prisma.members.create({
      data: {
        userId: userId,
        roomId: room.id,
      },
    });

    res.status(200).json({
      msg: "Room Created Successfully",
      roomId: room.id,
      name: room.slug,
    });
  } catch (error) {
    console.log("Error creating room:", error);
    res.status(409).json({
      err: "duplicateEntry",
      msg: "Room already Exists",
    });
  }
};

export const shareRoom = async (req: Request, res: Response) => {
  const { enableShare, roomId } = req.body;
  const userId = req.userId;

  if (!enableShare || !roomId) {
    return res.status(400).json({ msg: "Missing data" });
  }

  try {
    const shareLink = generateShareLink(14);

    if (enableShare && roomId) {
      await prisma.room.update({
        where: {
          id: roomId,
          adminId: userId,
        },
        data: {
          shared: shareLink,
        },
      });
    }

    res.status(200).json({
      sharedLink: shareLink,
    });
  } catch (error) {
    res.status(500).json({ msg: "Unexpected Problem Occurred" });
  }
};

export const joinRoom = async (req: Request, res: Response) => {
  const link = req.params.link;
  const userId = req.userId as string;

  try {
    const roomInfo = await prisma.room.findFirst({
      where: {
        shared: link?.toString(),
      },
    });

    if (!roomInfo) {
      return res.status(404).json({ msg: "link is invalid" });
    }

    const roomId = roomInfo.id;

    const existing = await prisma.members.findFirst({
      where: {
        userId,
        roomId,
      },
    });

    if (existing) {
      return res.status(409).json({ msg: "Already joined" });
    }

    await prisma.members.create({
      data: {
        userId: userId,
        roomId: roomId,
      },
    });

    res.status(200).json({
      msg: "Joined room successfully",
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error joining room",
    });
  }
};

export const leaveRoom = async (req: Request, res: Response) => {
  const roomId = req.body.roomId;
  const userId = req.userId;

  if (!userId || !roomId) {
    return res.status(400).json({ msg: "Invalid data" });
  }

  console.log(userId, roomId);

  try {
    await prisma.members.delete({
      where: {
        userId_roomId: {
          userId: userId,
          roomId: roomId.toString(),
        },
      },
    });

    res.status(200).json({ msg: "Left room successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error leaving room" });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  const { roomId } = req.body;
  const userId = req.userId;

  if (!userId || !roomId) {
    return res.status(400).json({ msg: "Invalid data" });
  }

  try {
    await prisma.room.delete({
      where: {
        adminId: userId,
        id: roomId.toString(),
      },
    });

    res.status(200).json({ msg: "Room deleted successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error deleting room" });
  }
};

export const allRooms = async (req: Request, res: Response) => {
  const userId = req.userId as string;

  try {
    const allRooms = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        memberOfRooms: true,
        rooms: true,
      },
    });
    res.status(200).json({
      allRooms,
    });
  } catch (error) {
    res.status(500).json({ message: "Error getting rooms" });
  }
};

export const getRoomId = async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const userId = req.userId;

  try {
    const room = await prisma.room.findFirst({
      where: {
        slug: slug as string,
      }
    });

    if (!room) {
      return res.status(404).json({ roomId: null, msg: "Room not found" });
    }

    return res.json({ roomId: room.id });
  } catch (error) {
    console.error("Error in getRoomId:", error);
    res.status(500).json({ roomId: null, msg: "Internal server error" });
  }
};