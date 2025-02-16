import { z } from "zod";

export const exampleFormSchema = z.object({
    name: z.string().min(2, {
        message: "example must be at least 2 characters.",
    }),
    terms: z.boolean().refine((value) => value === true, {
        message: "You must agree to the terms and conditions"
    }),
    language: z.enum(["en", "es"]),
    country: z.enum(["MA", "JP", "US"]),
    motivation: z.number().min(1).max(100),
    notification: z.boolean()
})

export type ExamplePayload = z.infer<typeof exampleFormSchema>;
