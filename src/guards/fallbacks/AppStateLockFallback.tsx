"use client"

import { useState, useRef, useEffect } from "react"
import { Text, Animated, View } from "react-native"
import { VStack } from "@/components/ui/vstack"
import { HStack } from "@/components/ui/hstack"
import { useSettings } from "@/contexts/SettingsContext"
import type { AppStateFallbackProps } from "../types"
import BiometricLoginButton from "@/components/auth/BiometricLoginButton"
import { Button, ButtonText } from "@/components/ui/button"
import { getBiometricTitle } from "@/utils/auth-helpers"
import { Heading } from "@/components/ui/heading"
import { Ionicons } from "@expo/vector-icons"
import { Box } from "@/components/ui/box"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { useClerk } from "@clerk/clerk-expo"

export default function AppStateLockFallback({ onUnlock, onLock, isLocked }: AppStateFallbackProps) {
    const { permissions, toggleSplashLoading, theme } = useSettings()
    const { signOut } = useClerk()
    const { availableAuthenticators } = permissions?.biometric!
    const biometricTitle = getBiometricTitle(availableAuthenticators[0])
    const [authError, setAuthError] = useState<string | null>(null)

    // Animation for the lock icon
    const pulseAnim = useRef(new Animated.Value(1)).current
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(20)).current

    useEffect(() => {
        // Pulse animation for the biometric button
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.15,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ]),
        ).start()

        // Fade in animation for the entire screen
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start()
    }, [])

    const onBiometricLogin = async () => {
        setAuthError(null)
        try {
            toggleSplashLoading(true)
            onUnlock()
        } catch (e: any) {
            console.log(e)
            setAuthError(e.message || "Authentication failed. Please try again.")
        } finally {
            toggleSplashLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await signOut()
            onUnlock()
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }





    return (
        <LinearGradient colors={[theme.primary!, theme.background!, theme.background!]} style={{ flex: 1 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <SafeAreaView className="flex-1" >
                <Animated.View
                    style={{
                        flex: 1,
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                >

                    <VStack space="xl" className="flex-1 px-6 py-10 items-center justify-center">
                        <Box className="mb-4">
                            <Ionicons name="shield-checkmark" size={40} color={theme.primary} />
                        </Box>

                        <Heading
                            size="2xl"
                            className="text-2xl font-bold mb-12 text-center text-typography-50"

                        >
                            App Locked
                        </Heading>

                        <VStack space="md" className="items-center w-full">
                            <Animated.View
                                style={{
                                    transform: [{ scale: pulseAnim }],
                                    shadowColor: theme.primary,
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 8,
                                    elevation: 5,
                                    marginBottom: 24,
                                }}
                            >
                                <BiometricLoginButton
                                    onPress={onBiometricLogin}
                                    size="xl"
                                    className="h-24 w-24 rounded-full"
                                    style={{
                                        backgroundColor: theme.background || "#ffffff",
                                        borderWidth: 2,
                                        borderColor: theme.primary,
                                    }}
                                />
                            </Animated.View>

                            <Text
                                className="text-center text-lg mb-2 text-typography-200 font-bold"

                            >
                                Use {biometricTitle} to unlock
                            </Text>

                            {authError && (
                                <Animated.View
                                    className="w-full rounded-lg p-3 mt-2 mb-4 bg-error-400"
                                >
                                    <Text className="text-center text-sm text-error-800">{authError}</Text>
                                </Animated.View>
                            )}

                            <VStack space="md" className="w-full mt-8">

                                <Button
                                    variant="outline"
                                    className="w-full mt-3 h-14 rounded-lg"

                                    onPress={handleLogout}
                                >
                                    <HStack space="sm" className="items-center">
                                        <Ionicons name="arrow-back" size={18} color={theme.primary} />
                                        <ButtonText >Back to Login</ButtonText>
                                    </HStack>
                                </Button>
                            </VStack>
                        </VStack>

                    </VStack>
                </Animated.View>
            </SafeAreaView >
        </LinearGradient >
    )
}

