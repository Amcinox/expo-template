

// Context

export enum StorageKeys {
    REFRESH_TOKEN_KEY = 'refreshToken',
    ACCESS_TOKEN_KEY = 'accessToken',
    ID_TOKEN_KEY = 'idToken',
    IS_BIOMETRIC_ENABLED_KEY = 'isBiometricEnabled',
    BIOMETRIC_OWNER_KEY = 'biometricOwner',
    AUTH_TIMEOUT_DURATION_KEY = 'authTimeoutDuration',
    LAST_BACKGROUND_TIMESTAMP_KEY = 'lastBackgroundTimestamp',
    REMEMBERED_USERNAME = 'rememberedUsername'
}



export enum AuthActionTypeEnum {
    SET_IS_AUTHENTICATED = 'SET_IS_AUTHENTICATED',
    SET_IS_INITIALIZED = 'SET_IS_INITIALIZED',
    SET_IS_LOADING = 'SET_IS_LOADING',
    SET_USER = 'SET_USER',
    SET_IS_BIOMETRIC_ENABLED = 'SET_IS_BIOMETRIC_ENABLED',
    SET_AUTH_TIMEOUT_DURATION = 'SET_AUTH_TIMEOUT_DURATION',
    SET_LAST_BACKGROUND_TIMESTAMP = 'SET_LAST_BACKGROUND_TIMESTAMP',
    SET_ACCESS_TOKEN = 'SET_ACCESS_TOKEN',
    RESET_AUTH_STATE = 'RESET_AUTH_STATE',
    SET_REMEMBERED_USERNAME = "SET_REMEMBERED_USERNAME"
}

export interface AuthState {
    isAuthenticated: boolean | null;
    isInitialized: boolean;
    isLoading: boolean;
    user: IdTokenPayload | null;
    rememberedUsername: string | null
    isBiometricEnabled: boolean;
    biometricOwner: string | null;
    lastBackgroundTimestamp: number | null;
    tokens: {
        idToken: string | null;
        accessToken: string | null;
        refreshToken: string | null;
    }
}


export type AuthActionType =
    | { type: AuthActionTypeEnum.SET_IS_AUTHENTICATED; payload: boolean | null }
    | { type: AuthActionTypeEnum.SET_IS_INITIALIZED; payload: boolean }
    | { type: AuthActionTypeEnum.SET_IS_LOADING; payload: boolean }
    | { type: AuthActionTypeEnum.SET_USER; payload: IdTokenPayload | null }
    | {
        type: AuthActionTypeEnum.SET_IS_BIOMETRIC_ENABLED; payload: {
            enabled: boolean;
            owner: string | null;
        }
    }
    | { type: AuthActionTypeEnum.SET_AUTH_TIMEOUT_DURATION; payload: number }
    | { type: AuthActionTypeEnum.SET_LAST_BACKGROUND_TIMESTAMP; payload: number | null }
    | { type: AuthActionTypeEnum.SET_ACCESS_TOKEN; payload: string | null }
    | { type: AuthActionTypeEnum.RESET_AUTH_STATE }
    | { type: AuthActionTypeEnum.SET_REMEMBERED_USERNAME; payload: string };


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


// Cognito 
export enum Group {
}
export enum Role {
    USER = "USER",
}


export interface AccessTokenPayload {
    sub: string
    "cognito:groups": string[]
    iss: string
    client_id: string
    origin_jti: string
    event_id: string
    token_use: string
    scope: string
    auth_time: number
    exp: number
    iat: number
    jti: string
    username: string
}

export interface IdTokenPayload {
    aud: string
    auth_time: number
    "cognito:groups": Group[]
    "cognito:username": string
    "custom:role": Role
    "custom:user_id": string
    email: string
    email_verified: boolean
    event_id: string
    exp: number
    iat: number
    iss: string
    jti: string
    origin_jti: string
    phone_number: string
    phone_number_verified: boolean
    sub: string
    token_use: string
}

export interface RefreshTokenResponse {
    result: {
        idToken: {
            jwtToken: string
            payload: IdTokenPayload
        },
        refreshToken: {
            token: string
        },
        accessToken: {
            jwtToken: string
            payload: AccessTokenPayload
        },
        clockDrift: number
    }
}




export interface LoginResponse {
    AuthenticationResult: {
        IdToken: string;
        RefreshToken: string;
        AccessToken: string;
    }
}

