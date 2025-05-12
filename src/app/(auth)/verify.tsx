import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useSettings } from '@/contexts/SettingsContext';
import { useSignUp } from '@clerk/clerk-expo';
import { zodResolver } from '@hookform/resolvers/zod';
import { ActivityIndicator } from 'react-native';

// Components
import { VStack } from "@/components/ui/vstack"
import { Button, ButtonText } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import FormProvider from '@/components/hook-form/form-provider';
import RHFTextField from '@/components/hook-form/rhf-text-field';
import Container from '@/components/Container';

// Validation
import { z } from 'zod';

const VerifySchema = z.object({
    code: z.string().min(6, 'Verification code must be 6 characters'),
});

type VerifyPayload = z.infer<typeof VerifySchema>;

export default function VerifyScreen() {
    const router = useRouter();
    const { signUp, setActive, isLoaded } = useSignUp();
    const { toggleSplashLoading } = useSettings();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<VerifyPayload>({
        resolver: zodResolver(VerifySchema),
        defaultValues: {
            code: '',
        },
    });

    const { handleSubmit } = form;

    const onVerify = handleSubmit(async (data: VerifyPayload) => {
        if (!isLoaded) return;
        setIsLoading(true);
        toggleSplashLoading(true);

        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code: data.code,
            });

            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId });
                router.replace('/(main)/(tabs)/home');
            } else {
                console.error(JSON.stringify(signUpAttempt, null, 2));
            }
        } catch (err) {
            form.setError("code", {
                message: (err as Error).message,
            });
            console.error(JSON.stringify(err, null, 2));
        } finally {
            setIsLoading(false);
            toggleSplashLoading(false);
        }
    });

    return (
        <Container>
            <VStack className="p-4 flex-1 bg-background-50" space="3xl">
                <Heading size="xl" className="text-center mt-10 text-typography-800 font-medium">
                    Verify Your Email
                </Heading>
                <VStack space="md">
                    <FormProvider methods={form}>
                        <RHFTextField
                            name="code"
                            type="text"
                            placeholder="Enter verification code"
                            size="xl"
                            className='rounded-md'
                            testID="verification-code"
                        />

                        <Button
                            className='rounded-3xl h-12'
                            variant="solid"
                            action="primary"
                            size="xl"
                            disabled={isLoading}
                            onPress={onVerify}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <ButtonText>
                                    Verify Email
                                </ButtonText>
                            )}
                        </Button>

                        <Button
                            variant="link"
                            action="primary"
                            onPress={() => router.back()}
                        >
                            <ButtonText className="text-typography-600">
                                Back to Sign Up
                            </ButtonText>
                        </Button>
                    </FormProvider>
                </VStack>
            </VStack>
        </Container>
    );
}
