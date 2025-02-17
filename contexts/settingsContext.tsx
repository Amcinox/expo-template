import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { getMultiFromAsyncStorage, saveItem } from '@/utils/AsyncStorage';
import { useTranslation } from 'react-i18next';
import { ColorSchemeName, Platform } from 'react-native';
import { NetworkState, useNetworkState } from 'expo-network';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { AuthenticationType, hasHardwareAsync, supportedAuthenticationTypesAsync } from 'expo-local-authentication';
import { DeviceDetails, Languages, Theme, Permissions } from '@/types/settings';






export interface SettingsState {
    settingsInitilized: boolean;
    settingsError: null | string;
    walkThrough: boolean;
    language: Languages;
    theme: Theme;
    notification: boolean;
    colorSchemeName: ColorSchemeName;
    permissions: Permissions
    device: DeviceDetails | null;
    networkState: NetworkState | null
}




enum InitialState {
    colorSchemeName = "colorSchemeName",
    language = "language",
    walkThrough = "walkThrough",
    notification = "notification",
    theme = "theme",
}

const initialState: SettingsState = {
    settingsInitilized: false,
    settingsError: null,
    [InitialState.language]: Languages.EN,
    [InitialState.colorSchemeName]: "dark",
    [InitialState.walkThrough]: false,
    [InitialState.notification]: false,
    [InitialState.theme]: {},
    permissions: {
        location: false,
        camera: false,
        notifications: false,
        microphone: false,
        mediaLibrary: false,
        cameraRoll: false,
        biometric: {
            isEnrolled: false,
            hasHardware: false,
            authenticationType: []
        }
    },
    device: null,
    networkState: null,

};


enum SettingsActionType {
    INITIALIZED = "INITIALIZED",
    UPDATE_PERMISSION = "UPDATE_PERMISSION",
    UPDATE_COLOR_SCHEME = "UPDATE_COLOR_SCHEME",
    UPDATE_LANGUAGE = "UPDATE_LANGUAGE",
    UPDATE_WALKTHROUGH = "UPDATE_WALKTHROUGH",
    UPDATE_NOTIFICATION = "UPDATE_NOTIFICATION",
    UPDATE_THEME = "UPDATE_THEME",
    UPDATE_DEVICE_INFO = "UPDATE_DEVICE_INFO",
    UPDATE_NETWORK_STATE = "UPDATE_NETWORK_STATE",
    UPDATE_INITIAL_PERMISSIONS = "UPDATE_INITIAL_PERMISSIONS",
    UPDATE_BIOMETRIC_PERMISSION = "UPDATE_BIOMETRIC_PERMISSION",
}

type SettingsAction =
    | { type: SettingsActionType.INITIALIZED; payload: any }
    | { type: SettingsActionType.UPDATE_PERMISSION; payload: { permission: keyof Permissions; value: boolean } }
    | { type: SettingsActionType.UPDATE_COLOR_SCHEME; payload: { colorSchemeName: ColorSchemeName } }
    | { type: SettingsActionType.UPDATE_LANGUAGE; payload: { language: Languages } }
    | { type: SettingsActionType.UPDATE_NOTIFICATION; payload: { notification: boolean } }
    | { type: SettingsActionType.UPDATE_WALKTHROUGH; payload: { walkThrough: boolean } }
    | { type: SettingsActionType.UPDATE_THEME; payload: { theme: Theme } }
    | { type: SettingsActionType.UPDATE_DEVICE_INFO; payload: { device: DeviceDetails | null } }
    | { type: SettingsActionType.UPDATE_INITIAL_PERMISSIONS; payload: { permissions: Permissions } }
    | { type: SettingsActionType.UPDATE_NETWORK_STATE; payload: { networkState: NetworkState } }
    | { type: SettingsActionType.UPDATE_BIOMETRIC_PERMISSION; payload: { hasHardware: boolean; availableAuthenticators: AuthenticationType[]; isEnrolled: boolean } };


const handlers: Record<string, (state: SettingsState, action: SettingsAction) => SettingsState> = {
    // set language & theme  & notification from storage if available on app start up
    INITIALIZED: (state, action) => {
        return {
            ...state,
            ...action.payload,
            settingsInitilized: true, // Ensure settingsInitilized is set to true after initialization
        }
    },
    // Update Permissions if user grants or denies permissions
    UPDATE_PERMISSION: (state, action) => ({
        ...state,
        permissions: {
            ...state.permissions,
            [action.payload.permission]: action.payload.value,
        }
    }),

    // Update Color Scheme
    UPDATE_COLOR_SCHEME: (state, action) => {
        return {
            ...state,
            colorSchemeName: action.payload.colorSchemeName
        }
    },

    UPDATE_THEME: (state, action) => {
        return {
            ...state,
            theme: action.payload.theme
        }
    },

    // Update Language
    UPDATE_LANGUAGE: (state, action) => {
        return {
            ...state,
            language: action.payload.language
        }
    },

    // Update WalkThrough
    UPDATE_WALKTHROUGH: (state, action) => {
        return {
            ...state,
            walkThrough: action.payload.walkThrough
        }
    },
    // Update Notification
    UPDATE_NOTIFICATION: (state, action) => {
        return {
            ...state,
            notification: action.payload.notification
        }
    },
    // Update Device Info
    UPDATE_DEVICE_INFO: (state, action) => {
        return {
            ...state,
            device: action.payload.device
        }
    },

    // Update Network State
    UPDATE_NETWORK_STATE: (state, action) => {
        return {
            ...state,
            networkState: action.payload.networkState
        }
    },
    //Update Initial Permissions
    UPDATE_INITIAL_PERMISSIONS: (state, action) => {
        return {
            ...state,
            permissions: {
                ...state.permissions,
                ...action.payload.permissions,
            }
        }
    },

    UPDATE_BIOMETRIC_PERMISSION: (state, action) => ({
        ...state,
        permissions: {
            ...state.permissions,
            biometric: {
                ...state.permissions.biometric,
                ...action.payload,
            },
        },
    }),


};

const reducer = (state: SettingsState, action: SettingsAction) =>
    handlers[action.type] ? handlers[action.type](state, action) : state;




interface SettingsContextProps extends SettingsState {
    updatePermission: (permission: keyof Permissions, value: boolean) => Promise<void>;
    updateColorScheme: (colorSchemeName: ColorSchemeName) => Promise<void>;
    updateLanguage: (language: Languages) => Promise<void>;
    updateWalkThrough: (walkThrough: boolean) => Promise<void>;
    updateTheme: (theme: Theme) => Promise<void>;


}
export const SettingsContext = createContext<SettingsContextProps>({
    ...initialState,
    updatePermission: () => Promise.resolve(),
    updateColorScheme: () => Promise.resolve(),
    updateLanguage: () => Promise.resolve(),
    updateWalkThrough: () => Promise.resolve(),
    updateTheme: () => Promise.resolve(),
});

// ----------------------------------------------------------------------

interface SettingsProviderProps {
    children: React.ReactNode;

}

export function SettingsProvider({ children }: SettingsProviderProps) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { i18n } = useTranslation()
    const networkState = useNetworkState();






    // fetch device info
    const getDeviceInfo = useCallback(async (): Promise<DeviceDetails | null> => {
        try {
            const deviceInfo: DeviceDetails = {
                brand: Device.brand,
                designName: Device.designName,
                deviceName: Device.deviceName,
                deviceType: Device.deviceType,
                deviceYearClass: Device.deviceYearClass,
                isDevice: Device.isDevice,
                manufacturer: Device.manufacturer,
                modelId: Device.modelId,
                modelName: Device.modelName,
                osBuildFingerprint: Device.osBuildFingerprint,
                osBuildId: Device.osBuildId,
                osInternalBuildId: Device.osInternalBuildId,
                osName: Device.osName,
                osVersion: Device.osVersion,
                platformApiLevel: Device.platformApiLevel,
                productName: Device.productName,
                supportedCpuArchitectures: Device.supportedCpuArchitectures,
                totalMemory: Device.totalMemory,
                applicationId: Application.applicationId,
                applicationName: Application.applicationName,
                nativeApplicationVersion: Application.nativeApplicationVersion,
                nativeBuildVersion: Application.nativeBuildVersion,
            };
            return deviceInfo;
        } catch (error) {
            console.error("Error getting device info:", error);
            return null
        }
    }, []);


    // Register for push notifications
    const registerForPushNotificationsAsync = useCallback(async () => {
        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push')
            return;
        }
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {

        }
        try {
            const pushTokenString = (
                await Notifications.getExpoPushTokenAsync({
                    projectId
                })
            ).data;

            return pushTokenString;
        } catch (e: unknown) {
            console.error(e);
        }
    }, []);


    // Get biometric info
    const getBiometricInfo = useCallback(async () => {
        try {
            const hasBiometricHardware = await hasHardwareAsync();
            const availableAuthenticators = await supportedAuthenticationTypesAsync();
            const isBiometricallyEnrolled = availableAuthenticators.length > 0; // Check if any biometric is enrolled

            return {
                hasHardware: hasBiometricHardware,
                availableAuthenticators: availableAuthenticators,
                isEnrolled: isBiometricallyEnrolled,
            };
        } catch (error) {
            console.error("Error getting biometric info:", error);
            return {
                hasHardware: false,
                availableAuthenticators: [],
                isEnrolled: false,
            };
        }
    }, []);


    useEffect(() => {
        const loadAsyncStorage = async () => {
            try {
                const [
                    storageSettings,
                    device,
                    pushNotificationToken,
                    biometricInfo,
                ] = await Promise.all([
                    getMultiFromAsyncStorage(
                        [{ key: InitialState.colorSchemeName, defaultValue: state.colorSchemeName },
                        { key: InitialState.language, defaultValue: state.language },
                        { key: InitialState.walkThrough, defaultValue: state.walkThrough },
                        { key: InitialState.theme, defaultValue: state.theme },
                        ]),
                    getDeviceInfo(),
                    registerForPushNotificationsAsync(),
                    getBiometricInfo(),

                ])




                const { colorSchemeName, language, walkThrough, theme } = storageSettings;
                await i18n.changeLanguage(language as string)

                const initPayload: Partial<SettingsState> = {
                    colorSchemeName,
                    language,
                    walkThrough,
                    theme,
                    device: {
                        ...device,
                        pushNotificationToken
                    },
                    permissions: {
                        ...state.permissions,
                        biometric: {
                            ...state.permissions.biometric,
                            ...biometricInfo,
                        },
                    }
                } as Partial<SettingsState>;

                dispatch({
                    type: SettingsActionType.INITIALIZED,
                    payload: initPayload
                })

            } catch (error: Error | any) {
                console.log({ error })
                dispatch({
                    type: SettingsActionType.INITIALIZED,
                    payload: {
                        settingErrors: error.message,
                    }
                })
            }

        };
        loadAsyncStorage();
    }, []);




    useEffect(() => {
        dispatch({
            type: SettingsActionType.UPDATE_NETWORK_STATE,
            payload: {
                networkState
            }
        })
    }, [networkState])

    // Update Permissions if user grants or denies permissions
    const updatePermission = useCallback(async (permission: keyof Permissions, value: boolean) => {
        // update state
        dispatch({
            type: SettingsActionType.UPDATE_PERMISSION,
            payload: {
                permission,
                value
            }
        })
    }, []);

    // Update Theme  if user changes theme
    const updateColorScheme = useCallback(async (colorSchemeName: ColorSchemeName) => {
        try {
            // save to async storage
            await saveItem(InitialState.colorSchemeName, colorSchemeName)
            // update state
            dispatch({
                type: SettingsActionType.UPDATE_COLOR_SCHEME,
                payload: {
                    colorSchemeName
                }
            })
        }
        catch (error: Error | any) {

            console.log(error)
        }

    }, []);

    const updateTheme = useCallback(async (theme: Theme) => {
        // save to async storage
        await saveItem(InitialState.theme, theme)
        // update state
        dispatch({
            type: SettingsActionType.UPDATE_THEME,
            payload: {
                theme
            }
        })
    }, []);

    // Update Language if user changes language
    const updateLanguage = useCallback(async (language: Languages) => {
        try {
            // save to async storage
            i18n.changeLanguage(language);
            await saveItem(InitialState.language, language)
            // update state
            dispatch({
                type: SettingsActionType.UPDATE_LANGUAGE,
                payload: {
                    language,
                }
            })
        } catch (error: Error | any) {
            console.log(error)
        }
    }, []);


    // Update WalkThrough if the user already saw the walkthrough
    const updateWalkThrough = useCallback(async (walkThrough: boolean) => {
        try {
            // save to async storage
            await saveItem(InitialState.walkThrough, walkThrough)
            // update state
            dispatch({
                type: SettingsActionType.UPDATE_WALKTHROUGH,
                payload: {
                    walkThrough,
                }
            })
        }
        catch (error: Error | any) {
            console.log(error)
        }
    }, []);


    return (
        <SettingsContext.Provider
            value={{
                ...state,
                updatePermission,
                updateColorScheme,
                updateLanguage,
                updateWalkThrough,
                updateTheme
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}


export const useSettings = () => {
    return useContext(SettingsContext);
};