import { authSchema } from "@repo/common/zod";
import { prisma } from "@repo/db";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-config/config";

export const singinController = async (req: Request, res: Response) => {
  const parseData = authSchema.safeParse(req.body);

  if (!parseData.success) {
    return res.status(403).json({
      msg: "Input fields invalid",
      error: parseData.error,
    });
  }

  const { email, password } = parseData.data;

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

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(403).json({
        msg: "Invalid inputs",
      });
    }

    console.log("secert", JWT_SECRET);

    const token = jwt.sign(
      {
        id: user.id,
      },
      JWT_SECRET as string,
    );

    console.log("token ", token);

    return res.status(200).json({
      msg: "Successfully Signed in",
      token: token,
    });
  } catch (error) {
    res.status(403).json({
      msg: "Unauthorized",
      error: error,
    });
  }
};

export const singupController = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    if (
      error.meta.driverAdapterError.cause.kind == "UniqueConstraintViolation"
    ) {
      res.status(411).json({
        msg: "User already exists",
      });
    } else {
      res.status(403).json({
        msg: "Unexpected Database Error",
      });
    }
  }
};