import React, {
    createContext,
    useEffect,
    useCallback,
    useReducer,
    useContext,
    Dispatch
} from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { AppState } from 'react-native';
import { jwtDecode } from 'jwt-decode';
import { apiHandler } from '@/api/apiHandler';
import { endpoints } from '@/api/endpoints';
import { LoginResponse } from '@/types/auth';

// Define all your auth related types and interfaces here
export interface IdTokenPayload {
    email: string;
    sub: string;
    // Add other claims from your ID token if needed
}


export interface RefreshTokenResponse {
    result: {
        refreshToken: { token: string };
        idToken: { jwtToken: string };
        accessToken: { jwtToken: string };
    };
}


export interface User {
    email: string | undefined;
    id: string | undefined;
    // Add other user properties if needed
}


export interface AuthContextType {
    isAuthenticated: boolean | null;
    isInitialized: boolean;
    isLoading: boolean;
    user: User | null;
    isBiometricEnabled: boolean;
    loginWithPassword: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loginWithBiometric: () => Promise<void>;
    enableBiometric: (password: string) => Promise<void>;
    disableBiometric: () => Promise<void>;
    setAuthTimeoutDuration: (durationMs: number) => void;
    authTimeoutDuration: number;
    lastBackgroundTimestamp: number | null;
    setLastBackgroundTimestamp: React.Dispatch<React.SetStateAction<number | null>>;
}


export interface AuthState {
    isAuthenticated: boolean | null;
    isInitialized: boolean;
    isLoading: boolean;
    user: User | null;
    isBiometricEnabled: boolean;
    authTimeoutDuration: number;
    lastBackgroundTimestamp: number | null;
    accessToken: string | null;
    config: Config; // Store config in state
}


export type AuthActionType =
    | { type: AuthActionTypeEnum.SET_IS_AUTHENTICATED; payload: boolean | null }
    | { type: AuthActionTypeEnum.SET_IS_INITIALIZED; payload: boolean }
    | { type: AuthActionTypeEnum.SET_IS_LOADING; payload: boolean }
    | { type: AuthActionTypeEnum.SET_USER; payload: User | null }
    | { type: AuthActionTypeEnum.SET_IS_BIOMETRIC_ENABLED; payload: boolean }
    | { type: AuthActionTypeEnum.SET_AUTH_TIMEOUT_DURATION; payload: number }
    | { type: AuthActionTypeEnum.SET_LAST_BACKGROUND_TIMESTAMP; payload: number | null }
    | { type: AuthActionTypeEnum.SET_ACCESS_TOKEN; payload: string | null }
    | { type: AuthActionTypeEnum.RESET_AUTH_STATE }
    | { type: AuthActionTypeEnum.SET_CONFIG; payload: Config };


export interface Config {
    biometric: {
        enabled: boolean;
    };
    authTimeout: {
        requireAuthAgain: boolean;
        authType: 'biometric' | 'logout';
        duration: number;
    };
}


const defaultAuthContextValue: AuthContextType = {
    isAuthenticated: null,
    isInitialized: false,
    isLoading: false,
    user: null,
    isBiometricEnabled: false,
    loginWithPassword: async () => { },
    logout: async () => { },
    loginWithBiometric: async () => { },
    enableBiometric: async () => { },
    disableBiometric: async () => { },
    setAuthTimeoutDuration: () => { },
    authTimeoutDuration: 30 * 60 * 1000,
    lastBackgroundTimestamp: null,
    setLastBackgroundTimestamp: () => { },
};


enum AuthActionTypeEnum {
    SET_IS_AUTHENTICATED = 'SET_IS_AUTHENTICATED',
    SET_IS_INITIALIZED = 'SET_IS_INITIALIZED',
    SET_IS_LOADING = 'SET_IS_LOADING',
    SET_USER = 'SET_USER',
    SET_IS_BIOMETRIC_ENABLED = 'SET_IS_BIOMETRIC_ENABLED',
    SET_AUTH_TIMEOUT_DURATION = 'SET_AUTH_TIMEOUT_DURATION',
    SET_LAST_BACKGROUND_TIMESTAMP = 'SET_LAST_BACKGROUND_TIMESTAMP',
    SET_ACCESS_TOKEN = 'SET_ACCESS_TOKEN',
    RESET_AUTH_STATE = 'RESET_AUTH_STATE',
    SET_CONFIG = 'SET_CONFIG',
}


const handlers: Record<string, (state: AuthState, action: any) => AuthState> = {
    [AuthActionTypeEnum.SET_IS_AUTHENTICATED]: (state, action) => ({
        ...state, isAuthenticated: action.payload
    }),
    [AuthActionTypeEnum.SET_IS_INITIALIZED]: (state, action) => ({
        ...state, isInitialized: action.payload
    }),
    [AuthActionTypeEnum.SET_IS_LOADING]: (state, action) => ({
        ...state, isLoading: action.payload
    }),
    [AuthActionTypeEnum.SET_USER]: (state, action) => ({
        ...state, user: action.payload
    }),
    [AuthActionTypeEnum.SET_IS_BIOMETRIC_ENABLED]: (state, action) => ({
        ...state, isBiometricEnabled: action.payload
    }),
    [AuthActionTypeEnum.SET_AUTH_TIMEOUT_DURATION]: (state, action) => ({
        ...state, authTimeoutDuration: action.payload
    }),
    [AuthActionTypeEnum.SET_LAST_BACKGROUND_TIMESTAMP]: (state, action) => ({
        ...state, lastBackgroundTimestamp: action.payload
    }),
    [AuthActionTypeEnum.SET_ACCESS_TOKEN]: (state, action) => ({
        ...state, accessToken: action.payload
    }),
    [AuthActionTypeEnum.RESET_AUTH_STATE]: (state) => ({
        ...state,
        isAuthenticated: false,
        isBiometricEnabled: false,
        user: null,
        accessToken: null,
        lastBackgroundTimestamp: null,
        config: state.config, // Keep config during reset
    }),
    [AuthActionTypeEnum.SET_CONFIG]: (state, action) => ({
        ...state, config: action.payload as Config
    }),
};


const authReducer = (state: AuthState, action: AuthActionType): AuthState =>
    handlers[action.type] ? handlers[action.type](state, action) : state;


export const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

interface AuthProviderProps {
    children: React.ReactNode;
    config?: Config;
}

export enum StorageKeys {
    REFRESH_TOKEN_KEY = 'refreshToken',
    ACCESS_TOKEN_KEY = 'accessToken',
    IS_BIOMETRIC_ENABLED_KEY = 'isBiometricEnabled',
    AUTH_TIMEOUT_DURATION_KEY = 'authTimeoutDuration',
    LAST_BACKGROUND_TIMESTAMP_KEY = 'lastBackgroundTimestamp',
}


export const decodeIdToken = async (idToken: string): Promise<User | null> => {
    try {
        const decodedIdToken = jwtDecode<IdTokenPayload>(idToken);
        return {
            email: decodedIdToken.email,
            id: decodedIdToken.sub,
        };
    } catch (decodeError) {
        console.error("Error decoding ID Token:", decodeError);
        return null;
    }
};

export const refreshAuthTokens = async (refreshToken: string, accessToken: string, dispatch: Dispatch<AuthActionType>): Promise<boolean> => {
    try {
        const { data } = await apiHandler.fetch<RefreshTokenResponse, any>({
            endpoint: endpoints.auth.refresh.path({}),
            method: endpoints.auth.refresh.method,
            body: { refreshToken, accessToken },
        });

        const idTokenJwt = data.result.idToken.jwtToken;
        const newRefreshToken = data.result.refreshToken.token;
        const accessTokenJwt = data.result.accessToken.jwtToken;

        if (newRefreshToken && idTokenJwt && accessTokenJwt) {
            await SecureStore.setItemAsync(StorageKeys.REFRESH_TOKEN_KEY, newRefreshToken);
            await SecureStore.setItemAsync(StorageKeys.ACCESS_TOKEN_KEY, accessTokenJwt);
            dispatch({ type: AuthActionTypeEnum.SET_ACCESS_TOKEN, payload: accessTokenJwt });
            const userPayload = await decodeIdToken(idTokenJwt);
            if (userPayload) {
                dispatch({ type: AuthActionTypeEnum.SET_USER, payload: userPayload });
            }
            return true;
        } else {
            throw new Error('No refresh token or ID token received during token refresh.');
        }
    } catch (error: any) {
        console.error("Token refresh failed:", error);
        return false;
    }
};


export function AuthProvider({ children, config }: AuthProviderProps) {

    // Default configuration (can be overridden by props)
    const initialConfig: Config = config || {
        biometric: {
            enabled: false,
        },
        authTimeout: {
            requireAuthAgain: true,
            authType: 'biometric', // or 'logout'
            duration: 30 * 60 * 1000, // 30 minutes
        },
    };

    const initialState: AuthState = {
        isAuthenticated: null,
        isInitialized: false,
        isLoading: false,
        user: null,
        isBiometricEnabled: initialConfig.biometric.enabled,
        authTimeoutDuration: initialConfig.authTimeout.duration,
        lastBackgroundTimestamp: null,
        accessToken: null,
        config: initialConfig,
    };

    const [state, dispatch] = useReducer(authReducer, initialState);


    const setConfig = useCallback((config: Config) => {
        dispatch({ type: AuthActionTypeEnum.SET_CONFIG, payload: config });
    }, [dispatch]);


    const loadInitialAuthState = useCallback(async () => {
        dispatch({ type: AuthActionTypeEnum.SET_IS_INITIALIZED, payload: false });
        try {
            const storedRefreshToken = await SecureStore.getItemAsync(StorageKeys.REFRESH_TOKEN_KEY);
            const storedAccessToken = await SecureStore.getItemAsync(StorageKeys.ACCESS_TOKEN_KEY);
            const biometricEnabled = await SecureStore.getItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY);
            const storedAuthTimeoutDuration = await SecureStore.getItemAsync(StorageKeys.AUTH_TIMEOUT_DURATION_KEY);
            const storedLastBackgroundTimestamp = await SecureStore.getItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);


            if (storedAuthTimeoutDuration) {
                dispatch({ type: AuthActionTypeEnum.SET_AUTH_TIMEOUT_DURATION, payload: Number(storedAuthTimeoutDuration) });
            } else if (initialConfig.authTimeout.duration) {
                dispatch({ type: AuthActionTypeEnum.SET_AUTH_TIMEOUT_DURATION, payload: initialConfig.authTimeout.duration });
            }

            if (biometricEnabled === 'true') {
                dispatch({ type: AuthActionTypeEnum.SET_IS_BIOMETRIC_ENABLED, payload: true });
            } else if (initialConfig.biometric.enabled) {
                dispatch({ type: AuthActionTypeEnum.SET_IS_BIOMETRIC_ENABLED, payload: initialConfig.biometric.enabled });
            }


            if (storedRefreshToken && storedAccessToken) {
                const refreshSuccessful = await refreshAuthTokens(storedRefreshToken, storedAccessToken, dispatch);
                if (refreshSuccessful) {
                    dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: true });
                } else {
                    dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: false });
                    if (biometricEnabled !== 'true' && initialConfig.biometric.enabled !== true) {
                        dispatch({ type: AuthActionTypeEnum.SET_IS_BIOMETRIC_ENABLED, payload: false });
                        await SecureStore.deleteItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY);
                    }
                }
            } else if (storedAccessToken) {
                const userPayload = await decodeIdToken(storedAccessToken);
                dispatch({ type: AuthActionTypeEnum.SET_USER, payload: userPayload });
                dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: userPayload !== null });
            }
            else {
                dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: false });
            }

            if (storedLastBackgroundTimestamp) {
                dispatch({ type: AuthActionTypeEnum.SET_LAST_BACKGROUND_TIMESTAMP, payload: Number(storedLastBackgroundTimestamp) });
            }


        } catch (error) {
            console.error("Error loading initial auth state:", error);
            dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: false });
            dispatch({ type: AuthActionTypeEnum.SET_IS_BIOMETRIC_ENABLED, payload: false });
        } finally {
            dispatch({ type: AuthActionTypeEnum.SET_IS_INITIALIZED, payload: true });
        }
    }, [dispatch, initialConfig.authTimeout.duration, initialConfig.biometric.enabled]);


    useEffect(() => {
        if (config) {
            setConfig(config);
        }
        loadInitialAuthState();
    }, [loadInitialAuthState, setConfig, JSON.stringify(config)]);


    const loginWithPassword = useCallback(async (username: string, password: string) => {
        dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: true });

        try {
            const { data } = await apiHandler.fetch<LoginResponse, any>({
                endpoint: endpoints.auth.login.path({}),
                method: endpoints.auth.login.method,
                body: { username, password },
            });

            const { RefreshToken: refreshToken, IdToken: idToken, AccessToken: returnedAccessToken } = data.AuthenticationResult;
            if (refreshToken && idToken && returnedAccessToken) {
                await SecureStore.setItemAsync(StorageKeys.REFRESH_TOKEN_KEY, refreshToken);
                await SecureStore.setItemAsync(StorageKeys.ACCESS_TOKEN_KEY, returnedAccessToken);
                dispatch({ type: AuthActionTypeEnum.SET_ACCESS_TOKEN, payload: returnedAccessToken });
                const userPayload = await decodeIdToken(idToken);
                if (userPayload) {
                    dispatch({ type: AuthActionTypeEnum.SET_USER, payload: userPayload });
                }

                dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: true });
                dispatch({ type: AuthActionTypeEnum.SET_LAST_BACKGROUND_TIMESTAMP, payload: null });
                await SecureStore.deleteItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);
            } else {
                throw new Error('No refresh token or ID token received from API');
            }

        } catch (error: any) {
            dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: false });
            throw error;
        } finally {
            dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: false });
        }
    }, [dispatch]);


    const logout = useCallback(async () => {
        dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: true });
        try {
            await apiHandler.fetch({
                endpoint: endpoints.auth.logout.path({}),
                method: endpoints.auth.logout.method,
                body: { accessToken: state.accessToken },
            });

            await SecureStore.deleteItemAsync(StorageKeys.ACCESS_TOKEN_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.REFRESH_TOKEN_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY); // No multi-user, always clear
        } catch (error: any) {
            console.error("Logout error:", error);
            await SecureStore.deleteItemAsync(StorageKeys.ACCESS_TOKEN_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.REFRESH_TOKEN_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY); // No multi-user, always clear
        } finally {
            dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: false });
            dispatch({ type: AuthActionTypeEnum.RESET_AUTH_STATE });
        }
    }, [dispatch, state.accessToken]);


    const enableBiometric = useCallback(async (password: string) => {
        if (!initialConfig.biometric.enabled) {
            return Promise.reject(new Error("Biometric login is disabled by configuration."));
        }

        dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: true });
        try {
            if (!state.user?.email) {
                throw new Error("No user email available to enable biometric.");
            }
            const { data } = await apiHandler.fetch<LoginResponse, any>({
                endpoint: endpoints.auth.login.path({}),
                method: endpoints.auth.login.method,
                body: { username: state.user.email, password },
            });

            const { RefreshToken: refreshToken, IdToken: idToken, AccessToken: returnedAccessToken } = data.AuthenticationResult;

            if (refreshToken && idToken && returnedAccessToken) {
                const biometricAvailable = await LocalAuthentication.hasHardwareAsync();
                if (!biometricAvailable) {
                    throw new Error("Biometric authentication not available on this device.");
                }

                // Single-user biometric logic (simplified)
                await SecureStore.setItemAsync(StorageKeys.REFRESH_TOKEN_KEY, refreshToken);
                await SecureStore.setItemAsync(StorageKeys.ACCESS_TOKEN_KEY, returnedAccessToken);
                await SecureStore.setItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY, 'true');

                dispatch({ type: AuthActionTypeEnum.SET_ACCESS_TOKEN, payload: returnedAccessToken });
                const userPayload = await decodeIdToken(idToken);
                if (userPayload) {
                    dispatch({ type: AuthActionTypeEnum.SET_USER, payload: userPayload });
                }

                dispatch({ type: AuthActionTypeEnum.SET_IS_BIOMETRIC_ENABLED, payload: true });
                dispatch({ type: AuthActionTypeEnum.SET_LAST_BACKGROUND_TIMESTAMP, payload: null });
                await SecureStore.deleteItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);

            } else {
                throw new Error('No refresh token or ID token received during biometric enable');
            }

        } catch (error: any) {
            console.error("Enable Biometric failed:", error);
            dispatch({ type: AuthActionTypeEnum.SET_IS_BIOMETRIC_ENABLED, payload: false });
            await SecureStore.deleteItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY);
            throw error;
        } finally {
            dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: false });
        }
    }, [dispatch, state.user?.email, initialConfig.biometric.enabled]);


    const disableBiometric = useCallback(async () => {
        dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: true });
        try {
            // Single-user biometric disable (simplified)
            await SecureStore.deleteItemAsync(StorageKeys.REFRESH_TOKEN_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.ACCESS_TOKEN_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);
            dispatch({ type: AuthActionTypeEnum.SET_IS_BIOMETRIC_ENABLED, payload: false });


        } catch (error: any) {
            console.error("Disable Biometric failed:", error);
            dispatch({ type: AuthActionTypeEnum.SET_IS_BIOMETRIC_ENABLED, payload: false });
            await SecureStore.deleteItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);
        } finally {
            dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: false });
        }
    }, [dispatch]);


    const loginWithBiometric = useCallback(async () => {
        if (!initialConfig.biometric.enabled) {
            return Promise.reject(new Error("Biometric login is disabled by configuration."));
        }
        dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: true });
        try {
            const biometricResult = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Login with Biometrics',
                fallbackLabel: 'Use Password',
            });
            if (biometricResult.success) {
                // Single user biometric login (simplified)
                const storedRefreshToken = await SecureStore.getItemAsync(StorageKeys.REFRESH_TOKEN_KEY);
                const storedAccessToken = await SecureStore.getItemAsync(StorageKeys.ACCESS_TOKEN_KEY);
                if (storedRefreshToken && storedAccessToken) {
                    const refreshSuccessful = await refreshAuthTokens(storedRefreshToken, storedAccessToken, dispatch);
                    if (refreshSuccessful) {
                        dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: true });
                        dispatch({ type: AuthActionTypeEnum.SET_LAST_BACKGROUND_TIMESTAMP, payload: null });
                        await SecureStore.deleteItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);
                    } else {
                        dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: false });
                    }
                } else {
                    dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: false });
                }
            } else {
                dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: false });
                if (biometricResult.error === 'lockout') {
                    console.warn("Biometric lockout detected.");
                }
            }

        } catch (error: any) {
            console.error("Biometric Login failed:", error);
            dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: false });
        } finally {
            dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: false });
        }
    }, [dispatch, initialConfig.biometric.enabled]);


    const setAuthTimeoutDuration = useCallback(async (durationMs: number) => {
        dispatch({ type: AuthActionTypeEnum.SET_AUTH_TIMEOUT_DURATION, payload: durationMs });
        await SecureStore.setItemAsync(StorageKeys.AUTH_TIMEOUT_DURATION_KEY, durationMs.toString());
    }, [dispatch]);


    const handleAppStateChange = useCallback(async (nextAppState: any) => {
        if (nextAppState === 'background' && state.isAuthenticated === true) {
            dispatch({ type: AuthActionTypeEnum.SET_LAST_BACKGROUND_TIMESTAMP, payload: Date.now() });
            await SecureStore.setItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY, Date.now().toString());
        } else if (nextAppState === 'active' && state.isAuthenticated === true && state.lastBackgroundTimestamp) {
            const backgroundDuration = Date.now() - state.lastBackgroundTimestamp;
            if (initialConfig.authTimeout.requireAuthAgain && backgroundDuration > state.authTimeoutDuration) {
                console.log("Session expired due to background timeout.");
                if (initialConfig.authTimeout.authType === 'logout') {
                    await logout();
                } else if (initialConfig.authTimeout.authType === 'biometric') {
                    dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: false });
                }
            }
            dispatch({ type: AuthActionTypeEnum.SET_LAST_BACKGROUND_TIMESTAMP, payload: null });
            await SecureStore.deleteItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);
        }
    }, [dispatch, logout, state.isAuthenticated, state.authTimeoutDuration, state.lastBackgroundTimestamp, initialConfig.authTimeout.requireAuthAgain, initialConfig.authTimeout.authType]);


    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [handleAppStateChange]);


    const contextValue: AuthContextType = {
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
        isLoading: state.isLoading,
        user: state.user,
        isBiometricEnabled: state.isBiometricEnabled,
        loginWithPassword,
        logout,
        loginWithBiometric,
        enableBiometric,
        disableBiometric,
        setAuthTimeoutDuration,
        authTimeoutDuration: state.authTimeoutDuration,
        lastBackgroundTimestamp: state.lastBackgroundTimestamp,
        setLastBackgroundTimestamp: (timestamp) => dispatch({ type: AuthActionTypeEnum.SET_LAST_BACKGROUND_TIMESTAMP, payload: timestamp as any }),
    };


    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}


export const useAuth = () => {
    return useContext(AuthContext);
};