import React, { useState } from 'react';
// Hooks
import { useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useSettings } from '@/contexts/SettingsContext';

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
import { ActivityIndicator, View } from 'react-native';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { Divider } from '@/components/ui/divider';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';

export default function LoginScreen() {
    const router = useRouter()
    const { signIn, setActive, isLoaded } = useSignIn()
    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
    const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: "oauth_apple" });

    const { toggleSplashLoading, permissions, theme } = useSettings()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<LoginPayload>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            username: process.env.EXPO_PUBLIC_DEMO_USERNAME,
            password: process.env.EXPO_PUBLIC_DEMO_PASSWORD,
            rememberMe: true,
        },
    });

    const { handleSubmit } = form;

    const login = handleSubmit(async (data: LoginPayload) => {
        if (!isLoaded) return
        setIsLoading(true)
        toggleSplashLoading(true)
        try {
            const signInAttempt = await signIn.create({
                identifier: data.username,
                password: data.password,
            })

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId })
                router.replace('/')
            } else {
                console.error(JSON.stringify(signInAttempt, null, 2))
            }
        } catch (err) {
            form.setError("password", {
                message: (err as Error).message,
            });
            console.error(JSON.stringify(err, null, 2))
        } finally {
            setIsLoading(false)
            toggleSplashLoading(false)
        }
    })

    const onGooglePress = async () => {
        try {
            const { createdSessionId, setActive } = await startOAuthFlow();
            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId });
                router.replace('/');
            }
        } catch (err) {
            console.error('OAuth error:', err);
        }
    };

    const onApplePress = async () => {
        try {
            const { createdSessionId, setActive } = await startAppleOAuth();
            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId });
                router.replace('/');
            }
        } catch (err) {
            console.error('OAuth error:', err);
        }
    };

    return (
        <Container>
            <VStack className="p-4 flex-1 bg-background-50" space="3xl">
                <Heading size="xl" className="text-center mt-10 text-typography-800 font-medium">
                    Welcome to Remirage
                </Heading>
                <VStack space="md">
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
                                testID='login-button'
                                onPress={login}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color={"#FFF"} />
                                ) : (
                                    <ButtonText>Login</ButtonText>
                                )}
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

                    <View className="flex-row items-center my-4">
                        <Divider className="flex-1" />
                        <Text className="mx-4 text-typography-400">or</Text>
                        <Divider className="flex-1" />
                    </View>

                    <VStack space="md">
                        <Button
                            variant="outline"
                            className='rounded-3xl h-12'
                            onPress={onGooglePress}
                        >
                            <ButtonText>Continue with Google</ButtonText>
                        </Button>
                        <Button
                            variant="outline"
                            className='rounded-3xl h-12'
                            onPress={onApplePress}
                        >
                            <ButtonText>Continue with Apple</ButtonText>
                        </Button>
                    </VStack>

                    <HStack className="justify-center items-center space-x-2">
                        <Text className="text-typography-600">
                            Don't have an account?
                        </Text>
                        <Link href="/signup">
                            <Text className="text-primary-600 font-medium">
                                Sign Up
                            </Text>
                        </Link>
                    </HStack>
                </VStack>
            </VStack>
        </Container>
    );
};