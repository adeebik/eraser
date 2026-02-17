import { Router } from "express";
import { auth } from "../middleware/auth";
import { landing } from "../controllers/dashboardController";

const dashboardRouter: Router = Router();

dashboardRouter.get("/", auth, landing);

export default dashboardRouter