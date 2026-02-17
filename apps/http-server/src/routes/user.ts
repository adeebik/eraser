import { Router } from "express";
import {
  logoutController,
  signinController,
  signupController,
} from "../controllers/userControllers";

const userRouter: Router = Router();

userRouter.post("/signin", signinController);
userRouter.post("/signup", signupController);
userRouter.post('/logout', logoutController);

export default userRouter;