import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppStateGuardProps, AppStateFallbackProps } from './types';
import deviceAnimation from '@/assets/lottie/lock.json';
import { DefaultFallback } from './fallbacks/DefaultFallback';
import SplashLoading from '@/components/SplashLoading';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';

// Storage keys
const BACKGROUND_TIME_KEY = '@AppStateGuard:backgroundTime';
const IS_LOCKED_KEY = '@AppStateGuard:isLocked';
const LAST_ACTIVE_KEY = '@AppStateGuard:lastActiveTime';
const APP_STATE_KEY = '@AppStateGuard:appState';

export interface EnhancedAppStateGuardProps extends AppStateGuardProps {
    // Time in seconds before locking when app is in background
    backgroundTimeoutSeconds?: number;

    // Time in seconds before locking when app is killed/terminated
    terminationTimeoutSeconds?: number;

    // Whether to apply different timeout for termination vs background
    distinguishTermination?: boolean;

    // Callback when app is detected as terminated and restarted
    onAppTerminated?: () => void;
}

export const AppStateGuard: React.FC<EnhancedAppStateGuardProps> = ({
    children,
    fallback,
    showFallback = true,
    timeoutSeconds = 15,
    backgroundTimeoutSeconds,
    terminationTimeoutSeconds = 5,
    distinguishTermination = true,
    guardOnStates = ['background', 'inactive'],
    onAppTerminated,
}) => {
    const { theme } = useSettings();
    const { logout } = useAuth();
    const [isLocked, setIsLocked] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [wasTerminated, setWasTerminated] = useState(false);
    const appState = useRef(AppState.currentState);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const backgroundedTimeRef = useRef<number | null>(null);

    // Use backgroundTimeoutSeconds if provided, otherwise fall back to timeoutSeconds
    const effectiveBgTimeout = backgroundTimeoutSeconds ?? timeoutSeconds;

    // Save current app state and timestamp when component mounts or app state changes
    const persistAppState = async (state: string) => {
        try {
            const currentTime = Date.now();
            await AsyncStorage.setItem(LAST_ACTIVE_KEY, currentTime.toString());
            await AsyncStorage.setItem(APP_STATE_KEY, state);
        } catch (error) {
            console.error('Error persisting app state:', error);
        }
    };

    // Load persisted state when component mounts
    useEffect(() => {
        const loadPersistedState = async () => {
            try {
                const [
                    storedBackgroundTimeStr,
                    storedIsLockedStr,
                    storedLastActiveTimeStr,
                    storedAppState,
                ] = await Promise.all([
                    AsyncStorage.getItem(BACKGROUND_TIME_KEY),
                    AsyncStorage.getItem(IS_LOCKED_KEY),
                    AsyncStorage.getItem(LAST_ACTIVE_KEY),
                    AsyncStorage.getItem(APP_STATE_KEY),
                ]);

                const storedBackgroundTime = storedBackgroundTimeStr ? parseInt(storedBackgroundTimeStr, 10) : null;
                const storedIsLocked = storedIsLockedStr === 'true';
                const storedLastActiveTime = storedLastActiveTimeStr ? parseInt(storedLastActiveTimeStr, 10) : null;

                // If we have a last active time but the app state wasn't properly closed,
                // we can infer the app was terminated
                const appWasTerminated = storedLastActiveTime &&
                    storedAppState &&
                    guardOnStates.includes(storedAppState);

                if (appWasTerminated) {
                    setWasTerminated(true);
                    const timeoutToUse = distinguishTermination ? terminationTimeoutSeconds : effectiveBgTimeout;

                    // Check if we should lock based on termination timeout
                    if (Date.now() - storedLastActiveTime >= timeoutToUse * 1000) {
                        setIsLocked(true);
                        if (onAppTerminated) onAppTerminated();
                    }
                }
                // Regular background lock check (same as before)
                else if (storedBackgroundTime) {
                    backgroundedTimeRef.current = storedBackgroundTime;

                    if (Date.now() - storedBackgroundTime >= effectiveBgTimeout * 1000 || storedIsLocked) {
                        setIsLocked(true);
                    } else {
                        // Clear the stored background time if we're not locking
                        AsyncStorage.removeItem(BACKGROUND_TIME_KEY);
                        AsyncStorage.removeItem(IS_LOCKED_KEY);
                    }
                }

                // Set initial state in storage for future comparison
                persistAppState(AppState.currentState);
                setIsInitialized(true);
            } catch (error) {
                console.error('Error loading persisted app state:', error);
                setIsInitialized(true);
            }
        };

        loadPersistedState();
    }, [timeoutSeconds, terminationTimeoutSeconds, effectiveBgTimeout, distinguishTermination]);

    const handleLock = async () => {
        console.log("App Locked");
        setIsLocked(true);
        try {
            await AsyncStorage.setItem(IS_LOCKED_KEY, 'true');
        } catch (error) {
            console.error('Error storing lock state:', error);
        }
    };

    const handleUnlock = async () => {
        setIsLocked(false);
        setWasTerminated(false);
        backgroundedTimeRef.current = null;
        try {
            await Promise.all([
                AsyncStorage.removeItem(BACKGROUND_TIME_KEY),
                AsyncStorage.removeItem(IS_LOCKED_KEY),
            ]);
            // Don't remove LAST_ACTIVE_KEY as we still need it to detect future terminations
            persistAppState('active');
        } catch (error) {
            console.error('Error clearing persisted app state:', error);
        }
    };

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
        console.log({ nextAppState, previous: appState.current });

        // App is going to background
        if (guardOnStates.includes(nextAppState) && !guardOnStates.includes(appState.current)) {
            const backgroundTime = Date.now();
            backgroundedTimeRef.current = backgroundTime;

            // Persist the background time and app state
            try {
                await AsyncStorage.setItem(BACKGROUND_TIME_KEY, backgroundTime.toString());
                persistAppState(nextAppState);
            } catch (error) {
                console.error('Error storing background time:', error);
            }

            // Set timeout to lock the app after specified period
            timeoutRef.current = setTimeout(() => {
                handleLock();
            }, effectiveBgTimeout * 1000);
        }

        // App is coming back to foreground
        if (nextAppState === 'active' && guardOnStates.includes(appState.current)) {
            // Clear timeout if app becomes active before timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            // Check if the background time exceeded timeout
            if (
                backgroundedTimeRef.current &&
                Date.now() - backgroundedTimeRef.current >= effectiveBgTimeout * 1000
            ) {
                handleLock();
            } else if (backgroundedTimeRef.current) {
                // If we're coming back before timeout, clear the stored background time
                try {
                    await AsyncStorage.removeItem(BACKGROUND_TIME_KEY);
                } catch (error) {
                    console.error('Error clearing background time:', error);
                }
            }

            // Update the last active time and app state
            persistAppState(nextAppState);
        }

        appState.current = nextAppState;
    };

    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [effectiveBgTimeout]);

    // Show nothing until we've initialized our persisted state
    if (!isInitialized) {
        return <View className='flex-1 bg-background-300' />;
    }

    if (isLocked) {
        if (!showFallback) return null;

        const fallbackProps: AppStateFallbackProps = {
            onLock: handleLock,
            onUnlock: handleUnlock,
            isLocked,
            wasTerminated
        };

        if (fallback) {
            return <>{fallback(fallbackProps)}</>;
        }

        const message = wasTerminated
            ? "Your session has expired because the app was closed. Please log in again."
            : "Your session has expired due to inactivity. Please log in again.";

        return (
            <DefaultFallback
                title="App Locked"
                message={message}
                animation={deviceAnimation}
                buttonHandler={async () => {
                    await logout();
                    await handleUnlock();
                }}
                buttonText="Back to Login"
            />
        );
    }

    return <>{children}</>;
};