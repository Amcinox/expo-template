"use client"

import { useEffect, useCallback, useState, useLayoutEffect, useMemo, useRef } from "react"
import { ScrollView, RefreshControl, View, Platform } from "react-native"
import { useSettings } from "@/contexts/SettingsContext"
import { useCustomerStore } from "@/stores/customerStore"

import { useAuth } from "@/contexts/AuthContext"
import { useCopilot } from "react-native-copilot"


export default function HomeScreen() {
    const { theme, walkThrough } = useSettings()
    const [refreshing, setRefreshing] = useState(false)
    const { customer, getCustomer } = useCustomerStore()
    const { user } = useAuth()
    const { start } = useCopilot()
    const [isScreenReady, setIsScreenReady] = useState(false)
    const initialRender = useRef(true)
    const startCopilotTour = useCallback(() => {
        if (!isScreenReady || walkThrough) return;
        if (initialRender.current) {
            initialRender.current = false;
            start();
        }
    }, [isScreenReady, start]);

    useEffect(() => {
        if (customer && isScreenReady) {
            startCopilotTour();
        }
    }, [customer, isScreenReady, startCopilotTour]);



    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        await getCustomer(user?.["custom:user_id"]!)
        setRefreshing(false)
    }, [getCustomer, user])




    const handleScreenLayout = useCallback(() => {
        // TODO: FIX THIS for Android
        if (Platform.OS === "android") {
            return
        }
        setIsScreenReady(true);
    }, []);

    return (
        <ScrollView
            className="flex-1"
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

        </ScrollView>
    )
}