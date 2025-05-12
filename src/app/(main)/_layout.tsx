
import React from "react";
import { Redirect, Stack } from "expo-router";
import { useCustomerStore } from "@/stores/customerStore";
import { AppStateGuard, StatusGuard } from "@/guards";
import AppStateLockFallback from "@/guards/fallbacks/AppStateLockFallback";
import { useClerk } from "@clerk/clerk-expo";

export default function _layout() {

    const { isSignedIn } = useClerk()
    const { customer, isLoading } = useCustomerStore()

    if (!isSignedIn) {
        return <Redirect href="/(auth)" />;
    }


    return (
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
            <Stack screenOptions={{
                headerShown: false,
            }}>

                {/* <Stack.Screen name="(tabs)" /> */}


            </Stack>

        </AppStateGuard>

    );
}
