const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};



export const defaultThemes = [
  {
    title: "Default",
    colors: {
      primary: "#96C428",
      secondary: "#f44336",
      success: "#4caf50",
      warning: "#ffeb3b",
      error: "#f44336",
      info: "#2196f3",
      typography: "#fff",
      caption: "#4F5259",
      background: "#444659",
      outline: "#BDBDBD"

    }
  },
  {
    title: "Solar Serenity",
    colors: {
      primary: "#FFC107", // Amber/Gold - Energetic, Warm
      secondary: "#03A9F4", // Light Blue - Calm, Serene
      success: "#8BC34A", // Light Green - Positive, Growth
      warning: "#FF9800", // Orange - Caution, Attention
      error: "#E91E63",   // Pink/Magenta -  Strong Error, Attention
      info: "#607D8B",    // Blue Grey - Neutral Info, Guidance
      typography: "#212121",    // Dark Grey -  High Contrast Text
      caption: "#757575", // Medium Grey - Subdued Caption Text
      background: "#F5F5F5", // Light Grey - Clean, Light Background
      outline: "#BDBDBD" // Medium Grey - Outlines, Dividers
    }
  },
  {
    title: "Mystic Dusk",
    colors: {
      primary: "#673AB7", // Deep Purple -  Mysterious, Creative
      secondary: "#9C27B0", //  Medium Purple -  Rich, Luxurious
      success: "#4CAF50", // Green (Kept for Success - Universal)
      warning: "#FFC107", // Amber/Gold (Shifted to Warning -  Subtle Alert)
      error: "#F44336",   // Red (Kept for Error - Universal)
      info: "#00BCD4",    // Cyan - Bright Info, Modern
      typography: "#FFFFFF",    // White -  Bright Text against Dark BG
      caption: "#B0BEC5", // Light Blue Grey - Subdued Caption on Dark BG
      background: "#303030", // Dark Grey -  Sophisticated, Deep Background
      outline: "#616161" // Medium Grey - Outlines, Dividers
    }
  },
  {
    title: "Ocean Breeze",
    colors: {
      primary: "#00BCD4", // Cyan - Fresh, Breezy, Modern
      secondary: "#009688", // Teal -  Calm, Stable, Oceanic
      success: "#4CAF50", // Green (Kept for Success - Universal)
      warning: "#FFEB3B", // Yellow (Kept for Warning - Universal)
      error: "#F44336",   // Red (Kept for Error - Universal)
      info: "#2196F3",    // Blue (Kept for Info - Universal, slightly adjusted shade)
      typography: "#37474F",    // Dark Blue Grey -  Readable Text on Light BG
      caption: "#78909C", // Medium Blue Grey - Subdued Caption Text
      background: "#ECEFF1", // Light Grey Blue -  Soft, Airy Background
      outline: "#B0BEC5" // Light Blue Grey - Outlines, Dividers

    }
  }
]