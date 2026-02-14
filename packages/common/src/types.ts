import z from "zod";

export const signup = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(4).max(26),
  name:z.string().min(3).max(20).toLowerCase()
});

export const singin = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(4).max(26),
});

export const roomSchema = z.object({
  name:z.string().min(3).max(25)
})