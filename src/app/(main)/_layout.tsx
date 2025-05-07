
import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomerStore } from "@/stores/customerStore";
import { AppStateGuard, StatusGuard } from "@/guards";
import AppStateLockFallback from "@/guards/fallbacks/AppStateLockFallback";
import MainMiddleware from "@/middlewares/MainMiddleware";
import CopilotCustomProvider from "@/components/copilot/CopilotCustomProvider";

export default function _layout() {

    const { isAuthenticated } = useAuth();
    const { customer, isLoading } = useCustomerStore()

    if (!isAuthenticated) {
        return <Redirect href="/(auth)" />;
    }


    return (
        <MainMiddleware>

            <AppStateGuard
                guardOnStates={["background", "inactive"]}
                backgroundTimeoutSeconds={900}
                terminationTimeoutSeconds={2}

                timeoutSeconds={1}
                fallback={({ onUnlock, onLock, isLocked }) => <AppStateLockFallback
                    onUnlock={onUnlock}
                    onLock={onLock}
                    isLocked={isLocked}
                />}

            >
                <StatusGuard
                    status={
                        isLoading ?
                            "ACTIVE" :
                            customer?.status!
                    }
                    allowedStatuses={["ACTIVE"]} >
                    <Stack screenOptions={{
                        headerShown: false,
                    }}>

                        <Stack.Screen name="(tabs)" />

                        <Stack.Screen name="(default)" />

                    </Stack>
                </StatusGuard>
            </AppStateGuard>

        </MainMiddleware >
    );
}
