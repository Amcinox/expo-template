import React from "react";
import { Button } from "../ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import BiometricIcon from "./BiometricIcon";
import { useCustomToast } from "../CustomToast";

interface BiometricLoginButtonProps extends React.ComponentProps<typeof Button> {
}
export default function BiometricLoginButton(props: BiometricLoginButtonProps) {
    const { permissions, theme } = useSettings()
    const { showToast } = useCustomToast()

    const handleBiometricLogin = async () => {
        try {
        } catch (error: any) {
            showToast({
                title: error.message,
                type: "error",
                message: "Please try again or use your password to login.",
                duration: 5000
            })
        }
    };
    return (
        <Button
            className="rounded-full h-full ml-3 flex items-center justify-center"
            variant="outline"
            action="primary"
            onPress={handleBiometricLogin}
            testID="biometric-login"
            {...props}
        >

            <BiometricIcon
                authenticationType={permissions.biometric?.availableAuthenticators[0]!}
                color={theme.primary} />

        </Button>
    );
}
