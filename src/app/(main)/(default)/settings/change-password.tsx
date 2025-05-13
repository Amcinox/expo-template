import { ScrollView } from "react-native";
import React from "react";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { useSettings } from "@/contexts/SettingsContext";
import { SafeAreaView } from "react-native-safe-area-context";
import GoBack from "@/components/screen-header/goBack";
import { useClerk } from "@clerk/clerk-expo";
import { Button, ButtonText } from "@/components/ui/button";
import { useCustomToast } from "@/components/CustomToast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormProvider from "@/components/hook-form/form-provider";
import RHFTextField from "@/components/hook-form/rhf-text-field";

const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ChangePasswordPayload = z.infer<typeof ChangePasswordSchema>;

export default function ChangePasswordScreen() {
    const { theme } = useSettings();
    const { client } = useClerk();
    const { showToast } = useCustomToast();
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<ChangePasswordPayload>({
        resolver: zodResolver(ChangePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const { handleSubmit, reset } = form;

    const handleChangePassword = handleSubmit(async (data: ChangePasswordPayload) => {
        try {
            setIsLoading(true);
            const email = client.activeSessions[0].user.primaryEmailAddress?.emailAddress;

            if (!email) {
                throw new Error("Email address not found");
            }

            await client.signIn.create({
                strategy: "password",
                identifier: email,
                password: data.currentPassword,
            });

            await client.activeSessions[0].user.updatePassword({
                newPassword: data.newPassword,
            });

            showToast({
                type: "success",
                title: "Password Updated",
                message: "Your password has been successfully updated"
            });

            reset();
        } catch (error: any) {
            showToast({
                type: "error",
                title: "Update Failed",
                message: error.message || "Failed to update password. Please try again."
            });
        } finally {
            setIsLoading(false);
        }
    });

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <VStack space="2xl" className="p-4">
                    <Heading size="xl">Change Password</Heading>
                    <Text className="text-typography-400">
                        Update your password to keep your account secure
                    </Text>

                    <FormProvider methods={form}>
                        <VStack space="md">
                            <RHFTextField
                                name="currentPassword"
                                label="Current Password"
                                placeholder="Enter your current password"
                                size="xl"
                                className="rounded-lg"
                                type="password"
                            />

                            <RHFTextField
                                name="newPassword"
                                label="New Password"
                                placeholder="Enter your new password"
                                size="xl"
                                className="rounded-lg"
                                type="password"
                            />

                            <RHFTextField
                                name="confirmPassword"
                                label="Confirm Password"
                                placeholder="Confirm your new password"
                                size="xl"
                                className="rounded-lg"
                                type="password"
                            />

                            <VStack space="xs" className="mt-4">
                                <Text className="text-typography-400 text-sm">
                                    Password Requirements:
                                </Text>
                                <Text className="text-typography-400 text-sm">• At least 8 characters long</Text>
                                <Text className="text-typography-400 text-sm">• At least one uppercase letter</Text>
                                <Text className="text-typography-400 text-sm">• At least one lowercase letter</Text>
                                <Text className="text-typography-400 text-sm">• At least one number</Text>
                                <Text className="text-typography-400 text-sm">• At least one special character</Text>
                            </VStack>
                        </VStack>
                    </FormProvider>

                    <Button
                        onPress={handleChangePassword}
                        disabled={isLoading}
                        className="mt-4"
                    >
                        <ButtonText>
                            {isLoading ? "Updating..." : "Update Password"}
                        </ButtonText>
                    </Button>
                </VStack>
            </ScrollView>
        </SafeAreaView>
    );
} 