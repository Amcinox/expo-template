import { Theme } from "@/types/settings";

interface HexColor {
    primary: string;
    secondary: string;
    tertiary: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    typography: string;
    outline: string;
    background: string;
    indicatorPrimary: string;
    indicatorInfo: string;
    indicatorError: string;
    backgroundError: string;
    backgroundWarning: string;
    backgroundSuccess: string;
    backgroundMuted: string;
    backgroundInfo: string;
}

type ColorLevel = '0' | '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950';
type ColorType = 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning' | 'info' | 'typography' | 'outline' | 'background';
type SpecialColorType = 'background-error' | 'background-warning' | 'background-success' | 'background-muted' | 'background-info';
type IndicatorColorType = 'indicator-primary' | 'indicator-info' | 'indicator-error';

type ColorShades = {
    [key in ThemeKey]: string;
};

export type ThemeKey = `--color-${ColorType}-${ColorLevel}` | `--color-${SpecialColorType}` | `--color-${IndicatorColorType}`;




function hexToRgb(hex: string): [number, number, number] {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];
}

function generateShades(baseRgb: [number, number, number], colorName: ColorType): { [key in `--color-${ColorType}-${ColorLevel}`]: string } {
    const shades = {} as { [key in `--color-${ColorType}-${ColorLevel}`]: string }; // Type assertion here

    const levels: ColorLevel[] = ['0', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

    levels.forEach(level => {
        let r, g, b;
        if (level === '0' || level === '50' || level === '100' || level === '200' || level === '300' || level === '400' || level === '500') {
            const levelNumber = parseInt(level, 10);
            const lightenFactor = 1 - (levelNumber / 500);
            r = Math.round(baseRgb[0] + (255 - baseRgb[0]) * lightenFactor);
            g = Math.round(baseRgb[1] + (255 - baseRgb[1]) * lightenFactor);
            b = Math.round(baseRgb[2] + (255 - baseRgb[2]) * lightenFactor);
        } else {
            const levelNumber = parseInt(level, 10);
            const darkenFactor = (levelNumber - 500) / (950 - 500);
            r = Math.round(baseRgb[0] * (1 - darkenFactor));
            g = Math.round(baseRgb[1] * (1 - darkenFactor));
            b = Math.round(baseRgb[2] * (1 - darkenFactor));
        }
        shades[`--color-${colorName}-${level}` as `--color-${ColorType}-${ColorLevel}`] = `${r} ${g} ${b}`;
    });
    return shades;
}

export function convertColorsToTheme(colors: Theme): ColorShades {
    const theme: any = {};
    for (const colorName in colors) {
        if (colors.hasOwnProperty(colorName)) {
            const hexColor = (colors as any)[colorName]; // using any for index access
            const baseRgb = hexToRgb(hexColor);
            const colorShades = generateShades(baseRgb, colorName as ColorType);
            Object.assign(theme, colorShades);
        }
    }

    // Adding default special background colors and indicator colors as requested
    theme['--color-typography-0'] = '254 254 255';
    theme['--color-typography-50'] = '245 245 245';
    theme['--color-typography-100'] = '229 229 229';
    theme['--color-typography-200'] = '219 219 220';
    theme['--color-typography-300'] = '212 212 212';
    theme['--color-typography-400'] = '163 163 163';
    theme['--color-typography-500'] = '140 140 140';
    theme['--color-typography-600'] = '115 115 115';
    theme['--color-typography-700'] = '82 82 82';
    theme['--color-typography-800'] = '64 64 64';
    theme['--color-typography-900'] = '38 38 39';
    theme['--color-typography-950'] = '23 23 23';
    theme['--color-background-error'] = '254 241 241';
    theme['--color-background-warning'] = '255 243 234';
    theme['--color-background-success'] = '237 252 242';
    theme['--color-background-muted'] = '247 248 247';
    theme['--color-background-info'] = '235 248 254';

    theme['--color-indicator-primary'] = '55 55 55';
    theme['--color-indicator-info'] = '83 153 236';
    theme['--color-indicator-error'] = '185 28 28';


    return theme;
}






/**
 * Helper function to merge a user-provided theme with the default theme.
 * Ensures all keys from default theme exist and all hex colors have proper format.
 * 
 * @param providedTheme The theme values provided by the user
 * @param defaultTheme The default theme containing all necessary keys
 * @returns A complete theme with all keys and properly formatted hex colors
 */
export const normalizeTheme = (providedTheme: Partial<Theme>, defaultTheme: Theme): Theme => {
    // Start with default theme
    const normalizedTheme = { ...defaultTheme };

    // Only process if providedTheme exists
    if (providedTheme) {
        // Iterate through provided theme keys
        Object.entries(providedTheme).forEach(([key, value]) => {
            if (value && typeof value === 'string') {
                // Check if it's a valid color key in our theme
                if (key in normalizedTheme) {
                    // Ensure the hex color has # prefix
                    const formattedColor = value.startsWith('#') ? value : `#${value}`;

                    // Validate it's a proper hex color (either #RGB or #RRGGBB format)
                    const hexRegex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;
                    if (hexRegex.test(formattedColor)) {
                        normalizedTheme[key as keyof Theme] = formattedColor;
                    }
                }
            }
        });
    }

    return normalizedTheme;
};