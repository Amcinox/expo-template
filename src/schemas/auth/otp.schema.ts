import { z } from "zod";

export const OTPSchema = z.object({
    verificationCode: z.string().length(6, "Verification code must be 6 Digits"),
});

export type OTPPayload = z.infer<typeof OTPSchema>;
