import { z } from "zod";

export const ResetPasswordSchema = z.object({
    verificationCode: z.string().nonempty("Verification code is required"),
    password: z.string().nonempty("Password is required"),
});

export type ResetPasswordPayload = z.infer<typeof ResetPasswordSchema>;
