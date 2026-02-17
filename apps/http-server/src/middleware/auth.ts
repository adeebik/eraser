import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-config/config";

export function auth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Authorization header missing" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "Token not provided" });
  }
  try {
    const verifyToken = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
    if (!verifyToken) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    req.userId = verifyToken.id;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ msg: "Invalid token" });
    }
    return res.status(401).json({ msg: "Authentication failed" });
  }
}