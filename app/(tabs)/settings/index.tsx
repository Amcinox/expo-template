// app/(tabs)/settings.tsx
import React, { useCallback } from 'react';
import { router } from 'expo-router';
import { useToast } from "@/components/ui/toast";

// Corrected Gluestack UI Imports from "@/components/ui/"
import { VStack } from "@/components/ui/vstack"
import { HStack } from "@/components/ui/hstack"
import { Text } from "@/components/ui/text"
import { Button, ButtonText } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Heading } from "@/components/ui/heading"
import { Center } from "@/components/ui/center"
import { Box } from "@/components/ui/box"
import { useAuth } from '@/auth/AuthContext';

const SettingsScreen = () => {
    const { logout, isBiometricEnabled, enableBiometric, disableBiometric, isLoading, user } = useAuth();
    const toast = useToast();

    const handleLogout = async () => {
        try {
            await logout();
            router.replace("/(auth)/login"); // Redirect to login screen after logout
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    const handleBiometricToggle = useCallback(async (value: boolean) => {
        if (value) {
            try {
                await enableBiometric("Mokamoka++-1");
            } catch (error) {
                console.error("Error enabling biometric:", error);
                toast.show({ /* ... toast code ... */ });
            }
        } else {
            try {
                await disableBiometric();
            } catch (error) {
                console.error("Error disabling biometric:", error);
                toast.show({ /* ... toast code ... */ });
            }
        }
    }, [disableBiometric, enableBiometric, toast]);

    return (
        <Center className="p-4 bg-white">
            <Box className="max-w-96 w-full">
                <Heading size="xl" className="mb-6">
                    Settings
                </Heading>
                <Text>
                    {JSON.stringify(user)}
                </Text>
                <VStack space="xl">
                    <HStack >
                        <Text className="text-lg font-semibold text-gray-700">Enable Biometric Login</Text>
                        <Switch
                            isDisabled={isLoading}
                            value={isBiometricEnabled}
                            onValueChange={handleBiometricToggle}
                        />
                    </HStack>

                    <Button
                        variant="link"
                        onPress={() => router.push("/settings/bank-information")}
                        isDisabled={isLoading}
                        className="rounded-md bg-green-500 hover:bg-green-600 py-2 mt-4"
                    >
                        <ButtonText className="text-white font-semibold">Bank Informations</ButtonText>
                    </Button>

                    <Button
                        variant="link"
                        onPress={() => router.push("/settings/basic-information")}
                        isDisabled={isLoading}
                        className="rounded-md bg-green-500 hover:bg-green-600 py-2 mt-4"
                    >
                        <ButtonText className="text-white font-semibold">Basic Informations</ButtonText>
                    </Button>


                    <Button
                        variant="link"
                        onPress={() => router.push("/settings/biometric")}
                        isDisabled={isLoading}
                        className="rounded-md bg-green-500 hover:bg-green-600 py-2 mt-4"
                    >
                        <ButtonText className="text-white font-semibold">Biometric</ButtonText>
                    </Button>


                    <Button
                        variant="link"
                        onPress={() => router.push("/settings/change-password")}
                        isDisabled={isLoading}
                        className="rounded-md bg-green-500 hover:bg-green-600 py-2 mt-4"
                    >
                        <ButtonText className="text-white font-semibold">Change Password</ButtonText>
                    </Button>

                    <Button
                        variant="link"
                        onPress={() => router.push("/settings/employer-information")}
                        isDisabled={isLoading}
                        className="rounded-md bg-green-500 hover:bg-green-600 py-2 mt-4"
                    >
                        <ButtonText className="text-white font-semibold">Employer Information</ButtonText>
                    </Button>
                </VStack>
            </Box>
        </Center >
    );
};

export default SettingsScreen;