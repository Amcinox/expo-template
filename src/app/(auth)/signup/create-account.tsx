import React, { useState } from 'react';

// Hooks
import { useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';

// Components
import { Button, ButtonText } from '@/components/ui/button';
import Container from '@/components/Container';
import FormProvider from '@/components/hook-form/form-provider';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import RHFTextField from '@/components/hook-form/rhf-text-field';
import { InputIcon, InputSlot } from '@/components/ui/input';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icon';
import { FormControlHelperText } from '@/components/ui/form-control';

// Validation
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateAccountPayload, CreateAccountSchema, PASSWORD_RULES } from '@/schemas/auth/createAccount.schema';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateAccountScreen() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const { permissions, toggleSplashLoading } = useSettings()
    const { loginWithPassword } = useAuth()

    const form = useForm<CreateAccountPayload>({
        resolver: zodResolver(CreateAccountSchema),
        defaultValues: {
            username: process.env.EXPO_PUBLIC_DEMO_USERNAME,
            password: process.env.EXPO_PUBLIC_DEMO_PASSWORD,
        },
    });

    const { handleSubmit, formState: { errors } } = form;

    const createAccount = handleSubmit(async (data: CreateAccountPayload) => {
        try {
            if (permissions.biometric?.hasHardware) {
                return router.push({
                    pathname: "/signup/setup-biometrics",
                    params: {
                        username: data.username,
                        password: data.password,
                    }
                });
            } else {
                await loginWithPassword(data.username, data.password)
            }
        } catch (error: any) {
            form.setError("password", {
                message: error.message,
            });

        } finally {
            toggleSplashLoading(false)
        }
    });

    const togglePasswordVisibility = () => setShowPassword(prev => !prev);

    return (
        <Container>
            <VStack className="p-4 flex-1 bg-background-50" space="3xl">
                <Heading size="xl" className="text-center mt-10 text-typography-600 font-medium">
                    Create Account

                </Heading>

                <FormProvider methods={form}>
                    <VStack space="md">
                        <RHFTextField
                            name="username"
                            type="text"
                            placeholder="Email"
                            size="xl"
                            className="rounded-md"
                        />


                        <RHFTextField
                            name="password"
                            placeholder="Password"
                            type={showPassword ? "text" : "password"}
                            size="xl"
                            className="rounded-md"
                            rightIcon={
                                <InputSlot
                                    className="pr-3 text-typography-900"
                                    onPress={togglePasswordVisibility}
                                >
                                    <InputIcon
                                        className="text-typography-900"
                                        color="gray"
                                        as={showPassword ? EyeIcon : EyeOffIcon}
                                    />
                                </InputSlot>
                            }
                            helperText={
                                <VStack space="xs" className="p-2">
                                    <FormControlHelperText className="font-semibold">
                                        Password must:
                                    </FormControlHelperText>
                                    {PASSWORD_RULES.map((rule, index) => (
                                        <FormControlHelperText key={index} className='items-center '>
                                            * {rule.description}
                                        </FormControlHelperText>
                                    ))}
                                </VStack>
                            }
                        />



                        <Button
                            className="rounded-3xl h-12 w-full mt-4"
                            variant="solid"
                            onPress={createAccount}
                        >
                            <ButtonText>Sign up</ButtonText>
                        </Button>
                    </VStack>
                </FormProvider>
            </VStack>
        </Container>
    );
}
