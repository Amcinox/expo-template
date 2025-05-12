import { ScrollView } from "react-native";
import React from "react";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { useSettings } from "@/contexts/SettingsContext";
import { SafeAreaView } from "react-native-safe-area-context";
import GoBack from "@/components/screen-header/goBack";

export default function NotificationsScreen() {
    const { theme } = useSettings();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <VStack space="2xl" className="p-4">
                    <Heading size="xl">Notifications</Heading>
                    <Text className="text-typography-400">
                        Manage your notification preferences
                    </Text>
                </VStack>
            </ScrollView>
        </SafeAreaView>
    );
} 