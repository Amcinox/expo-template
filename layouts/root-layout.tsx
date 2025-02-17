import { AuthProvider } from "@/contexts/AuthContext";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useSettings } from "@/contexts/SettingsContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import React, { useEffect } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [loaded, error] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        ...FontAwesome.font,
    });
    const { settingsInitilized } = useSettings()

    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded && settingsInitilized) {
            SplashScreen.hideAsync();
        }
    }, [loaded, settingsInitilized]);

    if (!loaded || !settingsInitilized) {
        return null;
    }

    return (
        <GluestackUIProvider mode="light">
            <AuthProvider config={
                {
                    biometric: {
                        enabled: true,
                    },
                    authTimeout: {
                        requireAuthAgain: false,
                        authType: "logout",
                        duration: 10000,
                    }
                }}>
                {children}
            </AuthProvider>
        </GluestackUIProvider>
    );
}
