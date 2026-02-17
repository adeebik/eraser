import { Router } from "express";
import {
  signinController,
  signupController,
} from "../controllers/userControllers";

const userRouter: Router = Router();

userRouter.post("/signin", signinController);
userRouter.post("/signup", signupController);

export default userRouter;