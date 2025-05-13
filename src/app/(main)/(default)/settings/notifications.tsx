import { ScrollView, Switch } from "react-native";
import React from "react";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { useSettings } from "@/contexts/SettingsContext";
import { SafeAreaView } from "react-native-safe-area-context";
import GoBack from "@/components/screen-header/goBack";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";

const notificationTypes = [
    {
        id: "push",
        title: "Push Notifications",
        description: "Receive push notifications for important updates"
    },
    {
        id: "email",
        title: "Email Notifications",
        description: "Receive email notifications for account activity"
    },
    {
        id: "marketing",
        title: "Marketing Updates",
        description: "Receive updates about new features and promotions"
    },
    {
        id: "security",
        title: "Security Alerts",
        description: "Get notified about security-related activities"
    }
];

export default function NotificationsScreen() {
    const { theme, permissions, updatePermission } = useSettings();
    const [notificationStates, setNotificationStates] = React.useState({
        push: false,
        email: false,
        marketing: false,
        security: false
    });

    const handleToggle = async (id: string, value: boolean) => {
        setNotificationStates(prev => ({ ...prev, [id]: value }));
        if (id === 'push') {
            await updatePermission('notifications', value);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <VStack space="2xl" className="p-4">
                    <Heading size="xl">Notifications</Heading>
                    <Text className="text-typography-400">
                        Manage your notification preferences
                    </Text>

                    <Box className="bg-background-100 rounded-xl overflow-hidden">
                        {notificationTypes.map((type, index) => (
                            <React.Fragment key={type.id}>
                                <HStack className="px-4 py-3 items-center justify-between">
                                    <VStack space="xs" className="flex-1">
                                        <Text className="text-typography-800 font-medium">
                                            {type.title}
                                        </Text>
                                        <Text className="text-typography-400 text-sm">
                                            {type.description}
                                        </Text>
                                    </VStack>
                                    <Switch
                                        value={notificationStates[type.id as keyof typeof notificationStates]}
                                        onValueChange={(value) => handleToggle(type.id, value)}
                                        trackColor={{ false: '#767577', true: theme.primary }}
                                        thumbColor={notificationStates[type.id as keyof typeof notificationStates] ? '#f4f3f4' : '#f4f3f4'}
                                    />
                                </HStack>
                                {index < notificationTypes.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </Box>
                </VStack>
            </ScrollView>
        </SafeAreaView>
    );
} 