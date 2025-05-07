import React from "react";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "@/contexts/SettingsContext";
import CopilotCustomProvider from "@/components/copilot/CopilotCustomProvider";

export default function DefaultLayout() {
    const { theme } = useSettings()
    return (
        <CopilotCustomProvider>
            <SafeAreaView
                edges={["bottom", "right", "left"]}
                style={{
                    flex: 1,
                    backgroundColor: theme.background
                }}
            >
                <Slot />
            </SafeAreaView>
        </CopilotCustomProvider>
    );
}
