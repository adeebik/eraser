import { Router } from "express";
import { auth } from "../middleware/auth";
import {
  allRooms,
  createRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
  shareRoom,
} from "../controllers/roomControllers";

const roomRouter: Router = Router();

roomRouter.post("/room/create", auth, createRoom);

roomRouter.post("/room/share", auth, shareRoom);

roomRouter.post("/room/join/:link", auth, joinRoom);

roomRouter.post("/room/leave", auth, leaveRoom);

roomRouter.post("/room/delete", auth, deleteRoom);

roomRouter.get("/room/allRooms", auth, allRooms);

export default roomRouter;
