// LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/toast";
import * as LocalAuthentication from 'expo-local-authentication';

import { VStack } from "@/components/ui/vstack"
import { FormControl, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control"
import { Input } from "@/components/ui/input"
import { InputField } from "@/components/ui/input"
import { Button, ButtonText } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { Center } from "@/components/ui/center"
import { Box } from "@/components/ui/box"
import { useAuth } from '@/auth/AuthContext';


const LoginScreen = () => {
    const { loginWithPassword, isLoading, isBiometricEnabled, loginWithBiometric } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const toast = useToast();
    const [biometricAvailable, setBiometricAvailable] = useState(false);

    useEffect(() => {
        const checkBiometricAvailability = async () => {
            const available = await LocalAuthentication.hasHardwareAsync();
            setBiometricAvailable(available);
        };
        checkBiometricAvailability();
    }, []);


    const handleSubmit = async () => {
        try {
            await loginWithPassword(username, password);
        } catch (error: any) {
            console.log({ error });
            setPassword('');
        }
    };

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
                    <FormControl>
                        <FormControlLabel>
                            <FormControlLabelText className="text-gray-700">Username</FormControlLabelText>
                        </FormControlLabel>
                        <Input>
                            <InputField
                                type="text"
                                placeholder="Enter username"
                                value={username}
                                onChangeText={setUsername}
                            />
                        </Input>
                    </FormControl>
                    <FormControl>
                        <FormControlLabel>
                            <FormControlLabelText className="text-gray-700">Password</FormControlLabelText>
                        </FormControlLabel>
                        <Input>
                            <InputField
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChangeText={setPassword}
                                onSubmitEditing={handleSubmit} // Submit on Enter key
                            />
                        </Input>
                    </FormControl>

                    <Button
                        isDisabled={isLoading}
                        onPress={handleSubmit}
                    >
                        <ButtonText>
                            {isLoading ? "Logging In..." : "Login"}
                        </ButtonText>
                    </Button>

                    {isBiometricEnabled && biometricAvailable && (
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
                </VStack>
            </Box>
        </Center>
    );
};

export default LoginScreen;