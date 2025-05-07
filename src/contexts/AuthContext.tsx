import React, {
    createContext,
    useEffect,
    useCallback,
    useReducer,
    useContext,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { apiHandler } from '@/api/apiHandler';
import { endpoints } from '@/api/endpoints';
import { AuthActionType, AuthActionTypeEnum, AuthState, IdTokenPayload, LoginResponse, RefreshTokenResponse, StorageKeys } from '@/types/auth';
import { decodeIdToken } from '@/utils/auth-helpers';






export interface AuthContextType {
    isAuthenticated: boolean | null;
    isInitialized: boolean;
    isLoading: boolean;
    user: IdTokenPayload | null;
    rememberedUsername: string | null
    isBiometricEnabled: boolean;
    biometricOwner: string | null;
    loginWithPassword: (username: string, password: string, config?: {
        rememberMe: boolean
    }) => Promise<IdTokenPayload | null>;
    logout: () => Promise<void>;
    loginWithBiometric: () => Promise<void>;
    changePassword: (oldPassword: string, newPassword: string) => Promise<void>;

    forgotPassword: (username: string) => Promise<void>;
    confirmForgotPassword: (username: string, code: string, newPassword: string) => Promise<void>;
    enableBiometric: () => Promise<void>;
    disableBiometric: () => Promise<void>;
    setAuthTimeoutDuration: (durationMs: number) => void;
    lastBackgroundTimestamp: number | null;
    setLastBackgroundTimestamp: React.Dispatch<React.SetStateAction<number | null>>;
}






const defaultAuthContextValue: AuthContextType = {
    isAuthenticated: null,
    isInitialized: false,
    isLoading: false,
    user: null,
    rememberedUsername: null,
    isBiometricEnabled: false,
    biometricOwner: null,
    loginWithPassword: async () => null,
    logout: async () => { },
    loginWithBiometric: async () => { },
    changePassword: async () => { },
    forgotPassword: async () => { },
    confirmForgotPassword: async () => { },
    enableBiometric: async () => { },
    disableBiometric: async () => { },
    setAuthTimeoutDuration: () => { },
    lastBackgroundTimestamp: null,
    setLastBackgroundTimestamp: () => { },

};





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
        ...state,
        isBiometricEnabled: action.payload.enabled,
        biometricOwner: action.payload.owner
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
        user: null,
        idToken: null,
    }),
    [AuthActionTypeEnum.SET_REMEMBERED_USERNAME]: (state, action) => ({
        ...state,
        rememberedUsername: action.payload
    }),
};


const authReducer = (state: AuthState, action: AuthActionType): AuthState =>
    handlers[action.type] ? handlers[action.type](state, action) : state;


export const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

interface AuthProviderProps {
    children: React.ReactNode;
}








export function AuthProvider({ children }: AuthProviderProps) {

    // Default configuration (can be overridden by props)


    const initialState: AuthState = {
        isAuthenticated: null,
        isInitialized: false,
        isLoading: false,
        user: null,
        rememberedUsername: null,
        isBiometricEnabled: false,
        biometricOwner: null,
        lastBackgroundTimestamp: null,
        tokens: {
            idToken: null,
            accessToken: null,
            refreshToken: null
        },
    };

    const [state, dispatch] = useReducer(authReducer, initialState);





    // TODO: need more enhance and refactoring for more clean code and easy to read
    const loadInitialAuthState = useCallback(async () => {
        dispatch({ type: AuthActionTypeEnum.SET_IS_INITIALIZED, payload: false });
        try {
            const storedRefreshToken = await SecureStore.getItemAsync(StorageKeys.REFRESH_TOKEN_KEY);
            const storedAccessToken = await SecureStore.getItemAsync(StorageKeys.ACCESS_TOKEN_KEY);
            const storedIdToken = await SecureStore.getItemAsync(StorageKeys.ID_TOKEN_KEY);
            const biometricEnabled = await SecureStore.getItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY);
            const biometricOwner = await SecureStore.getItemAsync(StorageKeys.BIOMETRIC_OWNER_KEY)
            const storedAuthTimeoutDuration = await SecureStore.getItemAsync(StorageKeys.AUTH_TIMEOUT_DURATION_KEY);
            const storedLastBackgroundTimestamp = await SecureStore.getItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);
            const storedrememberredUsername = await SecureStore.getItemAsync(StorageKeys.REMEMBERED_USERNAME)
            if (storedAuthTimeoutDuration) {
                dispatch({ type: AuthActionTypeEnum.SET_AUTH_TIMEOUT_DURATION, payload: Number(storedAuthTimeoutDuration) });
            }

            if (biometricEnabled === 'true') {
                dispatch({
                    type: AuthActionTypeEnum.SET_IS_BIOMETRIC_ENABLED, payload: {
                        enabled: true,
                        owner: biometricOwner
                    }
                });
            }

            if (storedrememberredUsername) {
                dispatch({ type: AuthActionTypeEnum.SET_REMEMBERED_USERNAME, payload: storedrememberredUsername });
            }


            // check if still login with refresh tokens ! if failed means refresh token expired then logout and disable biometric
            if (storedRefreshToken && storedAccessToken) {
                const refreshSuccessful = await refreshAuthTokens(storedRefreshToken, storedAccessToken);
                if (refreshSuccessful && storedIdToken) {
                    dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: true });
                } else {
                    dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: false });
                    if (biometricEnabled !== 'true') {
                        dispatch({
                            type: AuthActionTypeEnum.SET_IS_BIOMETRIC_ENABLED, payload: {
                                enabled: false,
                                owner: null
                            }
                        });
                        await SecureStore.deleteItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY);
                    } else {
                        dispatch({
                            type: AuthActionTypeEnum.SET_IS_BIOMETRIC_ENABLED, payload: {
                                enabled: true,
                                owner: biometricOwner
                            }
                        });
                    }
                }
            } else if (storedAccessToken) {
                const userPayload = decodeIdToken(storedAccessToken);
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
        } finally {
            dispatch({ type: AuthActionTypeEnum.SET_IS_INITIALIZED, payload: true });
        }
    }, [dispatch]);


    useEffect(() => {

        loadInitialAuthState();
    }, [loadInitialAuthState]);




    const refreshAuthTokens = useCallback(async (refreshToken: string, accessToken: string): Promise<boolean> => {
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
                await SecureStore.setItemAsync(StorageKeys.ID_TOKEN_KEY, idTokenJwt);
                dispatch({ type: AuthActionTypeEnum.SET_ACCESS_TOKEN, payload: accessTokenJwt });
                const userPayload = decodeIdToken(idTokenJwt);
                if (userPayload) {
                    dispatch({ type: AuthActionTypeEnum.SET_USER, payload: userPayload });
                    dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: userPayload !== null });
                }
                return true;
            } else {
                throw new Error('No refresh token or ID token received during token refresh.');
            }
        } catch (error: any) {
            console.error("Token refresh failed:", error);
            return false;
        }
    }, [dispatch])


    const loginWithPassword = useCallback(async (username: string, password: string, config?: { rememberMe: boolean }) => {
        dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: true });

        try {
            const { data } = await apiHandler.fetch<LoginResponse, any>({
                endpoint: endpoints.auth.login.path({}),
                method: endpoints.auth.login.method,
                body: { username, password },
            });
            const { RefreshToken, IdToken, AccessToken } = data.AuthenticationResult;

            if (RefreshToken && IdToken && AccessToken) {
                await SecureStore.setItemAsync(StorageKeys.REFRESH_TOKEN_KEY, RefreshToken);
                await SecureStore.setItemAsync(StorageKeys.ACCESS_TOKEN_KEY, AccessToken);
                await SecureStore.setItemAsync(StorageKeys.ID_TOKEN_KEY, IdToken);
                if (config?.rememberMe) {
                    await SecureStore.setItemAsync(StorageKeys.REMEMBERED_USERNAME, username);
                    dispatch({ type: AuthActionTypeEnum.SET_REMEMBERED_USERNAME, payload: username });

                }
                dispatch({ type: AuthActionTypeEnum.SET_ACCESS_TOKEN, payload: AccessToken });
                const userPayload = decodeIdToken(IdToken);
                dispatch({ type: AuthActionTypeEnum.SET_USER, payload: userPayload });
                dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: true });
                dispatch({ type: AuthActionTypeEnum.SET_LAST_BACKGROUND_TIMESTAMP, payload: null });
                await SecureStore.deleteItemAsync(StorageKeys.LAST_BACKGROUND_TIMESTAMP_KEY);
                dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: false });

                return userPayload
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
            const { accessToken, } = state.tokens
            // await apiHandler.fetch({
            //     endpoint: endpoints.auth.logout.path({}),
            //     method: endpoints.auth.logout.method,
            //     body: { accessToken },
            // });
            await SecureStore.deleteItemAsync(StorageKeys.ID_TOKEN_KEY);
            if (!state.isBiometricEnabled) {
                await SecureStore.deleteItemAsync(StorageKeys.ACCESS_TOKEN_KEY);
                await SecureStore.deleteItemAsync(StorageKeys.REFRESH_TOKEN_KEY);
            }
        } catch (error: any) {
            console.error("Logout error:", error);
            await SecureStore.deleteItemAsync(StorageKeys.ID_TOKEN_KEY);
        } finally {
            dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: false });
            dispatch({ type: AuthActionTypeEnum.RESET_AUTH_STATE });
        }
    }, [dispatch, state.tokens, state.isBiometricEnabled]);


    const enableBiometric = useCallback(async () => {
        dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: true });
        try {
            if (!state.user) {
                throw new Error("No user available to enable biometric.");
            }
            const biometricResult = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Login with Biometrics',
                fallbackLabel: 'Use Password',
            });
            if (!biometricResult.success) {
                throw new Error("Failed to enable Biometric")
            }
            const storedRefreshToken = await SecureStore.getItemAsync(StorageKeys.REFRESH_TOKEN_KEY);
            const storedAccessToken = await SecureStore.getItemAsync(StorageKeys.ACCESS_TOKEN_KEY);
            await refreshAuthTokens(storedRefreshToken!, storedAccessToken!);
            await SecureStore.setItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY, 'true');
            await SecureStore.setItemAsync(StorageKeys.BIOMETRIC_OWNER_KEY, state.user.email);
            dispatch({
                type: AuthActionTypeEnum.SET_IS_BIOMETRIC_ENABLED, payload: {
                    enabled: true,
                    owner: state.user.email
                }
            });

        } catch (error: any) {
            console.error("Enable Biometric failed:", error);
            dispatch({
                type: AuthActionTypeEnum.SET_IS_BIOMETRIC_ENABLED, payload: {
                    enabled: false,
                    owner: null
                }
            });
            await SecureStore.deleteItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.BIOMETRIC_OWNER_KEY);
            throw error;
        } finally {
            dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: false });
        }
    }, [dispatch, state.user]);


    const disableBiometric = useCallback(async () => {
        dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: true });
        try {
            await SecureStore.deleteItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.BIOMETRIC_OWNER_KEY);
            dispatch({
                type: AuthActionTypeEnum.SET_IS_BIOMETRIC_ENABLED, payload: {
                    enabled: false,
                    owner: null
                }
            });
        } catch (error: any) {
            console.error("Disable Biometric failed:", error);
            dispatch({
                type: AuthActionTypeEnum.SET_IS_BIOMETRIC_ENABLED, payload: {
                    enabled: false,
                    owner: null
                }
            });
            await SecureStore.deleteItemAsync(StorageKeys.IS_BIOMETRIC_ENABLED_KEY);
            await SecureStore.deleteItemAsync(StorageKeys.BIOMETRIC_OWNER_KEY);
        } finally {
            dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: false });
        }
    }, [dispatch]);


    const loginWithBiometric = useCallback(async () => {
        dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: true });
        try {

            if (!state.isBiometricEnabled) {
                throw Error("not Enabled")
            }
            const biometricResult = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Login with Biometrics',
                fallbackLabel: 'Use Password',
            });
            if (biometricResult.success) {
                const storedRefreshToken = await SecureStore.getItemAsync(StorageKeys.REFRESH_TOKEN_KEY);
                const storedAccessToken = await SecureStore.getItemAsync(StorageKeys.ACCESS_TOKEN_KEY);
                if (!storedRefreshToken || !storedAccessToken) {
                    throw new Error("Invalid Tokens")
                }
                const refreshSuccessful = await refreshAuthTokens(storedRefreshToken, storedAccessToken);
                if (refreshSuccessful) {
                    dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: true });
                    dispatch({ type: AuthActionTypeEnum.SET_LAST_BACKGROUND_TIMESTAMP, payload: null });
                } else {
                    dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: false });
                }

            } else {
                throw new Error("Authentication failed. Please try again.");
            }
        } catch (error: any) {
            console.error("Biometric Login failed:", error);
            // dispatch({ type: AuthActionTypeEnum.SET_IS_AUTHENTICATED, payload: false });
            throw error;
        } finally {
            dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: false });
        }
    }, [dispatch, state.isBiometricEnabled]);


    const setAuthTimeoutDuration = useCallback(async (durationMs: number) => {
        dispatch({ type: AuthActionTypeEnum.SET_AUTH_TIMEOUT_DURATION, payload: durationMs });
        await SecureStore.setItemAsync(StorageKeys.AUTH_TIMEOUT_DURATION_KEY, durationMs.toString());
    }, [dispatch]);


    const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
        dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: true });
        try {
            const accessToken = await SecureStore.getItemAsync(StorageKeys.ACCESS_TOKEN_KEY);
            await apiHandler.fetch({
                endpoint: endpoints.auth.changePassword.path({}),
                method: endpoints.auth.changePassword.method,
                body: { oldPassword, newPassword, accessToken },
            });
        } catch (error: any) {
            console.error("Change Password failed:", error);
            throw error;
        } finally {
            dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: false });
        }
    }
        , [dispatch]);


    const forgotPassword = useCallback(async (username: string) => {
        dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: true });
        try {
            await apiHandler.fetch({
                endpoint: endpoints.auth.forgotPassword.path({}),
                method: endpoints.auth.forgotPassword.method,
                body: { username },
            });
        } catch (error: any) {
            console.error("Forgot Password failed:", error);
            throw error;
        } finally {
            dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: false });
        }
    }
        , [dispatch]);

    const confirmForgotPassword = useCallback(async (username: string, code: string, newPassword: string) => {
        dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: true });
        try {
            await apiHandler.fetch({
                endpoint: endpoints.auth.confirmForgotPassword.path({}),
                method: endpoints.auth.confirmForgotPassword.method,
                body: { username, code, newPassword },
            });
        } catch (error: any) {
            console.error("Confirm Forgot Password failed:", error);
            throw error;
        } finally { dispatch({ type: AuthActionTypeEnum.SET_IS_LOADING, payload: false }); }
    }
        , [dispatch]);



    const contextValue: AuthContextType = {
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
        isLoading: state.isLoading,
        user: state.user,
        isBiometricEnabled: state.isBiometricEnabled,
        biometricOwner: state.biometricOwner,
        loginWithPassword,
        logout,
        loginWithBiometric,
        changePassword,
        forgotPassword,
        confirmForgotPassword,
        enableBiometric,
        disableBiometric,
        setAuthTimeoutDuration,
        lastBackgroundTimestamp: state.lastBackgroundTimestamp,
        setLastBackgroundTimestamp: (timestamp) => dispatch({ type: AuthActionTypeEnum.SET_LAST_BACKGROUND_TIMESTAMP, payload: timestamp as any }),
        rememberedUsername: state.rememberedUsername
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