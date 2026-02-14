import * as dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET
export const BE_URL = process.env.BE_URL
export const WS_URL = process.env.WS_URL
export const FE_URL= process.env.FE_URL