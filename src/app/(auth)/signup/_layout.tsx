import { Progress, ProgressFilledTrack } from '@/components/ui/progress';
import { Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable } from '@/components/ui/pressable';
import HelpButton from '@/components/intercom/helpButton';
import { useSettings } from '@/contexts/SettingsContext';

const steps = [
    "terms-and-conditions",
    "register-details",
    "otp-verification",
    "create-account",
    "setup-biometrics",
]
export default function SignupLayout() {
    const { theme } = useSettings()
    return (

        <Stack screenOptions={({ route, navigation }) => {
            return {

                headerStyle: {
                    height: 10,
                    backgroundColor: theme.background,
                },
                headerTintColor: '#FFF',

                headerTitle: () => steps.includes(route.name) ?
                    <Progress
                        value={steps.findIndex((value) => value === route.name) + 1}
                        size="sm"
                        orientation="horizontal"
                        max={steps.length}
                        className='w-2/3'>
                        <ProgressFilledTrack />
                    </Progress> : ""
                ,
                headerRight: () => <HelpButton />,
                headerLeft: () => (
                    <Pressable
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons
                            name="arrow-back-ios"
                            size={24}
                            color="white"
                        />
                    </Pressable>
                )


            }
        }}>
            <Stack.Screen name="index" options={{
                title: 'Main Step',
            }} />

            <Stack.Screen name="terms-and-conditions"
                options={{
                    title: 'Terms & Conditions',
                }} />
            <Stack.Screen name="register-details" options={{ title: 'Register Details' }} />
            <Stack.Screen name="otp-verification" options={{ title: 'OTP Verification' }} />
            <Stack.Screen name="create-account" options={{ title: 'Create Account' }} />
            <Stack.Screen name="setup-biometrics" options={{ title: 'Setup Biometrics' }} />
        </Stack>
    );
}