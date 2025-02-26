import { DeviceDetails } from '@/types/settings';
import { ReactNode } from 'react';
export interface BaseGuardProps {
    children: ReactNode;
    fallback?: ReactNode;
    showFallback?: boolean; // If false, will return null instead of fallback
}

export interface VersionGuardProps extends BaseGuardProps {
    minVersion?: string;
}

export interface EnvironmentGuardProps extends BaseGuardProps {
    allowedEnvironments: string[];
}

export interface DeviceGuardProps extends BaseGuardProps {
    condition: (device: DeviceDetails | null) => boolean;
}

export interface StatusGuardProps extends BaseGuardProps {
    status: string;
    allowedStatuses: string[];
}