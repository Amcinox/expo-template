import { ExpoConfig, ConfigContext } from '@expo/config';

type Environment = 'dev' | 'stg' | 'prod';

interface EnvironmentConfig {
    bundleId: string;
    packageName: string;
    appName: string;
    buildNumber?: string;
    icon?: string;
}

const envConfig: Record<Environment, EnvironmentConfig> = {
    dev: {
        bundleId: 'com.remirage.dev',
        packageName: 'com.remiragedev',
        appName: 'Remirage - DEV',
        icon: "./src/assets/images/icon.png",
    },
    stg: {
        bundleId: 'com.remirage.stg',
        packageName: 'com.remiragestg',
        appName: 'Remirage - STG',
        icon: "./src/assets/images/icon.png",
    },
    prod: {
        bundleId: 'com.remirage',
        packageName: 'com.remirage',
        appName: 'Remirage',
        icon: "./src/assets/images/icon.png",
    },
};
const generateDateBasedBuildNumber = (): string => {
    const now = new Date();
    const date = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0');

    return date + "03";



};

export default ({ config }: ConfigContext): ExpoConfig => {
    const env = (process.env.EXPO_PUBLIC_ENV as Environment) || 'dev';
    const { bundleId, packageName, appName, icon } = envConfig[env];
    const dateBuildNumber = generateDateBasedBuildNumber();

    return {
        ...config,
        owner: 'remirage',
        name: appName,
        slug: "remirage",
        version: "1.0.0",
        orientation: "portrait",
        icon: icon || "./src/assets/images/icon.png",
        scheme: "myapp",
        userInterfaceStyle: "automatic",
        splash: {
            image: "./src/assets/images/splash.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        ios: {
            ...config.ios,
            bundleIdentifier: bundleId,
            buildNumber: dateBuildNumber || "1",
            supportsTablet: true
        },
        android: {
            ...config.android,
            package: packageName,
            versionCode: dateBuildNumber ? parseInt(dateBuildNumber) : 1,
            adaptiveIcon: {
                foregroundImage: "./src/assets/images/adaptive-icon.png",
                backgroundColor: "#ffffff"
            }
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./src/assets/images/favicon.png"
        },
        plugins: [
            "expo-router",
            "expo-font",
            "expo-secure-store",
            [
                "expo-local-authentication",
                {
                    "faceIDPermission": "Allow $(PRODUCT_NAME) to use Face ID."
                }
            ],
            "expo-localization",


            // *** If Camera enabled in Settings, add the following plugin *** //
            // [
            //     "expo-camera",
            //     {
            //         "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
            //         "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone",
            //         "recordAudioAndroid": true
            //     }
            // ]


            // *** if Location enabled in Settings, add the following plugin *** //
            // [
            //     "expo-location",
            //     {
            //         "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location."
            //     }
            // ]


            // *** if mediaLibrary enabled in Settings, add the following plugin *** //
            // [
            //     "expo-media-library",
            //     {
            //         "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
            //         "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos.",
            //         "isAccessMediaLocationEnabled": true
            //     }
            // ]


            // *** if Audio/Microphone enabled in Settings, add the following plugin *** //
            // [
            //     "expo-audio",
            //     {
            //         "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
            //     }
            // ]

            // *** if Contact enabled in Settings, add the following plugin *** //
            // [
            //     "expo-contacts",
            //     {
            //         "contactsPermission": "Allow $(PRODUCT_NAME) to access your contacts."
            //     }
            // ]
        ],
        newArchEnabled: true,
        experiments: {
            typedRoutes: true,
        },
        extra: {
            eas: {
                projectId: "fad8d239-1f43-4ff9-9567-bc7beca0c6e1",
            },
            APP_ENV: process.env.APP_ENV,
            API_URL: process.env.API_URL,
        },
    };
};