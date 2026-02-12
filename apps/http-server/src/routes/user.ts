import { Router } from "express";
import { singinController, singupController } from "../controllers/userControllers";

const userRouter: Router = Router();

userRouter.post("/singin", singinController)
userRouter.post("/singup", singupController)

export default userRouter;