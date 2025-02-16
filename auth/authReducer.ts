import { AuthState, AuthActionType } from './auth-types'; // Import types from auth-types.ts

const authReducer = (state: AuthState, action: AuthActionType): AuthState => {
    switch (action.type) {
        case 'SET_IS_AUTHENTICATED':
            return { ...state, isAuthenticated: action.payload };
        case 'SET_IS_INITIALIZED':
            return { ...state, isInitialized: action.payload };
        case 'SET_IS_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_USER':
            return { ...state, user: action.payload };
        case 'SET_IS_BIOMETRIC_ENABLED':
            return { ...state, isBiometricEnabled: action.payload };
        case 'SET_AUTH_TIMEOUT_DURATION':
            return { ...state, authTimeoutDuration: action.payload };
        case 'SET_LAST_BACKGROUND_TIMESTAMP':
            return { ...state, lastBackgroundTimestamp: action.payload };
        case 'SET_ACCESS_TOKEN':
            return { ...state, accessToken: action.payload };
        case 'RESET_AUTH_STATE':
            return {
                ...state,
                isAuthenticated: false,
                isBiometricEnabled: false,
                user: null,
                accessToken: null,
                lastBackgroundTimestamp: null
            };
        default:
            return state;
    }
};

export { authReducer };