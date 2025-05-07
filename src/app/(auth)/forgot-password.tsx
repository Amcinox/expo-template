import React from "react";

// Hooks
import { useForm } from "react-hook-form";
import { useRouter } from "expo-router";

// Components
import Container from "@/components/Container";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import FormProvider from "@/components/hook-form/form-provider";
import RHFTextField from "@/components/hook-form/rhf-text-field";
import { Button, ButtonText } from "@/components/ui/button";

// Validation
import { ForgotPasswordPayload, ForgotPasswordSchema } from "@/schemas/auth/forgotPassword.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";

export default function ForgotPasswordScreen() {
    const router = useRouter()
    const { forgotPassword } = useAuth()
    const { toggleSplashLoading } = useSettings()

    const form = useForm<ForgotPasswordPayload>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            username: "",
        },
    });


    const { handleSubmit } = form;
    const forgotPasswordHandler = handleSubmit(async (data: ForgotPasswordPayload) => {
        toggleSplashLoading(true)
        try {

            await forgotPassword(data.username)

            router.push({
                pathname: "/confirm-password",
                params: {
                    email: data.username
                }
            })


        } catch (error: any) {
            form.setError("username", {
                message: error.message,
            });
        } finally {
            toggleSplashLoading(false)
        }
    })


    return (
        <Container>
            <VStack className="flex-1 items-center p-4 " space="xl">
                <Heading
                    size="md"
                    className="text-typography-800">Forgot Password</Heading>
                <Text>Enter your email to recover your password</Text>
                <FormProvider methods={form}>
                    <RHFTextField
                        size="xl"
                        className="w-full rounded-md "
                        name="username"
                        placeholder="Enter address"
                    />
                    <Text>
                        We will send you a verification code to reset your password
                    </Text>
                    <Button
                        className=' rounded-3xl h-12 w-full '
                        variant="solid"

                        onPress={forgotPasswordHandler}
                    >
                        <ButtonText>
                            Email me the code
                        </ButtonText>
                    </Button>


                </FormProvider>
            </VStack>
        </Container >
    );
}
