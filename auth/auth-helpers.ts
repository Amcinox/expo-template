import { jwtDecode } from 'jwt-decode';
import { IdTokenPayload, RefreshTokenResponse, User } from './auth-types';
import * as SecureStore from 'expo-secure-store';
import { apiHandler } from '@/api/apiHandler';
import { endpoints } from '@/api/endpoints';
import { Dispatch } from 'react';
import { AuthActionType } from './auth-types';
import { StorageKeys } from './auth-constants';

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
        const apiResponse: RefreshTokenResponse = await apiHandler.fetch<RefreshTokenResponse, any>({
            endpoint: endpoints.auth.refresh.path({}),
            method: endpoints.auth.refresh.method,
            body: { refreshToken, accessToken },
        });

        const idTokenJwt = apiResponse.result.idToken.jwtToken;
        const newRefreshToken = apiResponse.result.refreshToken.token;
        const accessTokenJwt = apiResponse.result.accessToken.jwtToken;

        if (newRefreshToken && idTokenJwt && accessTokenJwt) {
            await SecureStore.setItemAsync(StorageKeys.REFRESH_TOKEN_KEY, newRefreshToken);
            await SecureStore.setItemAsync(StorageKeys.ACCESS_TOKEN_KEY, accessTokenJwt);
            dispatch({ type: 'SET_ACCESS_TOKEN', payload: accessTokenJwt });
            const userPayload = await decodeIdToken(idTokenJwt);
            if (userPayload) {
                dispatch({ type: 'SET_USER', payload: userPayload });
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