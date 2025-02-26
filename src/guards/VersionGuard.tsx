import React from 'react';
import { compareVersions } from 'compare-versions';
import { DefaultFallback } from './DefaultFallback';
import { VersionGuardProps } from './types';
import updateAnimation from '@/assets/lottie/update.json';
import { useSettings } from '@/contexts/SettingsContext';


export const VersionGuard: React.FC<VersionGuardProps> = ({
    children,
    minVersion,
    fallback,
    showFallback = true,
}) => {
    const { appConfig } = useSettings()

    if (compareVersions(appConfig.currentVersion!, minVersion || appConfig.minVersion) < 0) {
        if (!showFallback) return null;

        if (fallback) {
            return <>{fallback}</>;
        }


        return (
            <DefaultFallback
                title="Update Required"
                message={`Current version ${appConfig.currentVersion} is not supported. Minimum required version is ${minVersion} .`}
                animation={updateAnimation}
            />
        );
    }

    return <>{children}</>;
};