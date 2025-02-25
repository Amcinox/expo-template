import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

export default function SettingLaout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false
            }}
            initialRouteName="index"
        >
            <Stack.Screen name="index" options={{ title: 'Settings' }} />
            <Stack.Screen name="bank-information" options={{ title: "Bank Information" }} />
            <Stack.Screen name="basic-information" options={{ title: "Basic Information" }} />
            <Stack.Screen name="change-password" options={{ title: "Change Password" }} />
            <Stack.Screen name="employer-information" options={{ title: "Employer Information" }} />
        </Stack>
    );
}
