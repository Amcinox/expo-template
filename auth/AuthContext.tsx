import React, {
    createContext,
    useEffect,
    useCallback,
    useReducer,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { AppState } from 'react-native';
import { AuthContextType } from './auth-types';
import { authReducer } from './authReducer';
import { decodeIdToken, refreshAuthTokens } from './auth-helpers';
import { StorageKeys } from './auth-constants';
import { apiHandler } from '@/api/apiHandler';
import { endpoints } from '@/api/endpoints';
import { LoginResponse } from '@/types/auth';


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

export const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

interface AuthProviderProps {
    children: React.ReactNode;
    defaultAuthTimeoutDuration?: number;
}


export const AuthProvider: React.FC<AuthProviderProps> = ({ children, defaultAuthTimeoutDuration }) => {
    const initialState = {
        isAuthenticated: null,
        isInitialized: false,
        isLoading: false,
        user: null,
        isBiometricEnabled: false,
        authTimeoutDuration: defaultAuthTimeoutDuration || defaultAuthContextValue.authTimeoutDuration,
        lastBackgroundTimestamp: null,
        accessToken: null,
    };

    const [state, dispatch] = useReducer(authReducer, initialState);

    const loadInitialAuthState = useCallback(async () => {
        try {

            const storedRefreshToken = await SecureStore.getItemAsync(StorageKeys.REFRESH_TOKEN_KEY);
            const storedAccessToken = await SecureStore.getItemAsync(StorageKeys.ACCESS_TOKEN_KEY);
            const biometricEnabled = await SecureStore.getItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY);
            const storedAuthTimeoutDuration = await SecureStore.getItemAsync(StorageKeys.AUTH_TIMEOUT_DURATION_KEY);
            const storedLastBackgroundTimestamp = await SecureStore.getItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);


            if (storedAuthTimeoutDuration) {
                dispatch({ type: 'SET_AUTH_TIMEOUT_DURATION', payload: Number(storedAuthTimeoutDuration) });
            }

            if (biometricEnabled === 'true') {
                dispatch({ type: 'SET_IS_BIOMETRIC_ENABLED', payload: true });
            }

            if (storedRefreshToken && storedAccessToken) {
                const refreshSuccessful = await refreshAuthTokens(storedRefreshToken, storedAccessToken, dispatch);
                if (refreshSuccessful) {
                    dispatch({ type: 'SET_IS_AUTHENTICATED', payload: true });
                } else {
                    dispatch({ type: 'SET_IS_AUTHENTICATED', payload: false });
                    if (biometricEnabled !== 'true') {
                        dispatch({ type: 'SET_IS_BIOMETRIC_ENABLED', payload: false });
                        await SecureStore.deleteItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY);
                    }
                }
            } else if (storedAccessToken) { // If no refreshToken but accessToken is present
                const userPayload = await decodeIdToken(storedAccessToken);
                dispatch({ type: 'SET_USER', payload: userPayload });
                dispatch({ type: 'SET_IS_AUTHENTICATED', payload: userPayload !== null });
            }
            else {
                dispatch({ type: 'SET_IS_AUTHENTICATED', payload: false });
            }

            if (storedLastBackgroundTimestamp) {
                dispatch({ type: 'SET_LAST_BACKGROUND_TIMESTAMP', payload: Number(storedLastBackgroundTimestamp) });
            }


        } catch (error) {
            console.error("Error loading initial auth state:", error);
            dispatch({ type: 'SET_IS_AUTHENTICATED', payload: false });
            dispatch({ type: 'SET_IS_BIOMETRIC_ENABLED', payload: false });
        } finally {
            dispatch({ type: 'SET_IS_INITIALIZED', payload: true });
        }
    }, [dispatch]);


    useEffect(() => {
        loadInitialAuthState();
    }, [loadInitialAuthState]);


    const loginWithPassword = useCallback(async (username: string, password: string) => {
        dispatch({ type: 'SET_IS_LOADING', payload: true });

        try {
            const apiResponse: LoginResponse = await apiHandler.fetch<LoginResponse, any>({
                endpoint: endpoints.auth.login.path({}),
                method: endpoints.auth.login.method,
                body: { username, password },
            });

            const { RefreshToken: refreshToken, IdToken: idToken, AccessToken: returnedAccessToken } = apiResponse.AuthenticationResult;
            if (refreshToken && idToken && returnedAccessToken) {
                await SecureStore.setItemAsync(StorageKeys.REFRESH_TOKEN_KEY, refreshToken);
                await SecureStore.setItemAsync(StorageKeys.ACCESS_TOKEN_KEY, returnedAccessToken);
                dispatch({ type: 'SET_ACCESS_TOKEN', payload: returnedAccessToken });
                const userPayload = await decodeIdToken(idToken);
                if (userPayload) {
                    dispatch({ type: 'SET_USER', payload: userPayload });
                }

                dispatch({ type: 'SET_IS_AUTHENTICATED', payload: true });
                dispatch({ type: 'SET_LAST_BACKGROUND_TIMESTAMP', payload: null });
                await SecureStore.deleteItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);
            } else {

                throw new Error('No refresh token or ID token received from API');
            }

        } catch (error: any) {
            // console.error("Login failed:", error);
            dispatch({ type: 'SET_IS_AUTHENTICATED', payload: false });
            throw error;
        } finally {
            dispatch({ type: 'SET_IS_LOADING', payload: false });
        }
    }, [dispatch]);


    const logout = useCallback(async () => {
        dispatch({ type: 'SET_IS_LOADING', payload: true });
        try {
            await apiHandler.fetch({
                endpoint: endpoints.auth.logout.path({}),
                method: endpoints.auth.logout.method,
                body: { accessToken: state.accessToken },
            });

            await SecureStore.deleteItemAsync(StorageKeys.ACCESS_TOKEN_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);


        } catch (error: any) {
            console.error("Logout error:", error);
            await SecureStore.deleteItemAsync(StorageKeys.ACCESS_TOKEN_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);


        } finally {
            dispatch({ type: 'SET_IS_LOADING', payload: false });
        }
    }, [dispatch, state.accessToken]);


    const enableBiometric = useCallback(async (password: string) => {
        dispatch({ type: 'SET_IS_LOADING', payload: true });
        try {
            if (!state.user?.email) {
                throw new Error("No user email available to enable biometric.");
            }
            const apiResponse: LoginResponse = await apiHandler.fetch<LoginResponse, any>({
                endpoint: endpoints.auth.login.path({}),
                method: endpoints.auth.login.method,
                body: { username: state.user.email, password },
            });

            const { RefreshToken: refreshToken, IdToken: idToken, AccessToken: returnedAccessToken } = apiResponse.AuthenticationResult;


            if (refreshToken && idToken && returnedAccessToken) {
                const biometricAvailable = await LocalAuthentication.hasHardwareAsync();
                if (!biometricAvailable) {
                    throw new Error("Biometric authentication not available on this device.");
                }
                await SecureStore.setItemAsync(StorageKeys.REFRESH_TOKEN_KEY, refreshToken);
                await SecureStore.setItemAsync(StorageKeys.ACCESS_TOKEN_KEY, returnedAccessToken);
                await SecureStore.setItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY, 'true');
                dispatch({ type: 'SET_ACCESS_TOKEN', payload: returnedAccessToken });
                const userPayload = await decodeIdToken(idToken);
                if (userPayload) {
                    dispatch({ type: 'SET_USER', payload: userPayload });
                }

                dispatch({ type: 'SET_IS_BIOMETRIC_ENABLED', payload: true });
                dispatch({ type: 'SET_IS_AUTHENTICATED', payload: false });
                dispatch({ type: 'SET_LAST_BACKGROUND_TIMESTAMP', payload: null });
                await SecureStore.deleteItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);


            } else {
                throw new Error('No refresh token or ID token received during biometric enable');
            }

        } catch (error: any) {
            console.error("Enable Biometric failed:", error);
            dispatch({ type: 'SET_IS_BIOMETRIC_ENABLED', payload: false });
            await SecureStore.deleteItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY);
            throw error;
        } finally {
            dispatch({ type: 'SET_IS_LOADING', payload: false });
        }
    }, [dispatch, state.user?.email]);


    const disableBiometric = useCallback(async () => {
        dispatch({ type: 'SET_IS_LOADING', payload: true });
        try {
            await SecureStore.deleteItemAsync(StorageKeys.REFRESH_TOKEN_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.ACCESS_TOKEN_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);
            dispatch({ type: 'SET_IS_BIOMETRIC_ENABLED', payload: false });
            dispatch({ type: 'SET_IS_AUTHENTICATED', payload: false });
            dispatch({ type: 'SET_LAST_BACKGROUND_TIMESTAMP', payload: null });


        } catch (error: any) {
            console.error("Disable Biometric failed:", error);
            dispatch({ type: 'SET_IS_BIOMETRIC_ENABLED', payload: false });
            dispatch({ type: 'SET_IS_AUTHENTICATED', payload: false });
            dispatch({ type: 'SET_LAST_BACKGROUND_TIMESTAMP', payload: null });
            await SecureStore.deleteItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);
        } finally {
            dispatch({ type: 'SET_IS_LOADING', payload: false });
        }
    }, [dispatch]);


    const loginWithBiometric = useCallback(async () => {
        dispatch({ type: 'SET_IS_LOADING', payload: true });
        try {
            const biometricResult = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Login with Biometrics',
                fallbackLabel: 'Use Password',
            });
            if (biometricResult.success) {
                const storedRefreshToken = await SecureStore.getItemAsync(StorageKeys.REFRESH_TOKEN_KEY);
                const storedAccessToken = await SecureStore.getItemAsync(StorageKeys.ACCESS_TOKEN_KEY);
                if (storedRefreshToken && storedAccessToken) {
                    const refreshSuccessful = await refreshAuthTokens(storedRefreshToken, storedAccessToken, dispatch);
                    if (refreshSuccessful) {
                        dispatch({ type: 'SET_IS_AUTHENTICATED', payload: true });
                        dispatch({ type: 'SET_LAST_BACKGROUND_TIMESTAMP', payload: null });
                        await SecureStore.deleteItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);
                    } else {
                        dispatch({ type: 'SET_IS_AUTHENTICATED', payload: false });
                    }

                } else {
                    dispatch({ type: 'SET_IS_AUTHENTICATED', payload: false });
                }
            } else {
                dispatch({ type: 'SET_IS_AUTHENTICATED', payload: false });
                if (biometricResult.error === 'lockout') {
                    console.warn("Biometric lockout detected.");
                }
            }

        } catch (error: any) {
            console.error("Biometric Login failed:", error);
            dispatch({ type: 'SET_IS_AUTHENTICATED', payload: false });

        } finally {
            dispatch({ type: 'SET_IS_LOADING', payload: false });
        }
    }, [dispatch]);


    const setAuthTimeoutDuration = useCallback(async (durationMs: number) => {
        dispatch({ type: 'SET_AUTH_TIMEOUT_DURATION', payload: durationMs });
        await SecureStore.setItemAsync(StorageKeys.AUTH_TIMEOUT_DURATION_KEY, durationMs.toString());
    }, [dispatch]);


    useEffect(() => {
        const subscription = AppState.addEventListener('change', async nextAppState => {
            if (nextAppState === 'background' && state.isAuthenticated === true) {
                dispatch({ type: 'SET_LAST_BACKGROUND_TIMESTAMP', payload: Date.now() });
                await SecureStore.setItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY, Date.now().toString());
            } else if (nextAppState === 'active' && state.isAuthenticated === true && state.lastBackgroundTimestamp) {
                const backgroundDuration = Date.now() - state.lastBackgroundTimestamp;
                if (backgroundDuration > state.authTimeoutDuration) {
                    console.log("Session expired due to background timeout.");
                    if (!state.isBiometricEnabled) {
                        await logout();
                    } else {
                        dispatch({ type: 'SET_IS_AUTHENTICATED', payload: false });
                    }
                }
                dispatch({ type: 'SET_LAST_BACKGROUND_TIMESTAMP', payload: null });
                await SecureStore.deleteItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);
            }
        });

        return () => {
            subscription.remove();
        };
    }, [dispatch, logout, state.isAuthenticated, state.authTimeoutDuration, state.isBiometricEnabled, state.lastBackgroundTimestamp]);


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
        setLastBackgroundTimestamp: (timestamp) => dispatch({ type: 'SET_LAST_BACKGROUND_TIMESTAMP', payload: timestamp as any }),
    };


    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    return React.useContext(AuthContext);
};