import { prisma } from "@repo/db";
import { Request, Response } from "express";

export const getChats = async (req: Request, res: Response) => {
  const roomId = req.params.roomId;

  const response = await prisma.chat.findMany({
    where: {
      roomId: roomId?.toString(),
    },
    orderBy: {
      id: "desc",
    },
    take: 100,
  });

  res.json({
    response,
  });
};