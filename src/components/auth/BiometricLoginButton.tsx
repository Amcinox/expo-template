import React from 'react';
import { Button, ButtonText } from '@/components/ui/button';
import { useCustomToast } from '@/components/CustomToast';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from "@/contexts/SettingsContext";

export default function BiometricLoginButton() {
    const { showToast } = useCustomToast();
    const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();
    const { theme } = useSettings();

    const handleBiometricLogin = async () => {
        if (!isLoaded || !signIn || !setActive) return;

        try {
            // Check if biometric is enabled
            const biometricEnabled = await SecureStore.getItemAsync('biometricEnabled');
            if (biometricEnabled !== 'true') {
                showToast({
                    type: "error",
                    title: "Biometrics",
                    message: "Biometric login is not enabled"
                });
                return;
            }

            // Check if device has biometric hardware
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) {
                showToast({
                    type: "error",
                    title: "Biometrics",
                    message: "No biometric hardware found"
                });
                return;
            }

            // Authenticate user
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: "Login with biometrics",
                fallbackLabel: "Use passcode"
            });

            if (result.success) {
                // Get stored credentials
                const storedCredentials = await SecureStore.getItemAsync('userCredentials');
                if (!storedCredentials) {
                    showToast({
                        type: "error",
                        title: "Biometrics",
                        message: "No stored credentials found"
                    });
                    return;
                }

                const { email, token } = JSON.parse(storedCredentials);

                // Sign in with stored credentials
                const signInAttempt = await signIn.create({
                    identifier: email,
                    password: token, // You might want to use a different authentication method
                });

                if (signInAttempt.status === 'complete') {
                    await setActive({ session: signInAttempt.createdSessionId });
                    router.replace('/');
                }
            }
        } catch (error: any) {
            showToast({
                type: "error",
                title: "Biometrics",
                message: error.message
            });
        }
    };

    return (
        <Button
            variant="outline"
            className="rounded-3xl h-12 w-12"
            onPress={handleBiometricLogin}
        >
            <Ionicons name="finger-print-outline" size={24} color={theme.primary} />
        </Button>
    );
}
