import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useSettings } from '@/contexts/SettingsContext';
import { useSignUp, useOAuth } from '@clerk/clerk-expo';
import { zodResolver } from '@hookform/resolvers/zod';
import { ActivityIndicator, View } from 'react-native';

// Components
import { VStack } from "@/components/ui/vstack"
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import FormProvider from '@/components/hook-form/form-provider';
import RHFTextField from '@/components/hook-form/rhf-text-field';
import { HStack } from '@/components/ui/hstack';
import Container from '@/components/Container';
import { EyeIcon, EyeOffIcon } from "@/components/ui/icon"
import { InputIcon, InputSlot } from '@/components/ui/input';
import { Link } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Divider } from '@/components/ui/divider';

// Validation
import { z } from 'zod';

const SignUpSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SignUpPayload = z.infer<typeof SignUpSchema>;

export default function SignUpScreen() {
    const router = useRouter();
    const { signUp, setActive, isLoaded } = useSignUp();
    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
    const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: "oauth_apple" });
    const { toggleSplashLoading, theme } = useSettings();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<SignUpPayload>({
        resolver: zodResolver(SignUpSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const { handleSubmit } = form;

    const onSignUp = handleSubmit(async (data: SignUpPayload) => {
        if (!isLoaded) return;
        setIsLoading(true);
        toggleSplashLoading(true);

        try {
            await signUp.create({
                username: data.username,
                emailAddress: data.email,
                password: data.password,
            });

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            router.push('/verify');
        } catch (err) {
            form.setError("email", {
                message: (err as Error).message,
            });
            console.error(JSON.stringify(err, null, 2));
        } finally {
            setIsLoading(false);
            toggleSplashLoading(false);
        }
    });

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
                    Create Account
                </Heading>
                <VStack space="md">
                    <FormProvider methods={form}>
                        <RHFTextField
                            name="username"
                            type="text"
                            placeholder="Username"
                            size="xl"
                            className='rounded-md'
                            testID="username"
                        />
                        <RHFTextField
                            name="email"
                            type="text"
                            placeholder="Email"
                            size="xl"
                            className='rounded-md'
                            testID="email"
                        />
                        <RHFTextField
                            name="password"
                            placeholder="Password"
                            type={showPassword ? "text" : "password"}
                            size="xl"
                            className='rounded-md'
                            testID="password"
                            rightIcon={<InputSlot
                                className="pr-3 text-typography-900"
                                onPress={() => setShowPassword((showState) => !showState)}>
                                <InputIcon
                                    className='text-typography-900'
                                    color="gray"
                                    as={showPassword ? EyeIcon : EyeOffIcon} />
                            </InputSlot>}
                        />
                        <RHFTextField
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            type={showConfirmPassword ? "text" : "password"}
                            size="xl"
                            className='rounded-md'
                            testID="confirmPassword"
                            rightIcon={<InputSlot
                                className="pr-3 text-typography-900"
                                onPress={() => setShowConfirmPassword((showState) => !showState)}>
                                <InputIcon
                                    className='text-typography-900'
                                    color="gray"
                                    as={showConfirmPassword ? EyeIcon : EyeOffIcon} />
                            </InputSlot>}
                        />

                        <Button
                            className='rounded-3xl h-12'
                            variant="solid"
                            action="primary"
                            size="xl"
                            disabled={isLoading}
                            onPress={onSignUp}
                        >
                            {isLoading ? (
                                <ButtonSpinner color="#FFF" />
                            ) : (
                                <ButtonText>
                                    Sign Up
                                </ButtonText>
                            )}
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
                            Already have an account?
                        </Text>
                        <Link href="/signin">
                            <Text className="text-primary-600 font-medium">
                                Sign In
                            </Text>
                        </Link>
                    </HStack>
                </VStack>
            </VStack>
        </Container>
    );
}
