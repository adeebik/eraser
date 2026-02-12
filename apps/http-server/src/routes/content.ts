import { Router } from "express";
import { auth } from "../middleware/auth";
import { getChats } from "../controllers/contentController";

const contentRouter : Router = Router();

contentRouter.get("/chats/:roomId", auth , getChats);

export default contentRouter;
