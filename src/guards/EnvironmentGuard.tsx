import React from 'react';
import { DefaultFallback } from './fallbacks/DefaultFallback';
import { EnvironmentGuardProps } from './types';
import environmentAnimation from '@/assets/lottie/lost.json';

const ENV = process.env.EXPO_PUBLIC_ENV!
export const EnvironmentGuard: React.FC<EnvironmentGuardProps> = ({
    children,
    allowedEnvironments,
    fallback,
    showFallback = true,
}) => {
    if (!allowedEnvironments.includes(ENV)) {
        if (!showFallback) return null;

        if (fallback) {
            return <>{fallback({})}</>;
        }

        return (
            <DefaultFallback
                title="Environment Not Supported Yet"
                message={`Current environment "${ENV}" is not supported yet. Allowed environments: ${allowedEnvironments.join(', ')}. Stay tuned, support is coming soon!`}
                animation={environmentAnimation}
            />
        );
    }

    return <>{children}</>;
};