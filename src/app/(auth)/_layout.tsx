import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthLayout() {
    // const { isAuthenticated } = useAuth();
    const { theme } = useSettings()


    const { isSignedIn } = useAuth()

    // if (isSignedIn) {
    //   return <Redirect href={'/'} />
    // }



    if (isSignedIn) {
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
                }} />
                <Stack.Screen name="confirm-password" options={{
                    title: 'Confirm Password',
                }} />
                <Stack.Screen name="signup" />


            </Stack>
        </SafeAreaView>
    );
}