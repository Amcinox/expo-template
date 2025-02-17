import { DeviceType } from "expo-device";
import { AuthenticationType } from "expo-local-authentication";

export interface Permissions {
    location?: boolean;
    camera: boolean;
    notifications: boolean;
    contacts?: boolean;
    microphone: boolean;
    cameraRoll: boolean;
    mediaLibrary: boolean;
    motion?: boolean;

    bluetooth?: boolean;
    speechRecognition?: boolean;
    tracking?: boolean;
    biometric?: {
        isEnrolled: boolean;
        hasHardware: boolean;
        authenticationType: AuthenticationType[];
    }
}

export type DeviceDetails = {

    brand?: string | null // Android: "google", "xiaomi"; iOS: "Apple"; web: null
    designName?: string | null; // Android: "kminilte"; iOS: null; web: null
    deviceName?: string | null; // "Simo's iPhone 16 Pro Max"
    deviceType?: DeviceType | null // UNKNOWN, PHONE, TABLET, TV, DESKTOP
    deviceYearClass?: number | null;
    isDevice?: boolean | null;
    manufacturer?: string | null; // Android: "Google", "xiaomi"; iOS: "Apple"; web: "Google", null
    modelId?: any; // iOS: "iPhone7,2"; Android: null; web: null
    modelName?: string | null; // Android: "Pixel 2"; iOS: "iPhone XS Max"; web: "iPhone", null
    osBuildFingerprint?: string | null; // Android: "google/walleye/walleye:8.1.0/OPM1.171019.011/4448085:user/release-keys"; iOS: null; web: null
    osBuildId?: string | null; // Android: "PSR1.180720.075"; iOS: "16F203"; web: null
    osInternalBuildId?: string | null; // Android: "MMB29K"; iOS: "16F203"; web: null,
    osName?: string | null; // Android: "Android", "iOS"; iOS: "iOS"; web: "Web", null
    osVersion?: string | null; // Android: "4.0.3"; iOS: "18.0.1"; web: "11.0", "8.1.0"
    platformApiLevel?: number | null; // Android: 19; iOS: null; web: null
    productName?: string | null; // Android: "kminiltexx"; iOS: null; web: null
    supportedCpuArchitectures?: string[] | null; // ['arm64 v8', 'Intel x86-64h Haswell', 'arm64-v8a', 'armeabi-v7a", 'armeabi']
    totalMemory?: number | null; // 17179869184

    applicationId?: string | null; // "com.remirage.app", "com.apple.Pages"
    applicationName: string | null; // "Expo", "Remirage", "Instagram"
    nativeApplicationVersion?: string | null; // "2.11.0"
    nativeBuildVersion?: string | null; // Android: "114", iOS: "2.11.0"


    pushNotificationToken?: string | null;




}
export enum Languages {
    EN = "en",
    FR = "fr",
    JA = "ja",
    ES = "es",

}


export interface Theme {
    primary?: string;
    secondary?: string;
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
    text?: string;
    caption?: string;
    background?: string;
    [key: string]: string | undefined;
}