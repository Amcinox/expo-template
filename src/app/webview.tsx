import { View } from "react-native";
import React, { useLayoutEffect } from "react";
import WebView from "react-native-webview";
import { static_pages } from "@/api/endpoints";
import { useSettings } from "@/contexts/SettingsContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { ScreenStackHeaderRightView } from "react-native-screens";
import { Text } from "@/components/ui/text";

export default function webview() {
    const { toggleSplashLoading, theme } = useSettings();
    const { uri, title } = useLocalSearchParams<{
        uri: string
        title: string
    }>()
    const { setOptions } = useNavigation()

    useLayoutEffect(() => {
        setOptions({
            title: title,
            headerShown: true,
            headerBackButtonDisplayMode: "minimal",
            headerTintColor: '#FFF',
            headerStyle: {
                backgroundColor: theme.background,
            },

        })
    }, [title, uri])
    return (
        <View className="flex-1">
            <WebView
                source={{ uri }}
                style={{
                    flex: 1,
                }}
                className="min-w-96 w-32"
                mixedContentMode="always"
                scalesPageToFit
                automaticallyAdjustContentInsets={false}
                onLoadStart={() => {
                    toggleSplashLoading(true)
                }}
                onLoadEnd={() => toggleSplashLoading(false)}
                onError={() => toggleSplashLoading(false)}
                incognito={true}
                cacheMode="LOAD_NO_CACHE"
            />
        </View>
    );
}
