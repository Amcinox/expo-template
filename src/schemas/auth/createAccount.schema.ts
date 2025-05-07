import { z } from "zod";
export const PASSWORD_RULES = [
    {
        test: (password: string) => password.length >= 8,
        description: "Be at least 8 characters long"
    },
    {
        test: (password: string) => /[A-Z]/.test(password),
        description: "Contain at least one uppercase letter"
    },
    {
        test: (password: string) => /[a-z]/.test(password),
        description: "Contain at least one lowercase letter"
    },
    {
        test: (password: string) => /[0-9]/.test(password),
        description: "Contain at least one number"
    },
    {
        test: (password: string) => /[^A-Za-z0-9]/.test(password),
        description: "Contain at least one symbol"
    }
];

export const CreateAccountSchema = z.object({
    username: z
        .string()
        .nonempty("Email is required")
        .email("Please enter a valid email address"),

    password: z
        .string()
        .nonempty("Password is required")
        .refine(
            (password) => password.length >= 8,
            { message: "Password must be at least 8 characters long" }
        )
        .refine(
            (password) => /[A-Z]/.test(password),
            { message: "Password must contain at least one uppercase letter" }
        )
        .refine(
            (password) => /[a-z]/.test(password),
            { message: "Password must contain at least one lowercase letter" }
        )
        .refine(
            (password) => /[0-9]/.test(password),
            { message: "Password must contain at least one number" }
        )
        .refine(
            (password) => /[^A-Za-z0-9]/.test(password),
            { message: "Password must contain at least one symbol" }
        )
});

export type CreateAccountPayload = z.infer<typeof CreateAccountSchema>;