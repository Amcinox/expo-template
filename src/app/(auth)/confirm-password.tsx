import React, { useState } from "react";

// Hooks 
import { useForm } from "react-hook-form";
import { useLocalSearchParams, useRouter } from "expo-router";

// Components
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Image } from "@/components/ui/image";
import Container from "@/components/Container";
import RHFTextField from "@/components/hook-form/rhf-text-field";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icon";
import { InputSlot, InputIcon } from "@/components/ui/input";
import FormProvider from "@/components/hook-form/form-provider";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";

// Validation
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordPayload, ResetPasswordSchema } from "@/schemas/auth/resetPassword.schema";
import { useSettings } from "@/contexts/SettingsContext";



export default function ConfirmPasswordScreen() {
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const { email } = useLocalSearchParams();
    const { toggleSplashLoading } = useSettings()
    const form = useForm<ResetPasswordPayload>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: "",
            verificationCode: "",
        },
    });


    const { handleSubmit } = form;
    const resetPasswordHandler = handleSubmit(async (data: ResetPasswordPayload) => {
        toggleSplashLoading(true)
        try {
            // reset password
            // await confirmForgotPassword(email as string, data.verificationCode, data.password)

            router.push({
                pathname: "/signin",
            })
        }
        catch (error: any) {
            form.setError("verificationCode", {
                message: error.message,
            });
        } finally {
            toggleSplashLoading(false)
        }
    }
    )


    return (
        <Container>
            <VStack
                space="xl"
                className="flex-1 items-center p-4"
            >
                <Heading
                    size="xl"
                    className="text-typography-800 font-medium">Check your Email</Heading>
                <Image
                    size="xl"
                    alt="email"
                    source={require('@/assets/images/illustrations/emailOpen.png')} />
                <Text>We send a 6 digits verification code to</Text>
                <Text className="font-bold text-typography-800">{email}</Text>

                <FormProvider methods={form}>

                    <RHFTextField
                        name="verificationCode"
                        type="text"
                        placeholder="6 Digit code"
                        size="xl"
                        className='rounded-md w-full'
                    />
                    <RHFTextField
                        name="password"
                        placeholder="New password"
                        type={showPassword ? "text" : "password"}
                        size="xl"
                        className='rounded-md w-full'

                        rightIcon={<InputSlot
                            className="pr-3 text-typography-900" onPress={() => setShowPassword((showState) => !showState)}>
                            <InputIcon
                                className='text-typography-900'
                                color="gray"
                                as={showPassword ? EyeIcon : EyeOffIcon} />
                        </InputSlot>}

                    />
                    <HStack className="justify-center " space="sm">
                        <Text>
                            Not in inbox or spam folder?
                        </Text>
                        <Pressable onPress={() => { }}><Text className="text-primary-500 underline">Resend</Text></Pressable>
                    </HStack>

                    <Button
                        className=' rounded-3xl h-12 w-full '
                        variant="solid"

                        onPress={resetPasswordHandler}
                    >
                        <ButtonText>
                            Reset Password
                        </ButtonText>
                    </Button>
                </FormProvider>
            </VStack>
        </Container>
    );
}
