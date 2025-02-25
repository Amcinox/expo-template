enum Group {
    ADMIN = "ADMIN"
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
    sub: string
    "cognito:groups": Group[]
    email_verified: boolean,
    iss: string
    "custom:user_id": string
    phone_number_verified: false,
    "cognito:username": string
    origin_jti: string
    aud: string
    event_id: string
    token_use: string
    auth_time: number,
    phone_number: string
    exp: number
    "custom:role": string
    iat: number
    jti: string
    email: string
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

