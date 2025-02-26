import React from 'react';
import { DefaultFallback } from './DefaultFallback';
import { DeviceGuardProps } from './types';
import deviceAnimation from '@/assets/lottie/building-phone.json';
import { useSettings } from '@/contexts/SettingsContext';

export const DeviceGuard: React.FC<DeviceGuardProps> = ({
    children,
    condition,
    fallback,
    showFallback = true,
}) => {
    const { device } = useSettings();
    const isAllowed = condition(device);

    if (!isAllowed) {
        if (!showFallback) return null;

        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <DefaultFallback
                title="Device Not Supported"
                message="Your device configuration is not supported for this feature."
                animation={deviceAnimation}
            />
        );
    }

    return <>{children}</>;
};