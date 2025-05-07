import { z } from "zod";

export const ForgotPasswordSchema = z.object({
    username: z.string().nonempty("Email is required"),
});

export type ForgotPasswordPayload = z.infer<typeof ForgotPasswordSchema>;
