import React, { useState } from 'react';
// Hooks
import { useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';

// Components
import { VStack } from "@/components/ui/vstack"
import { Button, ButtonText } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import FormProvider from '@/components/hook-form/form-provider';
import RHFTextField from '@/components/hook-form/rhf-text-field';
import RHFCheckbox from '@/components/hook-form/rhf-checkbox';
import { HStack } from '@/components/ui/hstack';
import Container from '@/components/Container';
import { EyeIcon, EyeOffIcon } from "@/components/ui/icon"
import { InputIcon, InputSlot } from '@/components/ui/input';
// Validation
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginPayload } from '@/schemas/auth/login.schema';
import BiometricLoginButton from '@/components/auth/BiometricLoginButton';
import { ActivityIndicator } from 'react-native';



export default function LoginScreen() {
    const router = useRouter()
    const { toggleSplashLoading, permissions, theme } = useSettings()
    const [showPassword, setShowPassword] = useState(false)
    const { loginWithPassword, isLoading, isBiometricEnabled, rememberedUsername } = useAuth();

    const form = useForm<LoginPayload>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            username: rememberedUsername || process.env.EXPO_PUBLIC_DEMO_USERNAME,
            password: process.env.EXPO_PUBLIC_DEMO_PASSWORD,
            rememberMe: true,
        },
    });


    const { handleSubmit } = form;

    const login = handleSubmit(async (data: LoginPayload) => {
        try {
            toggleSplashLoading(true)
            const user = await loginWithPassword(data.username, data.password, {
                rememberMe: data.rememberMe!
            });
        } catch (error: any) {
            form.setError("password", {
                message: error.message,
            });
        } finally {
            toggleSplashLoading(false)
        }
    })



    return (
        <Container>
            <VStack className="p-4 flex-1 bg-background-50" space="3xl">
                <Heading size="xl" className="text-center mt-10 text-typography-800 font-medium">
                    Welcome to Remirage
                </Heading>
                <VStack space="md" >
                    <FormProvider methods={form}>
                        <RHFTextField
                            name="username"
                            type="text"
                            placeholder="Email"
                            size="xl"
                            className='rounded-md'
                            testID="username"
                        />
                        <RHFTextField
                            name="password"
                            placeholder="Password"
                            type={showPassword ? "text" : "password"}
                            size="xl"
                            className='rounded-md'
                            testID="password"
                            rightIcon={<InputSlot
                                className="pr-3 text-typography-900" onPress={() => setShowPassword((showState) => !showState)}>
                                <InputIcon
                                    className='text-typography-900'
                                    color="gray"
                                    as={showPassword ? EyeIcon : EyeOffIcon} />
                            </InputSlot>}
                        />
                        <RHFCheckbox name="rememberMe" checkboxLabel='Remember your username' />
                        <HStack className="justify-between">

                            <Button
                                className='rounded-3xl h-12 flex-1'
                                variant="solid"
                                isDisabled={isLoading}
                                testID='login-button'
                                onPress={login}
                            >
                                {isLoading && <ActivityIndicator size="small" color={"#FFF"} />}

                                <ButtonText>
                                    Login
                                </ButtonText>
                            </Button>


                            <BiometricLoginButton />
                        </HStack>
                        <Button
                            variant="link"
                            onPress={() => router.push("/forgot-password")}
                        >
                            <ButtonText className='text-typography-800 underline font-medium'>
                                Forgot your Password?
                            </ButtonText>
                        </Button>
                    </FormProvider>
                </VStack>
            </VStack>
        </Container>
    );
};