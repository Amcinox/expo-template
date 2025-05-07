import React from "react";
import { Stack } from "expo-router";
import { useSettings } from "@/contexts/SettingsContext";
import GoBack from "@/components/screen-header/goBack";
import HelpButton from "@/components/intercom/helpButton";
import { useTranslation } from "react-i18next";

export default function ProfileLayout() {
    const { theme } = useSettings()
    const { t } = useTranslation()
    return (
        <Stack screenOptions={() => {
            return {

                headerStyle: {
                    height: 120,
                    backgroundColor: theme.background,
                },
                headerTintColor: '#FFF',
                headerLeft: () => <GoBack />,
                headerRight: () => <HelpButton />

            }
        }}>
            <Stack.Screen
                name="change-password"
                options={{ title: t('Change Password'), }} />
            <Stack.Screen name="basic-information" options={{ title: t('Basic Information') }} />
            <Stack.Screen name="terms-and-privacy" options={{ title: t('Terms & Privacy') }} />
        </Stack>
    );
}
