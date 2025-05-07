import { DeviceDetails } from '@/types/settings';
import { ReactNode } from 'react';
import { AppStateStatus } from 'react-native';
export interface BaseGuardProps<FallbackProps = {}> {
    children: ReactNode;
    // Fallback can be a function that receives specific props and returns a ReactNode
    fallback?: (props: FallbackProps) => ReactNode;
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

export interface MaintenanceGuardProps extends BaseGuardProps {
    enabled?: boolean
}


export interface ForbiddenGuardProps extends BaseGuardProps {
    enabled: boolean;
}


export interface AppStateFallbackProps {
    onLock: () => void;
    onUnlock: () => void;
    isLocked: boolean;
    wasTerminated?: boolean;
}

// AppStateGuard accepts fallback function that receives AppStateFallbackProps
export interface AppStateGuardProps extends BaseGuardProps<AppStateFallbackProps> {
    children: React.ReactNode;
    fallback?: (props: AppStateFallbackProps) => React.ReactNode;
    showFallback?: boolean;
    timeoutSeconds?: number;
    guardOnStates?: string[];
}