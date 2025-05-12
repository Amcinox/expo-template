import { Text, ScrollView, Pressable } from "react-native";
import React from "react";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { useRouter } from "expo-router";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { useSettings } from "@/contexts/SettingsContext";
import { Center } from "@/components/ui/center";
import { useCustomToast } from "@/components/CustomToast";
import { getBiometricTitle } from "@/utils/auth-helpers";
import { useUser, useClerk } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Box } from "@/components/ui/box";
import * as LocalAuthentication from "expo-local-authentication";

export default function Profile() {
    const router = useRouter();
    const { user } = useUser();
    const { signOut } = useClerk();
    const { appConfig, permissions, theme } = useSettings();
    const { showToast } = useCustomToast();
    const { availableAuthenticators } = permissions?.biometric!;
    const biometricTitle = getBiometricTitle(availableAuthenticators[0]);

    const handleEnableBiometric = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) {
                showToast({
                    type: "error",
                    title: "Biometrics",
                    message: "No biometric hardware found"
                });
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: `Enable ${biometricTitle}`,
                fallbackLabel: "Use passcode"
            });

            if (result.success) {
                showToast({
                    type: "success",
                    title: "Biometrics",
                    message: "Enabled Successfully"
                });
            }
        } catch (error: any) {
            showToast({
                type: "error",
                title: "Biometrics",
                message: error.message
            });
        }
    };

    const menuItems = [
        {
            title: "Account",
            items: [
                {
                    icon: "person-outline",
                    label: "Edit Profile",
                    onPress: () => router.push("/(main)/(default)/settings/edit-profile" as any)
                },
                {
                    icon: "lock-closed-outline",
                    label: "Change Password",
                    onPress: () => router.push("/(main)/(default)/settings/change-password" as any)
                },
                {
                    icon: "finger-print-outline",
                    label: `Use ${biometricTitle}`,
                    onPress: handleEnableBiometric
                }
            ]
        },
        {
            title: "Preferences",
            items: [
                {
                    icon: "notifications-outline",
                    label: "Notifications",
                    onPress: () => router.push("/(main)/(default)/settings/notifications" as any)
                },
                {
                    icon: "language-outline",
                    label: "Language",
                    onPress: () => router.push("/(main)/(default)/settings/language" as any)
                },
                {
                    icon: "moon-outline",
                    label: "Dark Mode",
                    onPress: () => router.push("/(main)/(default)/settings/theme" as any)
                }
            ]
        },
        {
            title: "Support",
            items: [
                {
                    icon: "help-circle-outline",
                    label: "Help Center",
                    onPress: () => router.push("/(main)/(default)/settings/help" as any)
                },
                {
                    icon: "document-text-outline",
                    label: "Terms & Privacy",
                    onPress: () => router.push("/(main)/(default)/settings/terms-and-privacy" as any)
                }
            ]
        }
    ];

    return (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingBottom: 100
            }}
        >
            <VStack space="2xl" className="p-4">
                {/* Profile Header */}
                <Center className="py-8">
                    <Avatar size="2xl" className="mb-4">
                        {user?.imageUrl ? (
                            <AvatarImage source={{ uri: user.imageUrl }} />
                        ) : (
                            <AvatarFallbackText>
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </AvatarFallbackText>
                        )}
                    </Avatar>
                    <Text className="text-typography-600 text-xl font-bold">
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text className="text-typography-400">
                        {user?.primaryEmailAddress?.emailAddress}
                    </Text>
                </Center>

                {/* Menu Sections */}
                {menuItems.map((section, sectionIndex) => (
                    <Box key={section.title} className="bg-background-100 rounded-xl overflow-hidden">
                        <Text className="text-typography-800 px-4 py-2 text-md font-medium">
                            {section.title}
                        </Text>
                        <Divider />
                        {section.items.map((item, itemIndex) => (
                            <React.Fragment key={item.label}>
                                <Pressable
                                    onPress={item.onPress}
                                    className="flex-row items-center px-4 py-3"
                                >
                                    <Ionicons name={item.icon as any} size={24} color={theme.primary} />
                                    <Text className="text-typography-800 ml-3 flex-1">
                                        {item.label}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={20} color={theme.primary} />
                                </Pressable>
                                {itemIndex < section.items.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </Box>
                ))}

                {/* Logout Button */}
                <Button
                    variant="outline"
                    action="negative"
                    className="mt-4"
                    onPress={() => signOut()}
                >
                    <ButtonText className="text-error-500">Log Out</ButtonText>
                </Button>

                {/* App Version */}
                <Center className="py-4">
                    <Text className="text-typography-400">
                        Version {appConfig.currentVersion}
                    </Text>
                </Center>
            </VStack>
        </ScrollView>
    );
}