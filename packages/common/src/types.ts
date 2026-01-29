import z from "zod";


export const authSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(4).max(26),
});
