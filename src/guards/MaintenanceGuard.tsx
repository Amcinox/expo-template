import React from 'react';
import { DefaultFallback } from './fallbacks/DefaultFallback';
import { MaintenanceGuardProps } from './types';
import maintenanceAnimation from '@/assets/lottie/maintenance.json';
import { useSettings } from '@/contexts/SettingsContext';


export const MaintenanceGuard: React.FC<MaintenanceGuardProps> = ({
    children,
    enabled,
    fallback,
    showFallback = true,
}) => {
    const { appConfig } = useSettings()

    if (enabled || appConfig.maintenance) {
        if (!showFallback) return null;

        if (fallback) {
            return <>{fallback({})}</>;
        }


        return (
            <DefaultFallback
                title="Maintenance Mode"
                message="We're currently undergoing maintenance to improve your experience. Please check back later."
                animation={maintenanceAnimation}
            />
        );
    }

    return <>{children}</>;
};