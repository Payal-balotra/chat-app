import { z } from "zod";

export const configSchema = z.object({
  PORT: z
    .string()
    .transform(Number)
    .refine((val) => !isNaN(val), {
      message: "PORT must be a valid number",
    }),

MONGO_URI: z.string().min(1, "MONGO_URI is required"),

});
