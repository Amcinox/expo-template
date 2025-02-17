import { Theme } from "@/types/settings";

type RGB = {
    r: number;
    g: number;
    b: number;
};

type ShadeNumber = 0 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;



type ColorShades = {
    [key: `${string}-${ShadeNumber}`]: string;
};

const hexToRgb = (hex: string): RGB | null => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

const rgbToHex = (rgb: RGB): string => {
    const toHex = (n: number): string => {
        const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
};

const adjustBrightness = (rgb: RGB, factor: number): RGB => {
    return {
        r: Math.min(255, Math.max(0, Math.round(rgb.r * factor))),
        g: Math.min(255, Math.max(0, Math.round(rgb.g * factor))),
        b: Math.min(255, Math.max(0, Math.round(rgb.b * factor)))
    };
};

const shadeFactors: Record<ShadeNumber, number> = {
    0: 1.6,    // Lightest
    50: 1.5,
    100: 1.4,
    200: 1.3,
    300: 1.2,
    400: 1.1,
    500: 1,    // Base color
    600: 0.9,
    700: 0.8,
    800: 0.7,
    900: 0.6,
    950: 0.5   // Darkest
};

export function generateColorPalette(colors: Theme): ColorShades {
    const result: ColorShades = {};

    Object.entries(colors).forEach(([name, hexColor]) => {
        if (!hexColor) return;

        const baseRgb = hexToRgb(hexColor);
        if (!baseRgb) return;

        (Object.entries(shadeFactors) as unknown as [ShadeNumber, number][]).forEach(([shade, factor]) => {
            const adjustedRgb = adjustBrightness(baseRgb, factor);
            const key = `${name}-${shade}` as const;
            result[key] = rgbToHex(adjustedRgb);
        });
    });

    return result;
}