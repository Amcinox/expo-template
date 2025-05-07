import { z } from "zod";

export const LoginSchema = z.object({
    username: z.string().nonempty("Username is required"),
    password: z.string().nonempty("Password is required"),
    rememberMe: z.boolean().optional(),
});

export type LoginPayload = z.infer<typeof LoginSchema>;
