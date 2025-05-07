import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { AuthenticationType } from "expo-local-authentication";

interface BiometricIconProps {
    authenticationType: AuthenticationType;
    color?: string;
    size?: number;
}


export default function BiometricIcon({
    authenticationType,
    color = '#000',
    size = 24
}: BiometricIconProps) {
    switch (authenticationType) {
        case AuthenticationType.FINGERPRINT:
            return <Ionicons name="finger-print-outline" size={size} color={color} />;
        case AuthenticationType.FACIAL_RECOGNITION:
            return <MaterialCommunityIcons name="face-recognition" size={size} color={color} />;
        case AuthenticationType.IRIS:
            return <Ionicons name="eye-outline" size={size} color={color} />;
        default:
            return <Ionicons name="lock-closed-outline" size={size} color={color} />;
    }
};
