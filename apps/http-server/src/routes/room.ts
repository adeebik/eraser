import { Router } from "express";
import { auth } from "../middleware/auth";
import {
  allRooms,
  createRoom,
  deleteRoom,
  getRoomId,
  joinRoom,
  leaveRoom,
  shareRoom,
} from "../controllers/roomControllers";

const roomRouter: Router = Router();

roomRouter.post("/create", auth, createRoom);
roomRouter.post("/share", auth, shareRoom);
roomRouter.post("/join/:link", auth, joinRoom);
roomRouter.post("/leave", auth, leaveRoom);
roomRouter.post("/delete", auth, deleteRoom);
roomRouter.get("/allRooms", auth, allRooms);
roomRouter.get("/roomId/:slug", auth, getRoomId);

export default roomRouter;