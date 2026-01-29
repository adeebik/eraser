import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-config/config";

export function auth(res: Response, req: Request, next: NextFunction) {
  const token = req.headers.authorization;

  if (!token) {
    return;
  }

  try {
    const verifyToken = jwt.verify(token, JWT_SECRET as string);
    if (!verifyToken) {
      return;
    }

    req.userId = verifyToken.id;
    next()
  } catch (error) {
    return
  }
}
