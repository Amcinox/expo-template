import React from 'react';
import { DefaultFallback } from './fallbacks/DefaultFallback';
import { ForbiddenGuardProps } from './types';
import LockAnimation from '@/assets/lottie/lock.json';
import { useSettings } from '@/contexts/SettingsContext';


export const ForbiddenGuard: React.FC<ForbiddenGuardProps> = ({
    children,
    enabled,
    fallback,
    showFallback = true,
}) => {

    if (enabled) {
        if (!showFallback) return null;

        if (fallback) {
            return <>{fallback({})}</>;
        }


        return (
            <DefaultFallback
                title="Forbidden"
                message="You are not allowed to access this screen"
                animation={LockAnimation}
            />
        );
    }

    return <>{children}</>;
};