import React from 'react';
import { DefaultFallback } from './fallbacks/DefaultFallback';
import { StatusGuardProps } from './types';

import statusAnimation from '@/assets/lottie/no-permission.json';
import { useClerk } from '@clerk/clerk-expo';
export const StatusGuard: React.FC<StatusGuardProps> = ({
    children,
    status,
    allowedStatuses,
    fallback,
    showFallback = true,
}) => {
    const isAllowed = allowedStatuses.includes(status);
    const { signOut } = useClerk()
    if (!isAllowed) {
        if (!showFallback) return null;

        if (fallback) {
            return <>{fallback({})}</>;
        }

        return (
            <DefaultFallback
                title="Status Not Allowed"
                message={`Current status "${status}" is not allowed. Allowed statuses: ${allowedStatuses.join(', ')}`}
                animation={statusAnimation}
                buttonHandler={async () => {
                    await signOut();
                }}
                buttonText="Back to Login"
            />
        );
    }

    return <>{children}</>;
};