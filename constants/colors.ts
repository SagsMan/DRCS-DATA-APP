/**
 * DRCS DATA fintech design tokens.
 *
 * Royal blue is the primary brand signal, white is reserved for clear
 * surfaces and contrast, charcoal handles primary text, and green is kept
 * for small positive/status accents.
 */

const colors = {
  light: {
    // Legacy aliases
    text: '#172033',
    tint: '#2557D6',

    // Core surfaces
    background: '#F5F8FF',
    foreground: '#172033',

    // Brand
    brandPrimaryLight: '#E8F0FF',
    brandPrimary: '#2557D6',
    brandPrimaryDark: '#12358F',
    brandPrimaryLightest: '#F5F8FF',
    grayBlack: '#172033',
    grayGray1: '#5E6B82',
    grayGray4: '#D8E1F0',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#172033',

    // Primary action (buttons)
    primary: '#2557D6',
    primaryForeground: '#FFFFFF',

    // Secondary
    secondary: '#EDF3FF',
    secondaryForeground: '#12358F',

    // Muted
    muted: '#F1F5FB',
    mutedForeground: '#5E6B82',

    // Accent
    accent: '#18A66A',
    accentForeground: '#FFFFFF',
    success: '#18A66A',
    successLight: '#E6F7EF',

    // Destructive
    destructive: '#D64545',
    destructiveForeground: '#FFFFFF',

    // Borders
    border: '#D8E1F0',
    input: '#C8D5EA',
    overlay: 'rgba(18, 53, 143, 0.56)',
  },
  dark: {
    text: '#F4F7FF',
    tint: '#6D92FF',
    background: '#0E1830',
    foreground: '#F4F7FF',
    brandPrimaryLight: '#1C326B',
    brandPrimary: '#6D92FF',
    brandPrimaryDark: '#9BB5FF',
    brandPrimaryLightest: '#132342',
    grayBlack: '#F4F7FF',
    grayGray1: '#B6C4DD',
    grayGray4: '#34476C',
    card: '#162443',
    cardForeground: '#F4F7FF',
    primary: '#6D92FF',
    primaryForeground: '#0E1830',
    secondary: '#1B2D53',
    secondaryForeground: '#DCE6FF',
    muted: '#1A2948',
    mutedForeground: '#B6C4DD',
    accent: '#39C987',
    accentForeground: '#0E1830',
    success: '#39C987',
    successLight: '#173C36',
    destructive: '#F07171',
    destructiveForeground: '#1A1010',
    border: '#34476C',
    input: '#40557D',
    overlay: 'rgba(0, 0, 0, 0.64)',
  },

  radius: 12,
};

export default colors;
