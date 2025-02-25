import { Stack } from 'expo-router';

export default function SignupLayout() {
    return (
        <Stack>
            <Stack.Screen name="step1" options={{ title: 'First Step' }} />
            <Stack.Screen name="srep2" options={{ title: 'Second Step' }} />
        </Stack>
    );
}