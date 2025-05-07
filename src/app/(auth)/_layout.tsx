import HelpButton from '@/components/intercom/helpButton';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useCustomerStore } from '@/stores/customerStore';
import Intercom from '@intercom/intercom-react-native';
import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthLayout() {
    const { isAuthenticated } = useAuth();
    const { theme } = useSettings()
    const { clearCustomer } = useCustomerStore()



    useEffect(() => {
        const clearAll = async () => {
            if (isAuthenticated) return
            try {
                clearCustomer()
                await Intercom.logout()
                await Intercom.loginUnidentifiedUser()
            } catch (error) {
                console.log(error)
            }
        };
        clearAll()

    }, [isAuthenticated])

    if (isAuthenticated) {
        return <Redirect href="/(main)/(tabs)/home" />;
    }
    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: theme.background

        }}>
            <Stack screenOptions={() => {
                return {
                    headerStyle: {
                        height: 120,
                        backgroundColor: theme.background,
                    },
                    headerTintColor: '#FFF',

                    headerTitle: "",
                    headerBackButtonDisplayMode: "minimal",

                }
            }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ title: 'Login' }} />
                <Stack.Screen name="forgot-password" options={{
                    title: 'Forgot Password',
                    headerRight: () => <HelpButton />,
                }} />
                <Stack.Screen name="confirm-password" options={{
                    title: 'Confirm Password',
                    headerRight: () => <HelpButton />,
                }} />
                <Stack.Screen name="signup" options={{ headerShown: false }} />


            </Stack>
        </SafeAreaView>
    );
}