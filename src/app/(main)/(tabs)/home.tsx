"use client"

import { useEffect, useCallback, useState, useLayoutEffect, useMemo, useRef } from "react"
import { ScrollView, RefreshControl, View, Platform } from "react-native"
import { useSettings } from "@/contexts/SettingsContext"
import { useCustomerStore } from "@/stores/customerStore"
import { Text } from "@/components/ui/text"


export default function HomeScreen() {
    const { theme, walkThrough } = useSettings()
    const [refreshing, setRefreshing] = useState(false)
    const { customer, getCustomer } = useCustomerStore()
    const [isScreenReady, setIsScreenReady] = useState(false)
    const initialRender = useRef(true)





    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        setRefreshing(false)
    }, [getCustomer])




    const handleScreenLayout = useCallback(() => {
        // TODO: FIX THIS for Android
        if (Platform.OS === "android") {
            return
        }
        setIsScreenReady(true);
    }, []);

    return (
        <ScrollView
            className="flex-1 bg-background-50"
            showsVerticalScrollIndicator={false}
            onLayout={handleScreenLayout}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[theme.primary!]}
                    tintColor={theme.primary}
                />
            }
        >
            <Text>Hello</Text>
        </ScrollView>
    )
}