import { useState, useEffect } from "react"
import * as LocalAuthentication from "expo-local-authentication"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { View, ActivityIndicator } from "react-native"
import { Text } from "@/components/ui/text"
import { Button, ButtonText } from "@/components/ui/button"
import Container from "@/components/Container"
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated"
import { Alert, AlertText } from "@/components/ui/alert"
import { useCustomToast } from "@/components/CustomToast"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSettings } from "@/contexts/SettingsContext"
import { useCustomerStore } from "@/stores/customerStore"
import { useAuth } from "@/contexts/AuthContext"

type BiometricType = "face" | "fingerprint" | "iris" | "biometric" | null

export default function SetupBiometricScreen() {
    const router = useRouter()
    const [biometricType, setBiometricType] = useState<BiometricType>(null)
    const [isAvailable, setIsAvailable] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false)
    const { showToast } = useCustomToast()

    const { username, password,
        verificationCode,
        phoneNumber

    } = useLocalSearchParams<{
        username: string
        password: string,
        verificationCode: any,
        phoneNumber: any
    }>()
    const { createCustomer } = useCustomerStore()
    const { toggleSplashLoading, theme } = useSettings()
    const { loginWithPassword } = useAuth()

    const createAccount = async () => {
        try {

            toggleSplashLoading(true)
            await createCustomer({
                username: username,
                password: password,
                verificationCode: verificationCode!,
                phoneNumber: phoneNumber!,
            })
            await loginWithPassword(username, password)
        } catch (error: any) {
            showToast({
                type: "error",
                title: "Error",
                message: error.message,
                duration: 5000,


            })
            router.back()
        } finally {
            toggleSplashLoading(false)
        }
    }
    useEffect(() => {
        checkBiometricAvailability()
    }, [])

    const checkBiometricAvailability = async (): Promise<void> => {
        try {
            setIsLoading(true)
            const isCompatible = await LocalAuthentication.hasHardwareAsync()


            if (isCompatible) {
                setIsAvailable(true)
                const types = await LocalAuthentication.supportedAuthenticationTypesAsync()

                if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                    setBiometricType("face")
                } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                    setBiometricType("fingerprint")
                } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
                    setBiometricType("iris")
                } else {
                    setBiometricType("biometric")
                }
            } else {
                showToast({
                    type: "error",
                    title: "Biometric Authentication Unavailable",
                    message: "Your device doesn't support biometric authentication.",
                })
            }
        } catch (error) {
            console.error("Error checking biometric availability:", error)
            showToast({
                type: "error",
                title: "Error",
                message: "There was an error checking biometric availability. Please try again later.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleBiometricAuth = async (): Promise<void> => {
        try {
            setIsAuthenticating(true)
            const results = await LocalAuthentication.authenticateAsync({
                promptMessage: "Authenticate to set up biometric sign in",
                cancelLabel: "Cancel",
                fallbackLabel: 'Use Password',
            })
            if (results.success) {
                createAccount()

            } else {

                if (results.error === "user_cancel") {
                    showToast({
                        type: "info",
                        title: "Authentication Cancelled",
                        message: "Biometric authentication was cancelled.",
                    })

                } else {
                    showToast({
                        type: "error",
                        title: "Authentication Failed",
                        message: "Biometric authentication failed. Please try again.",
                    })
                }
            }
        } catch (error) {
            console.error("Error during authentication:", error)
            showToast({
                type: "error",
                title: "Error",
                message: "There was an error during authentication. Please try again later.",
            })
        } finally {
            setIsAuthenticating(false)
        }
    }

    const getBiometricIcon = (): JSX.Element => {
        switch (biometricType) {
            case "face":
                return <MaterialCommunityIcons name="face-recognition" size={64} color={theme.background} />
            case "fingerprint":
                return <Ionicons name="finger-print-outline" size={64} color={theme.background} />
            case "iris":
                return <Ionicons name="eye-outline" size={64} color={theme.background} />
            default:
                return <Ionicons name="lock-closed-outline" size={64} color={theme.background} />
        }
    }

    const getBiometricName = (): string => {
        switch (biometricType) {
            case "face":
                return "Face ID"
            case "fingerprint":
                return "Fingerprint"
            case "iris":
                return "Iris Scan"
            default:
                return "Biometric"
        }
    }

    if (isLoading) {
        return (
            <Container>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text className="mt-4 text-gray-600">Checking biometric availability...</Text>
                </View>
            </Container>
        )
    }

    return (
        <Container>
            <Animated.View entering={FadeIn.duration(600)} className="p-6  rounded-2xl  w-full items-center">
                <Animated.View entering={FadeInDown.duration(800).delay(200)} className="mb-6 bg-blue-100 p-5 rounded-full">
                    {getBiometricIcon()}
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(800).delay(400)}>
                    <Text className="text-2xl font-bold mb-4 text-center text-gray-800">
                        Use {getBiometricName()} to Authorize Sign In
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(800).delay(600)}>
                    <Text className="text-base text-gray-600 mb-3 text-center leading-6">
                        Remember, only your biometrics should be enrolled on this device if you set up biometrics.
                    </Text>

                    <Text className="text-sm text-gray-500 mb-6 text-center leading-5">
                        If you enrolled someone else's biometrics, they'll be able to access your account and change some of your
                        settings and limits. Your liability for unauthorized transactions may be affected.
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(800).delay(800)} className="w-full mt-2">
                    {!isAvailable ? (
                        <Alert action="warning" className="mb-4">
                            <AlertText>
                                <Text className="text-amber-800 ml-2 text-sm flex-1">
                                    No biometric data found on this device. Please set up {getBiometricName()} in your device settings
                                    first.
                                </Text>
                            </AlertText>

                        </Alert>

                    ) : null}

                    <Button
                        action="primary"
                        onPress={handleBiometricAuth}
                        disabled={!isAvailable || isAuthenticating}
                        className={`w-full ${!isAvailable ? "opacity-70" : ""}`}
                    >
                        {isAuthenticating ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <ButtonText>Set up {getBiometricName()}</ButtonText>
                        )}
                    </Button>
                </Animated.View>
            </Animated.View>
        </Container>
    )
}

