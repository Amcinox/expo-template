import { QueryParams } from "@/types/api";


export function toQuery(queryObj: QueryParams) {
    if (!queryObj || !Object.keys(queryObj).length) return '';
    const queries: string[] = [];
    Object.keys(queryObj).forEach((key) => {
        if (queryObj[key]) {
            queries.push(`${key}=${queryObj[key]}`);
        }
    });
    return `?${queries.join('&')}`;
}


export interface MaskStringConfig {
    mask?: string;
    maskLength?: number;
    keepLength?: number;
    maskStart?: boolean;
}

const defaultMaskConfig: MaskStringConfig = {
    mask: '●',
    maskLength: 6,
    keepLength: 4,
    maskStart: false,
};

export function maskString(str: string, config: MaskStringConfig = {}) {
    if (!str) return '';

    const mergedConfig: MaskStringConfig = { ...defaultMaskConfig, ...config };
    const { mask = '●', maskLength = 6, keepLength = 4, maskStart = false } = mergedConfig;

    const visiblePart = str.slice(maskStart ? maskLength : -keepLength);
    const maskedPart = maskStart ? ''.padStart(str.length - maskLength, mask) : ''.padStart(str.length - keepLength, mask);

    return maskStart ? maskedPart + visiblePart : maskedPart + visiblePart;
}