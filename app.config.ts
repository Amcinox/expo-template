import { ExpoConfig, ConfigContext } from '@expo/config';

type Environment = 'dev' | 'stg' | 'prod';

interface EnvironmentConfig {
    bundleId: string;
    packageName: string;
    appName: string;
    buildNumber?: string;
    icon?: string;
    googleServicesFile?: string;
}

const envConfig: Record<Environment, EnvironmentConfig> = {
    dev: {
        bundleId: 'com.remirage.stylemind.dev',
        packageName: 'com.remirage.stylemind.dev',
        appName: 'StyleMind - DEV',
        icon: "./src/assets/images/icon-dev.png",
    },
    stg: {
        bundleId: 'com.remirage.stylemind.stg',
        packageName: 'com.remirage.stylemind.stg',
        appName: 'StyleMind - STG',
        icon: "./src/assets/images/icon-stg.png",
        googleServicesFile: "./google-services.json"
    },
    prod: {
        bundleId: 'com.remirage.stylemind',
        packageName: 'com.remirage.stylemind',
        appName: 'StyleMind',
        icon: "./src/assets/images/icon.png",
    },
};
const generateDateBasedBuildNumber = (): string => {
    const now = new Date();
    const date = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0');

    return date + "01";
};

export default ({ config }: ConfigContext): ExpoConfig => {
    const env = (process?.env?.EXPO_PUBLIC_ENV as Environment) || 'dev';
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
        scheme: "stylemind",
        userInterfaceStyle: "automatic",
        splash: {
            image: "./src/assets/images/splash.png",
            resizeMode: "contain",
            backgroundColor: "#444659"
        },
        ios: {
            ...config.ios,
            bundleIdentifier: bundleId,
            buildNumber: dateBuildNumber || "1",
            supportsTablet: true,
            config: {
                usesNonExemptEncryption: false
            }
        },
        android: {
            ...config.android,
            package: packageName,
            versionCode: dateBuildNumber ? parseInt(dateBuildNumber) : 1,
            adaptiveIcon: {
                foregroundImage: "./src/assets/images/adaptive-icon.png",
                backgroundColor: "#444659"
            }
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./src/assets/images/favicon.png"
        },
        plugins: [
            [
                "expo-build-properties",
                {
                    android: {
                        compileSdkVersion: 35,
                        targetSdkVersion: 35,
                        buildToolsVersion: '35.0.0',
                    },
                    ios: {
                        deploymentTarget: '15.1'
                    }
                }
            ],
            "expo-router",
            "expo-font",
            "expo-secure-store",
            [
                "expo-local-authentication",
                {
                    "faceIDPermission": "Allow $(PRODUCT_NAME) to use Face ID."
                }
            ],

            [
                "expo-media-library",
                {
                    "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
                    "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos.",
                    "isAccessMediaLocationEnabled": true
                }
            ],
            [
                "expo-camera",
                {
                    "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
                    "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone",
                    "recordAudioAndroid": true
                }
            ],
            "expo-localization",
            "expo-web-browser"
            // [
            //     "expo-sensors",
            //     {
            //         "motionPermission": "Allow $(PRODUCT_NAME) to access your device motion"
            //     }
            // ],


            // *** If Camera enabled in Settings, add the following plugin *** //



            // *** if Location enabled in Settings, add the following plugin *** //
            // [
            //     "expo-location",
            //     {
            //         "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location."
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
            // 
        ],
        // newArchEnabled: true,
        experiments: {
            typedRoutes: true,
        },
        newArchEnabled: true,
        extra: {
            eas: {
                projectId: "fad8d239-1f43-4ff9-9567-bc7beca0c6e1",
            },
            runtimeVersion: {
                policy: "appVersion"
            }
        },
        runtimeVersion: {
            policy: "appVersion"
        },
        updates: {
            url: `https://u.expo.dev/fad8d239-1f43-4ff9-9567-bc7beca0c6e1`,
        }
        ,
    };
};