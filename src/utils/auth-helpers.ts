import { IdTokenPayload } from "@/types/auth";
import { AuthenticationType } from "expo-local-authentication";
import { jwtDecode } from "jwt-decode";

export function authorizationHandler(idToken: string) {
    const userPayload = decodeIdToken(idToken);
    if (!userPayload) {
        throw new Error("Invalid token");
    }
    if (["dev", "local"].includes(process.env.EXPO_PUBLIC_ENV!)) {
        return JSON.stringify({
            role: userPayload["custom:role"],
            user_id: userPayload["custom:user_id"],
            groups: userPayload["cognito:groups"],
        })
    }
    return idToken;
}


export const decodeIdToken = (idToken: string): IdTokenPayload | null => {
    try {
        const decodedIdToken = jwtDecode<IdTokenPayload>(idToken);
        return decodedIdToken
    } catch (decodeError) {
        console.error("Error decoding ID Token:", decodeError);
        return null;
    }
};




export function getBiometricTitle(authenticationType: AuthenticationType) {
    switch (authenticationType) {
        case AuthenticationType.FINGERPRINT:
            return "Fingerprint";
        case AuthenticationType.FACIAL_RECOGNITION:
            return "Face ID";
        case AuthenticationType.IRIS:
            return "Iris";
        default:
            return "Not supported";
    }
};