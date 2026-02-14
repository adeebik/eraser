import express from "express";

import cors from "cors";
import userRouter from "./routes/user";
import roomRouter from "./routes/room";
import contentRouter from "./routes/content";
import dashboardRouter from "./routes/dashboard";
const app = express();
app.use(express.json());

app.use(cors());

app.use("/user", userRouter);
app.use("/room", roomRouter);
app.use("/content", contentRouter);
app.use("/dashboard", dashboardRouter);

app.listen(3002);