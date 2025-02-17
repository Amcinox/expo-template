import React from 'react';
import { VStack } from "@/components/ui/vstack"
import { Button, ButtonText } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { Center } from "@/components/ui/center"
import { Box } from "@/components/ui/box"
import { useAuth } from '@/contexts/AuthContext';
import FormProvider from '@/components/hook-form/form-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import RHFTextField from '@/components/hook-form/rhf-text-field';
import { LoginSchema, LoginPayload } from '@/schemas/auth/login.schema';




const LoginScreen = () => {
    const { loginWithPassword, isLoading, isBiometricEnabled, loginWithBiometric } = useAuth();
    const form = useForm<LoginPayload>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const { handleSubmit } = form;

    const login = handleSubmit(async (data: LoginPayload) => {
        try {
            await loginWithPassword(data.username, data.password);
        } catch (error: any) {
            form.setError("password", {
                message: error.message,
            });
        }
    })

    const handleBiometricLogin = async () => {
        try {
            await loginWithBiometric();
        } catch (error) {
            console.error("Biometric login failed in LoginScreen:", error);

        }
    };


    return (
        <Center className="p-4 flex-1 bg-white">
            <Box className="max-w-96 w-full">
                <Heading size="xl" className="text-center mb-6">
                    Login
                </Heading>
                <Text size="sm" className="mt-2 text-center text-gray-500">
                    Sign in to continue
                </Text>
                <VStack space="md" className="mt-8">
                    <FormProvider methods={form}>
                        <RHFTextField
                            name="username"
                            label="Username"
                            type="text"
                            placeholder="Enter username"
                        />
                        <RHFTextField
                            name="password"
                            label="Password"
                            placeholder="Enter password"
                            type="password"
                        />
                        <Button
                            isDisabled={isLoading}
                            onPress={login}
                        >
                            <ButtonText>
                                {isLoading ? "Logging In..." : "Login"}
                            </ButtonText>
                        </Button>

                        {isBiometricEnabled && (
                            <Button
                                variant="outline"
                                isDisabled={isLoading}
                                onPress={handleBiometricLogin}
                                className="mt-2"
                            >
                                <ButtonText>
                                    Login with Biometrics
                                </ButtonText>
                            </Button>
                        )}
                    </FormProvider>
                </VStack>
            </Box>
        </Center>
    );
};

export default LoginScreen;