import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ title: 'Login' }} />
            <Stack.Screen name="forgot-password" options={{ title: 'Forgot Password' }} />
            <Stack.Screen name="confirm-password" options={{ title: 'Confirm Password' }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
        </Stack>
    );
}