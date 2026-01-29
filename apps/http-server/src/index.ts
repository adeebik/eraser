import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-config/config";
import { authSchema, roomSchema } from "@repo/common/zod";
import prisma from "@repo/db/prisma";
import { auth } from "./middleware/auth";
import slugify from "slugify";

const app = express();
app.use(express.json());

app.post("/signup", async (res: Response, req: Request) => {
  const parseData = authSchema.safeParse(req.body);

  if (!parseData.success) {
    return res.status(403).json({
      msg: "Input fields invalid",
      error: parseData.error,
    });
  }

  const { email, password, name } = parseData.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name,
      },
    });

    res.status(200).json({
      msg: "Signed up Successfully",
      userId: user.id,
    });
  } catch (error) {
    res.status(403).json({
      msg: "User Already Exist",
      error: error,
    });
  }
});

app.post("/signin", async (res: Response, req: Request) => {
  const parseData = authSchema.safeParse(req.body);

  if (!parseData.success) {
    return res.status(403).json({
      msg: "Input fields invalid",
      error: parseData.error,
    });
  }

  const { email, password, name } = parseData.data;

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(403).json({
        msg: "Invalid inputs",
      });
    }

    const checkPassword = bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(403).json({
        msg: "Invalid inputs",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      JWT_SECRET as string,
    );

    res.status(200).json({
      msg: "Successfully Signed in",
      token: token,
    });
  } catch (error) {
    res.status(403).json({
      msg: "Unauthorized",
      error: error,
    });
  }
});

// @ts-ignore
app.post("/room", auth, async (res: Response, req: Request) => {
  const parseData = roomSchema.safeParse(req.body);
  if (!parseData.success) {
    return res.json({
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

    res.json({
      roomId: room.id,
    });
  } catch (error) {
    res.status(411).json({
      msg: "Room already Exists",
    });
  }
});

app.listen(3002);
