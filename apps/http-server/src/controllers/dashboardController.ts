import { prisma } from "@repo/db";
import { Request, Response } from "express";

export const landing = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const userInfo = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        memberOfRooms: {
          select: {
            joinedAt: true,
            rooms: {
              select: {
                id: true,
                slug: true,
                shared: true,
                createdAt: true,
                adminId: true,
                admin: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            joinedAt: "desc",
          },
        },
      },
    });

    if (!userInfo) {
      return res.status(404).json({
        msg: "Please signup first",
      });
    }

    const dashboardData = {
      user: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
      },
      rooms: userInfo.memberOfRooms.map((m) => ({
        id: m.rooms.id,
        slug: m.rooms.slug,
        shared: m.rooms.shared,
        createdAt: m.rooms.createdAt,
        joinedAt: m.joinedAt,
        isAdmin: m.rooms.adminId === userId,
        admin: {
          id: m.rooms.admin.id,
          name: m.rooms.admin.name,
          isYou: m.rooms.admin.id === userId,
        },
      })),
    };

    res.status(200).json({
      msg: "welcome to dashboard",
      dashboardData,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Unexpected error",
    });
  }
};