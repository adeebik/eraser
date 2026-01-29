import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth } from "./middleware/auth";
import {JWT_SECRET} from '@repo/backend-config/config'
import {authSchema} from '@repo/common/zod'

const app = express();
app.use(express.json());



app.post("/signup", async (res: Response, req: Request) => {
  const parseData = authSchema.safeParse(req.body);
  if (!parseData.success) {
    return;
  }

  const { email, password } = parseData.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      email,
      password,
    });
  } catch (error) {}
});

app.post("/signin", async (res: Response, req: Request) => {
  const parseData = authSchema.safeParse(req.body);
  if (!parseData.success) {
    return;
  }

  const { email, password } = parseData.data;

  try {
    const user = await prisma.user.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return;
    }

    const checkPassword = bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return;
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET as string );

    return token

  } catch (error) {
    return
  }
});

app.post("/room", auth, (res:Response ,req:Request)=>{
    
})

app.listen(3002);
