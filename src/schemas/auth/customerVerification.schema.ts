import { z } from "zod";

export const CustomerVerificationSchema = z.object({
    first_name: z.string().nonempty("First name is required"),
    last_name: z.string().nonempty("Last name is required"),
    mobile_number: z.string().nonempty("Mobile is required"),
});

export type CustomerVerificationPayload = z.infer<typeof CustomerVerificationSchema>;
