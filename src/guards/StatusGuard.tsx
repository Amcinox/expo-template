import React from 'react';
import { DefaultFallback } from './DefaultFallback';
import { StatusGuardProps } from './types';

import statusAnimation from '@/assets/lottie/no-permission.json';

export const StatusGuard: React.FC<StatusGuardProps> = ({
    children,
    status,
    allowedStatuses,
    fallback,
    showFallback = true,
}) => {
    const isAllowed = allowedStatuses.includes(status);

    if (!isAllowed) {
        if (!showFallback) return null;

        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <DefaultFallback
                title="Status Not Allowed"
                message={`Current status "${status}" is not allowed. Allowed statuses: ${allowedStatuses.join(', ')}`}
                animation={statusAnimation}

            />
        );
    }

    return <>{children}</>;
};