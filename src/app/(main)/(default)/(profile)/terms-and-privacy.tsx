import { View, Text, ScrollView } from "react-native";
import React from "react";
import { Menu, MenuItem, MenuItemType } from "@/components/navigation/MenuButton";
import { useRouter } from "expo-router";
import { static_pages } from "@/api/endpoints";

export default function TermsAndPrivacyScreen() {
    const router = useRouter()
    const menuItems: MenuItem[] = [
        {
            id: 'links',
            type: MenuItemType.GROUP,
            label: '',
            children: [
                {
                    id: 'terms-of-use',
                    type: MenuItemType.ACTION,
                    label: 'Terms of Use',
                    onPress: () => router.push({
                        pathname: "/webview",
                        params: {
                            uri: static_pages.terms_and_conditions,
                            title: "Terms of Use"
                        }
                    })
                },
                {
                    id: 'privact-policy',
                    type: MenuItemType.ACTION,
                    label: 'Privacy Policy',
                    onPress: () => router.push({
                        pathname: "/webview",
                        params: {
                            uri: static_pages.privacy_policy,
                            title: "Privacy Policy"
                        }
                    })
                }
            ]
        },





    ];


    return (
        <ScrollView className="flex-1 p-4">
            <Menu items={menuItems} />
        </ScrollView>
    );
}
