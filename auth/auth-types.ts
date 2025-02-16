import React from 'react';

// Define all your auth related types and interfaces here

export interface IdTokenPayload {
    email: string;
    sub: string;
    // Add other claims from your ID token if needed
}

export interface LoginResponse {
    AuthenticationResult: {
        RefreshToken: string;
        IdToken: string;
        AccessToken: string;
    };
    // Add other parts of your login response if needed
}

export interface RefreshTokenResponse {
    result: {
        refreshToken: { token: string };
        idToken: { jwtToken: string };
        accessToken: { jwtToken: string };
    };
    // Add other parts of your refresh token response if needed
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
}


export type AuthActionType =
    | { type: 'SET_IS_AUTHENTICATED'; payload: boolean | null }
    | { type: 'SET_IS_INITIALIZED'; payload: boolean }
    | { type: 'SET_IS_LOADING'; payload: boolean }
    | { type: 'SET_USER'; payload: User | null }
    | { type: 'SET_IS_BIOMETRIC_ENABLED'; payload: boolean }
    | { type: 'SET_AUTH_TIMEOUT_DURATION'; payload: number }
    | { type: 'SET_LAST_BACKGROUND_TIMESTAMP'; payload: number | null }
    | { type: 'SET_ACCESS_TOKEN'; payload: string | null }
    | { type: 'RESET_AUTH_STATE' };