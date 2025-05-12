import { Text, ScrollView } from "react-native";
import React from "react";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { useRouter } from "expo-router";
import _ from "lodash";
import { useCustomerStore } from "@/stores/customerStore";
import { Avatar, AvatarFallbackText, AvatarBadge } from "@/components/ui/avatar";
import { useSettings } from "@/contexts/SettingsContext";
import { Menu, MenuItem, MenuItemType } from "@/components/navigation/MenuButton";
import { Center } from "@/components/ui/center";
import { useCustomToast } from "@/components/CustomToast";
import { getBiometricTitle } from "@/utils/auth-helpers";
import useAllTrue from "@/hooks/useAllTrue";



export default function Profile() {
    const router = useRouter();
    const { customer } = useCustomerStore();
    const { appConfig, permissions } = useSettings()
    const { logout, enableBiometric, disableBiometric, isBiometricEnabled, biometricOwner, user } = useAuth()
    const { showToast } = useCustomToast()
    const { availableAuthenticators } = permissions?.biometric!
    const biometricTitle = getBiometricTitle(availableAuthenticators[0])
    const isEnabled = useAllTrue(isBiometricEnabled, biometricOwner === user?.email)


    const handleEnableBiometric = async () => {
        try {
            await enableBiometric()
            showToast({
                type: "success",
                title: "Biometrics",
                message: "Enabled Successfully "
            })

        } catch (error: any) {
            showToast({
                type: "error",
                title: "Biometrics",
                message: error.message
            })
        }

    }

    const menuItems: MenuItem[] = [
        {
            id: 'account',
            type: MenuItemType.GROUP,
            label: 'Account',
            children: [
                {
                    id: 'change-password',
                    type: MenuItemType.ACTION,
                    label: 'Change Password',
                    onPress: () => router.push("/change-password")
                },
                {
                    id: 'logout',
                    type: MenuItemType.ACTION,
                    label: 'Log Out',
                    showIcon: false,
                    testID: 'logout-button',
                    onPress: async () => {
                        await logout()
                    }
                }
            ]
        },
        {
            id: 'profile',
            type: MenuItemType.GROUP,
            label: 'Profile Information',
            children: [
                {
                    id: 'basic-info',
                    type: MenuItemType.ACTION,
                    label: 'Basic Information',
                    onPress: () => router.push("/basic-information")
                },
                {
                    id: 'close-account',
                    type: MenuItemType.ACTION,
                    label: 'Close Account',
                    showIcon: false,
                    className: "text-error-500",
                    onPress: () => {
                        console.log('Closing account');
                    }
                },
            ]
        },

        {
            id: 'settings',
            type: MenuItemType.GROUP,
            label: 'Settings',
            children: [
                {

                    id: 'face-id',
                    type: MenuItemType.TOGGLE,
                    label: `Use ${biometricTitle}`,
                    defaultValue: isBiometricEnabled && biometricOwner === user?.email,
                    onToggle: async (value) => {
                        console.log(`Face ID setting: ${value}`);
                        if (isBiometricEnabled && biometricOwner === user?.email) {
                            disableBiometric()
                        } else {
                            await handleEnableBiometric()
                        }
                    }
                },
                {
                    id: 'terms-privacy',
                    type: MenuItemType.ACTION,
                    label: 'Terms & Privacy',
                    showIcon: false,
                    primary: true,
                    className: "text-primary-500",
                    onPress: () => router.push("/terms-and-privacy")
                }
            ]
        },

    ];

    return (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false} testID="profile-screen">
            <VStack space="2xl">
                <HStack className="items-center" space="md">
                    <Avatar size="lg" className="bg-background-600">
                        <AvatarFallbackText>{customer?.firstName} {customer?.lastName}</AvatarFallbackText>
                        <AvatarBadge />
                    </Avatar>
                    <VStack>
                        <Text className="text-typography-600 font-bold">
                            {_.startCase(customer?.firstName)}
                        </Text>
                        <Text className="text-typography-600 font-bold">
                            {_.startCase(customer?.lastName)}
                        </Text>
                    </VStack>
                </HStack>
                <Menu items={menuItems} />
            </VStack>
            <Center className="pb-44" >
                <Text className="text-typography-600">App version {appConfig.currentVersion}
                </Text>
            </Center>
        </ScrollView>
    );
}