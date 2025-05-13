import React from "react";
import { Stack } from "expo-router";

import GoBack from "@/components/screen-header/goBack";
import { useSettings } from "@/contexts/SettingsContext";

export default function ProfileLayout() {
    const { theme } = useSettings();
    return (
        <Stack
            screenOptions={() => {
                return {
                    headerStyle: {
                        height: 120,
                        backgroundColor: theme.background,
                    },
                    headerTintColor: "#FFF",
                    headerTitleAlign: "center",
                    headerLeft: () => <GoBack />,

                    title: ""
                };
            }}>
                
        </Stack>
    );
}